import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignUpPage from './auth/signup';
import SignInPage from './auth/SignInPage';
import LecturerDashboard from './lecturer/DashBoard';
import HomePage from './HomePage';
import suppressResizeObserverError from './suppressResizeObserverError';

// Suppress the ResizeObserver error
suppressResizeObserverError();
function App() {

 
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/dashboard" element={<LecturerDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
