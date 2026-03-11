import express from "express";
import { readFileSync } from "fs";
import { createServer } from "http";

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Firebase config (server gebruikt client SDK URL direct)
const FIREBASE_URL = "https://atrdcbot-default-rtdb.europe-west1.firebasedatabase.app";

// ─── Serve HTML ───────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send(readFileSync("./web.html", "utf-8"));
});

// ─── API: Roblox stuurt positie hierheen ─────────────────────────────────────
app.post("/api/route", async (req, res) => {
  const data = req.body;
  if (!data?.uid) return res.status(400).json({ error: "Geen uid." });

  console.log(`[ATR] ${data.action || "update"} | ${data.robloxName || data.uid} | X:${data.robloxX ?? "—"} Z:${data.robloxZ ?? "—"}`);

  try {
    // Schrijf direct naar Firebase REST API (geen firebase-admin nodig)
    const base = `${FIREBASE_URL}/live_routes/${data.uid}`;

    if (data.action === "start") {
      await fetch(`${base}.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid:         data.uid,
          robloxName:  data.robloxName || "Roblox Speler",
          driverName:  data.robloxName || "Roblox Speler",
          photoURL:    "",
          lineNumber:  data.lineNumber || "1",
          lineName:    data.lineName   || "Lijn 1",
          lineColor:   data.lineColor  || "#f5c518",
          robloxX:     data.robloxX    || 0,
          robloxZ:     data.robloxZ    || 0,
          currentStop: data.currentStop || "—",
          status:      "driving",
          startedAt:   Date.now(),
          updatedAt:   Date.now()
        })
      });
    } else if (data.action === "update") {
      await fetch(`${base}.json`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          robloxX:   data.robloxX ?? 0,
          robloxZ:   data.robloxZ ?? 0,
          status:    "driving",
          updatedAt: Date.now()
        })
      });
    } else if (data.action === "end") {
      await fetch(`${base}.json`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "finished", updatedAt: Date.now() })
      });
      // Verwijder na 30 seconden
      setTimeout(async () => {
        await fetch(`${base}.json`, { method: "DELETE" });
      }, 30000);
    }

    res.json({ ok: true });
  } catch(e) {
    console.error("[ATR] Firebase fout:", e.message);
    res.status(500).json({ error: e.message });
  }
});

createServer(app).listen(PORT, () => {
  console.log(`ATR draait op poort ${PORT}`);
});
