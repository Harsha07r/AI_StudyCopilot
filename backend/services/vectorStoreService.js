import { MemoryVectorStore }
from "@langchain/classic/vectorstores/memory";

let vectorStore = null;

export const initializeVectorStore =
async (documents, embeddings) => {

  vectorStore =
    await MemoryVectorStore.fromDocuments(
      documents,
      embeddings
    );

  return vectorStore;
};

export const getVectorStore = () => {
  return vectorStore;
};

// The In-Memory Database (vectorStoreService.js)
// Instead of saving your data to your hard drive using ChromaDB, you are now saving it temporarily in your server's RAM using Langchain's MemoryVectorStore.

// initializeVectorStore: This function takes your raw text documents (chunks) and your embeddingsModel (the custom bridge you just built). Under the hood, Langchain automatically extracts the text, passes it to your custom embedder, gets the vectors back, and stores them all in memory.

// getVectorStore: Because the data is stored in a JavaScript variable (let vectorStore = null;), this function allows other files in your app to access the database later to perform searches.