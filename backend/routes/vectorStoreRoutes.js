import express from "express";
import multer from "multer";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { CohereEmbeddings } from "@langchain/cohere";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { PDFParse } from "pdf-parse";          // <-- ADD THIS

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

router.post("/store-pdf", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No PDF uploaded" });
    }

    // 1. Native Dynamic Import: Bypasses the Node 24 require() corruption entirely
    const pdfParseModule = await import("pdf-parse");
    const extractPdf = pdfParseModule.default || pdfParseModule;

    // 2. Extract Text
    const pdfData = await extractPdf(req.file.buffer);
    const rawText = pdfData.text;

    // 3. Safety Guard for Empty Documents
    if (!rawText || rawText.trim() === "") {
      return res.status(400).json({ 
        success: false, 
        error: "No readable text found in PDF. Make sure it is not a scanned image." 
      });
    }

    // 4. Split Text
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const docs = await textSplitter.createDocuments([rawText]);

    if (docs.length === 0) {
      return res.status(400).json({ success: false, error: "Document splitting generated 0 chunks." });
    }

    // 5. Generate Embeddings & Store
    const embeddings = new CohereEmbeddings({
      apiKey: process.env.COHERE_API_KEY,
      model: "embed-english-v3.0", 
    });

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