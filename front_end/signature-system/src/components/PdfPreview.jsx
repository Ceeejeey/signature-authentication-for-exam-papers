import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import './PdfPreview.css'; // Import the CSS file
import { pdfjs } from 'react-pdf';

const PdfPreview = ({ pdfFile }) => {
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(null);


pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

  // Handle the document load success event
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <div className="pdf-preview-container">
      {/* Check if the file is a valid PDF file */}
      {pdfFile && pdfFile.type === 'application/pdf' ? (
        <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
          <Page pageNumber={pageNumber} />
        </Document>
      ) : (
        <p>Invalid file provided</p>
      )}

      {/* Page navigation controls */}
      <div className="page-navigation">
        <button
          disabled={pageNumber <= 1}
          onClick={() => setPageNumber(pageNumber - 1)}
        >
          Previous
        </button>
        <span>
          Page {pageNumber} of {numPages}
        </span>
        <button
          disabled={pageNumber >= numPages}
          onClick={() => setPageNumber(pageNumber + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PdfPreview;
