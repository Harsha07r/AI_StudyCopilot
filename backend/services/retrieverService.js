import { CohereEmbeddings } from "@langchain/cohere";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { getActiveNamespace } from "../config/activeDocument.js";

export const retrieveRelevantChunks = async (query) => {
  const namespace = getActiveNamespace();
  if (!namespace) return [];

  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

  const embeddings = new CohereEmbeddings({
    apiKey: process.env.COHERE_API_KEY,
    model: "embed-english-v3.0",
    inputType: "search_query",
  });

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace,
  });

  // Retrieves the top 3 most relevant chunks based on cosine similarity
  // between the query and the stored vectors, scoped to the active document.
  return await vectorStore.similaritySearch(query, 3);
};