// components/TopToolbar.jsx

import React from "react";
import "./css/TopToolbar.css";

function TopToolbar({ onUpload }) {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onUpload(file); // Call the onUpload function passed as a prop
    }
  };

  return (
    <div className="top-toolbar">
      <div className="logo">PDF Editor</div>
      <div className="toolbar-buttons">
        <label>
          Upload
          <input type="file" accept="application/pdf" onChange={handleFileChange} style={{ display: "none" }} />
        </label>
        <button>Edit</button>
        <button>Signature</button>
        <button>Share</button>
        <button>Save</button>
      </div>
    </div>
  );
}

export default TopToolbar;
