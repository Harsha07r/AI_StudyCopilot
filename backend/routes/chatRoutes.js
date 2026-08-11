import express from "express";
import { retrieveRelevantChunks } from "../services/retrieverService.js";
import { model } from "../config/llm.js";

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { question } = req.body;

    // 1. Retrieve & Build Context (Unchanged)
    const chunks = await retrieveRelevantChunks(question);
    const context = chunks.map(doc => doc.pageContent).join("\n\n");

    const prompt = `
You are a study assistant.
Answer ONLY from the provided context.

Context:
${context}

Question:
${question}
`;

    // 2. Set headers for Server-Sent Events (SSE)
    // This tells the frontend: "Don't close the connection, data is coming in pieces!"
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // 3. Swap .invoke() for .stream()
    const stream = await model.stream(prompt);

    // 4. Loop through the stream and send chunks to the frontend instantly
    for await (const chunk of stream) {
      if (chunk.content) {
        // We wrap the text in a specific SSE format: "data: {...}\n\n"
        res.write(`data: ${JSON.stringify({ text: chunk.content })}\n\n`);
      }
    }

    // 5. Tell the frontend the stream is completely finished
    res.write(`data: [DONE]\n\n`);
    res.end();

  } catch (error) {
    console.error("Streaming Error:", error);
    
    // If the error happens before we start streaming, send a standard 500
    if (!res.headersSent) {
      res.status(500).json({ error: "Chat failed" });
    } else {
      // If it fails mid-stream, just close the connection
      res.end();
    }
  }
});

export default router;