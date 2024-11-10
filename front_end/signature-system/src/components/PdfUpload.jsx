import React, { useState } from 'react';
import { pdfjs } from 'react-pdf';

// Set up the PDF.js worker source
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PdfUpload = ({ onFileUpload }) => {
  const [file, setFile] = useState(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false); // State to track drawing mode

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
        if (!editWindow) {
          alert('Failed to open the edit window. Please allow popups for this site.');
          return;
        }

        editWindow.document.write(`
          <html>
            <head><title>Edit PDF</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
            </head>
            <body style="font-family: Arial, sans-serif; margin: 0; background-color: #f4f7fc;">
              <div id="toolbar" style="background-color: #ffffff; padding: 15px 20px; display: flex; gap: 15px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); border-bottom: 2px solid #e0e0e0; position: relative; top: 0;">
                <button id="cursor-tool" style="padding: 10px 15px; background-color: #f0f0f0; border: none; border-radius: 5px; cursor: pointer; transition: background-color 0.3s;">
                  <i class="fa fa-mouse-pointer"></i> Cursor
                </button>
                <button id="draw-tool" style="padding: 10px 15px; background-color: #f0f0f0; border: none; border-radius: 5px; cursor: pointer; transition: background-color 0.3s;">
                  <i class="fa fa-pencil-alt"></i> Draw
                </button>
                <button id="clear-tool" style="padding: 10px 15px; background-color: #f0f0f0; border: none; border-radius: 5px; cursor: pointer; transition: background-color 0.3s;">
                  <i class="fa fa-eraser"></i> Clear
                </button>
                <button id="add-text" style="padding: 10px 15px; background-color: #f0f0f0; border: none; border-radius: 5px; cursor: pointer; transition: background-color 0.3s;">
                  <i class="fa fa-font"></i> Add Text
                </button>
                <button id="add-signature" style="padding: 10px 15px; background-color: #f0f0f0; border: none; border-radius: 5px; cursor: pointer; transition: background-color 0.3s;">
                  <i class="fa fa-signature"></i> Add Signature
                </button>
                <input type="color" id="draw-color" style="padding: 10px; background-color: transparent; border: none; border-radius: 5px; cursor: pointer;" title='color of draw tool' >
                <input type="color" id="text-color" style="padding: 10px; background-color: transparent; border: none; border-radius: 5px; cursor: pointer;" title='color of text'>
                
              </div>
              
              <div style="display: flex; justify-content: center; margin-top: 20px; position: relative;">
                <!-- PDF Rendering Canvas -->
                <canvas id="pdf-viewer" style="border: 1px solid #ddd; position: absolute;"></canvas>
                <!-- Drawing Canvas (Above PDF) -->
                <canvas id="pdf-canvas" style="border: 1px solid #ddd; position: absolute; z-index: 2;"></canvas>
              </div>

              <style>
                button:hover {
                  background-color: #e0e0e0;
                }

                input[type="color"]:focus, button:focus {
                  outline: none;
                  border: 2px solid #007bff;
                }
              </style>
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
            let currentZoomLevel = 1.5; // Initial zoom level

            const renderPage = (pageNum, zoomLevel) => {
              doc.getPage(pageNum).then((page) => {
                const viewport = page.getViewport({ scale: zoomLevel });
                canvasElement.height = viewport.height;
                canvasElement.width = viewport.width;

                const renderContext = {
                  canvasContext: context,
                  viewport: viewport,
                };

                page.render(renderContext).promise.then(() => {
                  console.log('Page rendered');
                  initializeEditingTools(editWindow, canvasElement, viewport, zoomLevel);
                });
              });
            };

            renderPage(1, currentZoomLevel); // Render the first page

            // Zoom In functionality
            editWindow.document.getElementById('zoom-in').addEventListener('click', () => {
              currentZoomLevel += 0.1;
              renderPage(1, currentZoomLevel);
              console.log(`Zoom level: ${currentZoomLevel}`);
            });

            // Zoom Out functionality
            editWindow.document.getElementById('zoom-out').addEventListener('click', () => {
              currentZoomLevel = Math.max(0.1, currentZoomLevel - 0.1);
              renderPage(1, currentZoomLevel);
              console.log(`Zoom level: ${currentZoomLevel}`);
            });

            // Zoom using mouse wheel (with Ctrl key)
            editWindow.document.addEventListener('wheel', (e) => {
              if (e.ctrlKey) {
                e.preventDefault();
                currentZoomLevel += e.deltaY < 0 ? 0.1 : -0.1;
                currentZoomLevel = Math.max(0.1, currentZoomLevel);
                renderPage(1, currentZoomLevel);
                console.log(`Zoom level: ${currentZoomLevel}`);
              }
            });
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

  const initializeEditingTools = (editWindow, canvasElement, viewport, zoomLevel) => {
    // Ensure fabric.js is loaded
    const fabricScript = editWindow.document.createElement('script');
    fabricScript.src = 'https://cdn.jsdelivr.net/npm/fabric@latest/dist/fabric.min.js';
    fabricScript.onload = () => {
      // Initialize Fabric Canvas after Fabric.js is loaded
      const canvas = new editWindow.fabric.Canvas(editWindow.document.getElementById('pdf-canvas'), {
        isDrawingMode: false,
        backgroundColor: 'transparent', // Transparent background
        width: viewport.width,
        height: viewport.height,
        selection: true,
        preserveObjectStacking: true,
      });

      let drawColor = '#ff0000'; // Default red for drawing
      let textColor = '#000000'; // Default black for text

      // Event listener to start drawing
      editWindow.document.getElementById('draw-tool').addEventListener('click', () => {
        setIsDrawingMode(true); // Set drawing mode state
        console.log('Draw tool clicked');
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new editWindow.fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.width = 5;
        canvas.freeDrawingBrush.color = drawColor;
        canvas.renderAll();
      });

      // Event listener to switch to selection cursor
      editWindow.document.getElementById('cursor-tool').addEventListener('click', () => {
        setIsDrawingMode(false); // Set drawing mode state to false (selection mode)
        console.log('Cursor tool clicked');
        canvas.isDrawingMode = false; // Disable drawing mode
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

        const text = new editWindow.fabric.Textbox('Enter text here', {
          left: 100,
          top: 100,
          fontFamily: 'Arial',
          fontSize: 30,
          fill: textColor,
          editable: true, // Make the text editable
        });

        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.renderAll();
      });

      // Event listener to add signature
      editWindow.document.getElementById('add-signature').addEventListener('click', () => {
        const signatureWindow = window.open('', '_blank', 'width=400,height=200');
        if (!signatureWindow) {
          alert('Failed to open the signature window. Please allow popups for this site.');
          return;
        }

        signatureWindow.document.write(`
          <html>
            <head><title>Draw Signature</title></head>
            <body style="font-family: Arial, sans-serif; margin: 0; background-color: #f4f7fc;">
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                <canvas id="signature-canvas" width="300" height="100" style="border: 1px solid #ddd;"></canvas>
                <button id="save-signature" style="margin-top: 10px; padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Save Signature</button>
              </div>
              <script src="https://cdn.jsdelivr.net/npm/fabric@latest/dist/fabric.min.js"></script>
              <script>
                document.addEventListener('DOMContentLoaded', function() {
                  const signatureCanvas = new fabric.Canvas('signature-canvas');
                  signatureCanvas.isDrawingMode = true;
                  signatureCanvas.freeDrawingBrush.width = 2;
                  signatureCanvas.freeDrawingBrush.color = '#000000';

                  document.getElementById('save-signature').addEventListener('click', function() {
                    const signatureDataUrl = signatureCanvas.toDataURL();
                    window.opener.addSignatureToCanvas(signatureDataUrl);
                    window.close();
                  });
                });
              </script>
            </body>
          </html>
        `);
        signatureWindow.document.close();
      });

      // Handle text and drawing color changes
      editWindow.document.getElementById('draw-color').addEventListener('input', (e) => {
        drawColor = e.target.value;
        if (canvas.isDrawingMode) {
          canvas.freeDrawingBrush.color = drawColor;
        }
      });

      editWindow.document.getElementById('text-color').addEventListener('input', (e) => {
        textColor = e.target.value;
      });

      // Pan functionality: Mouse drag to move canvas
      let isPanning = false;
      let lastX = 0, lastY = 0;

      editWindow.document.getElementById('pdf-canvas').addEventListener('mousedown', (e) => {
        isPanning = true;
        lastX = e.clientX;
        lastY = e.clientY;
      });

      editWindow.document.getElementById('pdf-canvas').addEventListener('mousemove', (e) => {
        if (isPanning) {
          const deltaX = e.clientX - lastX;
          const deltaY = e.clientY - lastY;
          canvas.relativePan({ x: deltaX, y: deltaY });
          lastX = e.clientX;
          lastY = e.clientY;
        }
      });

      editWindow.document.getElementById('pdf-canvas').addEventListener('mouseup', () => {
        isPanning = false;
      });

      // Handle canvas drag when mouse is released
      editWindow.document.getElementById('pdf-canvas').addEventListener('mouseleave', () => {
        isPanning = false;
      });

      // Adjust the canvas zoom level
      canvas.setZoom(zoomLevel);

      // Make the fabric object accessible in the main window
      window.editWindowCanvas = canvas;
      window.editWindowFabric = editWindow.fabric;
    };

    editWindow.document.body.appendChild(fabricScript);
  };

  window.addSignatureToCanvas = (signatureDataUrl) => {
    const canvas = window.editWindowCanvas;
    const fabric = window.editWindowFabric;
    const signatureImg = new fabric.Image.fromURL(signatureDataUrl, (img) => {
      img.set({
        left: 100,
        top: 100,
        scaleX: 0.5,
        scaleY: 0.5,
      });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    });
  };

  return (
    <div style={containerStyle}>
      <input 
        type="file" 
        accept="application/pdf" 
        onChange={handleFileChange} 
        style={fileInputStyle}
      />
      {file && (
        <button onClick={openEditWindow} style={buttonStyle}>
          Edit PDF
        </button>
      )}
    </div>
  );
};

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  backgroundColor: '#f9f9f9',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  maxWidth: '400px',
  margin: 'auto',
};

const fileInputStyle = {
  padding: '10px',
  marginBottom: '20px',
  border: '2px solid #007bff',
  borderRadius: '5px',
  outline: 'none',
  width: '100%',
  maxWidth: '350px',
  fontSize: '16px',
  backgroundColor: '#ffffff',
  cursor: 'pointer',
};

const buttonStyle = {
  padding: '12px 20px',
  backgroundColor: '#007bff',
  color: '#ffffff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '16px',
  transition: 'background-color 0.3s ease, transform 0.3s ease',
};

const buttonHoverStyle = {
  backgroundColor: '#0056b3',
  transform: 'scale(1.05)',
};

const fileInputHoverStyle = {
  borderColor: '#0056b3',
};

export default PdfUpload;