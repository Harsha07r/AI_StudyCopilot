import express from "express";

import { loadPDF }
from "../services/pdfLoaderService.js";

import { splitDocuments }
from "../services/textSplitterService.js";

import { initializeVectorStore }
from "../services/vectorStoreService.js";

import { CustomEmbeddings }
from "../services/customEmbeddings.js";

const router = express.Router();

router.get(
  "/store-pdf",
  async (req, res) => {

    try {

      const docs =
        await loadPDF(
          "uploads/1780323039193-Application Number.pdf"
        );

      const chunks =
        await splitDocuments(docs);

      const embeddings =
        new CustomEmbeddings();

      await initializeVectorStore(
        chunks,
        embeddings
      );

      console.log(
        "Stored Chunks:",
        chunks.length
      );

      res.json({

        documents:
          docs.length,

        chunks:
          chunks.length,

        message:
          "Stored in Memory Vector Store"

      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        error:
          "Storage Failed"
      });

    }

  }
);

export default router;

// Load: Reads the PDF into large pages.

// Split: Chops the pages into smaller, 1000-character chunks.

// Instantiate: new CustomEmbeddings() creates the bridge to your local AI model.

// Store: initializeVectorStore(chunks, embeddings) hands the chunks and the AI bridge to Langchain. Langchain automatically loops through the chunks, translates them into vectors using the bridge, and saves them in the RAM database.

// Respond: Sends a clean success message back to the use