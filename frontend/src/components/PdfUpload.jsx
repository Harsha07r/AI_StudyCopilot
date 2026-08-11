import React, { useState, useEffect } from 'react';

const STAGES = [
  "Uploading document to server...",
  "Parsing PDF & extracting text...",
  "Splitting text into vector chunks...",
  "Generating embeddings via Groq...",
  "Updating knowledge base...",
  "Finalizing setup..."
];

function PdfUpload({ pdf, setPdf, handleUpload, isUploading }) {
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

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon">📄</div>
        <h2>Upload Document</h2>
      </div>

      <div className="file-drop-zone">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          disabled={isUploading} // Disables input while uploading
        />
        <div className="file-drop-icon">☁️</div>
        <p className="file-drop-text">
          Drop your PDF here or <span>browse files</span>
        </p>
      </div>

      {pdf && (
        <div className="file-selected">
          📎 {pdf.name}
        </div>
      )}

      <button 
        className="primary-btn" 
        onClick={handleUpload}
        disabled={!pdf || isUploading} // Disables button while uploading
      >
        {isUploading ? 'Processing...' : '⬆ Upload PDF'}
      </button>

      {/* New Multi-Stage Loading Feedback */}
      {isUploading && (
        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <span style={{ fontWeight: '600', color: '#555' }}>{STAGES[stageIndex]}</span>
          <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
            Step {stageIndex + 1} of {STAGES.length}
          </div>
        </div>
      )}
    </div>
  );
}

export default PdfUpload;