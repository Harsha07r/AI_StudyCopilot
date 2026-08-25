import { CohereEmbeddings, CohereRerank } from "@langchain/cohere";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { getActiveNamespace } from "../config/activeDocument.js";

const CANDIDATE_K = 20;
const FINAL_K = 3;
// Cohere's rerank score is a relative ranking signal, not a calibrated
// probability - a genuinely correct match can legitimately score under
// 0.01 if it lacks strong keyword overlap with the query, so it's unsafe
// as a hard relevance cutoff (verified against real data: a correct match
// scored 0.004, below any reasonable rerank threshold). Cosine similarity,
// by contrast, cleanly separates on-topic from off-topic queries in
// practice (off-topic queries: ~0.02-0.06; on-topic: ~0.44-0.50), so it's
// used as the rejection gate instead - reranking is used only to choose
// and order the best candidates among those that already passed it.
const COSINE_RELEVANCE_THRESHOLD = 0.3;

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

  // Wide candidate retrieval by vector similarity, gated by cosine score
  // (see COSINE_RELEVANCE_THRESHOLD above for why), then reranked to pick
  // and order the best few among the candidates that passed the gate.
  const scored = await vectorStore.similaritySearchWithScore(query, CANDIDATE_K);
  if (scored.length === 0) return [];

  const isBroad = BROAD_QUERY_PATTERN.test(query);
  if (!isBroad && scored[0][1] < COSINE_RELEVANCE_THRESHOLD) return [];

  const candidates = scored.map(([doc]) => doc);
  if (isBroad) return candidates;

  const reranker = new CohereRerank({
    apiKey: process.env.COHERE_API_KEY,
    model: "rerank-english-v3.0",
    topN: FINAL_K,
  });
  return await reranker.compressDocuments(candidates, query);
};