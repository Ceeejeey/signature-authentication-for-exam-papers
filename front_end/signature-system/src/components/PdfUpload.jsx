import React, { useState } from 'react';
import './PdfUpload.css';  // Import the CSS file

const PdfUpload = ({ onFileUpload }) => {
  const [file, setFile] = useState(null);

  // Handle file selection
  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      console.log('Uploaded file:', uploadedFile);  // Check the file details
      if (uploadedFile.type === 'application/pdf') {
        setFile(uploadedFile);
        onFileUpload(uploadedFile);  // Pass the valid file to the parent
      } else {
        alert('Please upload a valid PDF file');
      }
    }
  };

  return (
    <div className="pdf-upload-container">
      <h2>Upload Your PDF</h2>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
      />
      {file && <p>{file.name}</p>}  {/* Show the file name after selection */}
    </div>
  );
};

export default PdfUpload;
