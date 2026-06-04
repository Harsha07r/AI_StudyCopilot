import { getVectorStore } from "./vectorStoreService.js";

export const retrieveRelevantChunks = async (query) => {
    const vectorStore = getVectorStore();
    if(!vectorStore) {
        throw new Error("Vector Store not initialized");
    }

     const results = await vectorStore.similaritySearch(query,3); // Retrieves the top 3 most relevant chunks based on cosine similarity between the query and the stored vectors.

     return results;
}


// const vectorStore = getVectorStore();
// This reaches back into your vectorStoreService.js file and grabs the active, in-memory database instance where your chunked PDF data and vectors are currently floating in RAM.
// if (!vectorStore) {
//   throw new Error("Vector Store not initialized");
// }
// If a user tries to ask a question before uploading or processing a PDF, the database will be empty (null). This check catches that scenario so your server doesn't crash, throwing a clear error instead.