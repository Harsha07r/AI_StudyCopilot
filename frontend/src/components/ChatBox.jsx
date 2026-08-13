import { MessageSquare, Sparkles, Loader2, Lock } from "lucide-react";

function ChatBox({ question, setQuestion, handleAsk, loading, isIndexed }) {
  const disabled = !isIndexed || loading;

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon"><MessageSquare size={20} strokeWidth={1.5} /></div>
        <h2>Ask a Question</h2>
      </div>

      <div className="input-wrapper">
        {!isIndexed && <Lock size={15} strokeWidth={1.5} className="input-lock" />}
        <input
          type="text"
          placeholder={
            isIndexed
              ? "Ask anything from the PDF..."
              : "Upload a PDF to start asking questions"
          }
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !disabled && handleAsk()}
          disabled={disabled}
          className={!isIndexed ? "has-lock" : ""}
        />
      </div>

      {isIndexed && !question && !loading && (
        <div className="suggestions">
          {["Summarize this document", "What are the key points?", "Explain the main concepts"].map((s) => (
            <button key={s} className="suggestion-chip" onClick={() => setQuestion(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <button
        className="primary-btn"
        onClick={handleAsk}
        disabled={disabled || !question.trim()}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles size={16} strokeWidth={2} />
            Ask AI
          </>
        )}
      </button>
    </div>
  );
}

export default ChatBox;