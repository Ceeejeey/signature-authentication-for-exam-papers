// SignUpPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';  // Import the useNavigate hook
import styles from './SignUpPage.module.css';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    position: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Use useNavigate for navigation
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/signup', formData);
      setSuccessMessage('Signup successful!');
      
      // Reset form data after successful signup
      setFormData({
        name: '',
        email: '',
        department: '',
        position: '',
        password: '',
        confirmPassword: ''
      });

      // Redirect to the sign-in page after successful signup
      navigate('/signin');  // Use navigate to go to the SignIn page

    } catch (error) {
      setErrorMessage('Error: Unable to complete signup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className={styles.signupContainer}>
      <div className={styles.formWrapper}>
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={styles.input}
            required
          />

          <label className={styles.label}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={styles.input}
            required
          />

          <label className={styles.label}>Department</label>
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            className={styles.input}
            required
          >
            <option value="">Select Department</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Physical Science">Physical Science</option>
          </select>

          <label className={styles.label}>Position</label>
          <select
            name="position"
            value={formData.position}
            onChange={handleChange}
            className={styles.input}
            required
          >
            <option value="">Select Position</option>
            <option value="Lecturer">Lecturer</option>
            <option value="Examiner">Examiner</option>
          </select>

          <label className={styles.label}>Password</label>
          <div className={styles.passwordContainer}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
              required
            />
            <span onClick={togglePasswordVisibility} className={styles.iconInsideInput}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <label className={styles.label}>Confirm Password</label>
          <div className={styles.passwordContainer}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={styles.input}
              required
            />
            <span onClick={toggleConfirmPasswordVisibility} className={styles.iconInsideInput}>
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>

          {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
          {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
