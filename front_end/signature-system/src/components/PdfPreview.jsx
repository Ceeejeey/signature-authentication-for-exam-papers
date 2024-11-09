import React, { useEffect, useState } from 'react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import { PDFDocument } from 'pdf-lib';
import './PdfPreview.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PdfPreview = ({ pdfFile, signature, signatureWidth, signatureHeight }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const [signaturePosition, setSignaturePosition] = useState({ x: 100, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [isPositionConfirmed, setIsPositionConfirmed] = useState(false);
  const [initialMousePosition, setInitialMousePosition] = useState({ x: 0, y: 0 });

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handlePageLoad = (page) => {
    if (page && page.width && page.height) {
      setPageWidth(page.width);
      setPageHeight(page.height);
    }
  };

  useEffect(() => {
    if (pdfFile) {
      setPageWidth(0);
      setPageHeight(0);
    }
  }, [pdfFile]);

  const handleMouseDown = (e) => {
    if (isPositionConfirmed) return;

    e.preventDefault();
    setIsDragging(true);
    setInitialMousePosition({ x: e.clientX - signaturePosition.x, y: e.clientY - signaturePosition.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      e.preventDefault();
      const newX = e.clientX - initialMousePosition.x;
      const newY = e.clientY - initialMousePosition.y;

      
      setSignaturePosition({
        x: Math.max(0, Math.min(newX, pageWidth - signatureWidth)),
        y: Math.max(0, Math.min(newY, pageHeight - signatureHeight)), 
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const confirmPosition = () => {
    setIsPositionConfirmed(true);
  };

  const resetPosition = () => {
    setIsPositionConfirmed(false);
  };

  const saveWithSignature = async () => {
    if (!pdfFile || !signature) return;

    const pdfBytes = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    const { width, height } = firstPage.getSize();
    const scaleX = pageWidth > 0 ? width / pageWidth : 0; 
    const x = signaturePosition.x * scaleX;
    const y = height - (signaturePosition.y * scaleX) - signatureHeight; 

    console.log('pageWidth:', pageWidth);
    console.log('pageHeight:', pageHeight);
    console.log('signaturePosition:', signaturePosition);
    console.log('scaleX:', scaleX);
    console.log('Calculated x:', x);
    console.log('Calculated y:', y);

    const signatureImgBytes = await fetch(signature).then(res => res.arrayBuffer());
    const signatureImg = await pdfDoc.embedPng(signatureImgBytes);

    
    if (!isNaN(x) && !isNaN(y)) {
      firstPage.drawImage(signatureImg, {
        x,
        y,
        width: signatureWidth + 10, 
        height: signatureHeight -10, 
      });
    } else {
      console.error('Invalid x or y value for drawing signature:', { x, y });
    }

    const modifiedPdfBytes = await pdfDoc.save();
    const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'signed_document.pdf';
    link.click();
  };

  return (
    <div className="pdf-preview-container">
      <h3>Preview Exam Paper</h3>
      <div
        className="pdf-preview-document"
        style={{ position: 'relative', border: '2px dashed #ccc', padding: '10px', borderRadius: '5px' }}
      >
        {pdfFile ? (
          <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
            {[...Array(numPages)].map((_, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                onLoadSuccess={handlePageLoad}
                style={{ position: 'relative' }}
              />
            ))}
            {signature && (
              <img
                src={signature}
                alt="Signature"
                style={{
                  position: 'absolute',
                  left: `${signaturePosition.x}px`,
                  top: `${signaturePosition.y}px`,
                  cursor: isPositionConfirmed ? 'default' : 'move',
                  width: `${signatureWidth}px`, 
                  height: `${signatureHeight}px`, 
                  opacity: 0.8,
                }}
                onMouseDown={handleMouseDown}
                draggable={false}
              />
            )}
          </Document>
        ) : (
          <p>No PDF file selected</p>
        )}
      </div>
      <div style={{ marginTop: '20px' }}>
        {!isPositionConfirmed ? (
          <button onClick={confirmPosition}>Confirm Position</button>
        ) : (
          <button onClick={resetPosition}>Reset Position</button>
        )}
        <button onClick={saveWithSignature} style={{ marginLeft: '10px' }}>Save with Signature</button>
      </div>
    </div>
  );
};

export default PdfPreview;
