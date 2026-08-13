import express from "express";
import multer from "multer";

// 1. The NEW V2 imports for pdf-parse (and the CanvasFactory to prevent server crashes)
import { CanvasFactory } from "pdf-parse/worker";
import { PDFParse } from "pdf-parse";

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { CohereEmbeddings } from "@langchain/cohere";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";

const router = express.Router();

// Configure Multer to store uploaded files in RAM
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Pinecone Client
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

router.post("/store-pdf", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No PDF uploaded" });
    }

    // 2. The NEW V2 parsing execution
    const parser = new PDFParse({ 
      data: req.file.buffer, 
      CanvasFactory // Required for Node.js environments
    });
    
    const pdfData = await parser.getText();
    const rawText = pdfData.text;

    // 3. Split text into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const docs = await textSplitter.createDocuments([rawText]);

    // 4. Generate Embeddings using Cohere
    const embeddings = new CohereEmbeddings({
      apiKey: process.env.COHERE_API_KEY,
      model: "embed-english-v3.0", 
    });

    // 5. Upsert directly to Pinecone Vector Database
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex,
      maxConcurrency: 5, 
    });

    console.log(`Successfully stored ${docs.length} chunks in Pinecone!`);

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