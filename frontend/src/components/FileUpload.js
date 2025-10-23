import React, { useState, useRef } from 'react';
import axios from 'axios';
import './FileUpload.css';

const FileUpload = ({ onDataAnalyzed, loading, setLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    setError(null);
    setLoading(true);

    // Validate file type
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel'];
    const fileName = file.name.toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !fileName.endsWith('.csv')) {
      setError('Please upload a CSV file');
      setLoading(false);
      return;
    }

    // Validate file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      setError('File size must be less than 100MB');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 120000 // 2 minute timeout for large files
      });

      if (response.data.success) {
        onDataAnalyzed(response.data);
      } else {
        setError('Failed to analyze data');
        setLoading(false);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(
        err.response?.data?.error || 
        err.message || 
        'Failed to upload and analyze file'
      );
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="file-upload-container">
      <div className="upload-card">
        <h2>📊 Upload Sales Data</h2>
        <p className="upload-description">
          Upload your CSV file to analyze sales data instantly. Data is processed in-memory and not stored.
        </p>

        <div
          className={`drop-zone ${dragActive ? 'active' : ''} ${loading ? 'loading' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={!loading ? handleButtonClick : null}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleChange}
            style={{ display: 'none' }}
          />

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Analyzing your data...</p>
              <p className="loading-subtitle">This may take a moment for large files</p>
            </div>
          ) : (
            <>
              <div className="upload-icon">📁</div>
              <p className="drop-text">
                {dragActive ? 'Drop your file here' : 'Drag & drop your CSV file here'}
              </p>
              <p className="or-text">or</p>
              <button className="btn-browse" type="button">
                Browse Files
              </button>
              <p className="file-info">CSV files up to 100MB (50,000+ records supported)</p>
            </>
          )}
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <div className="features">
          <h3>What you can analyze:</h3>
          <ul>
            <li>✅ Total sales and revenue</li>
            <li>✅ Outstanding payments</li>
            <li>✅ Sales by vendor</li>
            <li>✅ Payment type distribution</li>
            <li>✅ Shipping method analysis</li>
            <li>✅ Sales trends over time</li>
          </ul>
        </div>

        <div className="privacy-note">
          <p>🔒 <strong>Privacy:</strong> Your data is analyzed temporarily and never stored on our servers.</p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
