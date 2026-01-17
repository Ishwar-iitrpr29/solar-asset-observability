import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const apiService = {
  getMap: () => axios.get(`${API_BASE_URL}/map`),
  getPerformance: () => axios.get(`${API_BASE_URL}/performance`),
  getDates: () => axios.get(`${API_BASE_URL}/dates`),
  getPerformanceByDate: (date: string) => axios.get(`${API_BASE_URL}/performance/${date}`),
  getAsset: (assetId: string) => axios.get(`${API_BASE_URL}/asset/${assetId}`),
  getAssetByIdAndDate: (assetId: string) => axios.get(`${API_BASE_URL}/asset/${assetId}`),
  getHealth: () => axios.get(`${API_BASE_URL}/health`),
};
