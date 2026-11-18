import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Localization from "expo-localization";
import { registerPushToken } from "../api";
import { registerForPushNotificationsAsync } from "../notifications";

export default function SettingsScreen() {
  const [time, setTime] = useState(new Date(new Date().setHours(17, 0, 0, 0)));
  const [showPicker, setShowPicker] = useState(Platform.OS === "ios");
  const [saving, setSaving] = useState(false);

  async function saveTime(selectedTime) {
    setSaving(true);
    try {
      const pushToken = await registerForPushNotificationsAsync();
      const timezone = Localization.getCalendars?.()[0]?.timeZone || "Australia/Melbourne";
      await registerPushToken({
        expoPushToken: pushToken,
        notifyHour: selectedTime.getHours(),
        notifyMinute: selectedTime.getMinutes(),
        timezone,
      });
      Alert.alert("Saved", "Your daily reminder time has been updated.");
    } catch (e) {
      Alert.alert("Couldn't save", "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Daily reminder time</Text>
      <Text style={styles.sublabel}>Clara will send a notification around this time each day.</Text>

      <DateTimePicker
        value={time}
        mode="time"
        display="spinner"
        onChange={(event, selectedTime) => {
          if (selectedTime) setTime(selectedTime);
        }}
      />

      <TouchableOpacity style={styles.button} onPress={() => saveTime(time)} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? "Saving..." : "Save reminder time"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fdf6ec" },
  label: { fontSize: 20, fontWeight: "700", color: "#4a3f35", marginBottom: 4 },
  sublabel: { fontSize: 14, color: "#8a7b6c", marginBottom: 20 },
  button: { backgroundColor: "#d98c4a", borderRadius: 12, paddingVertical: 16, marginTop: 24 },
  buttonText: { color: "#fff", textAlign: "center", fontSize: 16, fontWeight: "600" },
});
