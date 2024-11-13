
import React, { useEffect, useRef } from "react";
import WebViewer from "@pdftron/webviewer";

const PdfEditor = ({ fileUrl }) => {
  const viewerRef = useRef(null);

  useEffect(() => {
    WebViewer(
      {
        path: "../../public/webviewer",
        licenseKey: "demo:1731319649045:7efeacdc03000000002f099e3784e7ba3fa6cdf24a2a0054191be5fdd1",
      },
      viewerRef.current
    ).then((instance) => {
      const { UI, Core } = instance;
      const { documentViewer, annotationManager, Annotations, Tools } = Core;

      // Load document if fileUrl is provided
      if (fileUrl) {
        UI.loadDocument(fileUrl);
      }

      // Enable useful editing features
      UI.enableFeatures([
        UI.Feature.Annotations,
        UI.Feature.TextEditing,
        UI.Feature.PDFEditing,
      ]);

      // Optional: customize the toolbar with a save button
      UI.setHeaderItems((header) => {
        header.push({
          type: "actionButton",
          title: "Save",
          img: "/path/to/save-icon.svg", // Provide an icon or use a default
          onClick: async () => {
            const doc = await instance.Core.documentViewer.getDocument().getFileData({
              xfdfString: await instance.Core.annotationManager.exportAnnotations(),
            });
            const blob = new Blob([doc], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "edited-document.pdf";
            a.click();
            URL.revokeObjectURL(url);
          },
        });
      });

      // Optional: Handle actions after document is loaded
      documentViewer.addEventListener("documentLoaded", () => {
        console.log("Document loaded successfully");
      });
    });
  }, [fileUrl]); 
  return (
    <div className="pdf-editor">
      <div ref={viewerRef} style={{ height: "100vh", width: "100%" }}></div>
    </div>
  );
};

export default PdfEditor;
