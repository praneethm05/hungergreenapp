import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./screens/loginScreen";
import SignupScreen from "./screens/signupScreen";
import Dashboard from "./screens/dashboard";
import BottomNav from "./components/BottomNav"; // Import Bottom Navigation
import CustomHeader from "./components/CustomHeader";
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: true, header: () => <CustomHeader />, }}>
        {/* Screens without Bottom Navigation */}

        {/* Screens with Bottom Navigation */}
        <Stack.Screen name="Main" component={BottomNav}  />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignupScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
