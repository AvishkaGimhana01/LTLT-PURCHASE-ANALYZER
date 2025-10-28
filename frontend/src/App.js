import React, { useState } from 'react';
import './App.css';
import FileUpload from './components/FileUpload';
import DataTable from './components/DataTable';
import FilteredAnalysis from './components/FilteredAnalysis';
import Comparison from './components/Comparison';
// Date dropdown removed from DataTable - force rebuild

function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFilteredAnalysis, setShowFilteredAnalysis] = useState(false);
  const [filteredData, setFilteredData] = useState(null);
  const [exportHandler, setExportHandler] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [activeView, setActiveView] = useState('table'); // 'table', 'analysis', 'comparison'
  
  // Comparison page state persistence
  const [comparisonFilters, setComparisonFilters] = useState({
    period1Start: '',
    period1End: '',
    period2Start: '',
    period2End: '',
    dateColumn: ''
  });

  // DataTable filters state persistence
  const [tableFilters, setTableFilters] = useState({
    currentPage: 1,
    itemsPerPage: 50,
    searchTerm: '',
    sortConfig: { key: null, direction: 'asc' },
    filters: {},
    showDateFilter: false,
    dateFilterMode: 'exact',
    selectedDate: '',
    startDate: '',
    endDate: '',
    dateColumn: '',
    orderTypeFilter: '',
    itemServiceFilter: '',
    paymentTermsFilter: '',
    paymentTermsSearch: '',
    showPaymentTermsSuggestions: false,
    columnSearchTerms: {},
    activeSearchColumn: null
  });

  const handleDataAnalyzed = (data) => {
    setAnalysisData(data);
    setLoading(false);
    setShowFilteredAnalysis(false);
  };

  const handleReset = () => {
    setAnalysisData(null);
    setShowFilteredAnalysis(false);
    setFilteredData(null);
    // Reset table filters when uploading new file
    setTableFilters({
      currentPage: 1,
      itemsPerPage: 50,
      searchTerm: '',
      sortConfig: { key: null, direction: 'asc' },
      filters: {},
      showDateFilter: false,
      dateFilterMode: 'exact',
      selectedDate: '',
      startDate: '',
      endDate: '',
      dateColumn: '',
      orderTypeFilter: '',
      itemServiceFilter: '',
      paymentTermsFilter: '',
      paymentTermsSearch: '',
      showPaymentTermsSuggestions: false,
      columnSearchTerms: {},
      activeSearchColumn: null
    });
  };

  const handleShowAnalysis = (filteredInfo) => {
    setFilteredData(filteredInfo);
    setShowFilteredAnalysis(true);
    setActiveView('analysis');
  };

  const handleExportPDF = async () => {
    if (exportHandler) {
      setIsExporting(true);
      try {
        await exportHandler();
      } finally {
        setIsExporting(false);
      }
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div className="header-branding">
            <div className="logo-container">
              <img 
                src={`${process.env.PUBLIC_URL}/logo_/a.png`} 
                alt="LTL TRANSFORMERS Logo" 
                className="company-logo"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <div className="header-text">
              <h1>LTL TRANSFORMERS (PVT) LTD</h1>
              <p className="tagline">Engineering for better transformation</p>
              <p className="app-subtitle">Purchase Data Analyzer</p>
            </div>
          </div>
        </div>
      </header>

      <main className="app-main">
        {!analysisData ? (
          <FileUpload 
            onDataAnalyzed={handleDataAnalyzed} 
            loading={loading}
            setLoading={setLoading}
          />
        ) : (
          <div className="analysis-container">
            <div className="analysis-header">
              <div className="header-left">
                <h2>Analysis Results</h2>
                <span className="record-count">
                  {analysisData.totalRecords?.toLocaleString()} records analyzed
                </span>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {showFilteredAnalysis && (
                  <button 
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    style={{
                      background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      cursor: isExporting ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
                      transition: 'all 0.3s ease',
                      opacity: isExporting ? 0.6 : 1
                    }}
                  >
                    {isExporting ? (
                      <>
                        <span style={{ 
                          animation: 'spin 1s linear infinite', 
                          display: 'inline-block' 
                        }}>⏳</span>
                        Generating...
                      </>
                    ) : (
                      <>
                        📄 Export PDF
                      </>
                    )}
                  </button>
                )}
                <button className="btn-reset" onClick={handleReset}>
                  📤 Upload New File
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="view-navigation">
              <button 
                className={`nav-tab ${activeView === 'table' ? 'active' : ''}`}
                onClick={() => { setActiveView('table'); setShowFilteredAnalysis(false); }}
              >
                <span className="tab-icon">🗂️</span>
                <span className="tab-label">Data Table</span>
              </button>
              <button 
                className={`nav-tab ${activeView === 'analysis' ? 'active' : ''}`}
                onClick={() => { 
                  if (filteredData) {
                    setActiveView('analysis'); 
                    setShowFilteredAnalysis(true); 
                  }
                }}
                disabled={!filteredData}
              >
                <span className="tab-icon">📈</span>
                <span className="tab-label">Analysis</span>
              </button>
              <button 
                className={`nav-tab ${activeView === 'comparison' ? 'active' : ''}`}
                onClick={() => { setActiveView('comparison'); setShowFilteredAnalysis(false); }}
              >
                <span className="tab-icon">📊</span>
                <span className="tab-label">Period Comparison</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="view-content">
              <div style={{ display: activeView === 'table' ? 'block' : 'none' }}>
                <DataTable 
                  data={analysisData.data} 
                  columns={analysisData.columns}
                  totalRecords={analysisData.totalRecords}
                  onShowAnalysis={handleShowAnalysis}
                  tableFilters={tableFilters}
                  setTableFilters={setTableFilters}
                />
              </div>
              
              {activeView === 'analysis' && filteredData && (
                <FilteredAnalysis 
                  filteredData={filteredData.data}
                  columns={filteredData.columns}
                  totalRecords={filteredData.totalRecords}
                  filterInfo={filteredData.filterInfo}
                  setExportHandler={setExportHandler}
                />
              )}

              {activeView === 'comparison' && (
                <Comparison 
                  data={analysisData.data}
                  filters={comparisonFilters}
                  setFilters={setComparisonFilters}
                />
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-branding">
            <img 
              src={`${process.env.PUBLIC_URL}/logo_/a.png`} 
              alt="LTL TRANSFORMERS Logo" 
              className="footer-logo"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="footer-text">
              <h3>LTL TRANSFORMERS (PVT) LTD</h3>
              <p className="footer-tagline">Engineering for better transformation</p>
            </div>
          </div>
          <p className="footer-info">
            © 2025 LTL TRANSFORMERS (PVT) LTD. All rights reserved. | 
            Data is analyzed in-memory and not stored permanently.
          </p>
          <p className="footer-privacy">🔒 Privacy-first design • No data retention • Secure processing</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
