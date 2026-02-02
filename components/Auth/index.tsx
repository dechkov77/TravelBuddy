import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ImageBackground } from 'react-native';
import { useAuthLogic } from './logic';
import { styles } from './styles';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator } from 'react-native';
export default function Auth() {
  const { theme } = useTheme();
  const {
    loading,
    activeTab,
    setActiveTab,
    signUpData,
    setSignUpData,
    signInData,
    setSignInData,
    handleSignUp,
    handleSignIn,
  } = useAuthLogic();
  const [error, setError] = useState<string | null>(null);
  const onSignUp = async () => {
    setError(null);
    const result = await handleSignUp();
    if (!result.success) {
      setError(result.error || 'Sign up failed');
      Alert.alert('Sign Up Failed', result.error || 'Please try again.');
    } else {
      Alert.alert('Success', 'Your account has been created successfully.');
    }
  };
  const onSignIn = async () => {
    setError(null);
    const result = await handleSignIn();
    if (!result.success) {
      setError(result.error || 'Sign in failed');
      Alert.alert('Sign In Failed', result.error || 'Please try again.');
    }
  };
  return (
    <ImageBackground 
      source={require('../../assets/images/background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.card, { backgroundColor: theme.surface + 'E8' }]}>
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          <View style={styles.iconContainer}>
            <Ionicons name="globe" size={32} color={theme.buttonText} />
          </View>
          <Text style={[styles.title, { color: theme.buttonText }]}>Welcome to TravelBuddy</Text>
          <Text style={[styles.subtitle, { color: theme.buttonText }]}>Find your perfect travel companion</Text>
        </View>
        {}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'signin' && [styles.tabActive, { borderBottomColor: theme.primary }],
              { borderBottomColor: theme.divider }
            ]}
            onPress={() => {
              setActiveTab('signin');
              setError(null);
            }}
          >
            <Text style={[styles.tabText, activeTab === 'signin' && [styles.tabTextActive, { color: theme.primary }], { color: theme.text }]}>
              Sign In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'signup' && [styles.tabActive, { borderBottomColor: theme.primary }], { borderBottomColor: theme.divider }]}
            onPress={() => {
              setActiveTab('signup');
              setError(null);
            }}
          >
            <Text style={[styles.tabText, activeTab === 'signup' && [styles.tabTextActive, { color: theme.primary }], { color: theme.text }]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
        {}
        {activeTab === 'signin' && (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Email</Text>
              <TextInput
                style={[styles.input, { borderColor: theme.inputBorder, backgroundColor: theme.inputBackground, color: theme.inputText }]}
                placeholder="your@email.com"
                placeholderTextColor={theme.placeholder}
                value={signInData.email}
                onChangeText={(text) => setSignInData({ ...signInData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Password</Text>
              <TextInput
                style={[styles.input, { borderColor: theme.inputBorder, backgroundColor: theme.inputBackground, color: theme.inputText }]}
                placeholder="••••••••"
                placeholderTextColor={theme.placeholder}
                value={signInData.password}
                onChangeText={(text) => setSignInData({ ...signInData, password: text })}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
            {error && <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.primary }, loading && styles.buttonDisabled]}
              onPress={onSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.buttonText} />
              ) : (
                <>
                  <Text style={[styles.buttonText, { color: theme.buttonText }]}>Sign In</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
        {}
        {activeTab === 'signup' && (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Full Name</Text>
              <TextInput
                style={[styles.input, { borderColor: theme.inputBorder, backgroundColor: theme.inputBackground, color: theme.inputText }]}
                placeholder="John Doe"
                placeholderTextColor={theme.placeholder}
                value={signUpData.name}
                onChangeText={(text) => setSignUpData({ ...signUpData, name: text })}
                autoCapitalize="words"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Email</Text>
              <TextInput
                style={[styles.input, { borderColor: theme.inputBorder, backgroundColor: theme.inputBackground, color: theme.inputText }]}
                placeholder="your@email.com"
                placeholderTextColor={theme.placeholder}
                value={signUpData.email}
                onChangeText={(text) => setSignUpData({ ...signUpData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Password</Text>
              <TextInput
                style={[styles.input, { borderColor: theme.inputBorder, backgroundColor: theme.inputBackground, color: theme.inputText }]}
                placeholder="••••••••"
                placeholderTextColor={theme.placeholder}
                value={signUpData.password}
                onChangeText={(text) => setSignUpData({ ...signUpData, password: text })}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
            {error && <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.primary }, loading && styles.buttonDisabled]}
              onPress={onSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={[styles.buttonText, { color: theme.buttonText }]}>Create Account</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
    </ImageBackground>
  );
}