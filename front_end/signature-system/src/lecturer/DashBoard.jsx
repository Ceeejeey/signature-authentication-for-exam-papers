import React, { useState } from 'react';
import PdfUpload from '../components/PdfUpload';
import PdfPreview from '../components/PdfPreview';

const LecturerDashboard = () => {
  const [pdfFile, setPdfFile] = useState(null);

  // Handle the uploaded file from PdfUpload
  const handleFileUpload = (file) => {
    setPdfFile(file); // Set the file directly, no need for URL.createObjectURL
  };

  // Check if the file is being set correctly
console.log("pdfFile in LecturerDashboard:", pdfFile);

  return (
    <div>
      <h1>Upload and Preview PDF</h1>
      <PdfUpload onFileUpload={handleFileUpload} />
      {pdfFile && <PdfPreview pdfFile={pdfFile} />}
    </div>
  );
};

export default LecturerDashboard;
