# Solar Asset Observability: Performance Map Visualization System

A professional-grade web application for visualizing and monitoring the real-time performance of solar plant assets. Built with a modern MERN stack (MongoDB-ready, Express, React, Node.js) and TypeScript, this system enables solar operators to correlate physical spatial data with performance metrics through an intuitive, responsive dashboard.

**Status**: Complete implementation for SuperPower internship case study (C1 & C2 bonus challenges included)

---

<img width="1756" height="558" alt="image" src="https://github.com/user-attachments/assets/475166ac-6a72-4ff9-bd68-bd1197527113" />
<img width="1751" height="912" alt="image" src="https://github.com/user-attachments/assets/f24796b4-1528-492e-9ff1-9bd205b3e3ae" />
<img width="1747" height="908" alt="image" src="https://github.com/user-attachments/assets/d93e64e3-9040-463b-bb29-dd6897428147" />
<img width="1748" height="913" alt="image" src="https://github.com/user-attachments/assets/cca3e499-c6ba-402c-bd69-51b67fc74b14" />



## What This Application Does

1. **Renders a spatial map** of 64 solar inverters at the ICR17 plant location
2. **Color-codes each asset** based on Performance Ratio (PR) metrics in real-time
3. **Allows temporal navigation** through historical performance data via date slider or date picker
4. **Displays detailed performance trends** for selected assets (line chart)
5. **Shows performance distribution** across all assets for the selected date (histogram)
6. **Generates AI-powered insights** detecting anomalies, performance drops, and providing recommendations
7. **Automatically detects and integrates** new incoming performance data without code changes

---

Quick start

1. Install dependencies (root, server, client):
```bash
npm install
cd server && npm install
cd ../client && npm install
```

2. Run both servers (dev):
```bash
npm run dev
```

API base: `http://localhost:5000/api` (endpoints: `/map`, `/dates`, `/performance/:date`, `/asset/:assetId`, `/health`)

## Folder Structure

```
Solar Asset Observability/
│
├── server/                              # Backend (Node.js/Express/TypeScript)
│   ├── src/
│   │   ├── index.ts                     # Main server & route definitions
│   │   ├── types/
│   │   │   └── index.ts                 # TypeScript type definitions
│   │   ├── data/
│   │   │   ├── map_ICR17.ts             # 64 solar asset polygon coordinates
│   │   │   ├── pr_ICR17.ts              # Performance data for 2024
│   │   │   └── pr_ICR17_2025.ts         # Future data (auto-discovered)
│   │   └── utils/
│   │       └── dataLoader.ts            # Dynamic data file discovery & merging
│   ├── dist/                            # Compiled JavaScript (generated)
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── client/                              # Frontend (React/TypeScript)
│   ├── src/
│   │   ├── components/
│   │   │   ├── CanvasVisualizer.tsx     # Spatial map rendering (Canvas API)
│   │   │   ├── ControlsBar.tsx          # Date picker & asset search
│   │   │   ├── ChartsSection.tsx        # Charts container
│   │   │   ├── PerformanceTrendChart.tsx # Line chart (time-series)
│   │   │   ├── PerformanceDistributionChart.tsx # Histogram
│   │   │   ├── AssetInfoPanel.tsx       # Selected asset details
│   │   │   ├── ColorScale.tsx           # Legend for PR gradient
│   │   │   ├── DateSlider.tsx           # Date slider control
│   │   │   ├── AIInsightsPanel.tsx      # AI insights display
│   │   │   └── InsightTester.tsx        # Testing utility (dev)
│   │   ├── services/
│   │   │   ├── api.ts                   # Axios API client
│   │   │   ├── insightService.ts        # AI insights generation logic
│   │   │   └── insightTester.ts         # Insight testing (dev)
│   │   ├── utils/
│   │   │   └── colorScale.ts            # Color mapping algorithm
│   │   ├── App.tsx                      # Main app component & state management
│   │   ├── App.css                      # Application styling
│   │   ├── index.tsx                    # React entry point
│   │   └── index.css                    # Global styles
│   ├── public/
│   │   └── index.html                   # HTML shell
│   ├── build/                           # Production build
│   ├── package.json
│   ├── tsconfig.json
│   └── .gitignore
│
├── package.json                         # Root package.json (concurrently)
├── .gitignore                           # Git ignore rules
└── README.md                            # This file
```

---

## Design Decisions & Trade-offs

### 1. Canvas-Based Visualization (vs. SVG or Maps Library)
**Choice:** HTML5 Canvas API
- ✅ **Performance** – Handles 64 assets efficiently with smooth interactions
- ✅ **Control** – Pixel-perfect rendering and custom event handling
- ⚠️ **Trade-off** – Less accessible than SVG; no built-in zoom/pan

