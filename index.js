import express from "express";
import { readFileSync } from "fs";
import { createServer } from "http";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ─── Serve de HTML pagina ───────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send(readFileSync("./web.html", "utf-8"));
});

// ─── API: verificeer Firebase token (server-side) ───────────────────────────
app.post("/api/verify", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Geen token." });

  // Zodra je firebase-admin installeert, uncomment dit:
  // import admin from "firebase-admin";
  // const decoded = await admin.auth().verifyIdToken(token);
  // return res.json({ ok: true, user: decoded });

  // Tijdelijke placeholder:
  console.log("Token ontvangen:", token.slice(0, 20) + "...");
  res.json({ ok: true, message: "Login geslaagd (placeholder)" });
});

createServer(app).listen(PORT, () => {
  console.log(`ATR server draait op http://localhost:${PORT}`);
});
