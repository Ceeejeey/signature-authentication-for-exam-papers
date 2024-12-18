import React from 'react';
import ReactDOM from 'react-dom/client'; // Updated import
import App from './App';
import suppressResizeObserverError from './suppressResizeObserverError';

suppressResizeObserverError();
const root = ReactDOM.createRoot(document.getElementById('root')); // Create root
root.render(<App />); // Use createRoot
