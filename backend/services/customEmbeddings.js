import { Embeddings }
from "@langchain/core/embeddings";

import { createEmbedding }
from "./embeddingService.js";

export class CustomEmbeddings
extends Embeddings {

  async embedDocuments(texts) {

    const embeddings = [];

    for (const text of texts) {

      const embedding =
        await createEmbedding(text);

      embeddings.push(embedding);

    }

    return embeddings;
  }

  async embedQuery(text) {

    return await createEmbedding(text);

  }
}

// 1. The Bridge (customEmbeddings.js)
// This is the most clever part of your new setup. You are using the Adapter Pattern.

// Langchain has built-in functions to automatically store documents, but to do so, it requires an embedding tool that speaks its exact language. Specifically, Langchain expects an object with two exact methods: embedDocuments and embedQuery.

// Because you built a custom local AI embedder using @xenova/transformers, Langchain doesn't know how to use it out of the box. This file bridges that gap:

// extends Embeddings: You are telling Langchain, "Treat this class like one of your official embedding tools."

// embedDocuments(texts): Langchain will automatically pass an array of chunked texts here. This function loops through them, uses your local AI to create the math vectors, and hands the array of vectors back to Langchain.

// embedQuery(text): Later, when a user asks a question, Langchain will use this to convert their single question into a vector for searching.