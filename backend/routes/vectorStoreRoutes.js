import express from "express";
import multer from "multer";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { CohereEmbeddings } from "@langchain/cohere";
import { Pinecone } from "@pinecone-database/pinecone";
import { extractPageBlocks, tableToMarkdown } from "../services/pdfTableExtractor.js";
import { setActiveNamespace } from "../config/activeDocument.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const MAX_TABLE_ROWS_PER_CHUNK = 40;

router.post("/store-pdf", upload.single("pdf"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: "No PDF uploaded" });
  }

  try {
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    // Each upload gets its own namespace instead of wiping the index,
    // so previously uploaded documents' vectors are preserved in Pinecone.
    const namespace = `doc-${Date.now()}`;
    const namespacedIndex = pineconeIndex.namespace(namespace);

    // Layout-aware extraction: tables come back as structured rows instead
    // of pdf-parse's flattened text, so a chunk boundary never splits a
    // row and separates a label from its value.
    const blocks = await extractPageBlocks(req.file.buffer);

    if (blocks.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No readable text found in PDF. Make sure it is not a scanned image.",
      });
    }

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const rawText = blocks
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n\n");
    const textDocs = rawText.trim()
      ? (await textSplitter.createDocuments([rawText])).map((d) => ({
          pageContent: d.pageContent,
          type: "text",
        }))
      : [];

    // Tables are kept as atomic chunks so a row is never split mid-way;
    // large tables are grouped with the header repeated in each group.
    const tableDocs = blocks
      .filter((b) => b.type === "table")
      .flatMap((block) => {
        const [header, ...body] = block.rows;
        const rowGroups = [];
        for (let i = 0; i < body.length; i += MAX_TABLE_ROWS_PER_CHUNK) {
          rowGroups.push([header, ...body.slice(i, i + MAX_TABLE_ROWS_PER_CHUNK)]);
        }
        if (rowGroups.length === 0) rowGroups.push([header]);

        return rowGroups.map((rows) => ({
          pageContent: tableToMarkdown(rows),
          type: "table",
          page: block.page,
        }));
      });

    const docs = [...textDocs, ...tableDocs].filter(
      (d) => d.pageContent && d.pageContent.trim().length > 0
    );

    if (docs.length === 0) {
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

    const vectors = await embeddings.embedDocuments(docs.map((d) => d.pageContent));

    const records = vectors.map((values, i) => ({
      id: `${Date.now()}-${i}`,
      values,
      metadata: {
        text: docs[i].pageContent.slice(0, 1000),
        type: docs[i].type,
        ...(docs[i].page ? { page: docs[i].page } : {}),
      },
    }));

    for (let i = 0; i < records.length; i += 100) {
      await namespacedIndex.upsert(records.slice(i, i + 100));
    }

    setActiveNamespace(namespace);

    console.log(`Stored ${records.length} vectors in Pinecone namespace "${namespace}"`);

    return res.status(200).json({
      success: true,
      status: "completed",
      chunks: records.length,
      namespace,
      message: "Stored in Pinecone successfully!",
    });
  } catch (error) {
    console.error("Pinecone Storage Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Storage Failed",
    });
  }
});

export default router;