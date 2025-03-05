import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import { Text } from "react-native";
import RootNavigator from "./navigation/RootNavigator";
import { tokenCache } from "./cache";

// Retrieve your publishable key from an environment variable or hard-code for testing.
const publishableKey =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || "your-clerk-publishable-key";

if (!publishableKey) {
  throw new Error(
    "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env"
  );
}

export default function App() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        {console.log("ClerkLoaded")}
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
