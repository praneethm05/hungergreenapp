import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./screens/loginScreen";
import SignupScreen from "./screens/signupScreen";
import BottomNav from "./components/BottomNav"; // Import Bottom Navigation
import CustomHeader from "./components/CustomHeader";
import ProfileSettings from "./screens/ProfileManagement";
import AllMealsScreen from "./screens/AllMealsScreen";
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={({ navigation }) => ({
          header: () => <CustomHeader navigation={navigation} />,
          headerShown: true,
        })}
      >
        {/* Screens without Bottom Navigation */}
        <Stack.Screen name="Main" component={BottomNav} />
        <Stack.Screen
          name="AllMeals"
          component={AllMealsScreen}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        {/* Screens with Bottom Navigation */}

        <Stack.Screen name="Profile" component={ProfileSettings} />
        <Stack.Screen
          name="SignUp"
          component={SignupScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
