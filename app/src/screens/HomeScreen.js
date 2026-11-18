import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import * as Localization from "expo-localization";
import { getTodayTopic, registerPushToken, logout } from "../api";
import { registerForPushNotificationsAsync } from "../notifications";
import { useAuth } from "../context/AuthContext";

export default function HomeScreen({ navigation }) {
  const { userName, setUserName } = useAuth();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadTopic = useCallback(async () => {
    setLoading(true);
    try {
      const t = await getTodayTopic();
      setTopic(t);
    } catch (e) {
      // quietly ignore, "Chat now" will surface errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTopic();
    (async () => {
      const pushToken = await registerForPushNotificationsAsync();
      if (pushToken) {
        const timezone = Localization.getCalendars?.()[0]?.timeZone || "Australia/Melbourne";
        // Default daily reminder: 5pm local time. She can change this in Settings.
        await registerPushToken({ expoPushToken: pushToken, notifyHour: 17, notifyMinute: 0, timezone });
      }
    })();
  }, [loadTopic]);

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hi {userName} 👋</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Today's little chat</Text>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 12 }} />
        ) : (
          <Text style={styles.cardTitle}>{topic?.title || "A friendly chat"}</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => navigation.navigate("ChatSession")}
        disabled={loading}
      >
        <Text style={styles.chatButtonText}>Chat with Clara</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate("Settings")}>
        <Text style={styles.settingsText}>Reminder time & settings</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={async () => {
          await logout();
          setUserName(null);
        }}
      >
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fdf6ec", justifyContent: "center" },
  greeting: { fontSize: 24, fontWeight: "700", color: "#4a3f35", marginBottom: 24, textAlign: "center" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#eadfce",
  },
  cardLabel: { color: "#a07a52", fontSize: 13, fontWeight: "600", textTransform: "uppercase", marginBottom: 8 },
  cardTitle: { fontSize: 22, color: "#4a3f35", fontWeight: "600" },
  chatButton: { backgroundColor: "#d98c4a", borderRadius: 14, paddingVertical: 18, marginBottom: 14 },
  chatButtonText: { color: "#fff", textAlign: "center", fontSize: 18, fontWeight: "700" },
  settingsButton: { paddingVertical: 10 },
  settingsText: { textAlign: "center", color: "#a07a52", fontSize: 15 },
  logoutButton: { paddingVertical: 10, marginTop: 40 },
  logoutText: { textAlign: "center", color: "#c0392b", fontSize: 14 },
});
