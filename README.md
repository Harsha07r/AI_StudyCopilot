DAY1- Intial Frontend,Backend ,Groq API ,Langchain Setup 
Initial Setup:
git init in root dir -- to initialize git repo
mkdir frontend ,mkdir backend
created .gitignore ,README.md in Root dir
Install Backend and Frontend Dependencies 
Langchain is installed and Groq is also connected
->created an endpoint /chat to test requests to Groq API and tested
-------------------------------------------------------------
DAY2 -PDF Upload System
->developed the uploadRoutes Route to upload PDF from the frontend 
->Multer
uploads folder
File Storage
Flow:
A user goes to their browser or an app, selects a file, and hits "Upload". The app sends an HTTP POST request to your /upload route
Before your final code can even touch the request, the upload.single("pdf") MIDDLEWARE jumps in. It tells the server: "Hold on, there's a single file named 'pdf' in this request. Let me handle it."
Express doesn't know how to open or read this format on its own. so This Multer Middleware helps to unwrap the multipart/form-data and pass the control to the route
Def: "Express cannot natively parse multipart/form-data. Multer acts as a middleware that intercepts the request, unwraps (parses) the multipart stream, saves the file to the specified storage, populates req.file and req.body, and then calls next() to pass control to the final route handler."

now the pdf can be uploaded and stored only ,we cannot now read the text and give to AI
------------------------------------------------------------
DAY3- PDF Loading & Text Extraction.
->to convert pdf file into redable text
This is acheived using Langchain Document Loader
PDF Loader Dependencies -> npm install pdf-parse pdfjs-dist ,npm install @langchain/community

Flow between the pdfLoader and pdfRoutes files: 
the request from user is received at router.get("/read-pdf") ,it goes inside the try block and sees it passes the control to service to read the file content and also passes the file location to the service file , now server goes into service file and uses PDF Loader to open and read the file and  loadpdf function return the docs which contains array of objects(pages) and the metadata(page info) and gives it to the routerfile(pdfRoutes) and now this displays the content received from the pdfLaoderService

------------------------------------------------------
Day4- Text Splitting(Chunking)
->Huge Text is converted into Chunks using RecursiveCharacterTextSplitter
Need of Chunking : Suppose there is a OS PDF of 50 pages
Question: What is Deadlock? ,now should we send the entire PDF to LLM 
NO ,because of more tokens ,more cost 
SO break the entire PDF into chunks to make retreival easy
it uses chunkSize to divide into chunks and chunkOverlap to ensure context is not lost

Text Splitter package -> npm install @langchain/textsplitters --legacy-peer-deps

Till now:
Upload
 ↓
Load
 ↓
Split

--------------------------------------------------
Day5- Embeddings
->AI cannot search text efficiently so it converts Text into Embedding vector ,so it searches for meaning rather than exact words
Embedding -An embedding is a numerical representation of meaning. 

Also install Chromadb to store the Embeddings -> npm install chromadb --legacy-peer-deps

Implemented semantic embeddings using the
all-MiniLM-L6-v2 transformer model,
converting document chunks into 384-dimensional
vectors for semantic retrieval.

The flow and functioanlity is explained detaily in the embeddingService ,embeddingRoutes files itself

---------------------------------------------------------
Day6-Vector Database (ChromaDB)
ChromaDB stores Vectors
Chunk:"Deadlock occurs..."
Embedding:[0.23, -0.45, ...]
stored together.
Without Day 6:

Embeddings exist
but cannot be searched

current:
Embeddings
 ↓
Indexed
 ↓
Searchable

VectorStore:
A vector store indexes and stores embeddings, enabling efficient similarity search so that the most relevant chunks can be retrieved during a RAG workflow.