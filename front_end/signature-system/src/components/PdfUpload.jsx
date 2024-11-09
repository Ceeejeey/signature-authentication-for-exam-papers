
import React from 'react';
import './PdfUpload.css';

const PdfUpload = ({ onUpload }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      onUpload(file);
    } else {
      alert("Please upload a PDF file.");
    }
  };

  return (
    <div className="pdf-upload-container">
      <h3>Upload Exam Paper (PDF)</h3>
      <input 
        type="file" 
        id="pdf-upload" 
        accept="application/pdf" 
        className="file-input" 
        onChange={handleFileChange} 
      />
      <br />
      <label htmlFor="pdf-upload" className="upload-button">Choose PDF</label>
    </div>
  );
};

export default PdfUpload;
