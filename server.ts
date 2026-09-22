import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", version: "6.0.0" });
  });

  app.post("/api/gemini/generate-track", async (req, res) => {
    try {
      const { genre, duration, prompt, userApiKey } = req.body;
      const apiKey = userApiKey || process.env.GEMINI_API_KEY;

      if (!apiKey) {
        res.status(400).json({
          error: "API key required. Please set GEMINI_API_KEY or provide an key in the request."
        });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `You are an expert electronic music producer and AI synth music arranger.
Compose a structured arrangement breakdown for a ${duration}s track in the "${genre}" style.
User additional prompt: "${prompt || "Create a peak-energy underground club arrangement with 101 AI neural synth patches."}"

Please output a structured text report containing:
1. Track Title and BPM
2. Section Breakdown (Intro, Verse, Buildup, Drop/Chorus, Bridge, Outro) with timestamp ranges and recommended 101 AI Synth Model numbers & names for Lead, Bass, and Drums.
3. Sound Design Notes & Mixing Advice for Witch House / Psytrance / Dark Futurist atmospheres.`,
      });

      res.json({
        success: true,
        text: response.text || "No output text generated.",
      });
    } catch (error: any) {
      console.error("Error generating track:", error);
      res.status(500).json({
        error: error?.message || "Failed to generate track arrangement with Gemini API."
      });
    }
  });

  // Vite middleware for dev / static serving for prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RIPPLER Pro DAW Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
