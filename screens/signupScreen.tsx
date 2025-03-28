import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
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
  TouchableWithoutFeedback,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Bar } from "react-native-progress";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSignUp } from "@clerk/clerk-expo";

// Extend the form data interface to include phone and diet_type
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
  diet_type: string;
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
  diet_type: "Nonvegetarian", // default value
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
  diet_type: "Diet Type",
};

const validationRules: Partial<Record<keyof FormData, (v: any) => boolean | string>> = {
  username: (v: string) => v.length >= 3 || "Username must be at least 3 characters",
  email: (v: string) => /\S+@\S+\.\S+/.test(v) || "Please enter a valid email",
  name: (v: string) => v.length >= 2 || "Please enter your full name",
  phone: (v: string) =>
    /^\+?[1-9]\d{1,14}$/.test(v) || "Please provide a valid phone number (e.g., +1234567890)",
  weight: (v: string) =>
    (!isNaN(Number(v)) && Number(v) >= 20 && Number(v) <= 300) ||
    "Please enter a valid weight (20-300 kg)",
  height: (v: string) =>
    (!isNaN(Number(v)) && Number(v) >= 50 && Number(v) <= 300) ||
    "Please enter a valid height (50-300 cm)",
  sex: (v: string) => !!v || "Please select your gender",
  diet_type: (v: string) =>
    ["Vegetarian", "Eggetarian", "Nonvegetarian"].includes(v) ||
    "Please select a valid diet type",
};

