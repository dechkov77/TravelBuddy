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
    if (!user) {
      router.replace('/auth');
      return;
    }
    if (hasLoadedRef.current !== user.id) {
      fetchProfile();
      hasLoadedRef.current = user.id;
    } else {
      setLoading(false);
    }
  }, [user?.id]);
  const fetchProfile = async () => {
    if (!user) {
      return;
    }
    try {
      setLoading(true);
      const fetchedProfile = await ProfileService.getProfile(user.id);
      if (fetchedProfile) {
        const newProfileData = {
          name: String(fetchedProfile.name || ''),
          bio: String(fetchedProfile.bio || ''),
          country: String(fetchedProfile.country || ''),
          profile_picture: fetchedProfile.profile_picture ? String(fetchedProfile.profile_picture) : '',
          travel_interests: Array.isArray(fetchedProfile.travel_interests)
            ? [...fetchedProfile.travel_interests]
            : [],
        };
        setProfileData(newProfileData);
      } else {
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const handleSave = async () => {
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    setSaving(true);
    try {
      profileSchema.parse(profileData);
      const updateData = {
        name: profileData.name,
        bio: profileData.bio || '',
        country: profileData.country || '',
        travel_interests: profileData.travel_interests || [],
        profile_picture: profileData.profile_picture || '',
      };
      await ProfileService.updateProfile(user.id, updateData);
      if (refreshProfile) {
        await refreshProfile();
      }
      return { success: true, error: null };
    } catch (error) {
      if (error instanceof z.ZodError) {
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
    setUploadingPicture(true);
    try {
      if (Platform.OS === 'web') {
        return new Promise<void>((resolve) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = async (event: any) => {
            const file = event.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (e: any) => {
                setProfileData({
                  ...profileData,
                  profile_picture: e.target.result,
                });
                resolve();
              };
              reader.readAsDataURL(file);
            }
            resolve();
          };
          input.click();
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload picture');
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