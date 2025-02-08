import React, { useState, useCallback, useRef } from "react";

import { styles } from "../styles/loginStyles";
import {
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

interface Country {
  code: string;
  name: string;
}

interface LoginScreenProps {
  navigation: {
    navigate: (screen: string) => void;
  };
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [isOtpVisible, setIsOtpVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isCountryCodePickerVisible, setIsCountryCodePickerVisible] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [isLoading, setIsLoading] = useState(false);

  const countryList: Country[] = [
    { code: "+1", name: "USA" },
    { code: "+91", name: "India" },
    { code: "+44", name: "UK" },
    { code: "+61", name: "Australia" },
  ];

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    setIsCountryCodePickerVisible(false);
  };

  const handlePhoneSubmit = () => {
    debouncedPhoneNumberChange.flush(); // Ensure latest value is set
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
  const handleCountryCodeSelect = useCallback((code: string) => {
    setCountryCode(code);
    setIsCountryCodePickerVisible(false);
    }, []);
    
    const renderCountryItem = useCallback(
    ({ item }: { item: Country }) => (
    <TouchableOpacity
    style={styles.countryItem}
    onPress={() => handleCountryCodeSelect(item.code)}
    >
    <Text style={styles.countryItemText}>
    {item.name} ({item.code})
    </Text>
    </TouchableOpacity>
    ),
    [handleCountryCodeSelect]
    );
  const debouncedPhoneNumberChange = useRef(
    debounce((value: string) => {
      setPhoneNumber(value);
    },300)
  ).current;

  const handlePhoneNumberChange = (value: string) => {
    debouncedPhoneNumberChange(value);
  };
  


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
                    {countryList.find((item) => item.code === countryCode)?.name} ({countryCode})
                  </Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#C4C4C4"
                  keyboardType="phone-pad"
                  maxLength={10}
                  // value={phoneNumber}
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
            <Text style={styles.supportText}>Having issues? Contact Support</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};


export default LoginScreen;
