import React from 'react';

export const ColorScale: React.FC = () => {
  return (
    <div className="color-scale">
      <div className="color-scale-gradient" />
      <div className="color-scale-labels">
        <span className="color-scale-label-low">Low (Red)</span>
        <span className="color-scale-label-mid">Medium (Yellow)</span>
        <span className="color-scale-label-high">High (Green)</span>
      </div>
    </div>
  );
};
