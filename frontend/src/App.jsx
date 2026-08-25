import { useState } from "react";
import axios from "axios";

import Navbar from "./components/Navbar";
import PdfUpload from "./components/PdfUpload";
import ChatBox from "./components/ChatBox";
import AnswerBox from "./components/AnswerBox";
import { FileText, Search, Bot } from "lucide-react";
import "./App.css";

const FEATURES = [
  {
    // Use the React component and set a uniform size
    icon: <FileText size={32} strokeWidth={1.5} />,
    title: "PDF Upload",
    desc: "Drag and drop any PDF to instantly process and index its content for AI search.",
  },
  {
    icon: <Search size={32} strokeWidth={1.5} />,
    title: "Semantic Search",
    desc: "RAG-powered retrieval finds the most relevant chunks using vector similarity.",
  },
  {
    icon: <Bot size={32} strokeWidth={1.5} />,
    title: "AI Question Answering",
    desc: "Ask natural language questions and get precise answers powered by Groq LLaMA.",
  },
];

function App() {
  const [pdf, setPdf] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);

  // State for AI Chat loading
  const [loading, setLoading] = useState(false);

  // State for PDF Upload process
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(""); // errors only
  const [isIndexed, setIsIndexed] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // Selecting a new file invalidates the previous upload
  const handleSetPdf = (file) => {
    setPdf(file);
    setIsIndexed(false);
    setUploadStatus("");
    setAnswer(null);
  };

  const handleUpload = async () => {
    if (!pdf) {
      alert("Select a PDF first");
      return;
    }

    try {
      setIsUploading(true);
      setUploadStatus("");

      const formData = new FormData();
      formData.append("pdf", pdf);

      // Axios automatically sets the correct multipart boundary header
      const storeRes = await axios.post(`${BACKEND_URL}/store-pdf`, formData);

      if (storeRes.data.success) {
        setIsIndexed(true);
      } else {
        setIsIndexed(false);
        setUploadStatus(storeRes.data.error || "Upload failed.");
      }
    } catch (error) {
      console.error("Server said:", error.response?.data);
      setIsIndexed(false);
      setUploadStatus(
        error.response?.data?.error || "Upload failed. Please try again."
      );
    } finally {
      setIsUploading(false); // Guarantees the loading UI unfreezes
    }
  };

  const handleAsk = async () => {
    if (!question || !isIndexed) return;

    try {
      setLoading(true);
      setAnswer(null);

      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAnswer({ answer: data.error || "Chat request failed.", isAnswerable: false });
        return;
      }

      setAnswer(data);
    } catch (error) {
      console.error("Chat error:", error);
      setAnswer({ answer: "An error occurred while generating the response.", isAnswerable: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="glow-1" />
      <div className="glow-2" />

      <Navbar />

      <div className="container">
        <section className="hero">
          <div className="hero-badge">✦ AI-Powered PDF Assistant</div>
          <h1 className="hero-title">StudyCopilot AI</h1>
          <p className="hero-subtitle">
            Upload PDFs. Ask Questions. Learn Faster.
          </p>
        </section>

        <div className="feature-grid" id="features">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>

        <PdfUpload
          pdf={pdf}
          setPdf={handleSetPdf}
          handleUpload={handleUpload}
          isUploading={isUploading}
          uploadStatus={uploadStatus}
          isIndexed={isIndexed}
        />

        <ChatBox
          question={question}
          setQuestion={setQuestion}
          handleAsk={handleAsk}
          loading={loading}
          isIndexed={isIndexed}
        />

        <AnswerBox answer={answer} />
      </div>
    </>
  );
}

export default App;