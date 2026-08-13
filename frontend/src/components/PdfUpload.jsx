import React, { useState, useEffect } from 'react';
import { FileUp, UploadCloud, Paperclip, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const STAGES = [
  "Uploading document to server...",
  "Parsing PDF & extracting text...",
  "Splitting text into vector chunks...",
  "Generating embeddings...",
  "Updating knowledge base...",
  "Finalizing setup..."
];

function PdfUpload({ pdf, setPdf, handleUpload, isUploading, uploadStatus, isIndexed }) {
  const [stageIndex, setStageIndex] = useState(0);

  // Cycle through loading stage messages every 2.5 seconds when uploading
  useEffect(() => {
    let interval;
    if (isUploading) {
      interval = setInterval(() => {
        setStageIndex((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
      }, 2500);
    } else {
      setStageIndex(0); // Reset the stages when upload finishes
    }
    return () => clearInterval(interval);
  }, [isUploading]);

  // Client-side file validation
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
      return;
    }

    // 10MB limit to protect your free Render server
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB. Please choose a smaller study document.');
      return;
    }

    setPdf(selectedFile);
  };

  const formatSize = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon"><FileUp size={20} strokeWidth={1.5} /></div>
        <h2>Upload Document</h2>
      </div>

      <div className="file-drop-zone">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          disabled={isUploading} // Disables input while uploading
        />
        <div className="file-drop-icon">
          <UploadCloud size={36} strokeWidth={1.25} />
        </div>
        <p className="file-drop-text">
          Drop your PDF here or <span>browse files</span>
        </p>
        <p className="file-drop-hint">PDF only &middot; Max 10 MB</p>
      </div>

      {pdf && (
        <div className="file-selected">
          <div className="file-meta">
            <Paperclip size={16} strokeWidth={1.5} />
            <span className="file-name">{pdf.name}</span>
            <span className="file-size">{formatSize(pdf.size)}</span>
          </div>

          {isIndexed && !isUploading && (
            <span className="file-badge file-badge--ok">
              <CheckCircle2 size={14} strokeWidth={2} /> Indexed
            </span>
          )}
        </div>
      )}

      <button
        className="primary-btn"
        onClick={handleUpload}
        disabled={!pdf || isUploading || isIndexed}
      >
        {isUploading ? (
          <><Loader2 size={16} className="spin" /> Processing...</>
        ) : isIndexed ? (
          <><CheckCircle2 size={16} strokeWidth={2} /> Indexed</>
        ) : (
          <><FileUp size={16} strokeWidth={2} /> Upload PDF</>
        )}
      </button>

      {/* Multi-stage loading feedback */}
      {isUploading && (
        <div className="upload-progress">
          <span className="upload-stage">{STAGES[stageIndex]}</span>
          <div className="upload-step">Step {stageIndex + 1} of {STAGES.length}</div>
          <div className="upload-bar">
            <div
              className="upload-bar-fill"
              style={{ width: `${((stageIndex + 1) / STAGES.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Errors only — success is shown by the badge and button state */}
      {!isUploading && uploadStatus && !isIndexed && (
        <div className="upload-error">
          <AlertCircle size={16} strokeWidth={1.5} />
          <span>{uploadStatus}</span>
        </div>
      )}
    </div>
  );
}

export default PdfUpload;