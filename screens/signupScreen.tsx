import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  StyleSheet,
  TextInputProps,
  ReturnKeyTypeOptions,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Bar } from "react-native-progress";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Define the form data interface
interface FormData {
  username: string;
  email: string;
  name: string;
  phone: string;
  dob: Date;
  weight: string;
  height: string;
  sex: string;
  allergies: string;
  medicalConditions: string;
}

const initialFormState: FormData = {
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
};

// Define the navigation props interface (adjust as needed)
interface SignUpScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

const fieldLabels: Record<keyof FormData, string> = {
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
};

const validationRules: Partial<Record<keyof FormData, (v: any) => boolean | string>> = {
  username: (v: string) => v.length >= 3 || "Username must be at least 3 characters",
  email: (v: string) => /\S+@\S+\.\S+/.test(v) || "Please enter a valid email",
  name: (v: string) => v.length >= 2 || "Please enter your full name",
  phone: (v: string) => /^\d{10}$/.test(v) || "Please enter a valid 10-digit number",
  weight: (v: string) =>
    (!isNaN(Number(v)) && Number(v) >= 20 && Number(v) <= 300) ||
    "Please enter a valid weight (20-300 kg)",
  height: (v: string) =>
    (!isNaN(Number(v)) && Number(v) >= 50 && Number(v) <= 300) ||
    "Please enter a valid height (50-300 cm)",
  sex: (v: string) => !!v || "Please select your gender",
};

const Header: React.FC = () => {
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulseAnimation = Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1.05,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]);
    Animated.loop(pulseAnimation).start();
  }, [scaleValue]);

  return (
    <View style={styles.headerContainer}>
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <LinearGradient colors={["#3E885B", "#2E664A"]} style={styles.logoContainer}>
          <View style={styles.logoIconContainer}>
            <FontAwesome name="leaf" size={24} color="#FFFFFF" />
          </View>
        </LinearGradient>
      </Animated.View>
      <Text style={styles.title}>HUNGER GREEN</Text>
      <Text style={styles.subtitle}>Mindful eating for a better living</Text>
    </View>
  );
};

