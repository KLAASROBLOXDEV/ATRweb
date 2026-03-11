import express from "express";
import { readFileSync } from "fs";
import { createServer } from "http";

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ─── Serve HTML ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send(readFileSync("./web.html", "utf-8"));
});

// ─── API: Roblox route tracker ───────────────────────────────────────────────
// Ontvangt data van de Roblox ServerScript
// Firebase wordt bijgewerkt via de client-side SDK in index.html
// Als je firebase-admin wil gebruiken: npm install firebase-admin
app.post("/api/route", async (req, res) => {
  const data = req.body;
  if (!data || !data.uid) return res.status(400).json({ error: "Geen uid." });
  console.log(`[ATR] Route update: ${data.action} - ${data.robloxName || data.uid}`);
  // De website (index.html) luistert realtime via Firebase client SDK
  // Hier kan je eventueel firebase-admin toevoegen voor server-side schrijven
  res.json({ ok: true, received: data });
});

createServer(app).listen(PORT, () => {
  console.log(`ATR server draait op http://localhost:${PORT}`);
});
