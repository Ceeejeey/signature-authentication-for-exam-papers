import React, { useEffect, useRef, useState } from "react";
import { pdfjs } from "react-pdf";
import "./css/PdfViewer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PDFViewer = ({ file }) => {
  const [pdf, setPdf] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [isFileUploaded, setIsFileUploaded] = useState(false); // Track file upload state
  const viewerRef = useRef(null);

  useEffect(() => {
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const typedarray = new Uint8Array(e.target.result);
        pdfjs.getDocument(typedarray).promise.then((pdfDoc) => {
          setPdf(pdfDoc);
          setNumPages(pdfDoc.numPages);
          setIsFileUploaded(true); // Set file uploaded state to true
        });
      };
      fileReader.readAsArrayBuffer(file);
    }
  }, [file]);

  // Render a specific page
  const renderPage = (pageNum) => {
    return new Promise((resolve) => {
      pdf.getPage(pageNum).then((page) => {
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        page.render(renderContext).promise.then(() => {
          resolve(canvas);
        });
      });
    });
  };

  // Render all pages within the scrollable container
  useEffect(() => {
    const renderAllPages = async () => {
      if (pdf) {
        viewerRef.current.innerHTML = ""; // Clear previous renders
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          const canvas = await renderPage(pageNum);
          viewerRef.current.appendChild(canvas);
        }
      }
    };

    renderAllPages();
  }, [pdf, numPages]);

  return (
    <div className="pdf-viewer">
      {/* Heading that disappears after file is uploaded */}
      {!isFileUploaded && (
        <div className="upload-prompt">
          <p>Drag and drop a PDF or click to upload a PDF</p>
        </div>
      )}

      <div className="pdf-container" ref={viewerRef}></div>
    </div>
  );
};

export default PDFViewer;