const Header: React.FC = () => {
  const scaleValue = useRef(new Animated.Value(1)).current;
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
  const { signUp, setActive } = useSignUp();
  const [loading, setLoading] = useState<boolean>(false);
  const [datePickerMode, setDatePickerMode] = useState<"date" | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [currentField, setCurrentField] = useState<keyof FormData>("username");
  const [fadeAnim] = useState(new Animated.Value(1));
  const [progress, setProgress] = useState<number>(0);
  const [clerkStep, setClerkStep] = useState<"form" | "emailVerification">("form");
  const [otp, setOtp] = useState("");
  const [clerkUserId, setClerkUserId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", (event) => {
      if (Platform.OS === "ios") {
        const keyboardHeight = event.endCoordinates.height;
        scrollViewRef.current?.scrollTo({ y: keyboardHeight, animated: true });
      }
    });
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const fields = useMemo(() => Object.keys(initialFormState) as (keyof FormData)[], []);

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

  // Save user info to your DB.
  // BMI is calculated by the backend using weight and height.
  // This function converts allergies and medical conditions into arrays (splitting on commas).
  const saveToDB = async (userId: string | null) => {
    if (!userId) throw new Error("Missing Clerk user ID");
    const payload = {
      diet_type: formData.diet_type,
      user_id: userId,
      name: formData.name,
      username: formData.username,
      email: formData.email,
      phone: formData.phone,
      dob: formData.dob.toISOString(),
      weight: Number(formData.weight),
      height: Number(formData.height),
      sex: formData.sex,
      allergies: formData.allergies
        ? formData.allergies.split(",").map((a) => a.trim()).filter(Boolean)
        : [],
      medical_conditions: formData.medicalConditions
        ? formData.medicalConditions.split(",").map((c) => c.trim()).filter(Boolean)
        : [],
      profile_picture: "https://via.placeholder.com/100",
      circle: [],
    };
    const response = await fetch("http://192.168.1.4:550/users/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error("Failed to save user data to the database");
    }
    return response.json();
  };

  const handleClerkSignUp = useCallback(async () => {
    try {
      setLoading(true);
      const result = await signUp.create({
        emailAddress: formData.email,
        username: formData.username,
        unsafeMetadata: {
          name: formData.name,
          dob: formData.dob.toISOString(),
          weight: formData.weight,
          height: formData.height,
          sex: formData.sex,
          allergies: formData.allergies,
          medicalConditions: formData.medicalConditions,
          phone: formData.phone,
          diet_type: formData.diet_type,
        },
      });
      setClerkUserId(result.createdUserId);
      await signUp.prepareEmailAddressVerification();
      setClerkStep("emailVerification");
      Alert.alert("OTP Sent", "A 6‑digit code has been sent to your email");
    } catch (err: any) {
      console.error("Signup error:", err);
      Alert.alert("Sign‑Up Failed", err?.message || "An unknown error occurred during sign‑up.");
    } finally {
      setLoading(false);
    }
  }, [formData, signUp]);

  const handleNextField = useCallback(() => {
    if (!validateField(currentField)) return;
    const currentIndex = fields.indexOf(currentField);
    if (currentIndex === fields.length - 1) {
      setProgress(1);
      handleClerkSignUp();
    } else {
      const nextIndex = currentIndex + 1;
      setCurrentField(fields[nextIndex]);
      setProgress((nextIndex + 1) / fields.length);
    }
  }, [currentField, fields, handleClerkSignUp, validateField]);

  const handlePreviousField = useCallback(() => {
    const currentIndex = fields.indexOf(currentField);
    if (currentIndex > 0) {
      setCurrentField(fields[currentIndex - 1]);
      setProgress(currentIndex / fields.length);
    }
  }, [currentField, fields]);

  const handleVerifyOTP = useCallback(async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert("Invalid OTP", "Please enter a valid 6‑digit OTP");
      return;
    }
    console.log("Attempting OTP verification with code:", otp);
    try {
      setLoading(true);
      const verificationAttempt = await signUp.attemptEmailAddressVerification({ code: otp });
      console.log("Verification attempt result:", verificationAttempt);
      if (verificationAttempt.status === "complete") {
        await saveToDB(verificationAttempt.createdUserId || clerkUserId);
        await setActive({ session: verificationAttempt.createdSessionId });
        Alert.alert("Success 🎉", "Your account has been created successfully!", [
          { text: "OK", onPress: () => { return null; } },
        ]);
      } else {
        Alert.alert("Error", "OTP verification incomplete. Please try again.");
      }
    } catch (err: any) {
      console.error("OTP verification error:", err);
      Alert.alert("Error", err?.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  }, [otp, clerkUserId, signUp, setActive, navigation, saveToDB]);

  const renderField = () => {
    const commonProps: Partial<TextInputProps> = {
      style: [styles.input, errors[currentField] && styles.inputError],
      placeholderTextColor: "#5E8C7B",
      onSubmitEditing: handleNextField,
      returnKeyType: "next" as ReturnKeyTypeOptions,
      placeholder: `Enter your ${fieldLabels[currentField].toLowerCase()}`,
      autoCapitalize: ["email", "username"].includes(currentField) ? "none" : "words",
    };

    if (currentField === "phone") {
      return (
        <TextInput
          {...commonProps}
          value={formData.phone}
          keyboardType="phone-pad"
          onChangeText={(text) => {
            let normalized = text;
            if (normalized === "") {
              updateFormField("phone", "");
            } else if (!normalized.startsWith("+91")) {
              // Remove any non-digit characters
              const digitsOnly = normalized.replace(/[^0-9]/g, "");
              normalized = "+91" + digitsOnly;
              updateFormField("phone", normalized);
            } else {
              updateFormField("phone", normalized);
            }
          }}
        />
      );
    }

    switch (currentField) {
      case "dob":
        return (
          <>
            <TouchableOpacity
              style={[styles.input, errors[currentField] && styles.inputError]}
              onPress={handleDatePress}
            >
              <Text style={styles.dateText}>{formData.dob.toLocaleDateString()}</Text>
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
      case "diet_type":
        return (
          <View style={styles.sexButtonsContainer}>
            {["Vegetarian", "Eggetarian", "Nonvegetarian"].map((diet) => (
              <TouchableOpacity
                key={diet}
                style={[styles.sexButton, formData.diet_type === diet && styles.selectedSexButton]}
                onPress={() => updateFormField("diet_type", diet)}
              >
                <Text
                  style={[
                    styles.sexButtonText,
                    formData.diet_type === diet && styles.selectedSexButtonText,
                  ]}
                >
                  {diet}
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
              ["weight", "height"].includes(currentField)
                ? "numeric"
                : currentField === "phone"
                ? "phone-pad"
                : "default"
            }
          />
        );
    }
  };

  if (clerkStep === "emailVerification") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F6F9F7" />
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            ref={scrollViewRef}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollViewContent}
          >
            <View style={styles.otpContainer}>
              <Text style={styles.otpHeader}>Email Verification</Text>
              <Text style={styles.otpMessage}>Enter the OTP sent to your email</Text>
              <TextInput
                style={styles.input}
                value={otp}
                onChangeText={(text) => {
                  const numericText = text.replace(/[^0-9]/g, "");
                  setOtp(numericText.slice(0, 6));
                }}
                keyboardType="numeric"
                maxLength={6}
                placeholder="Enter OTP"
                placeholderTextColor="#5E8C7B"
              />
              <TouchableOpacity
                style={[styles.verifyOtpButton, loading && styles.actionButtonDisabled]}
                onPress={handleVerifyOTP}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.actionButtonText}>Verify OTP</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            ref={scrollViewRef}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[styles.scrollViewContainer, { paddingBottom: 20 }]}
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
              <View style={styles.navigationButtons}>
                {fields.indexOf(currentField) > 0 && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.previousButton]}
                    onPress={handlePreviousField}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.actionButtonText}>Previous</Text>
                  </TouchableOpacity>
                )}
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
              </View>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={styles.backButtonText}>Back to login</Text>
              </TouchableOpacity>
            </Animated.View>
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>
                By continuing, you agree to our{" "}
                <Text style={styles.linkText}>Terms</Text> and{" "}
                <Text style={styles.linkText}>Privacy Policy</Text>
              </Text>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  keyboardAvoidingContainer: { flex: 1 },
  scrollViewContainer: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingBottom: 20,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "space-between",
    padding: 20,
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
  logoIconContainer: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
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
  formHeaderContainer: { marginTop: 10, marginBottom: 20, alignItems: "center" },
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
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Avenir-Medium" : "sans-serif",
  },
  progressBarContainer: { marginBottom: 25 },
  formContainer: { paddingHorizontal: 30 },
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
  inputError: { borderColor: "#FF6B6B" },
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
  selectedSexButton: { backgroundColor: "#2E664A", borderColor: "#2E664A" },
  sexButtonText: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "Avenir-Medium" : "sans-serif-medium",
  },
  selectedSexButtonText: { color: "#FFFFFF" },
  errorText: {
    color: "#FF6B6B",
    fontSize: 14,
    marginTop: -15,
    marginBottom: 15,
    fontFamily: Platform.OS === "ios" ? "Avenir-Book" : "sans-serif-light",
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: "#2E664A",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  previousButton: { backgroundColor: "#83A794" },
  actionButtonDisabled: { backgroundColor: "#B0B0B0" },
  verifyOtpButton: {
    backgroundColor: "#2E664A",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Avenir-Medium" : "sans-serif-medium",
    letterSpacing: 0.3,
  },
  backButton: { paddingVertical: 12, alignItems: "center" },
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
  otpContainer: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F6F9F7",
  },
  otpHeader: {
    fontSize: 24,
    color: "#2E664A",
    marginBottom: 10,
    fontWeight: "700",
  },
  otpMessage: {
    fontSize: 16,
    color: "#5E8C7B",
    marginBottom: 20,
    textAlign: "center",
  },
  // ...additional styles remain unchanged
});

export default SignUpScreen;