const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState<boolean>(false);
  const [datePickerMode, setDatePickerMode] = useState<"date" | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [currentField, setCurrentField] = useState<keyof FormData>("username");
  const [fadeAnim] = useState(new Animated.Value(1));
  const [progress, setProgress] = useState<number>(0);

  // Memoize the list of fields so it remains stable between renders
  const fields = useMemo(() => Object.keys(initialFormState) as (keyof FormData)[], []);

  useEffect(() => {
    const keyboardShow = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const keyboardHide = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(keyboardShow, () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener(keyboardHide, () => setKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const validateField = useCallback(
    (field: keyof FormData) => {
      const value = formData[field];
      const rule = validationRules[field];
      const isValid = rule ? rule(value) : true;
      setErrors((prev) => ({
        ...prev,
        [field]: isValid === true ? "" : (isValid as string),
      }));
      return isValid === true;
    },
    [formData]
  );

  const updateFormField = useCallback((field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }, []);

  const handleDatePress = () => {
    setDatePickerMode("date");
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setDatePickerMode(null);
    if (event.type === "set" && selectedDate) {
      updateFormField("dob", selectedDate);
    }
  };

  const handleSignUp = useCallback(async () => {
    try {
      setLoading(true);
      const isValid = fields.every((field) => validateField(field));
      if (!isValid) throw new Error("Please fill all fields correctly.");

      // Simulate an API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Alert.alert("Success 🎉", "Your account has been created successfully!", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (err: any) {
      Alert.alert("Sign-Up Failed", err.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  }, [fields, validateField, navigation]);

  const handleNextField = useCallback(() => {
    if (!validateField(currentField)) return;

    const currentIndex = fields.indexOf(currentField);

    if (currentIndex === fields.length - 1) {
      setProgress(1);
      handleSignUp();
    } else {
      const nextIndex = currentIndex + 1;
      setCurrentField(fields[nextIndex]);
      setProgress((nextIndex + 1) / fields.length);
    }
  }, [currentField, validateField, fields, handleSignUp]);

  const renderField = () => {
    const commonProps: Partial<TextInputProps> = {
      style: [styles.input, errors[currentField] && styles.inputError],
      placeholderTextColor: "#5E8C7B",
      onSubmitEditing: handleNextField,
      // Explicitly cast the returnKeyType so TypeScript recognizes it as a valid ReturnKeyTypeOptions value.
      returnKeyType: "next" as ReturnKeyTypeOptions,
      placeholder: `Enter your ${fieldLabels[currentField].toLowerCase()}`,
      autoCapitalize: ["email", "username"].includes(currentField) ? "none" : "words",
    };

    switch (currentField) {
      case "dob":
        return (
          <>
            <TouchableOpacity
              style={[styles.input, errors[currentField] && styles.inputError]}
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
                style={[styles.sexButton, formData.sex === gender && styles.selectedSexButton]}
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
            value={formData[currentField] as string}
            onChangeText={(text) => updateFormField(currentField, text)}
            keyboardType={
              ["phone", "weight", "height"].includes(currentField)
                ? "numeric"
                : "default"
            }
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 100}
      >
        <StatusBar barStyle="light-content" backgroundColor="#F6F9F7" />
        <LinearGradient colors={["#F6F9F7", "#EFF5F1"]} style={styles.background}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollViewContainer,
              { paddingBottom: keyboardVisible ? 150 : 20 },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            <Header />
            <View style={styles.formHeaderContainer}>
              <Text style={styles.welcomeText}>Join Our Community</Text>
              <Text style={styles.formTitle}>
                Step {fields.indexOf(currentField) + 1} of {fields.length}
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <Bar
                progress={progress}
                width={null}
                height={8}
                color="#3E885B"
                unfilledColor="#E0E0E0"
                borderWidth={0}
                borderRadius={4}
              />
            </View>
            <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
              <Text style={styles.fieldTitle}>{fieldLabels[currentField]}</Text>
              {renderField()}
              {errors[currentField] && <Text style={styles.errorText}>{errors[currentField]}</Text>}
              <TouchableOpacity
                style={[styles.actionButton, loading && styles.actionButtonDisabled]}
                onPress={handleNextField}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.actionButtonText}>
                    {currentField === fields[fields.length - 1] ? "Complete" : "Continue"}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={styles.backButtonText}>Back to login</Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our{" "}
              <Text style={styles.linkText}>Terms</Text> and{" "}
              <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  scrollViewContainer: {
    flexGrow: 1,
  },
  headerContainer: {
    paddingTop: Platform.OS === "android" ? 40 : 30,
    paddingBottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  logoIconContainer: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    color: "#2E664A",
    letterSpacing: 2,
    marginBottom: 8,
    fontWeight: "800",
    fontFamily: Platform.OS === "ios" ? "Avenir-Heavy" : "sans-serif-medium",
  },
  subtitle: {
    fontSize: 16,
    color: "#5E8C7B",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Avenir-Book" : "sans-serif-light",
    letterSpacing: 0.3,
  },
  formHeaderContainer: {
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 30,
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 28,
    color: "#2E664A",
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Avenir-Heavy" : "sans-serif-medium",
  },
  formTitle: {
    fontSize: 18,
    color: "#5E8C7B",
    fontFamily: Platform.OS === "ios" ? "Avenir-Medium" : "sans-serif",
    textAlign: "center",
  },
  progressBarContainer: {
    paddingHorizontal: 30,
    marginBottom: 25,
  },
  formContainer: {
    paddingHorizontal: 30,
  },
  fieldTitle: {
    fontSize: 18,
    color: "#2E664A",
    marginBottom: 12,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Avenir-Medium" : "sans-serif-medium",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 17,
    color: "#333333",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    fontFamily: Platform.OS === "ios" ? "Avenir-Book" : "sans-serif",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  inputError: {
    borderColor: "#FF6B6B",
  },
  dateText: {
    fontSize: 17,
    color: "#333333",
    fontFamily: Platform.OS === "ios" ? "Avenir-Book" : "sans-serif",
  },
  sexButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  sexButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    marginHorizontal: 5,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedSexButton: {
    backgroundColor: "#2E664A",
    borderColor: "#2E664A",
  },
  sexButtonText: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "Avenir-Medium" : "sans-serif-medium",
  },
  selectedSexButtonText: {
    color: "#FFFFFF",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 14,
    marginTop: -15,
    marginBottom: 15,
    fontFamily: Platform.OS === "ios" ? "Avenir-Book" : "sans-serif-light",
  },
  actionButton: {
    backgroundColor: "#2E664A",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionButtonDisabled: {
    backgroundColor: "#83A794",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Avenir-Medium" : "sans-serif-medium",
    letterSpacing: 0.3,
  },
  backButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  backButtonText: {
    color: "#2E664A",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Avenir-Medium" : "sans-serif-medium",
  },
  footerContainer: {
    paddingHorizontal: 30,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#5E8C7B",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Avenir-Book" : "sans-serif-light",
    letterSpacing: 0.2,
  },
  linkText: {
    color: "#2E664A",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Avenir-Medium" : "sans-serif-medium",
  },
});

export default SignUpScreen;
