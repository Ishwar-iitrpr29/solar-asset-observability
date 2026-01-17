import express, { Request, Response } from 'express';
import cors from 'cors';
import { map_ICR17 } from './data/map_ICR17';
import { getMergedPerformanceData, getAllDates, getPerformanceByDate } from './utils/dataLoader';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes

// GET /api/map - Get the physical layout of the solar plant
app.get('/api/map', (req: Request, res: Response) => {
  try {
    res.json(map_ICR17);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch map data' });
  }
});

// GET /api/performance - Get merged performance data from all sources
app.get('/api/performance', (req: Request, res: Response) => {
  try {
    const mergedData = getMergedPerformanceData();
    res.json(mergedData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
});

// GET /api/dates - Get available dates from all data sources (dynamically merged)
app.get('/api/dates', (req: Request, res: Response) => {
  try {
    const dates = getAllDates();
    res.json({ dates });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dates' });
  }
});

// GET /api/performance/:date - Get performance data for a specific date
app.get('/api/performance/:date', (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const data = getPerformanceByDate(date);
    
    if (!data) {
      return res.status(404).json({ error: 'Date not found' });
    }
    
    res.json({ date, data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch performance data for date' });
  }
});

// GET /api/asset/:assetId - Get asset information with its performance across all dates
app.get('/api/asset/:assetId', (req: Request, res: Response) => {
  try {
    const { assetId } = req.params;
    const asset = map_ICR17.areas.find(area => area.id === assetId);
    
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    // Get performance data for this asset across all merged dates
    const mergedData = getMergedPerformanceData();
    const performanceHistory: { [key: string]: number } = {};
    
    for (const [date, assetDataForDate] of Object.entries(mergedData.pr_data)) {
      const value = assetDataForDate[assetId];
      if (value !== undefined && !isNaN(value as number)) {
        performanceHistory[date] = value as number;
      }
    }
    
    res.json({ asset, performanceHistory });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch asset data' });
  }
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Solar Asset Observability Server running on http://localhost:${PORT}`);
  console.log(`API Documentation:`);
  console.log(`  GET /api/map - Get solar plant layout`);
  console.log(`  GET /api/performance - Get all performance data`);
  console.log(`  GET /api/dates - Get available dates`);
  console.log(`  GET /api/performance/:date - Get performance for specific date`);
  console.log(`  GET /api/asset/:assetId - Get asset details and history`);
  console.log(`  GET /api/health - Health check`);
});

export default app;
