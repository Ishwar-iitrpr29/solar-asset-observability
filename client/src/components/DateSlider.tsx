import React from 'react';

interface DateSliderProps {
  dates: string[];
  currentDate: string;
  onChange: (date: string) => void;
}

export const DateSlider: React.FC<DateSliderProps> = ({ dates, currentDate, onChange }) => {
  const currentIndex = dates.indexOf(currentDate);

  return (
    <div className="date-slider">
      <label className="date-slider-label">
        Select Date
      </label>
      <input
        type="range"
        min="0"
        max={dates.length - 1}
        value={currentIndex}
        onChange={(e) => onChange(dates[parseInt(e.target.value)])}
        className="date-slider-input"
      />
      <div className="date-range-display">
        <span className="date-range-start">{dates[0]}</span>
        <span className="date-range-current">{currentDate}</span>
        <span className="date-range-end">{dates[dates.length - 1]}</span>
      </div>
    </div>
  );
};
