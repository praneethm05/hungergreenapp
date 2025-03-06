// navigation/RootNavigator.js
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "@clerk/clerk-expo";
import { ActivityIndicator, View, Text } from "react-native";

import LoginScreen from "../screens/loginScreen";
import SignupScreen from "../screens/signupScreen";
import BottomNav from "../components/BottomNav";
import CustomHeader from "../components/CustomHeader";
import ProfileSettings from "../screens/ProfileManagement";
import AllMealsScreen from "../screens/AllMealsScreen";
import EmailSignIn from "../screens/EmailSignIn";
import { User } from "lucide-react-native";
import UserProfile from "../screens/UserProfile";

const AuthStack = createStackNavigator();
const AppStack = createStackNavigator();

function AuthStackNavigator() {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="SignUp"
        component={SignupScreen}
        options={{ headerShown: false }}
      />

      <AuthStack.Screen
        name="EmailSignIn"
        component={EmailSignIn}
        options={{ headerShown: false }}
      />
    </AuthStack.Navigator>
  );
}

function AppStackNavigator() {
  return (
    <AppStack.Navigator
      screenOptions={({ navigation }) => ({
        header: () => <CustomHeader navigation={navigation} />,
        headerShown: true,
      })}
    >
      <AppStack.Screen name="Main" component={BottomNav} />
      <AppStack.Screen
        name="AllMeals"
        component={AllMealsScreen}
        options={{ headerShown: true }}
      />

      <AppStack.Screen
        name="UserProfile"
        component={UserProfile}
        options={{ headerShown: true }}
      />
      <AppStack.Screen name="Profile" component={ProfileSettings} />
    </AppStack.Navigator>
  );
}

function RootNavigator() {
  const { isSignedIn, isLoaded } = useAuth();
  console.log("Auth state:", { isLoaded, isSignedIn });

  if (!isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "red",
        }}
      >
        <ActivityIndicator size="large" color="#FFF" />
        <Text style={{ color: "#FFF", marginTop: 10 }}>Loading Auth...</Text>
      </View>
    );
  }

  return isSignedIn ? <AppStackNavigator /> : <AuthStackNavigator />;
}

export default RootNavigator;
