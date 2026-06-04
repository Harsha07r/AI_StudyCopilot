function ChatBox({ question, setQuestion, handleAsk, loading }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon">💬</div>
        <h2>Ask a Question</h2>
      </div>

      <div className="input-wrapper">
        <input
          type="text"
          placeholder="Ask anything from the PDF..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
        />
      </div>

      <button className="primary-btn" onClick={handleAsk} disabled={loading}>
        {loading ? (
          <>
            <div className="btn-spinner" />
            Generating...
          </>
        ) : (
          "✦ Ask AI"
        )}
      </button>

      {loading && (
        <div className="loading-row">
          <div className="spinner" />
          <span>Generating Answer...</span>
        </div>
      )}
    </div>
  );
}

export default ChatBox;
