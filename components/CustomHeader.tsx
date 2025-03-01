import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, StatusBar, Animated } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const CustomHeader = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={["#3E885B", "#2E664A"]} style={styles.header}>
        {/* Title Section */}
        <TouchableOpacity onPress={() => navigation.navigate("Main")}>
          <Text style={styles.headerSubtext}>Welcome back to</Text>
          <Text style={styles.headerText}>HUNGER GREEN</Text>
        </TouchableOpacity>

        {/* Notification & Profile Icons */}
        <View style={styles.iconContainer}>
          <TouchableOpacity style={styles.iconButton}>
            <FontAwesome name="bell" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.profileButton} 
            onPress={() => navigation.navigate("Profile")}
          >
            <FontAwesome name="user" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#3E885B",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 8,
  },
  headerSubtext: {
    color: "#dcfce7",
    fontSize: 14,
    marginBottom: 4,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "Avenir-Book" : "sans-serif-light",
    letterSpacing: 0.3,
  },
  headerText: {
    color: "white",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 2,
    fontFamily: Platform.OS === "ios" ? "Avenir-Heavy" : "sans-serif-medium",
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 12,
    borderRadius: 14,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  profileButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 12,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
});

export default CustomHeader;