PDF-Based Retrieval-Augmented Generation (RAG) System
A full-stack, offline-capable AI application that allows users to upload PDF documents, automatically extract and process their text, and converse with the document using an advanced Retrieval-Augmented Generation (RAG) pipeline.

By leveraging local embedding engines, semantic text chunking, and highly efficient similarity search algorithms, this system extracts answers directly from uploaded source material with zero external data leaks and highly reduced token costs.

🚀 Key Features & Capabilities
End-to-End Ingestion Pipeline: Seamless transition from raw, multi-page PDF binaries to clean, searchable mathematical representations.

Multipart File Handling: Robust streaming and temporary storage of local files using a high-performance middleware architecture.

Context-Preserving Tokenization: Intelligent text segmentation that ensures paragraphs are split along syntactic boundaries without tearing sentence meaning.

Local, Free AI Embeddings: Generates vector representations directly on your host machine—completely bypassing external API usage, pricing limits, and latency spikes.

Semantic Search & Retrieval: Identifies and returns document fragments using conceptual closeness rather than rigid, literal keyword lookups.

Strict Context Constraint: A custom LLM instruction layer forces the conversational agent to reply using only verified documentation fragments, neutralizing hallucinations.

🛠️ Technology Stack
Backend Engine
Runtime Environment: Node.js (ECMAScript Modules)

Web Framework: Express.js

File Processing: Multer

AI & Vector Infrastructure
Orchestration Framework: LangChain Core & Community Ecosystem

Local Embedding Engine: @xenova/transformers (JavaScript port of Hugging Face Transformers)

Embedding Model: all-MiniLM-L6-v2 (384-dimensional semantic vectors)

Database / Indexing: LangChain MemoryVectorStore & ChromaDB Integration

Inference Model: Groq API Cloud Client

📋 System Pipeline Architecture
The application functions through a strict, unidirectional processing data flow:

Plaintext
[ Raw PDF Upload ] 
       │
       ▼ (Multer Middleware handles Multipart Stream)
[ Disks/Upload Storage ] 
       │
       ▼ (LangChain PDFLoader extracts text pages)
[ Extracted Documents ] 
       │
       ▼ (Recursive Character Tokenizer splits text)
[ Optimized Document Chunks ] 
       │
       ▼ (Local Transformer Model calculates weights)
[ 384-Dimensional Vectors ] 
       │
       ▼ (Indexed into RAM or Disk-based Stores)
[ Vector Database ] ◄─── (Similarity Match) ─── [ User Query ]
       │                                              │
       ▼ (Extracted Paragraphs)                       │
[ Prompt Engineering Context Layer ] ◄────────────────┘
       │
       ▼ (Invokes Isolated Inference)
[ Final Human-Readable Answer ]
🔍 Core Component Breakdown
1. Document Extraction & Storage Layer
Traditional web frameworks cannot parse complex file streams out of the box. This layer intercepts binary data streams, saves files securely to disk, and uses a headless PDF compilation mechanism to output individual page elements containing both raw string content and location metadata.

2. Semantic Structural Chunking
To prevent overwhelming LLM context window spaces and keep billing footprints minimal, documents are divided through a hierarchy of separators (paragraphs, sentences, spaces).

Chunk Size: 1,000 Characters

Chunk Overlap: 200 Characters (Ensures contextual concepts at bounding edges are duplicated across adjacent structures).

3. Vectorization Engine (The Adapter Pattern)
Rather than passing raw phrases over the web, the system converts chunks into spatial data coordinates using a local instance of the all-MiniLM-L6-v2 neural model. A custom structural Adapter pattern maps your local inference arrays seamlessly into LangChain's uniform abstraction layer, deploying both single-query processing and massive batch execution blocks.

JavaScript
// Example structural implementation of the local AI adapter
export class CustomEmbeddings extends Embeddings {
  async embedDocuments(texts) {
    const embeddings = [];
    for (const text of texts) {
      embeddings.push(await createEmbedding(text));
    }
    return embeddings;
  }
  async embedQuery(text) {
    return await createEmbedding(text);
  }
}
4. Memory Indexing & Intelligent Context Retrieval
Once documents are saved into the Vector Space, user queries act as spatial probes. The data layer parses incoming strings, calculates the query's dimensional properties, and isolates the top 3 nearest historical records using mathematical Cosine Similarity equations.

The application maps, extracts, and stitches these documents together into a single plain-text reference string wrapped inside systemic boundaries:

Plaintext
You are a study assistant.
Answer ONLY from the provided context.

Context:
[Retrieved Document Fragment 1]
[Retrieved Document Fragment 2]
[Retrieved Document Fragment 3]

Question: [User Query]
🛠️ Getting Started & Installation
Prerequisites
Node.js (v18 or higher recommended)

Git

Installation
Clone the repository down to your local machine:

Bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
cd YOUR_REPOSITORY_NAME
Initialize your configurations inside the root server directory by creating a .env file:

Code snippet
PORT=3000
GROQ_API_KEY=your_secret_groq_api_key
Setup your dependencies:

Bash
# Navigate into Backend and install
cd backend
npm install

# Navigate into Frontend and install
cd ../frontend
npm install
Run the development application servers:

Bash
# From your backend service folder
npm run dev