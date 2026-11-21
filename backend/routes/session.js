const express = require("express");
const multer = require("multer");
const fs = require("fs");
const os = require("os");
const path = require("path");
const db = require("../db");
const { topicForDate, findTopic } = require("../topics");
const { buildSystemPrompt } = require("../persona");
const { transcribeAudio, chatReply } = require("../groq");

const router = express.Router();
const upload = multer({ dest: os.tmpdir() });

// GET today's topic (shown on the home screen before she starts chatting)
router.get("/today", (req, res) => {
  const topic = topicForDate(req.userId);
  res.json({ topic: { key: topic.key, title: topic.title } });
});

// Start a new session for today
router.post("/start", (req, res) => {
  const topic = topicForDate(req.userId);
  const info = db
    .prepare("INSERT INTO sessions (user_id, topic_key) VALUES (?, ?)")
    .run(req.userId, topic.key);

  res.json({ sessionId: info.lastInsertRowid, topic: { key: topic.key, title: topic.title } });
});

// One conversational turn: she sends a short audio recording, gets back
// her transcript + Clara's reply text (the app speaks the reply itself).
router.post("/turn", upload.single("audio"), async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: "sessionId is required" });
  if (!req.file) return res.status(400).json({ error: "audio file is required" });

  const session = db.prepare("SELECT * FROM sessions WHERE id = ? AND user_id = ?").get(sessionId, req.userId);
  if (!session) return res.status(404).json({ error: "Session not found" });

  // multer saves the upload with no file extension, but Groq's transcription
  // API identifies the audio format from the filename extension. Rename it
  // so it has one before sending it off.
  const audioPathWithExt = `${req.file.path}.m4a`;
  fs.renameSync(req.file.path, audioPathWithExt);

  try {
    const userText = await transcribeAudio(audioPathWithExt);

    const priorTurns = db
      .prepare("SELECT role, text FROM turns WHERE session_id = ? ORDER BY id ASC")
      .all(sessionId)
      .map((t) => ({ role: t.role, content: t.text }));

    const topic = findTopic(session.topic_key);
    const systemPrompt = buildSystemPrompt(topic);
    const history = [...priorTurns, { role: "user", content: userText }];

    const replyText = await chatReply(systemPrompt, history);

    db.prepare("INSERT INTO turns (session_id, role, text) VALUES (?, 'user', ?)").run(sessionId, userText);
    db.prepare("INSERT INTO turns (session_id, role, text) VALUES (?, 'assistant', ?)").run(sessionId, replyText);
    db.prepare("UPDATE sessions SET turn_count = turn_count + 1 WHERE id = ?").run(sessionId);

    res.json({ userText, replyText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong processing that turn" });
  } finally {
    fs.unlink(audioPathWithExt, () => {});
  }
});

module.exports = router;