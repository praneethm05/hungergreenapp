import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, Platform } from "react-native";
import { Home, MessageSquare, Settings, UserRoundPlus } from "lucide-react-native";
import Dashboard from "../screens/dashboard";
import SearchUsers from "../screens/SearchUsers";
import FeedbackScreen from "../screens/FeedbackScreen";

// Dummy Settings Screen
const SettingsScreen = () => (
  <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
    <Text style={{ fontSize: 18 }}>Settings</Text>
  </View>
);

const Tab = createBottomTabNavigator();

const BottomNav = () => {
  return (
    <Tab.Navigator
      id={"BottomTabNav" as any}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let IconComponent;
          if (route.name === "Home") IconComponent = Home;
          else if (route.name === "Feedback") IconComponent = MessageSquare;
          else if (route.name === "Circle") IconComponent = UserRoundPlus;
          else if (route.name === "Settings") IconComponent = Settings;
          return <IconComponent size={size} color={color} />;
        },
        tabBarActiveTintColor: "#2E664A", // primary dark green
        tabBarInactiveTintColor: "#94a3b8",
        tabBarLabelStyle: {
          fontFamily: Platform.OS === "ios" ? "Avenir-Medium" : "sans-serif-medium",
          fontSize: 12,
          letterSpacing: 0.5,
          marginBottom: 2,
        },
        tabBarStyle: {
          backgroundColor: "#fff",
          height: Platform.OS === "ios" ? 90 : 70,
          paddingBottom: Platform.OS === "ios" ? 20 : 10,
          borderTopColor: "#f1f5f9",
          borderTopWidth: 1,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={Dashboard} />
      <Tab.Screen name="Feedback" component={FeedbackScreen} />
      <Tab.Screen name="Circle" component={SearchUsers} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default BottomNav;
