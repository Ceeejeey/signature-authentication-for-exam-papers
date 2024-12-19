import React, { useRef, useEffect, useState } from 'react';
import WebViewer from '@pdftron/webviewer';
import './css/PdfUpload.css';

const PdfUpload = () => {
  const viewerRef = useRef(null);
  const observedDivRef = useRef(null);
  const resizingDelayTimer = useRef(null);
  const [divWidth, setDivWidth] = useState(0);
  const [instance, setInstance] = useState(null);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [currentPageNumber, setCurrentPageNumber] = useState(null);
  const [isSending, setIsSending] = useState(false);  // State to track sending status

  // ResizeObserver to track div width
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      clearTimeout(resizingDelayTimer.current);
      resizingDelayTimer.current = setTimeout(() => {
        if (observedDivRef.current) {
          setDivWidth(observedDivRef.current.clientWidth); // Update width state
        }
      }, 100);
    });

    if (observedDivRef.current) {
      observer.observe(observedDivRef.current);
    }

    return () => {
      if (observer && observedDivRef.current) {
        observer.unobserve(observedDivRef.current);
      }
    };
  }, []);

  // Initialize WebViewer
  useEffect(() => {
    WebViewer(
      {
        path: '/webviewer/lib',
        licenseKey: 'demo:1731319649045:7efeacdc03000000002f099e3784e7ba3fa6cdf24a2a0054191be5fdd1',
        fullAPI: true,
      },
      viewerRef.current
    ).then((webViewerInstance) => {
      setInstance(webViewerInstance);

      // Initialize document viewer and set page number change listener
      const documentViewer = webViewerInstance.Core.documentViewer;
      documentViewer.addEventListener('pageNumberUpdated', (e) => {
        setCurrentPageNumber(e.pageNumber);
      });
    });
  }, []);

  // Handle file upload
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

  // Handle inserting a stamp or signature at the correct mouse position
  const handleInsert = (event) => {
    if (!instance || !currentPageNumber) return;

    const viewer = instance.Core.documentViewer;
    const displayModeManager = viewer.getDisplayModeManager();
    const displayMode = displayModeManager.getDisplayMode();

    const mouseX = event.clientX;
    const mouseY = event.clientY;

    // Get page number at mouse position
    const pageNumber = displayMode.getPageAtPoint(mouseX, mouseY);
    if (pageNumber !== currentPageNumber) return;

    // Convert screen coordinates to PDF coordinates
    const pdfCoordinates = displayMode.windowToPageCoordinates(pageNumber, mouseX, mouseY);

    const annotation = new instance.Core.Annotations.StampAnnotation();
    annotation.PageNumber = pageNumber;
    annotation.X = pdfCoordinates.x;
    annotation.Y = pdfCoordinates.y;
    annotation.Width = 100;  // Set the width for the stamp
    annotation.Height = 50;  // Set the height for the stamp
    annotation.setImage('https://example.com/your-stamp-image.png');  // Path to your stamp image

    const annotationManager = viewer.getAnnotationManager();
    annotationManager.addAnnotation(annotation);
    annotationManager.redrawAnnotation(annotation);
  };

  // Handle share request with encryption
  const handleShareRequest = async () => {
    if (!recipientEmail || !isFileUploaded || !password) {
      alert('Please upload a file, provide recipient email, and enter a password!');
      return;
    }

    setIsSending(true);  // Start sending process

    const documentViewer = instance.Core.documentViewer;
    const doc = documentViewer.getDocument();

    if (!doc) {
      alert('No document is loaded.');
      setIsSending(false);  // End sending process
      return;
    }

    try {
      const annotationManager = documentViewer.getAnnotationManager();
      const xfdfString = await annotationManager.exportAnnotations();

      const pdfBuffer = await doc.getFileData({ xfdfString });
      const pdfDoc = await instance.Core.PDFNet.PDFDoc.createFromBuffer(pdfBuffer);
      pdfDoc.initSecurityHandler();

      const securityHandler = await instance.Core.PDFNet.SecurityHandler.createDefault();
      securityHandler.changeUserPasswordUString(password);

      securityHandler.setPermission(instance.Core.PDFNet.SecurityHandler.Permission.e_print, true);
      securityHandler.setPermission(instance.Core.PDFNet.SecurityHandler.Permission.e_extract_content, false);

      pdfDoc.setSecurityHandler(securityHandler);

      const encryptedBuffer = await pdfDoc.saveMemoryBuffer(instance.Core.PDFNet.SDFDoc.SaveOptions.e_linearized);

      const blob = new Blob([encryptedBuffer], { type: 'application/pdf' });

      const formData = new FormData();
      formData.append('pdf', blob, 'encrypted-document.pdf');
      formData.append('email', recipientEmail);
      formData.append('message', message);

      const response = await fetch('http://localhost:3000/api/send-pdf', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        alert('Encrypted PDF shared successfully!');
      } else {
        alert('Failed to share the encrypted PDF. Please try again.');
      }
    } catch (err) {
      console.error('Error while sharing the encrypted document:', err);
      alert('An error occurred while sharing the encrypted document.');
    } finally {
      setIsSending(false);  // End sending process
      setIsModalOpen(false);  // Close the modal
    }
  };

  return (
    <div className="pdf-upload">
      {/* Top Navbar */}
      <div className="top-navbar">
        <div className="welcome-message">Welcome to the PDF Editor</div>
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
        style={{ display: isFileUploaded ? 'block' : 'none', height: '100vh', width: '100%' }}
        onClick={handleInsert}  
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
              Password:
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password for encryption"
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
              <button
                onClick={handleShareRequest}
                className="send-button"
                disabled={isSending}  // Disable the button during sending
              >
                {isSending ? 'Sending...' : 'Send'}
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="cancel-button"
              >
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
