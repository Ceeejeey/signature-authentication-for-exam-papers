import React, { useRef, useEffect, useState } from 'react';
import WebViewer from '@pdftron/webviewer';
import './css/PdfUpload.css';

const PdfUpload = () => {
  const viewerRef = useRef(null);
  const [instance, setInstance] = useState(null);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');

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

  const handleShareRequest = async () => {
    if (!recipientEmail || !isFileUploaded) {
      alert('Please upload a file and provide recipient email!');
      return;
    }
  
    const documentViewer = instance.Core.documentViewer;
    const annotManager = instance.Core.annotationManager;
    const doc = documentViewer.getDocument();
  
    if (!doc) {
      alert('No document is loaded.');
      return;
    }
  
    try {
      // Step 1: Flatten annotations into the document
      const xfdfString = await annotManager.exportAnnotations(); // Export annotations
      const options = { xfdfString }; // Pass XFDF to embed annotations into the PDF
  
      // Step 2: Retrieve the updated PDF with annotations embedded
      const fileData = await doc.getFileData(options);
  
      // Step 3: Convert the fileData to a Blob
      const blob = new Blob([fileData], { type: 'application/pdf' });
  
      // Step 4: Prepare formData for sending the PDF
      const formData = new FormData();
      formData.append('pdf', blob, 'document.pdf');
      formData.append('email', recipientEmail);
      formData.append('message', message);
  
      // Step 5: Send the formData to the backend
      const response = await fetch('http://localhost:3000/api/send-pdf', {
        method: 'POST',
        body: formData,
      });
  
      const result = await response.json();
  
      if (result.success) {
        alert('PDF shared successfully!');
        setIsModalOpen(false); // Close the modal upon success
      } else {
        alert('Failed to share PDF. Please try again.');
      }
    } catch (err) {
      console.error('Error while sharing the document:', err);
      alert('An error occurred while sharing the document.');
    }
  };
  
  


  return (
    <div className="pdf-upload">
      {/* Top Navbar */}
      <div className="top-navbar">
        <div className="welcome-message">
           Welcome to the PDF Editor
        </div>
        {isFileUploaded && (
          <button
            className="share-button-topbar"
            onClick={() => setIsModalOpen(true)}
          >
            Share & Request Signature
          </button>
        )}
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



      {/* Modal for Sharing */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Share PDF & Request Signature</h3>
            <label>
              Recipient Email:
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="Enter recipient's email"
              />
            </label>
            <label>
              Message (optional):
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write a message to the recipient"
              ></textarea>
            </label>
            <div className="modal-actions">
              <button onClick={handleShareRequest} className="send-button">
                Send
              </button>
              <button onClick={() => setIsModalOpen(false)} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfUpload;
