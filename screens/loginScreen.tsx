import React, { useRef, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  GestureResponderEvent,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";


interface ActionButtonProps {
  onPress: (event: GestureResponderEvent) => void;
  icon?: React.ComponentProps<typeof FontAwesome>["name"];
  text: string;
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
}


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
        <LinearGradient
          colors={["#3E885B", "#2E664A"]}
          style={styles.logoContainer}
        >
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

const ActionButton: React.FC<ActionButtonProps> = ({
  onPress,
  icon,
  text,
  backgroundColor,
  textColor,
  borderColor = "transparent",
}) => {
  return (
    <TouchableOpacity
      style={[styles.actionButton, { backgroundColor, borderColor }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {icon && (
        <FontAwesome
          name={icon}
          size={18}
          color={textColor}
          style={styles.buttonIcon}
        />
      )}
      <Text style={[styles.actionButtonText, { color: textColor }]}>{text}</Text>
    </TouchableOpacity>
  );
};

interface LoginScreenProps {
  navigation: {
    navigate: (screen: string) => void;
  };
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const handleGoogleSignIn = () => {
    console.log("Google Sign-In button pressed");
  };

  const handleSignUp = () => {
    console.log("Sign up button pressed");
    navigation.navigate("SignUp");
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#F6F9F7" />
      <LinearGradient colors={["#F6F9F7", "#EFF5F1"]} style={styles.background}>
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <Header />

            <View style={styles.contentContainer}>
              <View style={styles.welcomeTextContainer}>
                <Text style={styles.welcomeTitle}>Welcome Back</Text>
                <Text style={styles.welcomeMessage}>
                  Continue your journey toward sustainable nutrition and mindful
                  living
                </Text>
              </View>

              <View style={styles.buttonsContainer}>
                <ActionButton
                  icon="google"
                  text="Continue with Google"
                  backgroundColor="#FFFFFF"
                  textColor="#333333"
                  borderColor="#E0E0E0"
                  onPress={handleGoogleSignIn}
                />

                <ActionButton
                  text="Sign up"
                  backgroundColor="#2E664A"
                  textColor="#FFFFFF"
                  onPress={handleSignUp}
                />
              </View>
            </View>

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>
                By continuing, you agree to our{" "}
                <Text style={styles.linkText}>Terms</Text> and{" "}
                <Text style={styles.linkText}>Privacy Policy</Text>
              </Text>
              <TouchableOpacity style={styles.helpButton}>
                <Text style={styles.helpButtonText}>Need help?</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: Platform.OS === "android" ? 60 : 40,
    paddingBottom: 30,
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
  contentContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
    justifyContent: "center",
  },
  welcomeTextContainer: {
    width: "100%",
    marginBottom: 40,
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: 32,
    color: "#2E664A",
    marginBottom: 16,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Avenir-Heavy" : "sans-serif-medium",
    letterSpacing: 0.5,
  },
  welcomeMessage: {
    fontSize: 17,
    color: "#5E8C7B",
    textAlign: "center",
    lineHeight: 26,
    fontFamily: Platform.OS === "ios" ? "Avenir-Medium" : "sans-serif",
    paddingHorizontal: 10,
    letterSpacing: 0.2,
  },
  buttonsContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: "100%",
    justifyContent: "center",
    marginBottom: 18,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonIcon: {
    marginRight: 12,
  },
  actionButtonText: {
    fontSize: 17,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Avenir-Medium" : "sans-serif-medium",
    letterSpacing: 0.3,
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
    marginBottom: 16,
    fontFamily: Platform.OS === "ios" ? "Avenir-Book" : "sans-serif-light",
    letterSpacing: 0.2,
  },
  linkText: {
    color: "#2E664A",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Avenir-Medium" : "sans-serif-medium",
  },
  helpButton: {
    padding: 8,
  },
  helpButtonText: {
    color: "#2E664A",
    fontSize: 15,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Avenir-Medium" : "sans-serif-medium",
    letterSpacing: 0.2,
  },
});

export default LoginScreen;
