import express from "express";
import multer from "multer";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { CohereEmbeddings } from "@langchain/cohere";
import { Pinecone } from "@pinecone-database/pinecone";
import { PDFParse } from "pdf-parse";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/store-pdf", upload.single("pdf"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: "No PDF uploaded" });
  }

  let parser;

  try {
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    parser = new PDFParse({ data: new Uint8Array(req.file.buffer) });
    const { text: rawText } = await parser.getText();

    if (!rawText || rawText.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "No readable text found in PDF. Make sure it is not a scanned image.",
      });
    }

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const docs = await textSplitter.createDocuments([rawText]);

    const texts = docs
      .map((d) => d.pageContent)
      .filter((t) => t && t.trim().length > 0);

    if (texts.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Document splitting generated 0 usable chunks.",
      });
    }

    const embeddings = new CohereEmbeddings({
      apiKey: process.env.COHERE_API_KEY,
      model: "embed-english-v3.0",
      inputType: "search_document",
    });

    const vectors = await embeddings.embedDocuments(texts);

    const records = vectors.map((values, i) => ({
      id: `${Date.now()}-${i}`,
      values,
      metadata: { text: texts[i].slice(0, 1000) },
    }));

    for (let i = 0; i < records.length; i += 100) {
      await pineconeIndex.upsert(records.slice(i, i + 100));
    }

    console.log(`Stored ${records.length} vectors in Pinecone`);

    return res.status(200).json({
      success: true,
      status: "completed",
      chunks: records.length,
      message: "Stored in Pinecone successfully!",
    });
  } catch (error) {
    console.error("Pinecone Storage Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Storage Failed",
    });
  } finally {
    await parser?.destroy();
  }
});

export default router;