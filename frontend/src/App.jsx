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
  
  // State for the AI Chat loading
  const [loading, setLoading] = useState(false);
  
  // NEW: State for the PDF Upload process
  const [isUploading, setIsUploading] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const handleUpload = async () => {
    if (!pdf) {
      alert("Select a PDF first");
      return;
    }

    try {
      setIsUploading(true); // 1. Turn on the multi-stage loading UI

      const formData = new FormData();
      formData.append("pdf", pdf);
      
      const uploadRes = await axios.post(`${BACKEND_URL}/upload`, formData);
      const { fileName } = uploadRes.data;
      
      await axios.post(`${BACKEND_URL}/store-pdf`, { fileName });
      
      // Optional: You can remove this alert now since the UI will naturally 
      // stop showing the loading state, which implies success.
      // alert("PDF uploaded successfully"); 
      
    } catch (error) {
      console.log(error);
      alert("Upload failed. Please check your connection and try again.");
    } finally {
      setIsUploading(false); // 2. Turn off the loading UI when finished (success or fail)
    }
  };

 const handleAsk = async () => {
    if (!question) return;

    try {
      setLoading(true); // Turn on the loading state
      setAnswer(""); // Clear the previous answer

      // 1. Use native fetch to keep the connection open for the stream
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) throw new Error("Chat request failed");

      // 2. Set up the stream reader
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      setLoading(false); // Turn off the loading spinner the second the first word arrives

      // 3. Loop through the incoming data packets
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break; // The stream is completely finished
        }

        // Decode the raw bytes into text
        const chunk = decoder.decode(value, { stream: true });

        // 4. Parse the Server-Sent Events format (data: {...}\n\n)
        const lines = chunk.split("\n\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataString = line.replace("data: ", "");
            
            if (dataString === "[DONE]") {
              break; // Backend signaled the end
            }
            
            try {
              const parsedData = JSON.parse(dataString);
              // 5. Append the new word to the answer state instantly
              setAnswer((prev) => prev + parsedData.text);
            } catch (e) {
              console.error("Error parsing stream data:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setAnswer("An error occurred while generating the response.");
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

        {/* 3. Pass the isUploading state down to the child component! */}
        <PdfUpload 
          pdf={pdf} 
          setPdf={setPdf} 
          handleUpload={handleUpload} 
          isUploading={isUploading} 
        />
        
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