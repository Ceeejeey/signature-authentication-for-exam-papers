import React from "react";
import { FaInbox, FaPaperPlane } from "react-icons/fa";
import "./css/RightSidebar.css";

const RightSidebar = () => {
  return (
    <div className="right-sidebar">
      <div className="sidebar-header">
        <h3>Share PDF</h3>
      </div>

      <div className="sidebar-content">
        {/* Inbox Button */}
        <div className="sidebar-item">
          <button className="sidebar-btn">
            <FaInbox size={24} />
            <span>Inbox</span>
          </button>
          <p className="sidebar-description">
            View and manage all incoming documents.
          </p>
        </div>

        {/* Send PDF Button */}
        <div className="sidebar-item">
          <button className="sidebar-btn">
            <FaPaperPlane size={24} />
            <span>Send PDF</span>
          </button>
          <p className="sidebar-description">
            Share your edited PDFs with others.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