### 2. Static Files + Backend (vs. Frontend-Only)
**Choice:** REST API with TypeScript backend
- ✅ **Scalability** – Foundation for database, caching, authentication
- ✅ **Data Abstraction** – Complex data merging hidden from frontend
- ⚠️ **Trade-off** – Extra infrastructure; works without DB initially

### 3. Chart.js for Performance Charts (vs. D3.js or Recharts)
**Choice:** chart.js + react-chartjs-2
- ✅ **Simplicity** – Easy setup for line and bar charts
- ✅ **Performance** – Lightweight, no excessive re-renders
- ⚠️ **Trade-off** – Less customization than D3.js

### 4. TypeScript Throughout (vs. JavaScript)
**Choice:** Strict TypeScript on frontend and backend
- ✅ **Type Safety** – Catches errors at build time
- ✅ **Documentation** – Types serve as inline documentation
- ⚠️ **Trade-off** – Slightly longer development time

### 5. Color Gradient Algorithm (Simple Linear Normalization)
**Choice:** Min-max normalization with fixed color breakpoints
- ✅ **Transparent** – Easy to understand and debug
- ✅ **Configurable** – Min/max PR values are adjustable in UI
- ⚠️ **Trade-off** – Doesn't adapt to actual data distribution

---

## Advanced Features & Challenge Responses

### Challenge C1: Data Scalability & Dynamic Ingestion

**Problem:** How does the system scale when new performance data arrives?

**Solution Implemented:**
1. **Dynamic File Discovery** (`dataLoader.ts`)
   - Scans `/data` directory for all `pr_ICR17_*.ts` files
   - Discovers new files automatically without code changes

2. **Data Merging Algorithm**
   - Combines performance data from multiple files
   - Returns unified dataset with merged date ranges
   - Metadata tracks source files and date coverage

3. **Automatic UI Updates**
   - Date slider expands to include new dates
   - Date input validation updates automatically
   - Charts render for any new date range

**Example:**
Adding `server/src/data/pr_ICR17_2025.ts` with 2025 performance data automatically:
- ✅ Expands `/api/dates` to include new dates
- ✅ Makes new data available via `/api/performance/:date`
- ✅ No frontend or backend code changes required

### Challenge C2: AI-Driven Insights Agent

**Problem:** Provide intelligent, context-aware insights about asset performance.

**Solution Implemented:**

**Insights Service** (`insightService.ts`) generates:

1. **Anomaly Detection**
   - Identifies performance values outside typical range (< 0.008 or > 0.010)
   - Severity levels: critical, warning, info

2. **Comparative Analysis**
   - Compares asset performance to plant average
   - Highlights outliers (top performers and underperformers)

3. **Performance Trend Analysis**
   - Detects performance drop patterns (>2% decline)
   - Identifies improving trends

4. **Operational Recommendations**
   - Suggests maintenance for critical assets
   - Recommends monitoring for warning-level assets
   - Provides context-specific actions

**Example Output:**
```
Asset: L17_LT1_INV5
Current PR: 0.00743 (7.43%)

🔴 CRITICAL: Performance anomaly detected
   Asset PR is 5.2% below plant average

⚠️ WARNING: Performance drop detected
   PR decreased by 2.1% in last 3 days

💡 Recommendation: Schedule maintenance inspection
   Priority: High | Impact: Plant efficiency reduced by 3.2%
```

---

## Performance Optimization Strategies

### Frontend
1. **Canvas Rendering** – Only redraws on state changes, not every frame
2. **Memoized Insights** – useMemo prevents unnecessary insight recalculation
3. **Async Data Loading** – Non-blocking API calls with proper loading states
4. **Code Splitting** – React components lazy-loaded per route (future enhancement)

### Backend
1. **Data Merging Cache** – Performance data merged once and cached per request
2. **File Discovery Cache** – Data file list cached to avoid filesystem scans
3. **Error Handling** – Graceful fallbacks for missing data

---
## Testing the Application

### Manual Testing Checklist
- [ ] Server starts without errors on port 5000
- [ ] Frontend loads and connects to API on port 3000
- [ ] Map renders all 64 assets with correct polygons
- [ ] Date slider changes performance data
- [ ] Manual date input accepts/rejects invalid dates
- [ ] Asset search finds assets by ID
- [ ] Clicking asset highlights it and shows details
- [ ] Hovering asset shows preview without selection
- [ ] Color scale updates based on PR values
- [ ] Trend chart shows performance history for selected asset
- [ ] Histogram shows all assets' distribution for current date
- [ ] AI insights generate for selected asset
- [ ] Responsive design works on mobile (viewport <600px)

### API Testing (curl)
```bash
# Health check
curl http://localhost:5000/api/health

# Get map
curl http://localhost:5000/api/map | head -c 500

# Get available dates
curl http://localhost:5000/api/dates

# Get performance for specific date
curl http://localhost:5000/api/performance/2024-08-01

# Get asset details
curl http://localhost:5000/api/asset/L17_LT1_INV1
```
