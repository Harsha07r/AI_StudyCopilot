import { CohereEmbeddings } from "@langchain/cohere";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { getActiveNamespace } from "../config/activeDocument.js";

// Pinecone cosine-similarity scores range roughly 0-1 for normalized
// embeddings; below this, a chunk is too dissimilar to be a genuine
// match for the query rather than just the "least bad" of the top-k.
const SIMILARITY_THRESHOLD = 0.5;

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

  // Retrieves the top 3 candidate chunks scoped to the active document,
  // then drops any that aren't actually similar enough to the query -
  // similaritySearch alone always returns its top-k even when nothing
  // relevant exists, which is what let out-of-context questions slip
  // through to the LLM before.
  const results = await vectorStore.similaritySearchWithScore(query, 3);
  return results
    .filter(([, score]) => score >= SIMILARITY_THRESHOLD)
    .map(([doc]) => doc);
};