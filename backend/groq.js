// Thin wrapper around Groq's free-tier API:
//  - whisper-large-v3-turbo for speech-to-text (transcribing what she said)
//  - llama-3.3-70b-versatile for the actual conversation + corrections
//
// Get a free key at https://console.groq.com/keys (no credit card required
// for the free tier at time of writing; limits are generous for one person
// doing a single ~10 minute session a day).

const fs = require("fs");
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function transcribeAudio(filePath) {
  const transcription = await groq.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: "whisper-large-v3-turbo",
    language: "en",
    response_format: "text",
  });
  // The SDK returns either a string or { text } depending on response_format/version.
  return typeof transcription === "string" ? transcription.trim() : (transcription.text || "").trim();
}

async function chatReply(systemPrompt, history) {
  // history: array of { role: 'user' | 'assistant', content: string }
  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [{ role: "system", content: systemPrompt }, ...history],
    temperature: 0.7,
    max_tokens: 200,
  });
  return completion.choices[0].message.content.trim();
}

module.exports = { transcribeAudio, chatReply };
