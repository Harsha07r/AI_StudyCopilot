import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { Sparkles, Copy, Check, FileQuestion } from "lucide-react";

// Allow <br> (used inside table cells for multi-line content) on top of
// the default safe-tag allowlist, which already strips scripts/handlers.
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "br"],
};

function AnswerBox({ answer }) {
  const [copied, setCopied] = useState(false);
  const hasAnswer = Boolean(answer);

  const handleCopy = async () => {
    if (!hasAnswer) return;
    const tableText = answer.table?.length
      ? "\n\n" + answer.table.map((row) => row.join(" | ")).join("\n")
      : "";
    await navigator.clipboard.writeText(answer.answer + tableText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon"><Sparkles size={20} strokeWidth={1.5} /></div>
        <h2>AI Answer</h2>

        {hasAnswer && (
          <button className="icon-btn" onClick={handleCopy} title="Copy answer">
            {copied ? <Check size={16} strokeWidth={2} /> : <Copy size={16} strokeWidth={1.5} />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        )}
      </div>

      {hasAnswer ? (
        <div className="answer-content markdown-body">
          {answer.isAnswerable === false && (
            <div className="answer-unanswerable">
              <FileQuestion size={16} strokeWidth={2} />
              <span>The document doesn&apos;t seem to contain enough information for a confident answer.</span>
            </div>
          )}

          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
          >
            {answer.answer}
          </ReactMarkdown>

          {answer.table?.length > 0 && (
            <table>
              <thead>
                <tr>
                  {answer.table[0].map((cell, i) => (
                    <th key={i}>{cell}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {answer.table.slice(1).map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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