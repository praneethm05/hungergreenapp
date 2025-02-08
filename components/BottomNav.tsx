import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { View, Text } from "react-native";
import { Home, MessageSquare, PenSquare, Settings } from "lucide-react-native";
import Dashboard from "../screens/dashboard";

// Dummy Screens (unchanged)

const MessagesScreen = () => <View><Text>Messages</Text></View>;
const WriteScreen = () => <View><Text>Write</Text></View>;
const SettingsScreen = () => <View><Text>Settings</Text></View>;

const Tab = createBottomTabNavigator();

const BottomNav = () => {
  return (
   
      <Tab.Navigator
      id={"BottomTabNav" as any} // Add an ID for the navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let IconComponent;
            if (route.name === "Home") IconComponent = Home;
            else if (route.name === "Messages") IconComponent = MessageSquare;
            else if (route.name === "Write") IconComponent = PenSquare;
            else if (route.name === "Settings") IconComponent = Settings;
            return <IconComponent size={size} color={color} />;
          },
          tabBarActiveTintColor: "#16A34A",
          tabBarInactiveTintColor: "#94a3b8",
          tabBarStyle: { backgroundColor: "#fff", paddingBottom: 5 },
          headerShown: false, // Hide headers for all screens
          // tabBarShowLabel: false // Uncomment to hide labels
        })}
      >
        <Tab.Screen name="Home" component={Dashboard} />
        <Tab.Screen name="Messages" component={MessagesScreen} />
        <Tab.Screen name="Write" component={WriteScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>

  );
};

export default BottomNav;