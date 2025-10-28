# 🚀 Quick Start Guide

## Fastest Way to Start

### Option 1: Double-click Batch File (Recommended)
```
Double-click: quick-start.bat
```
- Opens backend and frontend in separate windows
- Shows clear progress and status
- Easy to monitor both servers

### Option 2: Single Command
```bash
npm start
```
- Runs both servers in one terminal
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

---

## ⏱️ Startup Times

| Component | First Run | Subsequent Runs |
|-----------|-----------|-----------------|
| Backend   | ~2 seconds | ~2 seconds |
| Frontend  | ~15-20 seconds | ~10-15 seconds |
| **Total** | **~20 seconds** | **~12-15 seconds** |

**Note**: The frontend compilation time is normal for React apps. Subsequent saves will use Fast Refresh (instant updates).

---

## 🎯 What Happens During Startup

```
[0-2s]   ✓ Backend server starts (port 5000)
[2-5s]   ⏳ Webpack initializing...
[5-10s]  ⏳ Compiling React components...
[10-15s] ⏳ Optimizing bundle...
[15-20s] ✓ Frontend ready (port 3000)
```

---

## 💡 Tips for Faster Development

1. **Keep servers running** - Don't stop/restart unless needed
2. **Use Fast Refresh** - File saves update instantly (no rebuild)
3. **First run is slower** - Webpack caches speed up subsequent starts

---

## 🔄 Auto Port Selection

If ports are busy, servers automatically use next available port:
- Backend: 5000 → 5001 → 5002...
- Frontend: 3000 → 3001 → 3002...

No manual configuration needed! ✨

---

## 📦 Production Mode (Instant Start)

Already built? Run the packaged app:
```bash
.\dist\win-unpacked\LTL TRANSFORMERS Purchase Analyzer.exe
```

**Starts in ~1 second** (no compilation needed)

---

## 🛑 Stop Servers

### If using quick-start.bat:
- Press any key in the batch window

### If using npm start:
- Press `Ctrl+C` in terminal

### Force stop all:
```bash
taskkill /F /IM node.exe
```

---

**Made with ❤️ for LTL TRANSFORMERS (PVT) LTD**
