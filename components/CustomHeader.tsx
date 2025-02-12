import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, StatusBar } from "react-native";
import { User, Bell } from "lucide-react-native"; // Import Bell icon

const CustomHeader = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        {/* Title Section */}
        <View>
          <Text style={styles.headerSubtext}>Welcome back to</Text>
          <Text style={styles.headerText}>HUNGER GREEN</Text>
        </View>

        {/* Notification & Profile Icons */}
        <View style={styles.iconContainer}>
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={24} color="white" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileButton}>
            <User size={24} color="white" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#4CAF50",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0, // Fix for Android status bar
  },
  header: {
    backgroundColor: "#16A34A",
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  headerSubtext: {
    color: "#dcfce7",
    fontSize: 14,
    marginBottom: 4,
    fontWeight: "500",
  },
  headerText: {
    color: "white",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 1,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 10,
    borderRadius: 14,
    marginRight: 10, // Space between icons
  },
  profileButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 12,
    borderRadius: 14,
  },
});

export default CustomHeader;
