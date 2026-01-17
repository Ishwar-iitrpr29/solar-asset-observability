import React, { useEffect, useRef } from 'react';

export interface Point {
  x: number;
  y: number;
}

export interface Area {
  id: string;
  points: Point[];
}

export interface CanvasVisualizerProps {
  areas: Area[];
  pr_ICR17: { [key: string]: number };
  selectedAsset: string | null;
  onAssetHover: (assetId: string | null) => void;
  onAssetClick: (assetId: string) => void;
  minPR: number;
  maxPR: number;
}

const getColorForPR = (pr: number, minPR: number, maxPR: number): string => {
  const normalized = (pr - minPR) / (maxPR - minPR);
  
  if (normalized <= 0.33) {
    const ratio = normalized / 0.33;
    const r = 255;
    const g = Math.round(165 * ratio);
    const b = 0;
    return `rgb(${r}, ${g}, ${b})`;
  } else if (normalized <= 0.66) {
    const ratio = (normalized - 0.33) / 0.33;
    const r = 255;
    const g = Math.round(165 + (255 - 165) * ratio);
    const b = 0;
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    const ratio = (normalized - 0.66) / 0.34;
    const r = Math.round(255 - (255 - 34) * ratio);
    const g = 255;
    const b = 0;
    return `rgb(${r}, ${g}, ${b})`;
  }
};

export const CanvasVisualizer: React.FC<CanvasVisualizerProps> = ({
  areas,
  pr_ICR17,
  selectedAsset,
  onAssetHover,
  onAssetClick,
  minPR,
  maxPR,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredAsset, setHoveredAsset] = React.useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with light background
    ctx.fillStyle = '#fafbfc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all areas
    areas.forEach((area) => {
      const pr = pr_ICR17[area.id];
      const color = pr !== undefined && !isNaN(pr) 
        ? getColorForPR(pr, minPR, maxPR)
        : '#444444';

      ctx.fillStyle = color;
      ctx.strokeStyle = selectedAsset === area.id || hoveredAsset === area.id ? '#0052cc' : '#d0d0d0';
      ctx.lineWidth = selectedAsset === area.id ? 3 : 1;

      // Draw polygon
      if (area.points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(area.points[0].x, area.points[0].y);
        for (let i = 1; i < area.points.length; i++) {
          ctx.lineTo(area.points[i].x, area.points[i].y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    });
  }, [areas, pr_ICR17, selectedAsset, hoveredAsset, minPR, maxPR]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check which area was clicked
    for (const area of areas) {
      if (isPointInPolygon(x, y, area.points)) {
        onAssetClick(area.id);
        return;
      }
    }
  };

  const handleCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check which area is being hovered
    for (const area of areas) {
      if (isPointInPolygon(x, y, area.points)) {
        setHoveredAsset(area.id);
        onAssetHover(area.id);
        canvas.style.cursor = 'pointer';
        return;
      }
    }
    
    setHoveredAsset(null);
    onAssetHover(null);
    canvas.style.cursor = 'default';
  };

  const handleCanvasLeave = () => {
    setHoveredAsset(null);
    onAssetHover(null);
  };

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={512}
      onClick={handleCanvasClick}
      onMouseMove={handleCanvasMove}
      onMouseLeave={handleCanvasLeave}
      className="canvas-visualizer"
    />
  );
};

// Ray casting algorithm to check if point is inside polygon
function isPointInPolygon(x: number, y: number, polygon: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;

    const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}
