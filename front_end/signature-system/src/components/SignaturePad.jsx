import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import './SignaturePad.css';

const SignaturePad = ({ onSignatureChange }) => {
  const sigPadRef = useRef();

  const handleSaveSignature = () => {
    const trimmedCanvas = sigPadRef.current.getTrimmedCanvas();
    const signature = trimmedCanvas.toDataURL("image/png");
    
    const signatureWidth = trimmedCanvas.width;
    const signatureHeight = trimmedCanvas.height;

    onSignatureChange(signature, signatureWidth, signatureHeight);
  };

  return (
    <div className="signature-container">
      <h3>Signature</h3>

      <SignatureCanvas
        ref={sigPadRef}
        canvasProps={{
          width: 400,
          height: 200,
          className: 'sigCanvas'
        }}
      />

      <button onClick={handleSaveSignature}>Save Signature</button>

      <label htmlFor="upload" className="upload-label">Upload Signature</label>
      <input
        type="file"
        accept="image/*"
        id="upload"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () => onSignatureChange(reader.result);
            reader.readAsDataURL(file);
          }
        }}
      />
    </div>
  );
};

export default SignaturePad;
