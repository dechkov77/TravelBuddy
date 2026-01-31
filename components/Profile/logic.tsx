import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Platform, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import * as ProfileService from '../../database/profiles';
import { Profile } from '../../database/types';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(2).max(100),
  bio: z.string().max(500).optional(),
  country: z.string().max(100).optional(),
});

export const useProfileLogic = () => {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newInterest, setNewInterest] = useState('');
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const hasLoadedRef = useRef<string | null>(null);

  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    country: '',
    travel_interests: [] as string[],
    profile_picture: '',
  });

  useEffect(() => {
    console.log('[Profile] useEffect triggered, user?.id:', user?.id, 'hasLoadedRef.current:', hasLoadedRef.current);
    if (!user) {
      console.log('[Profile] No user, redirecting to auth');
      router.replace('/auth');
      return;
    }
    // Fetch profile if we haven't loaded for this user, or if user changed
    if (hasLoadedRef.current !== user.id) {
      console.log('[Profile] Fetching profile for user:', user.id);
      fetchProfile();
      hasLoadedRef.current = user.id;
    } else {
      console.log('[Profile] Profile already loaded for this user, skipping fetch');
      setLoading(false);
    }
  }, [user?.id]); // Only depend on user.id, not the entire user object or profile

  const fetchProfile = async () => {
    if (!user) {
      console.error('[Profile] fetchProfile called but no user');
      return;
    }
    try {
      console.log('[Profile] Starting fetchProfile for user:', user.id);
      setLoading(true);
      const fetchedProfile = await ProfileService.getProfile(user.id);
      console.log('[Profile] Fetched profile data:', {
        name: fetchedProfile?.name,
        bio: fetchedProfile?.bio ? 'has bio' : 'no bio',
        country: fetchedProfile?.country,
        interestsCount: Array.isArray(fetchedProfile?.travel_interests) ? fetchedProfile.travel_interests.length : 0,
      });
      if (fetchedProfile) {
        // Only update state if we have valid data - use explicit values to avoid web state batching issues
        // Ensure we're using the correct fields from the fetched profile
        const newProfileData = {
          name: String(fetchedProfile.name || ''),
          bio: String(fetchedProfile.bio || ''),
          country: String(fetchedProfile.country || ''),
          profile_picture: fetchedProfile.profile_picture ? String(fetchedProfile.profile_picture) : '',
          travel_interests: Array.isArray(fetchedProfile.travel_interests)
            ? [...fetchedProfile.travel_interests]
            : [],
        };
        console.log('[Profile] Raw fetched profile country:', fetchedProfile.country);
        console.log('[Profile] Raw fetched profile name:', fetchedProfile.name);
        console.log('[Profile] Setting profile data:', {
          name: newProfileData.name,
          bio: newProfileData.bio ? 'has bio' : 'no bio',
          country: newProfileData.country,
          profile_picture: newProfileData.profile_picture ? 'has picture' : 'no picture',
          interestsCount: newProfileData.travel_interests.length,
        });
        // Use direct state update (not functional) to avoid web batching issues
        setProfileData(newProfileData);
      } else {
        console.warn('[Profile] No profile found for user:', user.id);
      }
    } catch (error) {
      console.error('[Profile] Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      console.error('[Profile] handleSave called but no user');
      return { success: false, error: 'User not found' };
    }
    console.log('[Profile] Starting save with data:', {
      name: profileData.name,
      bio: profileData.bio ? 'has bio' : 'no bio',
      country: profileData.country,
      interestsCount: profileData.travel_interests.length,
    });
    setSaving(true);

    try {
      profileSchema.parse(profileData);
      console.log('[Profile] Validation passed');

      const updateData = {
        name: profileData.name,
        bio: profileData.bio || '',
        country: profileData.country || '',
        travel_interests: profileData.travel_interests || [],
        profile_picture: profileData.profile_picture || '',
      };
      console.log('[Profile] Updating profile with:', updateData);

      await ProfileService.updateProfile(user.id, updateData);
      console.log('[Profile] Profile updated successfully');

      // Refresh profile in context (but don't refetch local state to avoid overwriting)
      if (refreshProfile) {
        console.log('[Profile] Refreshing profile in context');
        await refreshProfile();
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('[Profile] Error saving profile:', error);
      if (error instanceof z.ZodError) {
        console.error('[Profile] Validation error:', error.errors);
        return { success: false, error: error.errors[0].message };
      }
      return { success: false, error: 'Failed to update profile' };
    } finally {
      setSaving(false);
    }
  };

  const addInterest = () => {
    if (
      newInterest.trim() &&
      !profileData.travel_interests.includes(newInterest.trim())
    ) {
      setProfileData({
        ...profileData,
        travel_interests: [...profileData.travel_interests, newInterest.trim()],
      });
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setProfileData({
      ...profileData,
      travel_interests: profileData.travel_interests.filter((i) => i !== interest),
    });
  };

  const pickProfilePicture = async () => {
    if (!user) return;
    console.log('[Profile] pickProfilePicture called');
    setUploadingPicture(true);
    try {
      if (Platform.OS === 'web') {
        // For web, use file input
        return new Promise<void>((resolve) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = async (e: any) => {
            const file = e.target.files?.[0];
            if (file) {
              // Convert to data URL for storage
              const reader = new FileReader();
              reader.onload = (event) => {
                const dataUrl = event.target?.result as string;
                console.log('[Profile] Image selected, data URL length:', dataUrl.length);
                setProfileData({ ...profileData, profile_picture: dataUrl });
                setUploadingPicture(false);
                resolve();
              };
              reader.onerror = () => {
                console.error('[Profile] Error reading file');
                setUploadingPicture(false);
                resolve();
              };
              reader.readAsDataURL(file);
            } else {
              setUploadingPicture(false);
              resolve();
            }
          };
          input.click();
        });
      } else {
        // For native, use expo-image-picker
        const ImagePicker = require('expo-image-picker');
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Please grant camera roll permissions');
          setUploadingPicture(false);
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

        if (!result.canceled && result.assets?.[0]) {
          const imageUri = result.assets[0].uri;
          console.log('[Profile] Image selected:', imageUri);
          setProfileData({ ...profileData, profile_picture: imageUri });
        }
      }
    } catch (error) {
      console.error('[Profile] Error picking image:', error);
    } finally {
      setUploadingPicture(false);
    }
  };

  return {
    profileData,
    setProfileData,
    loading,
    saving,
    newInterest,
    setNewInterest,
    handleSave,
    addInterest,
    removeInterest,
    pickProfilePicture,
    uploadingPicture,
  };
};
