// Tracks which Pinecone namespace the chat endpoint should query.
// The app only supports one "active" document at a time (no per-user
// sessions yet), but storing it as a namespace means older uploads
// stay in Pinecone instead of being wiped on every new upload.
let activeNamespace = null;

export const setActiveNamespace = (namespace) => {
  activeNamespace = namespace;
};

export const getActiveNamespace = () => activeNamespace;
