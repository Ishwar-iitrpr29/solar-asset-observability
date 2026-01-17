import React, { useState, useEffect } from 'react';
import { apiService } from './services/api';
import { CanvasVisualizer, Area } from './components/CanvasVisualizer';
import { DateSlider } from './components/DateSlider';
import { AssetInfoPanel } from './components/AssetInfoPanel';
import { ColorScale } from './components/ColorScale';
import { ChartsSection } from './components/ChartsSection';
import { ControlsBar } from './components/ControlsBar';
import { AIInsightsPanel } from './components/AIInsightsPanel';
//import { testCustom } from './services/insightTester';
import './App.css';
import './index.css';

import { runAllTests } from './services/insightTester';



interface pr_ICR17 {
  [assetId: string]: number;
}

function App() {
    // Run tests once when app loads
  useEffect(() => {
    runAllTests();
  }, []);
  

  const [areas, setAreas] = useState<Area[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [pr_ICR17, setpr_ICR17] = useState<pr_ICR17>({});
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [hoveredAsset, setHoveredAsset] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [minPR, setMinPR] = useState(0.007);
  const [maxPR, setMaxPR] = useState(0.010);
  const [assetPerformanceHistory, setAssetPerformanceHistory] = useState<{ [date: string]: number }>({});
  const [insightsPanelExpanded, setInsightsPanelExpanded] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get map data
        const mapResponse = await apiService.getMap();
        setAreas(mapResponse.data.areas);

        // Get available dates
        const datesResponse = await apiService.getDates();
        const sortedDates = datesResponse.data.dates.sort();
        setDates(sortedDates);

        // Set default date to the first available date
        if (sortedDates.length > 0) {
          setSelectedDate(sortedDates[0]);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load solar plant data. Please check if the server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch performance data for selected date
  useEffect(() => {
    if (!selectedDate) return;

    const fetchPerformance = async () => {
      try {
        const response = await apiService.getPerformanceByDate(selectedDate);
        setpr_ICR17(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching performance data:', err);
        setError(`Failed to load performance data for ${selectedDate}`);
      }
    };

    fetchPerformance();
  }, [selectedDate]);

  // Fetch asset performance history when an asset is selected
  useEffect(() => {
    if (!selectedAsset) {
      setAssetPerformanceHistory({});
      return;
    }

    const fetchAssetHistory = async () => {
      try {
        const response = await apiService.getAssetByIdAndDate(selectedAsset);
        setAssetPerformanceHistory(response.data.performanceHistory || {});
      } catch (err) {
        console.error('Error fetching asset history:', err);
        setAssetPerformanceHistory({});
      }
    };

    fetchAssetHistory();
  }, [selectedAsset]);

  const displayAsset = selectedAsset || hoveredAsset;
  const displayPR = displayAsset ? pr_ICR17[displayAsset] : null;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Solar Plant Data...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="header-title">Solar Asset Observability</h1>
          <p className="header-subtitle">ICR17 Plant - Real-time Performance Monitoring</p>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <div className="app-container">
        <main className="main-content">
          <ControlsBar
            selectedDate={selectedDate}
            dates={dates}
            onDateChange={setSelectedDate}
            assetIds={areas.map(area => area.id)}
            selectedAsset={selectedAsset}
            onAssetSelect={setSelectedAsset}
          />

          <div className="canvas-section">
            <div className="canvas-header">
              <h2>Plant Layout Visualization</h2>
            </div>
            <div className="canvas-container">
              {areas.length > 0 ? (
                <CanvasVisualizer
                  areas={areas}
                  pr_ICR17={pr_ICR17}
                  selectedAsset={selectedAsset}
                  onAssetHover={setHoveredAsset}
                  onAssetClick={setSelectedAsset}
                  minPR={minPR}
                  maxPR={maxPR}
                />
              ) : (
                <div className="no-data-message">No map data available</div>
              )}
            </div>
          </div>

          <div className="stats-section">
            <div className="stat-card">
              <h3>Total Assets</h3>
              <p className="stat-value">{areas.length}</p>
            </div>
            <div className="stat-card">
              <h3>Available Dates</h3>
              <p className="stat-value">{dates.length}</p>
            </div>
            <div className="stat-card">
              <h3>Current Date</h3>
              <p className="stat-value">{selectedDate}</p>
            </div>
            <div className="stat-card">
              <h3>Selected Asset</h3>
              <p className="stat-value">{selectedAsset || 'None'}</p>
            </div>
          </div>

          <ChartsSection
            selectedAsset={selectedAsset}
            assetPerformanceHistory={assetPerformanceHistory}
            dates={dates}
            currentDate={selectedDate}
            performanceData={pr_ICR17}
          />

          <AIInsightsPanel
            assetId={selectedAsset}
            currentPR={selectedAsset ? pr_ICR17[selectedAsset] : null}
            performanceHistory={assetPerformanceHistory}
            currentDate={selectedDate}
            isExpanded={insightsPanelExpanded}
            onToggleExpand={setInsightsPanelExpanded}
          />
        </main>

        <aside className="sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-heading">Performance Scale</h3>
            <ColorScale />
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-heading">Date Navigation</h3>
            <DateSlider dates={dates} currentDate={selectedDate} onChange={setSelectedDate} />
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-heading">Asset Details</h3>
            <AssetInfoPanel 
              assetId={displayAsset} 
              pr={displayPR} 
              date={selectedDate}
              performanceHistory={selectedAsset ? assetPerformanceHistory : {}}
            />
          </div>
          
          <div className="sidebar-section instructions-card">
            <h3 className="sidebar-heading">How to Use</h3>
            <ul className="instructions-list">
              <li>Use the slider to navigate through dates</li>
              <li>Hover over assets to preview performance</li>
              <li>Click to select an asset for detailed view</li>
              <li>Green = High performance, Red = Low performance</li>
            </ul>
          </div>
        </aside>
      </div>

      <footer className="app-footer">
        <p>&copy; 2024 SuperPower Solar Asset Observability System. Built with MERN Stack.</p>
      </footer>
    </div>
  );
}

export default App;
