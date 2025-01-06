import React, { useState, useEffect, useCallback } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Keyboard,
} from "react-native";

import { styles } from "../styles/signupStyles";
import { Bar } from "react-native-progress";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const initialFormState = {
  username: "",
  email: "",
  name: "",
  phone: "",
  dob: new Date(),
  weight: "",
  height: "",
  sex: "",
  allergies: "",
  medicalConditions: "",
  circle: "",
};

const fieldLabels = {
  username: "Username",
  email: "Email Address",
  name: "Full Name",
  phone: "Phone Number",
  dob: "Date of Birth",
  weight: "Weight (kg)",
  height: "Height (cm)",
  sex: "Gender",
  allergies: "Allergies",
  medicalConditions: "Medical Conditions",
  circle: "Circle of Care",
};

const validationRules = {
  username: (v) => v.length >= 3 || "Username must be at least 3 characters",
  email: (v) => /\S+@\S+\.\S+/.test(v) || "Please enter a valid email",
  name: (v) => v.length >= 2 || "Please enter your full name",
  phone: (v) => /^\d{10}$/.test(v) || "Please enter a valid 10-digit number",
  weight: (v) =>
    (!isNaN(v) && v >= 20 && v <= 300) ||
    "Please enter a valid weight (20-300 kg)",
  height: (v) =>
    (!isNaN(v) && v >= 50 && v <= 300) ||
    "Please enter a valid height (50-300 cm)",
  sex: (v) => !!v || "Please select your gender",
  circle: (v) => !!v || "Please enter your circle of care",
};

function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [currentField, setCurrentField] = useState("username");
  const [fadeAnim] = useState(new Animated.Value(1));
  const [progress, setProgress] = useState(0);

  const fields = Object.keys(initialFormState);

  useEffect(() => {
    const keyboardShow =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const keyboardHide =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(keyboardShow, () =>
      setKeyboardVisible(true)
    );
    const hideSubscription = Keyboard.addListener(keyboardHide, () =>
      setKeyboardVisible(false)
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const validateField = useCallback(
    (field) => {
      const value = formData[field];
      const isValid = validationRules[field]
        ? validationRules[field](value)
        : true;

      setErrors((prev) => ({
        ...prev,
        [field]: isValid === true ? "" : isValid,
      }));
      return isValid === true;
    },
    [formData]
  );

  const updateFormField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }, []);

  const handleDatePress = () => {
    setDatePickerMode("date");
  };

  const handleDateChange = (event, selectedDate) => {
    setDatePickerMode(null);
    if (event.type === "set" && selectedDate) {
      updateFormField("dob", selectedDate);
    }
  };

  const handleNextField = useCallback(() => {
    if (!validateField(currentField)) return;

    const currentIndex = fields.indexOf(currentField);

    if (currentIndex === fields.length - 1) {
      setProgress(1); // Ensure progress is 100% when completing the form
      handleSignUp();
    } else {
      const nextIndex = currentIndex + 1;
      setCurrentField(fields[nextIndex]);
      setProgress((nextIndex + 1) / fields.length); // Update progress accurately
    }
  }, [currentField, validateField, fields]);

  const handleSignUp = async () => {
    try {
      setLoading(true);
      const isValid = fields.every((field) => validateField(field));
      if (!isValid) throw new Error("Please fill all fields correctly.");

      await new Promise((resolve) => setTimeout(resolve, 1500));
      Alert.alert("Success 🎉", "Your account has been created successfully!", [
        { text: "OK" },
      ]);
    } catch (err) {
      Alert.alert(
        "Sign-Up Failed",
        err.message || "An unknown error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderField = () => {
    const commonProps = {
      style: [styles.input, errors[currentField] && styles.inputError],
      placeholderTextColor: "#999",
      onSubmitEditing: handleNextField,
      returnKeyType: "next",
      placeholder: `Enter your ${fieldLabels[currentField].toLowerCase()}`,
    };

    switch (currentField) {
      case "dob":
        return (
          <>
            <TouchableOpacity
              style={[styles.input, errors.dob && styles.inputError]}
              onPress={handleDatePress}
            >
              <Text style={styles.dateText}>
                {formData.dob.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            {datePickerMode && (
              <DateTimePicker
                value={formData.dob}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
          </>
        );
      case "sex":
        return (
          <View style={styles.sexButtonsContainer}>
            {["Male", "Female", "Other"].map((gender) => (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.sexButton,
                  formData.sex === gender && styles.selectedSexButton,
                ]}
                onPress={() => updateFormField("sex", gender)}
              >
                <Text
                  style={[
                    styles.sexButtonText,
                    formData.sex === gender && styles.selectedSexButtonText,
                  ]}
                >
                  {gender}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      default:
        return (
          <TextInput
            {...commonProps}
            value={formData[currentField]}
            onChangeText={(text) => updateFormField(currentField, text)}
            keyboardType={
              ["phone", "weight", "height"].includes(currentField)
                ? "numeric"
                : "default"
            }
            autoCapitalize={
              ["email", "username"].includes(currentField) ? "none" : "words"
            }
          />
        );
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollViewContainer,
            { paddingBottom: insets.bottom + 20 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerContainer}>
            <Text style={styles.welcomeText}>Welcome! 👋</Text>
            <Text style={styles.title}>Create Your Account</Text>
            <Text style={styles.subtitle}>
              Step {fields.indexOf(currentField) + 1} of {fields.length}
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <Bar
              progress={progress}
              width={null}
              height={8}
              color="#4CAF50"
              borderRadius={4}
            />
          </View>
          <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
            <Text style={styles.fieldTitle}>{fieldLabels[currentField]}</Text>
            {renderField()}
            {errors[currentField] && (
              <Text style={styles.errorText}>{errors[currentField]}</Text>
            )}
            <TouchableOpacity
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled,
              ]}
              onPress={handleNextField}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitText}>
                  {currentField === fields[fields.length - 1]
                    ? "Complete"
                    : "Continue"}
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default SignUpScreen;
