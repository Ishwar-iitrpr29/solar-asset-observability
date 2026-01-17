// Color scale utilities for PR visualization
export const getColorForPR = (pr: number, minPR: number, maxPR: number): string => {
  // Normalize PR value between 0 and 1
  const normalized = (pr - minPR) / (maxPR - minPR);
  
  // Green to Yellow to Red gradient
  if (normalized <= 0.33) {
    // Red to Orange
    const ratio = normalized / 0.33;
    const r = Math.round(255);
    const g = Math.round(165 * ratio);
    const b = Math.round(0);
    return `rgb(${r}, ${g}, ${b})`;
  } else if (normalized <= 0.66) {
    // Orange to Yellow
    const ratio = (normalized - 0.33) / 0.33;
    const r = Math.round(255);
    const g = Math.round(165 + (255 - 165) * ratio);
    const b = Math.round(0);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Yellow to Green
    const ratio = (normalized - 0.66) / 0.34;
    const r = Math.round(255 - (255 - 34) * ratio);
    const g = Math.round(255);
    const b = Math.round(0);
    return `rgb(${r}, ${g}, ${b})`;
  }
};

export const PRtoPercentage = (pr: number): number => {
  return Math.round(pr * 100 * 1000) / 10; // Percentage format
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};
