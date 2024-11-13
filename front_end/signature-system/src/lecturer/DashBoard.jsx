import React, { useState } from "react";
import TopToolbar from "../components/TopToolbar";
import LeftSidebar from "../components/LeftSidebar";
import PdfEditor from "../components/PdfEditor"; // Replace PDFViewer with PdfEditor
import RightSidebar from "../components/RightSidebar";
import "./css/dashboard.css";

const LecturerDashboard = () => {
  const [selectedFileUrl, setSelectedFileUrl] = useState(null);

  // Handle file upload, create a URL, and set it for PdfEditor
  const handleFileUpload = (file) => {
    const fileUrl = URL.createObjectURL(file);
    setSelectedFileUrl(fileUrl);
  };

  return (
    <div className="dashboard">
      <TopToolbar onUpload={handleFileUpload} />
      <div className="content">
        <LeftSidebar />
        <PdfEditor fileUrl={selectedFileUrl} /> {/* Pass fileUrl to PdfEditor */}
        <RightSidebar />
      </div>
    </div>
  );
};

export default LecturerDashboard;
