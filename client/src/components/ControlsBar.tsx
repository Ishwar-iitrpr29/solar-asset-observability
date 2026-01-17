import React, { useState, useCallback } from 'react';

interface ControlsBarProps {
  selectedDate: string;
  dates: string[];
  onDateChange: (date: string) => void;
  assetIds: string[];
  selectedAsset: string | null;
  onAssetSelect: (assetId: string) => void;
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  selectedDate,
  dates,
  onDateChange,
  assetIds,
  selectedAsset,
  onAssetSelect,
}) => {
  const [dateInput, setDateInput] = useState(selectedDate);
  const [dateError, setDateError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Handle manual date input
  const handleDateInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateInput(value);
    setDateError(null);
  }, []);

  const handleDateInputBlur = useCallback(() => {
    if (!dateInput) {
      setDateError('Please enter a date');
      return;
    }

    if (!dates.includes(dateInput)) {
      setDateError(`Date not available. Valid range: ${dates[0]} to ${dates[dates.length - 1]}`);
      setDateInput(selectedDate);
      return;
    }

    setDateError(null);
    onDateChange(dateInput);
  }, [dateInput, dates, selectedDate, onDateChange]);

  const handleDateInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleDateInputBlur();
    }
  }, [handleDateInputBlur]);

  // Sync date input when selectedDate changes (from slider)
  React.useEffect(() => {
    setDateInput(selectedDate);
    setDateError(null);
  }, [selectedDate]);

  // Handle asset search
  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setSearchInput(value);
    setSearchError(null);

    if (value.length === 0) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const matches = assetIds.filter(id => id.includes(value));
    setSearchSuggestions(matches.slice(0, 5)); // Limit to 5 suggestions
    setShowSuggestions(matches.length > 0);

    if (matches.length === 0 && value.length > 0) {
      setSearchError(`No assets found matching "${value}"`);
    }
  }, [assetIds]);

  const handleAssetSelect = useCallback((assetId: string) => {
    setSearchInput('');
    setSearchSuggestions([]);
    setShowSuggestions(false);
    setSearchError(null);
    onAssetSelect(assetId);
  }, [onAssetSelect]);

  const handleSearchInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchSuggestions.length > 0) {
      handleAssetSelect(searchSuggestions[0]);
    }
  }, [searchSuggestions, handleAssetSelect]);

  return (
    <div className="controls-bar">
      <div className="controls-section">
        <div className="control-group">
          <label htmlFor="date-input" className="control-label">Manual Date Selection</label>
          <input
            id="date-input"
            type="date"
            value={dateInput}
            onChange={handleDateInputChange}
            onBlur={handleDateInputBlur}
            onKeyDown={handleDateInputKeyDown}
            className="control-input date-input"
            min={dates[0]}
            max={dates[dates.length - 1]}
          />
          {dateError && <div className="control-error">{dateError}</div>}
        </div>
      </div>

      <div className="controls-section">
        <div className="control-group search-group">
          <label htmlFor="asset-search" className="control-label">Search Asset by ID</label>
          <div className="search-input-wrapper">
            <input
              id="asset-search"
              type="text"
              placeholder="Enter asset ID (e.g., L17_LT4_INV13)"
              value={searchInput}
              onChange={handleSearchInputChange}
              onKeyDown={handleSearchInputKeyDown}
              onFocus={() => searchInput.length > 0 && setShowSuggestions(true)}
              className="control-input search-input"
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput('');
                  setSearchSuggestions([]);
                  setShowSuggestions(false);
                  setSearchError(null);
                }}
                className="search-clear-btn"
                title="Clear search"
              >
                ✕
              </button>
            )}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="search-suggestions">
                {searchSuggestions.map(assetId => (
                  <div
                    key={assetId}
                    className={`suggestion-item ${selectedAsset === assetId ? 'active' : ''}`}
                    onClick={() => handleAssetSelect(assetId)}
                  >
                    {assetId}
                  </div>
                ))}
              </div>
            )}
          </div>
          {searchError && <div className="control-error">{searchError}</div>}
          {selectedAsset && !searchInput && (
            <div className="control-info">Selected: {selectedAsset}</div>
          )}
        </div>
      </div>
    </div>
  );
};
