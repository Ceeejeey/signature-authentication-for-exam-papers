import React from "react";
import "./css/BottomToolbar.css";

function BottomToolbar() {
  return (
    <div className="bottom-toolbar">
      <button>Previous</button>
      <span>Page 1 of 10</span>
      <button>Next</button>
    </div>
  );
}

export default BottomToolbar;
