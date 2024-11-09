import React, { useState } from 'react';
import { pdfjs } from 'react-pdf';

// Set up the PDF.js worker source
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PdfUpload = ({ onFileUpload }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    console.log('File selected:', uploadedFile);

    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setFile(uploadedFile);
      onFileUpload(uploadedFile);
      console.log('PDF file selected and set');
    } else {
      alert('Please upload a valid PDF file');
      console.log('Invalid file type selected');
    }
  };

  const openEditWindow = () => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const pdfArrayBuffer = reader.result;
  
        const editWindow = window.open('', '_blank', 'width=1000,height=800');
        editWindow.document.write(`
          <html>
            <head><title>Edit PDF</title></head>
            <body style="font-family: Arial, sans-serif;">
              <div id="toolbar" style="background-color: #f0f0f0; padding: 10px; display: flex; gap: 10px;">
                <button id="draw-tool" style="padding: 8px;">Draw</button>
                <button id="clear-tool" style="padding: 8px;">Clear</button>
                <button id="add-text" style="padding: 8px;">Add Text</button>
                <button id="download-png" style="padding: 8px;">Download as PNG</button>
              </div>
              <div style="display: flex; justify-content: center; margin-top: 20px; position: relative;">
                <!-- PDF Rendering Canvas -->
                <canvas id="pdf-viewer" style="border: 1px solid #ddd; position: absolute;"></canvas>
                <!-- Drawing Canvas (Above PDF) -->
                <canvas id="pdf-canvas" style="border: 1px solid #ddd; position: absolute; z-index: 2;"></canvas>
              </div>
            </body>
          </html>
        `);
        editWindow.document.close();
  
        // Load pdf.js worker in the new window
        const pdfjsScript = editWindow.document.createElement('script');
        pdfjsScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.min.js';
        pdfjsScript.onload = () => {
          // Set the workerSrc for pdf.js in the new window context
          editWindow.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';
  
          const pdfArrayBufferUint8 = new Uint8Array(pdfArrayBuffer);
          editWindow.pdfjsLib.getDocument({ data: pdfArrayBufferUint8 }).promise.then((doc) => {
            const canvasElement = editWindow.document.getElementById('pdf-viewer');
            const context = canvasElement.getContext('2d');
            const renderPage = (pageNum) => {
              doc.getPage(pageNum).then((page) => {
                const viewport = page.getViewport({ scale: 1.5 });
                canvasElement.height = viewport.height;
                canvasElement.width = viewport.width;
  
                const renderContext = {
                  canvasContext: context,
                  viewport: viewport,
                };
  
                page.render(renderContext).promise.then(() => {
                  console.log('Page rendered');
                  initializeEditingTools(editWindow, canvasElement, viewport);
                });
              });
            };
  
            renderPage(1); // Render the first page
          }).catch((error) => {
            console.error('Error loading PDF:', error);
          });
        };
        editWindow.document.body.appendChild(pdfjsScript);
      };
  
      reader.readAsArrayBuffer(file);
    } else {
      alert('No PDF file uploaded to edit.');
    }
  };
  

  const initializeEditingTools = (editWindow, canvasElement, viewport) => {
    // Ensure fabric.js is loaded
    const fabricScript = editWindow.document.createElement('script');
    fabricScript.src = 'https://cdn.jsdelivr.net/npm/fabric@latest/dist/index.min.js';
    fabricScript.onload = () => {
      // Initialize Fabric Canvas after Fabric.js is loaded
      const canvas = new editWindow.fabric.Canvas(editWindow.document.getElementById('pdf-canvas'), {
        isDrawingMode: false,
        backgroundColor: 'transparent', // Transparent background
        width: viewport.width,
        height: viewport.height,
      });
  
      // Event listener to start drawing
      editWindow.document.getElementById('draw-tool').addEventListener('click', () => {
        console.log('Draw tool clicked');
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new editWindow.fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.width = 5;
        canvas.freeDrawingBrush.color = '#ff0000';
        canvas.renderAll();
      });
  
      // Event listener to clear the canvas
      editWindow.document.getElementById('clear-tool').addEventListener('click', () => {
        console.log('Clear tool clicked');
        canvas.clear();
        canvas.renderAll();
      });
  
      // Event listener to add text
      editWindow.document.getElementById('add-text').addEventListener('click', () => {
        console.log('Add text tool clicked');
        
        // Create a text box that is typeable
        const text = new editWindow.fabric.Textbox('Enter text here', {
          left: 100,
          top: 100,
          fontFamily: 'Arial',
          fontSize: 30,
          fill: '#000000',
          editable: true, // Make the text editable
          hasControls: true, // Enable resizing
          lockUniScaling: false, // Allow aspect ratio scaling
        });
  
        // Allow text to be edited directly
        text.set({
          editable: true,  // Enable typing
          selectable: true, // Allow selecting text
          hasControls: true, // Enable resizing handles
        });
  
        // Set the font size and the font weight for the text box
        text.on('editing:entered', () => {
          text.set('fontSize', 20);
          canvas.renderAll();
        });
  
        // Add the text object to the canvas
        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.renderAll();
      });
  
      // Event listener to download as PNG
      editWindow.document.getElementById('download-png').addEventListener('click', () => {
        console.log('Download PNG clicked');
        const imageSrc = canvas.toDataURL({ format: 'png' });
        const a = editWindow.document.createElement('a');
        a.href = imageSrc;
        a.download = 'edited-image.png';
        editWindow.document.body.appendChild(a);
        a.click();
        editWindow.document.body.removeChild(a);
      });
    };
    editWindow.document.body.appendChild(fabricScript);
  };
  

  return (
    <div className="pdf-upload-container">
      <h2>Upload Your PDF</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      {file && <p>{file.name}</p>}
      {file && (
        <button className="edit-button" onClick={openEditWindow}>
          Edit This Page
        </button>
      )}
    </div>
  );
};

export default PdfUpload;