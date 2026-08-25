import { CohereEmbeddings, CohereRerank } from "@langchain/cohere";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { getActiveNamespace } from "../config/activeDocument.js";

const CANDIDATE_K = 20;
const FINAL_K = 3;
// Cohere relevance scores range 0-1; well below this is generally noise.
const RERANK_RELEVANCE_THRESHOLD = 0.3;

// Reranking scores how well a passage matches the literal query text, which
// breaks down for meta-instructions like "summarize this document" - no
// single chunk is textually "about" the word "summarize", so every chunk
// scores near zero even when the whole document is exactly the right
// context. Detected broad queries skip reranking and just return the wider
// candidate set instead of a relevance-filtered top-3.
const BROAD_QUERY_PATTERN =
  /\b(summar(y|ize|ise)|overview|outline|main points?|key points?|tl;?dr)\b/i;

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

  // Wide candidate retrieval by vector similarity, then rerank and keep
  // only the genuinely relevant results - cosine similarity alone always
  // returns its top-k even when nothing relevant exists, so relevance is
  // decided by Cohere's rerank score instead of raw vector distance.
  const candidates = await vectorStore.similaritySearch(query, CANDIDATE_K);
  if (candidates.length === 0) return [];

  if (BROAD_QUERY_PATTERN.test(query)) return candidates;

  const reranker = new CohereRerank({
    apiKey: process.env.COHERE_API_KEY,
    model: "rerank-english-v3.0",
    topN: FINAL_K,
  });
  const reranked = await reranker.compressDocuments(candidates, query);

  return reranked.filter((doc) => doc.metadata.relevanceScore >= RERANK_RELEVANCE_THRESHOLD);
};