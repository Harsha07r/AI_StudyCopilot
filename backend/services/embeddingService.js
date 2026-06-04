// services/embeddingService.js

import { pipeline } from "@xenova/transformers";

let embedder = null;

export const createEmbedding = async (text) => {
  
  if (!embedder) {
    console.log("Loading embedding model...");

    embedder = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );

    console.log("Embedding model loaded.");
  }

  const output = await embedder(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data);
};


//You have upgraded your app from using cloud-based APIs to running a local, offline, and free AI model right on your own server using the @xenova/transformers library.

 //1. The Engine (embeddingService.js)
// Local Processing: Downloads the Hugging Face model directly to your machine. No internet or API keys required.
// Smart Memory (Singleton Pattern): Uses let embedder = null to ensure the heavy AI model is only loaded into your server's RAM once, making future requests instant.
// Data Formatting: Converts the AI's complex tensor output into a clean, easy-to-read JavaScript array.
// pooling: "mean", normalize: true: These are standard rules for creating good sentence embeddings.
// Mean pooling averages out the meaning of all the individual words to get the overall meaning of the sentence.
// Normalize scales all the resulting numbers so they are easier to compare mathematically later.