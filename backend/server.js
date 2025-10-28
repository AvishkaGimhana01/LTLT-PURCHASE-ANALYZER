const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Papa = require('papaparse');
const fs = require('fs');
const path = require('path');
const http = require('http');
const dataAnalyzer = require('./utils/dataAnalyzer');

const app = express();
let PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads (store in memory, not on disk)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'LTL Purchase Analyzer API is running' });
});

// File upload and analysis endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`Processing file: ${req.file.originalname}, Size: ${req.file.size} bytes`);

    // Parse CSV data from buffer
    const csvData = req.file.buffer.toString('utf8');
    
    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        try {
          if (results.errors.length > 0) {
            console.warn('Parse warnings:', results.errors);
          }

          // Filter out completely empty rows (where all values are empty, null, undefined, or just "-")
          const rawData = results.data;
          const data = rawData.filter(row => {
            const values = Object.values(row);
            // Check if row has at least one meaningful value
            const hasData = values.some(value => {
              if (value === null || value === undefined || value === '') return false;
              if (typeof value === 'string') {
                const trimmed = value.trim();
                return trimmed !== '' && trimmed !== '-';
              }
              return true; // Numbers, booleans, etc. are considered data
            });
            return hasData;
          });
          
          console.log(`Parsed ${rawData.length} records, filtered to ${data.length} valid records (removed ${rawData.length - data.length} empty rows)`);

          // Perform data analysis
          const analysis = dataAnalyzer.analyzeData(data);

          // Return ALL data (no pagination on backend)
          // Frontend will handle pagination for display
          res.json({
            success: true,
            message: `Successfully processed ${data.length} records`,
            totalRecords: data.length,
            data: data, // Return ALL data
            allData: data, // Keep a copy for reference
            analysis: analysis,
            columns: results.meta.fields || Object.keys(data[0] || {})
          });

          // Important: Data is NOT stored, it will be garbage collected
          // after this response is sent
        } catch (analysisError) {
          console.error('Analysis error:', analysisError);
          res.status(500).json({ 
            error: 'Error analyzing data', 
            details: analysisError.message 
          });
        }
      },
      error: (error) => {
        console.error('Parse error:', error);
        res.status(500).json({ 
          error: 'Error parsing CSV file', 
          details: error.message 
        });
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Error processing file', 
      details: error.message 
    });
  }
});

// Parse and analyze data from raw CSV text (for Google Sheets paste)
app.post('/api/analyze-text', async (req, res) => {
  try {
    const { csvText } = req.body;

    if (!csvText) {
      return res.status(400).json({ error: 'No CSV text provided' });
    }

    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        try {
          // Filter out completely empty rows (where all values are empty, null, undefined, or just "-")
          const rawData = results.data;
          const data = rawData.filter(row => {
            const values = Object.values(row);
            // Check if row has at least one meaningful value
            const hasData = values.some(value => {
              if (value === null || value === undefined || value === '') return false;
              if (typeof value === 'string') {
                const trimmed = value.trim();
                return trimmed !== '' && trimmed !== '-';
              }
              return true; // Numbers, booleans, etc. are considered data
            });
            return hasData;
          });
          
          console.log(`Parsed ${rawData.length} records from text, filtered to ${data.length} valid records (removed ${rawData.length - data.length} empty rows)`);

          // Perform data analysis
          const analysis = dataAnalyzer.analyzeData(data);

          // Return ALL data (no pagination on backend)
          // Frontend will handle pagination for display
          res.json({
            success: true,
            message: `Successfully processed ${data.length} records`,
            totalRecords: data.length,
            data: data, // Return ALL data
            allData: data, // Keep a copy for reference
            analysis: analysis,
            columns: results.meta.fields || Object.keys(data[0] || {})
          });
        } catch (analysisError) {
          console.error('Analysis error:', analysisError);
          res.status(500).json({ 
            error: 'Error analyzing data', 
            details: analysisError.message 
          });
        }
      },
      error: (error) => {
        console.error('Parse error:', error);
        res.status(500).json({ 
          error: 'Error parsing CSV text', 
          details: error.message 
        });
      }
    });

  } catch (error) {
    console.error('Text analysis error:', error);
    res.status(500).json({ 
      error: 'Error processing text', 
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    details: err.message 
  });
});

// Function to find available port
let currentServer = null;

function startServer(port) {
  const server = http.createServer(app);
  
  server.listen(port)
    .on('listening', () => {
      PORT = port;
      currentServer = server;
      console.log(`LTL Purchase Analyzer API running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    })
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is busy, trying port ${port + 1}...`);
        startServer(port + 1);
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    });

  return server;
}

// Start server with auto port detection
startServer(PORT);

// Handle process termination gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  if (currentServer) {
    currentServer.close(() => {
      console.log('HTTP server closed');
    });
  }
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  if (currentServer) {
    currentServer.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit on uncaught exception, just log it
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit on unhandled rejection, just log it
});

// Export app for testing or external use
module.exports = app;
