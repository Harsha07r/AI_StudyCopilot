# **StudyCopilot AI: PDF-Based RAG System**

**Live Demo:** [https://aistudycopilot.vercel.app/](https://aistudycopilot.vercel.app/)

StudyCopilot AI is a full-stack, document-grounded Question-Answering application. It implements a Retrieval-Augmented Generation (RAG) pipeline to extract precise context from uploaded PDF documents and stream answers via a Large Language Model without hallucinations or data leaks.

---

## **Architectural Advantages**

* **Zero Disk Footprint:** PDF uploads are buffered directly in system RAM using `multer.memoryStorage()`. The backend extracts raw text in-memory and immediately discards the buffer without writing temporary files to the host file system.
* **Low-Latency Embeddings:** Embeddings are generated using Cohere's `embed-english-v3.0` model, converting text chunks into 384-dimensional spatial vectors in milliseconds.
* **Persistent External Vector Storage:** Vector embeddings and chunk metadata are indexed in Pinecone. This decouples vector storage from the application server, ensuring data availability even during host server sleep/restart cycles on free-tier infrastructure.

---

## **Key Features**

* **End-to-End Ingestion:** Automated text extraction, chunking, vectorization, and upserting from raw multi-page PDF files.
* **Context-Preserving Text Chunking:** Utilizes recursive character splitting along natural paragraph and sentence boundaries to retain semantic context across chunk edges.
* **Semantic Search:** Performs cosine similarity queries against indexed vectors rather than relying on exact keyword matching.
* **Strict Grounding:** Prompts force the downstream LLM (LLaMA 3.3 70B) to respond strictly using retrieved context chunks, preventing speculative answers.
* **Streaming Responses:** Implements client-side Server-Sent Events (SSE) handling for real-time response rendering.

---

## **Tech Stack**

### **Frontend**
* **Framework:** React (Vite)
* **Hosting:** Vercel
* **HTTP / Streaming:** Axios & Fetch API

### **Backend & API**
* **Runtime:** Node.js (ES Modules)
* **Framework:** Express.js
* **Middleware:** Multer (Memory Storage)
* **PDF Parsing:** PDF-Parse

### **AI & Vector Infrastructure**
* **Orchestration:** LangChain Ecosystem (`@langchain/core`, `@langchain/pinecone`)
* **Embedding Model:** Cohere (`embed-english-v3.0`)
* **Vector Database:** Pinecone
* **Inference Model:** Groq API (`llama-3.3-70b-versatile`)

---

## **System Pipeline Architecture**

```text
[ User Uploads PDF ]
        │
        ▼
[ Memory Buffer (Multer) ]
        │
        ▼
[ Text Extraction (pdf-parse) ]
        │
        ▼
[ Recursive Character Splitting ] ─── (1000 char chunks / 200 overlap)
        │
        ▼
[ Vector Embeddings (Cohere API) ]
        │
        ▼
[ Upsert to Pinecone Index ]

---------------------------------------------------------------------

[ User Submits Query ]
        │
        ▼
[ Vector Search (Pinecone) ] ─── (Top-3 Cosine Similarity Match)
        │
        ▼
[ Context Injection Layer ]
        │
        ▼
[ LLM Inference Stream (Groq / LLaMA 3.3) ]
        │
        ▼
[ Real-Time UI Render ]
Core Pipeline Details
1. In-Memory Ingestion
Upon receiving a POST request at /store-pdf, the system initializes a Pinecone client and invokes deleteAll() on the designated index namespace. This resets stale vector state before processing new documents. The incoming file stream is parsed into raw UTF-8 string data directly from memory.

2. Semantic Chunking Strategy
Raw strings are split using the following parameters:

Chunk Size: 1,000 characters

Chunk Overlap: 200 characters

This chunk boundary overlap prevents context fragmentation when key information spans across contiguous paragraphs.

3. Retrieval & Prompt Structuring
Incoming user queries are converted into 384-dimensional query vectors and matched against Pinecone records. The top 3 matching text chunks are extracted and wrapped into a system-level context template:

Plaintext
You are a helpful AI assistant. Answer the user's question using ONLY the provided context.
If the context does not contain the answer, say "I cannot answer this based on the provided document."

Context:
[Retrieved Chunk 1]
[Retrieved Chunk 2]
[Retrieved Chunk 3]

Question: [User Query]
Getting Started
Prerequisites
Node.js v18+

API keys for Pinecone, Cohere, and Groq

Installation
Clone the repository:

Bash
git clone [https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git)
cd YOUR_REPOSITORY_NAME
Configure the backend:

Bash
cd backend
npm install
Create a .env file in the backend directory:

Code snippet
PORT=3000
GROQ_API_KEY=your_groq_api_key
COHERE_API_KEY=your_cohere_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_pinecone_index_name
Configure the frontend:

Bash
cd ../frontend
npm install
Create a .env file in the frontend directory:

Code snippet
VITE_BACKEND_URL=http://localhost:3000
Run locally:

Bash
# In backend directory
npm run dev

# In frontend directory
npm run dev
