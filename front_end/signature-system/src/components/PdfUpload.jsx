import React, { useState, useRef } from "react";
import { pdfjs } from "react-pdf";
import "./css/PdfUpload.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PdfUpload = () => {
  const [pdf, setPdf] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const canvasRef = useRef(null);

  // Handle PDF file upload and render the first page
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const typedarray = new Uint8Array(e.target.result);
        pdfjs.getDocument(typedarray).promise.then((pdfDoc) => {
          setPdf(pdfDoc);
          setNumPages(pdfDoc.numPages);
          setPageNumber(1);
          renderPage(pdfDoc, 1);
        });
      };
      fileReader.readAsArrayBuffer(file);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  // Render a specific page on the canvas
  const renderPage = (pdfDoc, pageNum) => {
    pdfDoc.getPage(pageNum).then((page) => {
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      page.render(renderContext);
    });
  };

  // Navigation to the previous page
  const goToPrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
      renderPage(pdf, pageNumber - 1);
    }
  };

  // Navigation to the next page
  const goToNextPage = () => {
    if (pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
      renderPage(pdf, pageNumber + 1);
    }
  };

  return (
    <div className="pdf-upload">
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <canvas ref={canvasRef} className="pdf-canvas"></canvas>

      {pdf && (
        <div className="navigation">
          <button onClick={goToPrevPage} disabled={pageNumber <= 1}>
            Previous
          </button>
          <span>
            Page {pageNumber} of {numPages}
          </span>
          <button onClick={goToNextPage} disabled={pageNumber >= numPages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PdfUpload;
