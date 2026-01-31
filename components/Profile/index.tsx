import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { useProfileLogic } from './logic';
import { styles } from './styles';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import CountryPicker from '../CountryPicker';

export default function Profile() {
  const { theme, toggleTheme, themeMode } = useTheme();
  const {
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
  } = useProfileLogic();

  const onSubmit = async () => {
    console.log('[Profile] onSubmit called, current profileData:', {
      name: profileData.name,
      bio: profileData.bio ? 'has bio' : 'no bio',
      country: profileData.country,
      interestsCount: profileData.travel_interests.length,
    });
    const result = await handleSave();
    console.log('[Profile] handleSave result:', result);
    if (result.success) {
      Alert.alert('Success', 'Profile updated successfully');
    } else {
      Alert.alert('Error', result.error || 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: theme.text }]}>My Profile</Text>
          <TouchableOpacity
            style={[styles.themeButton, { backgroundColor: theme.card }]}
            onPress={toggleTheme}
          >
            <Ionicons
              name={themeMode === 'dark' ? 'sunny' : 'moon'}
              size={20}
              color={theme.primary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          {/* Profile Picture */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Profile Picture</Text>
            <View style={styles.profilePictureContainer}>
              {profileData.profile_picture ? (
                <Image
                  source={{ uri: profileData.profile_picture }}
                  style={[styles.profilePicture, { backgroundColor: theme.inputBackground }]}
                />
              ) : (
                <View style={[styles.profilePicturePlaceholder, { backgroundColor: theme.inputBackground }]}>
                  <Ionicons name="person" size={40} color={theme.textLight} />
                </View>
              )}
              <TouchableOpacity
                style={[styles.pictureButton, { backgroundColor: theme.inputBackground }]}
                onPress={pickProfilePicture}
                disabled={uploadingPicture}
              >
                {uploadingPicture ? (
                  <ActivityIndicator color={theme.primary} />
                ) : (
                  <>
                    <Ionicons name="camera" size={20} color={theme.primary} />
                    <Text style={[styles.pictureButtonText, { color: theme.primary }]}>
                      {profileData.profile_picture ? 'Change' : 'Add'} Photo
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Full Name *</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.inputBorder, backgroundColor: theme.inputBackground, color: theme.inputText }]}
              value={profileData.name}
              onChangeText={(text) => {
                console.log('[Profile] Name changed to:', text);
                setProfileData({ ...profileData, name: text });
              }}
              placeholder="Your name"
              placeholderTextColor={theme.placeholder}
            />
          </View>

          <View style={styles.inputGroup}>
            <CountryPicker
              label="Country"
              value={profileData.country}
              onChange={(country) => {
                console.log('[Profile] Country changed to:', country);
                setProfileData({ ...profileData, country });
              }}
              placeholder="Select your country"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea, { borderColor: theme.inputBorder, backgroundColor: theme.inputBackground, color: theme.inputText }]}
              value={profileData.bio}
              onChangeText={(text) => {
                console.log('[Profile] Bio changed, length:', text.length);
                setProfileData({ ...profileData, bio: text });
              }}
              placeholder="Tell other travelers about yourself..."
              placeholderTextColor={theme.placeholder}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Travel Interests</Text>
            <View style={styles.interestsInputRow}>
              <TextInput
                style={[styles.input, styles.interestsInput, { borderColor: theme.inputBorder, backgroundColor: theme.inputBackground, color: theme.inputText }]}
                value={newInterest}
                onChangeText={setNewInterest}
                placeholder="Add an interest (e.g., Hiking)"
                placeholderTextColor={theme.placeholder}
                onSubmitEditing={addInterest}
                returnKeyType="done"
              />
              <TouchableOpacity 
                style={[styles.addButton, { backgroundColor: theme.primary }]} 
                onPress={addInterest}
              >
                <Ionicons name="add" size={24} color={theme.buttonText} />
              </TouchableOpacity>
            </View>

            <View style={styles.interestsContainer}>
              {profileData.travel_interests.map((interest, idx) => (
                <View key={idx} style={[styles.interestBadge, { backgroundColor: theme.inputBackground }]}>
                  <Text style={[styles.interestText, { color: theme.primary }]}>{interest}</Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeInterest(interest)}
                  >
                    <Ionicons name="close" size={16} color={theme.primary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.primary }, saving && { opacity: 0.6 }]}
            onPress={onSubmit}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={theme.buttonText} />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color={theme.buttonText} />
                <Text style={[styles.saveButtonText, { color: theme.buttonText }]}>Save Profile</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
