import React from 'react';
import { View, Text, ScrollView, ImageBackground, TouchableOpacity } from 'react-native';
import { useHomeLogic } from './logic';
import { useTheme } from '../../contexts/ThemeContext';
import { styles } from './styles';
import { Ionicons } from '@expo/vector-icons';
interface HomeProps {
  onNavigate: (screen: 'home' | 'explore' | 'trips' | 'buddies' | 'profile') => void;
}
export default function Home({ onNavigate }: HomeProps) {
  const { theme } = useTheme();
  const { user, stats, handleExplore, handleTrips, handleAuth } = useHomeLogic({ onNavigate });
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {}
      <ImageBackground
        source={{ uri: 'https://via.placeholder.com/400x300' }}
        style={styles.heroSection}
        imageStyle={{ opacity: 0.7 }}
      >
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <Text style={[styles.heroTitle, { color: theme.buttonText }]}>Find Your Perfect Travel Companion</Text>
          <Text style={[styles.heroSubtitle, { color: theme.buttonText }]}>
            Connect with travelers worldwide. Plan amazing adventures together.
          </Text>
          {user ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.primary }]} onPress={handleExplore}>
                <Text style={[styles.primaryButtonText, { color: theme.buttonText }]}>Explore Travelers</Text>
                <Ionicons name="arrow-forward" size={20} color={theme.buttonText} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.outlineButton, { borderColor: theme.buttonText }]} onPress={handleTrips}>
                <Text style={[styles.outlineButtonText, { color: theme.buttonText }]}>My Trips</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.primary }]} onPress={handleAuth}>
              <Text style={[styles.primaryButtonText, { color: theme.buttonText }]}>Get Started Free</Text>
              <Iconicons name="arrow-forward" size={20} color={theme.buttonText} />
            </TouchableOpacity>
          )}
        </View>
      </ImageBackground>
      {}
      <View style={[styles.featuresSection, { backgroundColor: theme.surface }]}>
        <Text style={[styles.featuresTitle, { color: theme.text }]}>How TravelBuddy Works</Text>
        <Text style={[styles.featuresSubtitle, { color: theme.textSecondary }]}>
          Your journey to amazing adventures starts here
        </Text>
        <View style={styles.featuresGrid}>
          <View style={[styles.featureCard, { backgroundColor: theme.card }]}>
            <View style={[styles.featureIcon, { backgroundColor: theme.primary }]}>
              <Ionicons name="people" size={24} color={theme.buttonText} />
            </View>
            <Text style={[styles.featureTitle, { color: theme.text }]}>Find Travel Buddies</Text>
            <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
              Browse travelers with similar interests and destinations. Connect with people who
              share your passion for adventure.
            </Text>
          </View>
          <View style={[styles.featureCard, { backgroundColor: theme.card }]}>
            <View style={[styles.featureIcon, { backgroundColor: theme.error }]}>
              <Ionicons name="map" size={24} color={theme.buttonText} />
            </View>
            <Text style={[styles.featureTitle, { color: theme.text }]}>Plan Trips Together</Text>
            <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
              Create and manage trips collaboratively. Share itineraries, split costs, and make
              decisions together.
            </Text>
          </View>
          <View style={[styles.featureCard, { backgroundColor: theme.card }]}>
            <View style={[styles.featureIcon, { backgroundColor: theme.secondary }]}>
              <Ionicons name="chatbubbles" size={24} color={theme.buttonText} />
            </View>
            <Text style={[styles.featureTitle, { color: theme.text }]}>Stay Connected</Text>
            <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
              Chat with trip participants in real-time. Share updates, photos, and coordinate
              meetups on the go.
            </Text>
          </View>
        </View>
      </View>
      {}
      <View style={styles.statsSection}>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCardOcean]}>
            <Ionicons name="sparkles" size={48} color="#FFFFFF" style={styles.statIcon} />
            <Text style={styles.statValue}>{stats.travelers}</Text>
            <Text style={styles.statLabel}>Travel Buddies</Text>
          </View>
          <View style={[styles.statCard, styles.statCardSunset]}>
            <Ionicons name="map" size={48} color="#FFFFFF" style={styles.statIcon} />
            <Text style={styles.statValue}>{stats.trips}</Text>
            <Text style={styles.statLabel}>Adventures Planned</Text>
          </View>
        </View>
      </View>
      {}
      {!user && (
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to Start Your Adventure?</Text>
          <Text style={styles.ctaSubtitle}>
            Join thousands of travelers finding their perfect travel companions
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleAuth}>
            <Text style={styles.primaryButtonText}>Join TravelBuddy Today</Text>
            <Ionicons name="arrow-forward" size={20} color="#0066CC" />
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}