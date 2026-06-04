import express from "express";
import { createEmbedding }
from "../services/embeddingService.js";

const router = express.Router();

router.get(
  "/test-embedding",
  async (req, res) => {

    try {

      const embedding =
        await createEmbedding(
          "Operating Systems"
        );

      console.log(
        "Embedding Dimensions:",
        embedding.length
      );

      res.json({

        dimensions:
          embedding.length,

        sample:
          embedding.slice(0, 5),

      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        error:
          "Embedding failed",
      });

    }

  }
);

export default router;
 
//Flow: 
//The Trigger: A simple GET endpoint (/test-embedding) to test your new engine.

// The Test: Passes a sample string ("Operating Systems") to the local model.

// The Output: Proves the model works by returning the vector's length (384 dimensions) and a tiny preview of the first 5 numbers.