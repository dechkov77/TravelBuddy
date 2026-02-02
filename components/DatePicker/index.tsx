import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useTheme } from '../../contexts/ThemeContext';
import { styles } from './styles';
let DateTimePicker: any = null;
if (Platform.OS !== 'web') {
  try {
    DateTimePicker = require('@react-native-community/datetimepicker').default;
  } catch (e) {
  }
}
interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  label?: string;
  minimumDate?: Date;
  maximumDate?: Date;
}
export default function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  label,
  minimumDate,
  maximumDate,
}: DatePickerProps) {
  const { theme } = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(
    value ? new Date(value) : new Date()
  );
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (selectedDate) {
      setTempDate(selectedDate);
      if (Platform.OS === 'android') {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        onChange(formattedDate);
      }
    }
  };
  const handleConfirm = () => {
    const formattedDate = format(tempDate, 'yyyy-MM-dd');
    onChange(formattedDate);
    setShowPicker(false);
  };
  const displayValue = value ? format(new Date(value), 'MMM d, yyyy') : placeholder;
  if (Platform.OS === 'web') {
    return (
      <View>
        {label && <Text style={[styles.label, { color: theme.text }]}>{label}</Text>}
        <TouchableOpacity
          style={[styles.dateButton, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}
          onPress={() => setShowPicker(true)}
        >
          <Ionicons name="calendar" size={20} color={theme.textSecondary} />
          <Text style={[styles.dateText, !value && styles.placeholderText, { color: value ? theme.inputText : theme.textSecondary }]}>
            {displayValue}
          </Text>
        </TouchableOpacity>
        <Modal
          visible={showPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]}>
            <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Select Date</Text>
                <TouchableOpacity
                  onPress={() => setShowPicker(false)}
                  style={styles.cancelButton}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.primary }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
              <View style={{ padding: 20 }}>
                <Text style={{ marginBottom: 10, fontSize: 16, color: theme.text }}>Enter date (YYYY-MM-DD):</Text>
                <input
                  type="date"
                  value={value || format(new Date(), 'yyyy-MM-dd')}
                  onChange={(e) => {
                    if (e.target.value) {
                      setTempDate(new Date(e.target.value));
                    }
                  }}
                  min={minimumDate ? format(minimumDate, 'yyyy-MM-dd') : undefined}
                  max={maximumDate ? format(maximumDate, 'yyyy-MM-dd') : undefined}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${theme.inputBorder}`,
                    borderRadius: '8px',
                    fontSize: '16px',
                    marginBottom: 20,
                    backgroundColor: theme.inputBackground,
                    color: theme.inputText,
                  }}
                />
                <TouchableOpacity
                  style={[styles.confirmButton, { alignSelf: 'flex-end', paddingHorizontal: 20, paddingVertical: 10, backgroundColor: theme.primary }]}
                  onPress={handleConfirm}
                >
                  <Text style={[styles.confirmButtonText, { color: theme.buttonText }]}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
  if (!DateTimePicker) {
    return (
      <View>
        {label && <Text style={[styles.label, { color: theme.text }]}>{label}</Text>}
        <TouchableOpacity
          style={[styles.dateButton, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}
          onPress={() => {
            const dateStr = prompt('Enter date (YYYY-MM-DD):', value || format(new Date(), 'yyyy-MM-dd'));
            if (dateStr) {
              onChange(dateStr);
            }
          }}
        >
          <Ionicons name="calendar" size={20} color={theme.textSecondary} />
          <Text style={[styles.dateText, !value && styles.placeholderText, { color: value ? theme.inputText : theme.textSecondary }]}>
            {displayValue}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View>
      {label && <Text style={[styles.label, { color: theme.text }]}>{label}</Text>}
      <TouchableOpacity
        style={[styles.dateButton, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}
        onPress={() => setShowPicker(true)}
      >
        <Ionicons name="calendar" size={20} color={theme.textSecondary} />
        <Text style={[styles.dateText, !value && styles.placeholderText, { color: value ? theme.inputText : theme.textSecondary }]}>
          {displayValue}
        </Text>
      </TouchableOpacity>
      {Platform.OS === 'ios' ? (
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]}>
            <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => setShowPicker(false)}
                  style={styles.cancelButton}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.primary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleConfirm}
                  style={styles.confirmButton}
                >
                  <Text style={[styles.confirmButtonText, { color: theme.primary }]}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
              />
            </View>
          </View>
        </Modal>
      ) : (
        showPicker && (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
        )
      )}
    </View>
  );
}