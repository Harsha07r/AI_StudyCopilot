import express from "express";

import { retrieveRelevantChunks }
from "../services/retrieverService.js";

import { model }
from "../config/llm.js";

const router = express.Router();

router.post(
  "/chat",
  async (req, res) => {

    try {

      const { question } =
        req.body;

      const chunks =
        await retrieveRelevantChunks(
          question
        );

      const context =
        chunks
          .map(
            doc =>
              doc.pageContent
          )
          .join("\n\n");

      const prompt = `
You are a study assistant.

Answer ONLY from the provided context.

Context:
${context}

Question:
${question}
`;
  console.log("QUESTION:", question);

console.log("RETRIEVED CHUNKS:");
console.log(chunks);

console.log("CONTEXT:");
console.log(context);

console.log("PROMPT:");
console.log(prompt);
      const response =
        await model.invoke(
          prompt
        ); //invokes groq model with the prompt

      res.json({

        answer:
          response.content,

        retrievedChunks:
          chunks.length,

      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        error:
          "Chat failed",
      });

    }

  }
);

export default router;

// const chunks = await retrieveRelevantChunks(question);
// const context = chunks
//   .map(doc => doc.pageContent)
//   .join("\n\n");

// retrieveRelevantChunks: You pass the user's question to the service you built in the previous step. It searches the memory database and returns the top 3 most relevant PDF chunks.

// map and join: The database gives you an array of complex objects. This code strips away the metadata and grabs just the raw text (pageContent). It then joins those 3 paragraphs together, separated by double newlines (\n\n), creating one solid wall of reference text.