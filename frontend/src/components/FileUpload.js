import React, { useState, useRef } from 'react';
import axios from 'axios';
import './FileUpload.css';

const FileUpload = ({ onDataAnalyzed, loading, setLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL || 'https://ltlt-purchase-analyzer.onrender.com/';

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
      {/* Animated Background Elements */}
      <div className="bg-animated-circles">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
      </div>

      <div className="upload-card-enhanced">
        {/* Company Header with Logo */}
        <div className="upload-header-modern">
          <div className="logo-wrapper">
            <img 
              src={`${process.env.PUBLIC_URL}/logo_/a.png`} 
              alt="LTL TRANSFORMERS Logo" 
              className="upload-logo-modern"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <div className="company-branding">
            <h1 className="company-name-gradient">LTL TRANSFORMERS (PVT) LTD</h1>
            <p className="company-tagline-modern">Engineering for better transformation</p>
          </div>
        </div>

        {/* Divider Line */}
        <div className="section-divider">
          <span className="divider-line"></span>
          <span className="divider-icon">⚡</span>
          <span className="divider-line"></span>
        </div>

        {/* Main Title */}
        <div className="upload-title-section">
          <h2 className="main-title">
            <span className="icon-badge">📊</span>
            Purchase Data Analyzer
          </h2>
          <p className="subtitle-text">
            Transform your purchase data into actionable insights with our advanced analytics platform
          </p>
        </div>

        {/* Upload Zone */}
        <div
          className={`drop-zone-modern ${dragActive ? 'active' : ''} ${loading ? 'loading' : ''}`}
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
            <div className="loading-state-modern">
              <div className="spinner-modern"></div>
              <p className="loading-text-primary">Analyzing your data...</p>
              <p className="loading-text-secondary">Processing large datasets may take a moment</p>
            </div>
          ) : (
            <div className="upload-content">
              <div className="upload-icon-container">
                <div className="icon-pulse">
                  <svg className="upload-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 18C4.23858 18 2 15.7614 2 13C2 10.2386 4.23858 8 7 8C7.33891 8 7.67077 8.02689 7.99452 8.07866C8.60419 5.63242 10.8538 4 13.5 4C16.5376 4 19 6.46243 19 9.5C19 9.58701 18.9976 9.67383 18.9929 9.76036C20.7031 10.3314 22 11.9925 22 14C22 16.5 20 18 17.5 18H7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 13V21M12 13L9 16M12 13L15 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <h3 className="drop-zone-title">
                {dragActive ? '✓ Drop your file here' : 'Drag & drop your CSV file'}
              </h3>
              <p className="drop-zone-or">or</p>
              <button className="btn-browse-modern" type="button">
                <span className="btn-icon">📁</span>
                <span>Browse Files</span>
              </button>
              <p className="file-info-text">
                <span className="info-icon">ℹ️</span>
                Supports CSV files up to 100MB • 50,000+ records
              </p>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-message-modern">
            <span className="error-icon-modern">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Features Grid */}
        <div className="features-grid">
          <h3 className="features-title">Powerful Analytics Features</h3>
          <div className="features-container">
            <div className="feature-item">
              <div className="feature-icon">📈</div>
              <div className="feature-content">
                <h4>Total Revenue</h4>
                <p>Comprehensive sales and revenue analysis</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">💵</div>
              <div className="feature-content">
                <h4>Payment Tracking</h4>
                <p>Monitor outstanding payments in real-time</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🏢</div>
              <div className="feature-content">
                <h4>Vendor Analysis</h4>
                <p>Detailed breakdown by supplier and vendor</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <div className="feature-content">
                <h4>Visual Reports</h4>
                <p>Interactive charts and comprehensive data tables</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🎯</div>
              <div className="feature-content">
                <h4>Advanced Filtering</h4>
                <p>Search, sort, and filter with precision</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <div className="feature-content">
                <h4>Instant Processing</h4>
                <p>Lightning-fast analysis of large datasets</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="security-badge">
          <div className="security-icon">🔒</div>
          <div className="security-text">
            <strong>Your Privacy Matters:</strong> Data is processed in-memory and never stored permanently. 
            100% secure and confidential.
          </div>
        </div>

        {/* Trusted By Section */}
        <div className="trusted-section">
          <p className="trusted-text">
            <span className="trusted-icon">✓</span>
            Trusted by leading enterprises worldwide for reliable data analysis
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
