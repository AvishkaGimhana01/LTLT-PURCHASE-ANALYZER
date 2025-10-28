# 🔌 LTL Sales Analyzer

**Professional sales data analysis application for LTL Transformers**

A powerful, one-time data analysis tool that allows you to upload CSV files or Google Sheets, analyze sales data instantly, and visualize insights—all without storing data permanently.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)

---

## 📋 Features

### 🚀 Core Capabilities
- **One-Time Analysis**: Upload and analyze data without permanent storage
- **Large Dataset Support**: Handle 50,000+ records efficiently
- **Real-time Visualization**: Interactive charts and graphs
- **Advanced Filtering**: Search, sort, and filter data dynamically
- **Responsive Design**: Works on desktop and tablet devices

### 📊 Analytics Provided
- ✅ Total sales and revenue calculations
- ✅ Outstanding payments tracking
- ✅ Sales breakdown by vendor
- ✅ Payment type distribution analysis
- ✅ Shipping method statistics
- ✅ Sales trends over time
- ✅ Average sale value metrics

### 🎨 Visualizations
- Bar charts for vendor comparison
- Pie charts for payment type distribution
- Doughnut charts for shipping analysis
- Line graphs for sales trends
- Interactive data tables with pagination

---

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js**: REST API server
- **Multer**: File upload handling
- **PapaParse**: CSV parsing
- **CORS**: Cross-origin resource sharing

### Frontend
- **React.js**: UI framework
- **Chart.js**: Data visualization
- **React-ChartJS-2**: React wrapper for Chart.js
- **Axios**: HTTP client

### Desktop Application
- **Electron**: Desktop app framework
- **Electron-Builder**: Application packaging

---

## 📦 Installation

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** (v7 or higher)

### Step 1: Clone or Extract the Project
```bash
cd "LTLT SALES ANALYSER 2"
```

### Step 2: Install Dependencies
```bash
# Install root dependencies (includes Electron)
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

---

## 🚀 Running the Application

### Development Mode

#### Option 1: Run All Components Together (Recommended)
```powershell
# From the root directory
npm run electron:dev
```

This will start:
1. Backend server on `http://localhost:5000`
2. React development server on `http://localhost:3000`
3. Electron window

#### Option 2: Run Components Separately
```powershell
# Terminal 1: Start Backend
cd backend
npm start

# Terminal 2: Start Frontend
cd frontend
npm start

# Terminal 3: Start Electron (after backend and frontend are running)
npm run electron
```

### Production Build

#### Build the Application
```powershell
# Build frontend for production
npm run build:frontend

# Package as Electron app for Windows
npm run package:win

# Or for other platforms:
# npm run package:mac    # macOS
# npm run package:linux  # Linux
```

The packaged application will be in the `dist` folder.

---

## 📖 Usage Guide

### 1. Upload Your Data
- Launch the application
- Drag and drop your CSV file or click "Browse Files"
- Supported file size: Up to 100MB
- Supported formats: CSV files

### 2. View Analysis
After upload, you'll see:
- **Summary Cards**: Total records, sales, outstanding payments, average value
- **Interactive Charts**: Visual representations of your data
- **Data Table**: Searchable, sortable, filterable table view

### 3. Explore Your Data
- **Search**: Use the global search to find specific records
- **Filter**: Use column dropdowns to filter by specific values
- **Sort**: Click column headers to sort ascending/descending
- **Paginate**: Navigate through large datasets efficiently

### 4. Upload New Data
- Click "Upload New File" to analyze different data
- Previous data is automatically discarded

---

## 📁 Project Structure

```
LTLT SALES ANALYSER 2/
├── backend/                 # Express.js API server
│   ├── server.js           # Main server file
│   ├── utils/
│   │   └── dataAnalyzer.js # Data analysis logic
│   └── package.json
├── frontend/               # React application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── FileUpload.js
│   │   │   ├── Dashboard.js
│   │   │   ├── SalesChart.js
│   │   │   └── DataTable.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
├── electron/               # Electron wrapper
│   ├── main.js            # Main Electron process
│   └── preload.js         # Preload script
├── package.json           # Root package file
├── .gitignore
└── README.md
```

---

## 🔧 Configuration

### Backend Port
Default: `5000`

To change, set environment variable:
```powershell
$env:PORT=3001
```

### API Endpoint
Frontend automatically connects to `http://localhost:5000`

To change, set in frontend:
```javascript
// frontend/src/components/FileUpload.js
const API_URL = 'http://your-custom-url:port';
```

---

## 📊 CSV File Format

Your CSV file should have columns like:

| Column Name | Description | Example |
|------------|-------------|---------|
| Vendor | Vendor/supplier name | "ABC Corp" |
| Amount | Sale amount | 50000 |
| Date | Transaction date | "2024-01-15" |
| Payment_Type | Payment method/status | "Paid", "Pending" |
| Shipping_Type | Delivery method | "Express", "Standard" |
| Remarks | Additional notes | "Rush order" |

**Note**: The analyzer automatically detects column names (case-insensitive).

---

## 🔒 Privacy & Security

- **No Permanent Storage**: Data is analyzed in-memory only
- **Session-Based**: Data is discarded after analysis
- **Local Processing**: All analysis happens on your machine
- **No External Servers**: Data never leaves your computer

---

## 🐛 Troubleshooting

### Backend doesn't start
```powershell
# Check if port 5000 is available
netstat -ano | findstr :5000

# Kill process if needed
taskkill /PID <PID> /F
```

### Frontend can't connect to backend
- Ensure backend is running on port 5000
- Check firewall settings
- Verify CORS is enabled in backend

### Large file upload fails
- Check file size (max 100MB)
- Increase timeout in FileUpload.js if needed
- Ensure sufficient RAM available

### Electron app won't start
```powershell
# Rebuild Electron
npm install electron --save-dev
```

---

## 🚀 Performance Tips

### For Large Datasets (50,000+ records)
1. **Use pagination**: Adjust rows per page (25, 50, 100, 200)
2. **Apply filters**: Narrow down data before sorting
3. **Close other apps**: Ensure sufficient RAM
4. **Increase memory**: For Node.js backend
   ```powershell
   $env:NODE_OPTIONS="--max-old-space-size=4096"
   ```

---

## 📝 Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run start:backend` | Start backend server |
| `npm run start:frontend` | Start React dev server |
| `npm run build:frontend` | Build React for production |
| `npm run electron` | Start Electron app |
| `npm run electron:dev` | Run full app in dev mode |
| `npm run package:win` | Package for Windows |
| `npm run package:mac` | Package for macOS |
| `npm run package:linux` | Package for Linux |

---

## 🤝 Support

For issues or questions:
1. Check this README first
2. Review error messages in console
3. Contact: LTL Transformers IT Support

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👥 Credits

**Developed for LTL Transformers**

Built with ❤️ using:
- React.js
- Node.js
- Electron
- Chart.js

---

## 🎯 Roadmap

Future enhancements:
- [ ] Excel file support (.xlsx)
- [ ] Google Sheets direct integration
- [ ] Export analysis as PDF report
- [ ] Multiple file comparison
- [ ] Custom chart builder
- [ ] Dark mode theme

---

**Version**: 1.0.0  
**Last Updated**: October 2025  
**Status**: Production Ready ✅
