import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  Platform, 
  StatusBar,
  SafeAreaView
} from "react-native";

import { SignIn,useSignIn } from "@clerk/clerk-react";
import { ChevronRight, UserPlus } from "lucide-react-native";
import { ScrollView } from "react-native-gesture-handler";

const EmailSignin = ({ navigation }: { navigation: any }) => {
  const { signIn, isLoaded ,setActive} = useSignIn();
  
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"enterEmail" | "enterOTP">("enterEmail");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    // Basic email validation regex
    const emailRegex = /\S+@\S+\.\S+/;
    if (!email || !emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }
    if (!isLoaded) {
      Alert.alert("Error", "Authentication is not ready yet");
      return;
    }
    setLoading(true);
    try {
      // Optionally check if the user exists (update API endpoint if needed)
      const response = await fetch(`http://192.168.1.6:5500/users/?email=${encodeURIComponent(email)}`);
      if (!response.ok) {
        throw new Error("Failed to check user existence");
      }
      const data = await response.json();
      
      if (!data || (Array.isArray(data) && data.length === 0)) {
        Alert.alert(
          "No Account Found", 
          "We couldn't find an account with this email address.",
          [
            {
              text: "Sign Up Now",
              onPress: () => navigation.navigate("SignUp"),
              style: "default"
            },
            {
              text: "Cancel",
              style: "cancel"
            }
          ]
        );
        return;
      }

      // Create the sign-in using email_code strategy.
      const result = await signIn.create({
        identifier: email,
        strategy: "email_code",
      });
      if (result.status === "needs_first_factor") {
        setStep("enterOTP");
        Alert.alert("OTP Sent", "A 6-digit code has been sent to your email");
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.errors ? error.errors[0].message : error.message || "Failed to send OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    
    if (!otp || otp.length !== 6) {
      Alert.alert("Invalid OTP", "Please enter a valid 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code: otp,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        Alert.alert("Success!", "You are now logged in!");
      } else {
        Alert.alert("Error", "OTP verification incomplete");
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.errors ? error.errors[0].message : "OTP verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor="#F5F5F5" 
          translucent={false} 
        />
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>hungergreen</Text>
            <Text style={styles.tagline}>Smart Choices,Healthy Living !</Text>
          </View>

          {step === "enterEmail" && (
            <View style={styles.formContainer}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in with your email address</Text>
              
              <TextInput
                style={styles.emailInput}
                placeholder="Email address"
                placeholderTextColor="#A9A9A9"
                value={email}
                onChangeText={(text) => setEmail(text)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              
              <TouchableOpacity
                style={[
                  styles.primaryButton, 
                  (loading || !email) && styles.buttonDisabled
                ]}
                onPress={handleSendOTP}
                disabled={loading || !email}
              >
                <Text style={styles.primaryButtonText}>
                  {loading ? "Sending OTP..." : "Send OTP"}
                </Text>
                <ChevronRight color="white" size={20} />
              </TouchableOpacity>
              
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity 
                  onPress={() => navigation.navigate("SignUp")}
                  style={styles.signupLinkContainer}
                >
                  <Text style={styles.signupLink}>Sign Up</Text>
                  <UserPlus color="#2E664A" size={16} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {step === "enterOTP" && (
            <View style={styles.formContainer}>
              <Text style={styles.title}>Verify OTP</Text>
              <Text style={styles.subtitle}>
                Enter the 6-digit code sent to {email}
              </Text>
              
              <TextInput
                style={styles.otpInput}
                placeholder="Enter 6-digit OTP"
                placeholderTextColor="#A9A9A9"
                value={otp}
                onChangeText={(text) => {
                  const numericText = text.replace(/[^0-9]/g, '');
                  setOtp(numericText.slice(0, 6));
                }}
                keyboardType="numeric"
                maxLength={6}
              />
              
              <TouchableOpacity
                style={[
                  styles.primaryButton, 
                  (loading || otp.length !== 6) && styles.buttonDisabled
                ]}
                onPress={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
              >
                <Text style={styles.primaryButtonText}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </Text>
                <ChevronRight color="white" size={20} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => setStep("enterEmail")}
                style={styles.secondaryActionContainer}
              >
                <Text style={styles.secondaryActionText}>Change Email Address</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <Text style={styles.locationText}>
            Currently Available in India 🇮🇳
          </Text>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    marginTop: Platform.OS === "ios" ? 90 : 50,
    backgroundColor: "#F5F5F5",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    fontSize: 36,
    fontWeight: "700",
    color: "#2E664A",
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  emailInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    fontSize: 16,
    backgroundColor: "white",
  },
  otpInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    fontSize: 16,
    backgroundColor: "white",
  },
  primaryButton: {
    backgroundColor: "#2E664A",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: { 
    color: "white", 
    fontSize: 16, 
    fontWeight: "600",
    marginRight: 10,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  signupText: {
    color: "#666",
    fontSize: 14,
  },
  signupLinkContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  signupLink: {
    color: "#2E664A",
    fontWeight: "600",
    marginRight: 6,
  },
  secondaryActionContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  secondaryActionText: {
    color: "#2E664A",
    fontWeight: "600",
  },
  locationText: {
    textAlign: "center",
    marginTop: 24,
    color: "#666",
    fontSize: 14,
  },
});

export default EmailSignin;
