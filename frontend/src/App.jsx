import { useState } from "react";
import axios from "axios";

import Navbar from "./components/Navbar";
import PdfUpload from "./components/PdfUpload";
import ChatBox from "./components/ChatBox";
import AnswerBox from "./components/AnswerBox";

import "./App.css";

const FEATURES = [
  {
    icon: "📄",
    title: "PDF Upload",
    desc: "Drag and drop any PDF to instantly process and index its content for AI search.",
  },
  {
    icon: "🔍",
    title: "Semantic Search",
    desc: "RAG-powered retrieval finds the most relevant chunks using vector similarity.",
  },
  {
    icon: "🤖",
    title: "AI Question Answering",
    desc: "Ask natural language questions and get precise answers powered by Groq LLaMA.",
  },
];

function App() {
  const [pdf, setPdf] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const handleUpload = async () => {
    if (!pdf) {
      alert("Select a PDF first");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("pdf", pdf);
      const uploadRes = await axios.post(`${BACKEND_URL}/upload`, formData);
      const { fileName } = uploadRes.data;
      await axios.post(`${BACKEND_URL}/store-pdf`, { fileName });
      alert("PDF uploaded successfully");
    } catch (error) {
      console.log(error);
    }
  };

  const handleAsk = async () => {
    if (!question) return;

    try {
      setLoading(true);
      const res = await axios.post(`${BACKEND_URL}/chat`, { question });
      setAnswer(res.data.answer);
    } catch (error) {
      console.log(error);
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

        <PdfUpload pdf={pdf} setPdf={setPdf} handleUpload={handleUpload} />
        <ChatBox
          question={question}
          setQuestion={setQuestion}
          handleAsk={handleAsk}
          loading={loading}
        />
        <AnswerBox answer={answer} />

      
      </div>
    </>
  );
}

export default App;
