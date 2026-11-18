import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from "react-native";
import * as Localization from "expo-localization";
import { login, signup } from "../api";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen({ navigation }) {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const { setUserName } = useAuth();

  const onSubmit = async () => {
    setBusy(true);
    try {
      const timezone = Localization.getCalendars?.()[0]?.timeZone || "Australia/Melbourne";
      const result = isSignup
        ? await signup(name, email, password, timezone)
        : await login(email, password);
      setUserName(result.name);
    } catch (err) {
      Alert.alert("Couldn't sign you in", err?.response?.data?.error || err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <Text style={styles.title}>Chat with Clara</Text>
      <Text style={styles.subtitle}>A friendly daily English chat</Text>

      {isSignup && (
        <TextInput style={styles.input} placeholder="Your name" value={name} onChangeText={setName} />
      )}
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={onSubmit} disabled={busy}>
        <Text style={styles.buttonText}>{busy ? "Please wait..." : isSignup ? "Create account" : "Log in"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
        <Text style={styles.switchText}>
          {isSignup ? "Already have an account? Log in" : "New here? Create an account"}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#fdf6ec" },
  title: { fontSize: 28, fontWeight: "700", textAlign: "center", color: "#4a3f35" },
  subtitle: { fontSize: 15, textAlign: "center", color: "#8a7b6c", marginBottom: 32 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#eadfce",
  },
  button: { backgroundColor: "#d98c4a", borderRadius: 12, paddingVertical: 16, marginTop: 8 },
  buttonText: { color: "#fff", textAlign: "center", fontSize: 17, fontWeight: "600" },
  switchText: { textAlign: "center", marginTop: 20, color: "#a07a52" },
});
