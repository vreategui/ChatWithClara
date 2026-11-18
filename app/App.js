import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthProvider, useAuth } from "./src/context/AuthContext";
import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ChatSessionScreen from "./src/screens/ChatSessionScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import { View, ActivityIndicator } from "react-native";

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { userName, isReady } = useAuth();

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#d98c4a" />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {!userName ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Chat with Clara" }} />
          <Stack.Screen name="ChatSession" component={ChatSessionScreen} options={{ title: "Today's chat" }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Settings" }} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
