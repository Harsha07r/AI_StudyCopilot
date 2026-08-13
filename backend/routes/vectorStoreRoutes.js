import express from "express";
import multer from "multer";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// We require the package, and safely "unwrap" the default function if Node hid it inside an object
const pdfParseRaw = require("pdf-parse");
const pdfParse = pdfParseRaw.default || pdfParseRaw;
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { CohereEmbeddings } from "@langchain/cohere";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";

const router = express.Router();cd ..

// 1. Configure Multer to store uploaded files in RAM (No disk I/O!)
const upload = multer({ storage: multer.memoryStorage() });

// 2. Initialize Pinecone Client
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

// Notice we use upload.single("pdf") middleware here directly
router.post("/store-pdf", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No PDF uploaded" });
    }

    // 3. Extract text directly from the RAM buffer 
    const pdfData = await pdfParse(req.file.buffer);
    const rawText = pdfData.text;

    // 4. Split text into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const docs = await textSplitter.createDocuments([rawText]);

    // 5. Generate Embeddings using Cohere (Blazing fast & matches 1024 dimensions)
    const embeddings = new CohereEmbeddings({
      apiKey: process.env.COHERE_API_KEY,
      model: "embed-english-v3.0", 
    });

    // 6. Upsert directly to Pinecone Vector Database
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex,
      maxConcurrency: 5, // Uploads chunks in parallel for speed
    });

    console.log(`Successfully stored ${docs.length} chunks in Pinecone!`);

    // 7. Send explicit success response back to React to stop the loading UI
    return res.status(200).json({
      success: true,
      status: "completed",
      chunks: docs.length,
      message: "Stored in Pinecone successfully!"
    });

  } catch (error) {
    console.error("Pinecone Storage Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Storage Failed"
    });
  }
});

export default router;
// Load: Reads the PDF into large pages.

// Split: Chops the pages into smaller, 1000-character chunks.

// Instantiate: new CustomEmbeddings() creates the bridge to your local AI model.

// Store: initializeVectorStore(chunks, embeddings) hands the chunks and the AI bridge to Langchain. Langchain automatically loops through the chunks, translates them into vectors using the bridge, and saves them in the RAM database.

// Respond: Sends a clean success message back to the use