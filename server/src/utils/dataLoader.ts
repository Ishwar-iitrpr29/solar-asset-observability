import fs from 'fs';
import path from 'path';
import { pr_ICR17 } from '../data/pr_ICR17';



export interface MergedPerformanceData {
  pr_data: {
    [date: string]: {
      [assetId: string]: number;
    };
  };
  metadata: {
    source_files: string[];
    date_range: {
      earliest: string;
      latest: string;
    };
    total_dates: number;
  };
}

/**
 * Get all available performance data files from the data directory
 * Returns a list of pr_ICR17_*.ts file names found
 */
function getAvailableDataFiles(): string[] {
  const dataDir = path.join(__dirname, '../data');
  
  try {
    const files = fs.readdirSync(dataDir);
    const prFiles = files.filter(file => 
      file.startsWith('pr_ICR17') && 
      file.endsWith('.ts') &&
      file !== 'pr_ICR17.ts' // Don't include the main file twice
    );
    
    return ['pr_ICR17.ts', ...prFiles]; // Always include base file first
  } catch (error) {
    console.warn('Could not read data directory:', error);
    return ['pr_ICR17.ts']; // Fallback to main file
  }
}

/**
 * Dynamically import a TypeScript data file and extract pr_data
 * Note: This works because the server uses ts-node-dev which auto-transpiles TS
 */
async function loadDataFile(fileName: string): Promise<any> {
  try {
    // Import the module dynamically
    const filePath = path.join(__dirname, '../data', fileName);
    // Use require with cache busting to ensure fresh loads
    delete require.cache[require.resolve(`../data/${fileName.replace('.ts', '')}`)];
    const module = require(`../data/${fileName.replace('.ts', '')}`);
    
    // Extract pr_ICR17 or pr_ICR17_XXXX object
    const key = Object.keys(module).find(k => k.startsWith('pr_ICR17'));
    return module[key as string] || null;
  } catch (error) {
    console.warn(`Failed to load data file ${fileName}:`, error);
    return null;
  }
}

/**
 * Merge multiple performance datasets
 * Later datasets override earlier ones for the same date
 */
function mergeDatasets(datasets: any[]): MergedPerformanceData {
  const merged: MergedPerformanceData = {
    pr_data: {},
    metadata: {
      source_files: [],
      date_range: {
        earliest: '',
        latest: ''
      },
      total_dates: 0
    }
  };

  // Merge all datasets
  datasets.forEach((dataset, index) => {
    if (!dataset || !dataset.pr_data) return;

    Object.entries(dataset.pr_data).forEach(([date, assetData]: [string, any]) => {
      if (!merged.pr_data[date]) {
        merged.pr_data[date] = {};
      }
      // Merge asset data for this date
      merged.pr_data[date] = {
        ...merged.pr_data[date],
        ...assetData
      };
    });
  });

  // Calculate metadata
  const dates = Object.keys(merged.pr_data).sort();
  merged.metadata.total_dates = dates.length;
  
  if (dates.length > 0) {
    merged.metadata.date_range.earliest = dates[0];
    merged.metadata.date_range.latest = dates[dates.length - 1];
  }

  return merged;
}

/**
 * Cache for the merged data to avoid repeated I/O
 */
let cachedMergedData: MergedPerformanceData | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 60000; // 1 minute cache

/**
 * Get merged performance data from all available sources
 * This is the main entry point for getting all performance data
 */
export function getMergedPerformanceData(): MergedPerformanceData {
  const now = Date.now();

  // Return cached data if still fresh
  if (cachedMergedData && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedMergedData;
  }

  // Start with the primary dataset
  const datasets: any[] = [pr_ICR17];

  // Try to load additional datasets
  const availableFiles = getAvailableDataFiles();
  availableFiles.forEach(file => {
    if (file !== 'pr_ICR17.ts') {
      try {
        const filePath = path.join(__dirname, '../data', file);
        const module = require(filePath.replace('.ts', ''));
        const key = Object.keys(module).find(k => k.startsWith('pr_ICR17'));
        if (key && module[key]) {
          datasets.push(module[key]);
        }
      } catch (error) {
        // Silently ignore files that can't be loaded
      }
    }
  });

  // Merge all datasets
  cachedMergedData = mergeDatasets(datasets);
  cacheTimestamp = now;

  return cachedMergedData;
}

/**
 * Get all available dates from all loaded datasets
 * Returns a sorted array of unique dates
 */
export function getAllDates(): string[] {
  const data = getMergedPerformanceData();
  return Object.keys(data.pr_data).sort();
}

/**
 * Get performance data for a specific date
 * Returns null if date not found
 */
export function getPerformanceByDate(date: string): { [assetId: string]: number } | null {
  const data = getMergedPerformanceData();
  return data.pr_data[date] || null;
}

/**
 * Clear the cache (useful for testing or forcing a reload)
 */
export function clearCache(): void {
  cachedMergedData = null;
  cacheTimestamp = 0;
}
