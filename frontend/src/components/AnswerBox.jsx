function AnswerBox({ answer }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon">✨</div>
        <h2>AI Answer</h2>
      </div>

      {answer ? (
        <p className="answer-content">{answer}</p>
      ) : (
        <div className="answer-placeholder">
          <p>
            Upload a PDF and ask a question<br />
            to get AI-powered responses.
          </p>
        </div>
      )}
    </div>
  );
}

export default AnswerBox;
