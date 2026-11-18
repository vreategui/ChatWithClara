require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { router: authRouter, authMiddleware } = require("./routes/auth");
const sessionRouter = require("./routes/session");
const pushRouter = require("./routes/push");
const { startDailyNotifyCron } = require("./dailyNotify");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/session", authMiddleware, sessionRouter);
app.use("/api/push", authMiddleware, pushRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend listening on http://0.0.0.0:${PORT}`);
  startDailyNotifyCron();
});
