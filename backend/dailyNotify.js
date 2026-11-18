const cron = require("node-cron");
const { Expo } = require("expo-server-sdk");
const db = require("./db");
const { topicForDate } = require("./topics");

const expo = new Expo();

function currentHourMinuteInTimezone(timezone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const hour = Number(parts.find((p) => p.type === "hour").value);
  const minute = Number(parts.find((p) => p.type === "minute").value);
  return { hour, minute };
}

async function sendDueNotifications() {
  const users = db.prepare("SELECT * FROM users WHERE expo_push_token IS NOT NULL").all();

  const messages = [];
  for (const user of users) {
    const { hour, minute } = currentHourMinuteInTimezone(user.timezone || "Australia/Melbourne");
    if (hour === user.notify_hour && minute === user.notify_minute) {
      if (!Expo.isExpoPushToken(user.expo_push_token)) continue;
      const topic = topicForDate(user.id);
      messages.push({
        to: user.expo_push_token,
        sound: "default",
        title: "Time for a chat with Clara ☕",
        body: `Today's little chat: ${topic.title}. Just 10 minutes!`,
        data: { topicKey: topic.key },
      });
    }
  }

  if (messages.length === 0) return;

  const chunks = Expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (err) {
      console.error("Failed to send push chunk:", err);
    }
  }
}

function startDailyNotifyCron() {
  // Checks every minute; only sends to users whose chosen local time matches "now".
  cron.schedule("* * * * *", sendDueNotifications);
  console.log("Daily notification cron started (checks every minute).");
}

module.exports = { startDailyNotifyCron, sendDueNotifications };
