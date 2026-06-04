function PdfUpload({ pdf, setPdf, handleUpload }) {
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
          onChange={(e) => setPdf(e.target.files[0])}
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

      <button className="primary-btn" onClick={handleUpload}>
        ⬆ Upload PDF
      </button>
    </div>
  );
}

export default PdfUpload;
