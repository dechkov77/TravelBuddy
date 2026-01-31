import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { COUNTRIES } from '../../utils/countries';
import { styles } from './styles';

interface CountryPickerProps {
  value: string;
  onChange: (country: string) => void;
  placeholder?: string;
  label?: string;
}

export default function CountryPicker({
  value,
  onChange,
  placeholder = 'Select country',
  label,
}: CountryPickerProps) {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCountries = COUNTRIES.filter((country) =>
    country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectCountry = (country: string) => {
    onChange(country);
    setModalVisible(false);
    setSearchTerm('');
  };

  return (
    <View>
      {label && <Text style={[styles.label, { color: theme.text }]}>{label}</Text>}
      <TouchableOpacity
        style={[styles.pickerButton, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="location" size={20} color={theme.textSecondary} />
        <Text style={[styles.pickerText, !value && styles.placeholderText, { color: value ? theme.inputText : theme.textSecondary }]}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setModalVisible(false);
          setSearchTerm('');
        }}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Select Country</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setSearchTerm('');
                }}
              >
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={[styles.searchContainer, { backgroundColor: theme.inputBackground, borderBottomColor: theme.divider }]}>
              <Ionicons name="search" size={20} color={theme.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={[
                  styles.searchInput,
                  {
                    backgroundColor: theme.inputBackground,
                    color: theme.inputText,
                  }
                ]}
                placeholder="Search countries..."
                placeholderTextColor={theme.textSecondary}
                value={searchTerm}
                onChangeText={setSearchTerm}
                autoFocus
              />
            </View>

            <ScrollView style={[styles.countryList, { backgroundColor: theme.background }]}>
              {filteredCountries.map((country) => (
                <TouchableOpacity
                  key={country}
                  style={[
                    styles.countryItem,
                    value === country && [styles.countryItemSelected, { backgroundColor: theme.primary, opacity: 0.2 }],
                    { borderBottomColor: theme.divider }
                  ]}
                  onPress={() => handleSelectCountry(country)}
                >
                  <Text
                    style={[
                      styles.countryText,
                      { color: theme.text },
                      value === country && [styles.countryTextSelected, { color: theme.primary, fontWeight: '600' }],
                    ]}
                  >
                    {country}
                  </Text>
                  {value === country && (
                    <Ionicons name="checkmark" size={20} color={theme.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
