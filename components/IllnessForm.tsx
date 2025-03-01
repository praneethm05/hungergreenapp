import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Platform 
} from 'react-native';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ChevronDown, Calendar, AlertCircle } from 'lucide-react-native';

function RecordIllnessForm() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [illness, setIllness] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!illness.trim()) {
      setError('Please enter the illness name');
      return;
    }
    // Handle form submission
    console.log({ illness, date });
    setError('');
    setIllness('');
    setDate(new Date());
    setIsFormVisible(false);
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity 
        style={styles.header}
        onPress={() => setIsFormVisible(!isFormVisible)}
      >
        <View style={styles.headerContent}>
          <AlertCircle size={22} color="#dc2626" strokeWidth={2} />
          <Text style={styles.title}>Record an Illness</Text>
        </View>
        <ChevronDown 
          size={20} 
          color="#64748b" 
          style={[
            styles.chevron,
            isFormVisible && styles.chevronUp
          ]}
        />
      </TouchableOpacity>

      {isFormVisible && (
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Type or Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter illness name"
              value={illness}
              onChangeText={(text) => {
                setIllness(text);
                setError('');
              }}
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date of Diagnosis</Text>
            <TouchableOpacity 
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>{formatDate(date)}</Text>
              <Calendar size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
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
        </View>
      )}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E664A',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
  },
  chevron: {
    transform: [{ rotate: '0deg' }],
  },
  chevronUp: {
    transform: [{ rotate: '180deg' }],
  },
  formContainer: {
    padding: 20,
    paddingTop: 0,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
    marginBottom: 8,
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
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: '#2E664A', // Updated to darker primary green
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
