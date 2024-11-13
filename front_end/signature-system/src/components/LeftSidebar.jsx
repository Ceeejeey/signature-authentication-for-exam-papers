import React from "react";
import { FaFilePdf, FaComment, FaPen, FaSignature, FaRegListAlt } from "react-icons/fa"; // Import web icons
import "./css/LeftSidebar.css";

function LeftSidebar() {
  return (
    <div className="left-sidebar">
      <h3>Tools</h3>
      <div className="tools-list">
        <div className="tool-item">
          <FaFilePdf className="tool-icon" />
          <div className="tool-description">
            <h4>Create PDF</h4>
            <p>Create a new PDF document from scratch or template.</p>
          </div>
        </div>

        <div className="tool-item">
          <FaComment className="tool-icon" />
          <div className="tool-description">
            <h4>Add Comments</h4>
            <p>Insert comments and notes on specific parts of your document.</p>
          </div>
        </div>

        <div className="tool-item">
          <FaPen className="tool-icon" />
          <div className="tool-description">
            <h4>Fill & Sign</h4>
            <p>Fill out forms and sign documents electronically.</p>
          </div>
        </div>

        <div className="tool-item">
          <FaSignature className="tool-icon" />
          <div className="tool-description">
            <h4>Request E-Signatures</h4>
            <p>Request electronic signatures from others on your document.</p>
          </div>
        </div>

        <div className="tool-item">
          <FaRegListAlt className="tool-icon" />
          <div className="tool-description">
            <h4>Organize Pages</h4>
            <p>Rearrange, rotate, or delete pages within your document.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeftSidebar;
