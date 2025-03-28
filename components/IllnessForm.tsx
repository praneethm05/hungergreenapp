import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ChevronDown, Calendar, AlertCircle } from 'lucide-react-native';
import { useUser } from '@clerk/clerk-expo';

function RecordIllnessForm({onSubmitSuccess}) {
  const { user } = useUser();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [illness, setIllness] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async () => {
    if (!illness.trim()) {
      setError('Please enter the illness name');
      return;
    }
    try {
      // Use the Clerk user id from "user"
      const response = await fetch('http://192.168.1.4:550/illness/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          illness,
          diagnosisDate: date,
          user_id: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Record illness submitted:", data);
      setError('');
      setIllness('');
      setDate(new Date());
      // Close the modal upon successful submission
      onSubmitSuccess();
      setIsFormVisible(false);
    } catch (err) {
      console.error("Error submitting illness record:", err);
      setError("Error submitting illness record. Please try again.");
    }
  }, [illness, date, user?.id]);

  const onDateChange = useCallback((event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  }, []);

  const formatDate = useCallback((date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  return (
    <View style={styles.card}>
      {/* Button to open the illness form modal */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsFormVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="Open Record Illness Form"
      >
        <View style={styles.headerContent}>
          <AlertCircle size={22} color="#dc2626" strokeWidth={2} />
          <Text style={styles.title}>Record an Illness</Text>
        </View>
        <ChevronDown size={20} color="#64748b" style={styles.chevron} />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isFormVisible}
        onRequestClose={() => setIsFormVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Record an Illness</Text>
                <TouchableOpacity
                  onPress={() => setIsFormVisible(false)}
                  accessibilityRole="button"
                  accessibilityLabel="Close Record Illness Form"
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Type or Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter illness name"
                    placeholderTextColor="#94a3b8"
                    value={illness}
                    onChangeText={(text) => {
                      setIllness(text);
                      setError('');
                    }}
                    accessibilityLabel="Illness name input"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Date of Diagnosis</Text>
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowDatePicker(true)}
                    accessibilityRole="button"
                    accessibilityLabel="Select date of diagnosis"
                  >
                    <Text style={styles.dateText}>{formatDate(date)}</Text>
                    <Calendar size={20} color="#64748b" />
                  </TouchableOpacity>
                </View>

                {error ? (
                  <Text style={styles.errorText} accessibilityLiveRegion="polite">
                    {error}
                  </Text>
                ) : null}

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                  accessibilityRole="button"
                  accessibilityLabel="Submit illness record"
                >
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                    maximumDate={new Date()}
                  />
                )}
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E664A',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
    marginLeft: 12,
  },
  chevron: {
    transform: [{ rotate: '0deg' }],
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E664A',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: '600',
  },
  formContainer: {
    paddingBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#0f172a',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif-light',
  },
  dateInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 15,
    color: '#0f172a',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif-light',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
  submitButton: {
    backgroundColor: '#2E664A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
  },
});

export { RecordIllnessForm };
