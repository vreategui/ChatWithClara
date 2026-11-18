const express = require("express");
const db = require("../db");

const router = express.Router();

// Called once by the app after it registers for push notifications,
// and again whenever she changes her preferred reminder time.
router.post("/register", (req, res) => {
  const { expoPushToken, notifyHour, notifyMinute, timezone } = req.body;

  db.prepare(
    `UPDATE users SET
      expo_push_token = COALESCE(?, expo_push_token),
      notify_hour = COALESCE(?, notify_hour),
      notify_minute = COALESCE(?, notify_minute),
      timezone = COALESCE(?, timezone)
     WHERE id = ?`
  ).run(expoPushToken, notifyHour, notifyMinute, timezone, req.userId);

  res.json({ ok: true });
});

module.exports = router;
