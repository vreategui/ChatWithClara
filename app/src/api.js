import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// IMPORTANT: change this to wherever your backend is actually reachable from
// your mum's phone (see the setup instructions). While developing on the same
// wifi network as your computer, this is usually your computer's local IP,
// e.g. "http://192.168.1.23:3000". For real daily use, deploy the backend
// somewhere always-on (Render/Railway free tier, etc.) and put that URL here.
export const API_BASE_URL = "http://192.168.0.74:3000";

const client = axios.create({ baseURL: API_BASE_URL });

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function signup(name, email, password, timezone) {
  const { data } = await client.post("/api/auth/signup", { name, email, password, timezone });
  await AsyncStorage.setItem("authToken", data.token);
  await AsyncStorage.setItem("userName", data.name);
  return data;
}

export async function login(email, password) {
  const { data } = await client.post("/api/auth/login", { email, password });
  await AsyncStorage.setItem("authToken", data.token);
  await AsyncStorage.setItem("userName", data.name);
  return data;
}

export async function logout() {
  await AsyncStorage.multiRemove(["authToken", "userName"]);
}

export async function getTodayTopic() {
  const { data } = await client.get("/api/session/today");
  return data.topic;
}

export async function startSession() {
  const { data } = await client.post("/api/session/start");
  return data;
}

export async function sendTurn(sessionId, audioUri) {
  const form = new FormData();
  form.append("sessionId", String(sessionId));
  form.append("audio", {
    uri: audioUri,
    name: "turn.m4a",
    type: "audio/m4a",
  });
  const { data } = await client.post("/api/session/turn", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function registerPushToken({ expoPushToken, notifyHour, notifyMinute, timezone }) {
  const { data } = await client.post("/api/push/register", {
    expoPushToken,
    notifyHour,
    notifyMinute,
    timezone,
  });
  return data;
}

export default client;
