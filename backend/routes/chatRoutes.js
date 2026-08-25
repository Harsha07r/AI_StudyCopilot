import express from "express";
import { z } from "zod";
import { retrieveRelevantChunks } from "../services/retrieverService.js";
import { getActiveNamespace } from "../config/activeDocument.js";
import { model } from "../config/llm.js";

const router = express.Router();

const AnswerSchema = z.object({
  answer: z
    .string()
    .describe("The answer to the question, in plain prose or basic markdown. Never use raw HTML tags."),
  isAnswerable: z
    .boolean()
    .describe("True only if the provided context actually contains enough information to answer the question."),
  table: z
    .array(z.array(z.string()))
    .nullable()
    .optional()
    .describe(
      "Structured table data if the answer is naturally tabular - the first row is the header row. Set to null when a table isn't needed."
    ),
});

router.post("/chat", async (req, res) => {
  try {
    const { question } = req.body;

    const chunks = await retrieveRelevantChunks(question);

    if (chunks.length === 0) {
      const message = getActiveNamespace()
        ? "That question doesn't seem related to the uploaded document."
        : "No document uploaded yet. Please upload a PDF first.";
      return res.status(400).json({ error: message });
    }

    const context = chunks.map((doc) => doc.pageContent).join("\n\n");

    const prompt = `
You are a study assistant.
Answer ONLY from the provided context.
Set isAnswerable to false and explain what's missing if the context does not contain enough information - never guess.

Context:
${context}

Question:
${question}
`;

    const structuredModel = model.withStructuredOutput(AnswerSchema, { name: "study_answer" });
    const result = await structuredModel.invoke(prompt);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Chat Error:", error);
    return res.status(500).json({ error: "Chat failed" });
  }
});

export default router;
