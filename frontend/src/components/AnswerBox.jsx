import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles, Copy, Check, FileQuestion } from "lucide-react";

function AnswerBox({ answer }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon"><Sparkles size={20} strokeWidth={1.5} /></div>
        <h2>AI Answer</h2>

        {answer && (
          <button className="icon-btn" onClick={handleCopy} title="Copy answer">
            {copied ? <Check size={16} strokeWidth={2} /> : <Copy size={16} strokeWidth={1.5} />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        )}
      </div>

      {answer ? (
        <div className="answer-content markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
        </div>
      ) : (
        <div className="answer-placeholder">
          <FileQuestion size={32} strokeWidth={1.25} />
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