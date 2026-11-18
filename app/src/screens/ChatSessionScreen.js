import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import { startSession, sendTurn } from "../api";

// Simple chat bubble, she = her transcribed speech, clara = the AI's reply
function Bubble({ from, text }) {
  const isHer = from === "her";
  return (
    <View style={[styles.bubble, isHer ? styles.bubbleHer : styles.bubbleClara]}>
      <Text style={styles.bubbleLabel}>{isHer ? "You" : "Clara"}</Text>
      <Text style={styles.bubbleText}>{text}</Text>
    </View>
  );
}

export default function ChatSessionScreen({ navigation }) {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [starting, setStarting] = useState(true);
  const recordingRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Microphone needed", "Clara needs the microphone to hear you.");
        }
        const result = await startSession();
        setSessionId(result.sessionId);
        const opener = `Hi! Today let's chat about: ${result.topic.title.toLowerCase()}. Ready whenever you are — just tap the button and talk to me like you normally would.`;
        addClaraMessage(opener);
      } catch (e) {
        Alert.alert("Couldn't start", "Check that the app can reach the backend server.");
      } finally {
        setStarting(false);
      }
    })();

    return () => {
      Speech.stop();
    };
  }, []);

  function addClaraMessage(text) {
    setMessages((prev) => [...prev, { from: "clara", text }]);
    Speech.speak(text, { language: "en-AU", rate: 0.95 });
  }

  function addHerMessage(text) {
    setMessages((prev) => [...prev, { from: "her", text }]);
  }

  async function startRecording() {
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (e) {
      Alert.alert("Recording error", "Couldn't start recording. Please try again.");
    }
  }

  async function stopRecordingAndSend() {
    setIsRecording(false);
    const recording = recordingRef.current;
    if (!recording) return;
    recordingRef.current = null;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setIsThinking(true);
      const { userText, replyText } = await sendTurn(sessionId, uri);
      addHerMessage(userText);
      addClaraMessage(replyText);
    } catch (e) {
      Alert.alert("Hmm", "That didn't quite go through — mind trying that again?");
    } finally {
      setIsThinking(false);
    }
  }

  if (starting) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#d98c4a" />
        <Text style={{ marginTop: 12, color: "#8a7b6c" }}>Getting Clara ready...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((m, i) => (
          <Bubble key={i} from={m.from} text={m.text} />
        ))}
        {isThinking && (
          <View style={[styles.bubble, styles.bubbleClara]}>
            <ActivityIndicator size="small" color="#a07a52" />
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.micButton, isRecording && styles.micButtonActive]}
        onPress={isRecording ? stopRecordingAndSend : startRecording}
        disabled={isThinking}
      >
        <Text style={styles.micButtonText}>{isRecording ? "Tap to finish talking" : "Tap to talk"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.endButton} onPress={() => navigation.goBack()}>
        <Text style={styles.endButtonText}>End chat for now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fdf6ec", paddingTop: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fdf6ec" },
  messages: { flex: 1, paddingHorizontal: 16 },
  bubble: { borderRadius: 14, padding: 14, marginBottom: 10, maxWidth: "85%" },
  bubbleHer: { backgroundColor: "#d98c4a", alignSelf: "flex-end" },
  bubbleClara: { backgroundColor: "#fff", alignSelf: "flex-start", borderWidth: 1, borderColor: "#eadfce" },
  bubbleLabel: { fontSize: 11, fontWeight: "700", color: "#00000066", marginBottom: 2 },
  bubbleText: { fontSize: 16, color: "#2d2520" },
  micButton: {
    margin: 16,
    backgroundColor: "#d98c4a",
    borderRadius: 50,
    paddingVertical: 20,
  },
  micButtonActive: { backgroundColor: "#c0392b" },
  micButtonText: { color: "#fff", textAlign: "center", fontSize: 17, fontWeight: "700" },
  endButton: { paddingBottom: 24 },
  endButtonText: { textAlign: "center", color: "#a07a52" },
});
