import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import debounce from "lodash.debounce";

function LoginScreen({ navigation }) {
  const [isOtpVisible, setIsOtpVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isCountryCodePickerVisible, setIsCountryCodePickerVisible] =
    useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [countryList] = useState([
    { code: "+1", name: "USA" },
    { code: "+91", name: "India" },
    { code: "+44", name: "UK" },
    { code: "+61", name: "Australia" },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    setIsCountryCodePickerVisible(false);
  };

  const handlePhoneSubmit = () => {
    const phoneRegex = /^[0-9]{10}$/;
    if (phoneRegex.test(phoneNumber)) {
      setIsOtpVisible(true);
    } else {
      alert("Please enter a valid 10-digit phone number.");
    }
  };

  const handleOtpSubmit = () => {
    const otpRegex = /^[0-9]{4}$/;
    if (otpRegex.test(otp.trim())) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        alert("OTP verified successfully!");
        navigation.navigate("SignUp");
      }, 2000);
    } else {
      alert("Please enter a valid 4-digit OTP.");
    }
  };

  const handleBack = () => {
    setOtp("");
    setIsOtpVisible(false);
  };

  const handleCountryCodeSelect = (code) => {
    setCountryCode(code);
    setIsCountryCodePickerVisible(false);
  };

  const renderCountryItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.countryItem}
        onPress={() => handleCountryCodeSelect(item.code)}
      >
        <Text style={styles.countryItemText}>
          {item.name} ({item.code})
        </Text>
      </TouchableOpacity>
    ),
    []
  );

  const handlePhoneNumberChange = useCallback(
    debounce((value) => setPhoneNumber(value), 300),
    []
  );

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.title}>HUNGER GREEN</Text>
          <Text style={styles.subtitle}>Your guide to mindful eating</Text>
        </View>

        <View style={styles.formContainer}>
          {!isOtpVisible && (
            <>
              <View style={styles.inputContainer}>
                <TouchableOpacity
                  style={styles.countryCodeButton}
                  onPress={() => {
                    dismissKeyboard();
                    setIsCountryCodePickerVisible(!isCountryCodePickerVisible);
                  }}
                >
                  <Text style={styles.countryCodeText}>
                    {
                      countryList.find((item) => item.code === countryCode)
                        ?.name
                    }{" "}
                    ({countryCode})
                  </Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#C4C4C4"
                  keyboardType="phone-pad"
                  maxLength={10}
                  onChangeText={handlePhoneNumberChange}
                  accessibilityLabel="Phone number input"
                  accessible
                />
              </View>

              {isCountryCodePickerVisible && (
                <FlatList
                  data={countryList}
                  keyExtractor={(item) => item.code}
                  renderItem={renderCountryItem}
                />
              )}

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handlePhoneSubmit}
              >
                <Text style={styles.submitText}>Submit</Text>
              </TouchableOpacity>
            </>
          )}

          {isOtpVisible && (
            <>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter OTP"
                  placeholderTextColor="#C4C4C4"
                  keyboardType="number-pad"
                  maxLength={4}
                  value={otp}
                  onChangeText={setOtp}
                  accessibilityLabel="OTP input"
                  accessible
                />
              </View>
              {isLoading ? (
                <ActivityIndicator size="large" color="#388E3C" />
              ) : (
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleOtpSubmit}
                >
                  <Text style={styles.submitText}>Verify OTP</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backText}>Go Back</Text>
              </TouchableOpacity>
            </>
          )}

          {!isOtpVisible && <Text style={styles.orText}>OR</Text>}

          {!isOtpVisible && (
            <>
              <TouchableOpacity style={styles.socialButton}>
                <FontAwesome name="google" size={20} color="#DB4437" />
                <Text style={styles.socialButtonText}>Sign in with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton}>
                <FontAwesome name="apple" size={20} color="#000000" />
                <Text style={styles.socialButtonText}>Sign in with Apple</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.supportContainer}>
            <Text style={styles.supportText}>
              Having issues? Contact Support
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  /* Styles unchanged */
  container: {
    flex: 1,
    backgroundColor: "#F4F5F7",
    alignItems: "center",
    justifyContent: "center",
  },
  headerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#2E7D32",
    paddingVertical: 50,
    elevation: 5,
  },
  title: {
    fontSize: 35,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "300",
    color: "#D5E8D4",
    textAlign: "center",
    marginTop: 5,
  },
  formContainer: {
    flex: 2,
    width: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginTop: -30,
    elevation: 10,
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    elevation: 5,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
      },
    }),
  },
  countryCodeButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginRight: 10,
  },
  countryCodeText: {
    fontSize: 16,
    color: "#333333",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333333",
  },
  submitButton: {
    backgroundColor: "#388E3C",
    paddingVertical: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 15,
  },
  submitText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  countryItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  countryItemText: {
    fontSize: 16,
    color: "#333333",
  },
  backButton: {
    backgroundColor: "#E0E0E0",
    paddingVertical: 10,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 15,
  },
  backText: {
    fontSize: 16,
    color: "#333333",
  },
  orText: {
    fontSize: 16,
    color: "#888888",
    marginVertical: 20,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F5F7",
    borderRadius: 10,
    width: "100%",
    paddingVertical: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  socialButtonText: {
    fontSize: 16,
    marginLeft: 10,
    color: "#333333",
  },
  supportContainer: {
    marginTop: 20,
  },
  supportText: {
    fontSize: 14,
    color: "#388E3C",
    textAlign: "center",
    textDecorationLine: "underline",
  },
});

export default LoginScreen;
