import express from "express";
import { loadPDF } from "../services/pdfLoaderService.js";
import { splitDocuments }
from "../services/textSplitterService.js";
const router = express.Router();

router.get("/read-pdf", async (req, res) => {

  try {

    const docs =
      await loadPDF(
        "uploads/1780323039193-Application Number.pdf"
      );

    const chunks =
      await splitDocuments(docs);

    console.log("Documents:", docs.length);

console.log("Chunks:", chunks.length);

console.log(
  "First Chunk Length:",
  chunks[0].pageContent.length
);

    res.json({

      totalDocuments: docs.length,

      totalChunks:
        chunks.length,

      firstChunk:
        chunks[0].pageContent,

         
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error:
        "Chunking failed",
    });

  }

});export default router;