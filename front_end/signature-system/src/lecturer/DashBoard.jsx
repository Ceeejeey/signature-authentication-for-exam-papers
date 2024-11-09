import React, { useState } from 'react';
import PdfUpload from '../components/PdfUpload';
import PdfPreview from '../components/PdfPreview';
import SignaturePad from '../components/SignaturePad';
import { PDFDocument } from 'pdf-lib'; 
import './css/dashboard.css';

const LecturerDashboard = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [signatureImage, setSignatureImage] = useState(null);
  const [signatureWidth, setSignatureWidth] = useState(70); 
  const [signatureHeight, setSignatureHeight] = useState(40); 

  const handlePdfUpload = (file) => {
    console.log('Uploaded PDF file:', file);
    setPdfFile(file);
  };

  const handleSignature = (signature) => {
    console.log('Captured signature:', signature);
    setSignatureImage(signature);
  };

  const saveSignedPdf = async () => {
    if (!pdfFile || !signatureImage) return;

    const pdfDoc = await PDFDocument.load(await pdfFile.arrayBuffer());
    const pngImage = await pdfDoc.embedPng(signatureImage);

    const page = pdfDoc.getPage(0);
    const { width, height } = page.getSize();

    
    page.drawImage(pngImage, {
      x: width / 2 - 50,
      y: height / 2 - 50,
      width: signatureWidth,
      height: signatureHeight,
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'signed_document.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard">
      <h2>Digital Signature Tool</h2>

      <div className="input-section">
        <PdfUpload onUpload={handlePdfUpload} />
      </div>

      {pdfFile && (
        <div className="pdf-preview">
          <PdfPreview 
            pdfFile={pdfFile} 
            signature={signatureImage} 
            signatureWidth={signatureWidth} 
            signatureHeight={signatureHeight} 
          />
        </div>
      )}

      <div className="input-section">
        <SignaturePad onSignatureChange={handleSignature} />
      </div>
      
      
    </div>
  );
};

export default LecturerDashboard;
