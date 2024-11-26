import React, { useRef, useEffect, useState } from 'react';
import WebViewer from '@pdftron/webviewer';
import './css/PdfUpload.css';

const PdfUpload = () => {
  const viewerRef = useRef(null);
  const [instance, setInstance] = useState(null);
  const [isFileUploaded, setIsFileUploaded] = useState(false);

  useEffect(() => {
    // Initialize WebViewer without loading a default document
    WebViewer(
      {
        path: '/webviewer/lib', 
        licenseKey: 'demo:1731319649045:7efeacdc03000000002f099e3784e7ba3fa6cdf24a2a0054191be5fdd1',
      },
      viewerRef.current
    ).then((webViewerInstance) => {
      setInstance(webViewerInstance);
    });
  }, []);

  const handleFileUpload = (file) => {
    if (file && file.type === 'application/pdf') {
      setIsFileUploaded(true); 
      const reader = new FileReader();
      reader.onload = (e) => {
        const buffer = e.target.result;
        instance.UI.loadDocument(buffer, { filename: file.name });
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert('Please upload a valid PDF file.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileUpload(file);
  };

  return (
    <div className="pdf-upload">
      {/* Top Navbar */}
      <div className="top-navbar">
        <h1>Welcome to the PDF Editor</h1>
      </div>

      {/* Drag and Drop Section */}
      {!isFileUploaded && (
        <div
          className="drag-drop-container"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="drag-drop-message">
            <p>Drag and drop your PDF here</p>
            <p>or</p>
            <label htmlFor="file-input" className="upload-button">
              Browse Files
            </label>
            <input
              id="file-input"
              type="file"
              accept="application/pdf"
              onChange={handleFileInputChange}
              className="hidden-file-input"
            />
          </div>
        </div>
      )}

      {/* Viewer Container */}
      <div
        className="viewer-container"
        ref={viewerRef}
        style={{ display: isFileUploaded ? 'block' : 'none' }}
      ></div>
    </div>
  );
};

export default PdfUpload;
