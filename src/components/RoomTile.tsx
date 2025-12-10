import React, { useState, useEffect, useRef } from "react";
import { Room, Mode } from "services/tiko.service";

const TEMP_MIN = 0;
const TEMP_MAX = 40;
const TEMP_INCREMENT = 0.5;
const DEBOUNCE_DELAY = 1000; // ms

interface RoomTileProps {
  heater: Room;
  mainMode: Mode | null;
  onModeChange: (roomId: string, mode: Mode | null) => void;
  onTemperatureChange: (roomId: string, temperature: number) => Promise<void>;
}

const MODES: Array<{ key: Mode; label: string }> = [
  { key: Mode.Comfort, label: "☀️" },
  { key: Mode.Absence, label: "🌱" },
  { key: Mode.Sleep, label: "🌙" },
  { key: Mode.Frost, label: "❄️" },
  //   { key: Mode.Boost, label: "🔥" },
  { key: Mode.DisableHeating, label: "🚫" },
];

export const RoomTile: React.FC<RoomTileProps> = ({
  heater,
  mainMode,
  onModeChange,
  onTemperatureChange,
}) => {
  // Local state for instant UI updates
  const [displayTemp, setDisplayTemp] = useState(
    heater.targetTemperatureDegrees
  );
  const [displayMode, setDisplayMode] = useState(heater.mode);
  const [isSettingTemp, setIsSettingTemp] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isDisabled = heater.mode === Mode.DisableHeating;

  useEffect(() => {
    if (!isSettingTemp) {
      setDisplayTemp(heater.targetTemperatureDegrees);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heater.targetTemperatureDegrees]);

  useEffect(() => {
    setDisplayMode(heater.mode);
  }, [heater.mode]);

  const handleTempChange = (newTemp: number) => {
    setDisplayTemp(newTemp);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsSettingTemp(true);
      await onTemperatureChange(heater.id, newTemp);
      setIsSettingTemp(false);
    }, DEBOUNCE_DELAY);
  };

  const handleTempIncrease = () => {
    if (displayTemp < TEMP_MAX) {
      handleTempChange(displayTemp + TEMP_INCREMENT);
    }
  };

  const handleTempDecrease = () => {
    if (displayTemp > TEMP_MIN) {
      handleTempChange(displayTemp - TEMP_INCREMENT);
    }
  };

  const handleModeClick = (mode: Mode) => {
    const newMode = mode === displayMode ? null : mode;
    setDisplayMode(newMode);
    onModeChange(heater.id, newMode);
  };

  return (
    <div className="room-tile" style={{ borderColor: heater.color }}>
      <div className="room-header">
        <h3 className="room-name">{heater.name}</h3>
      </div>

      <div className="room-temps">
        <div className="temp-display">
          <span className="temp-label">🌡️</span>
          <span className="temp-value">
            {heater.currentTemperatureDegrees.toFixed(1)}°
          </span>
        </div>
        <div className="temp-display">
          <span className="temp-label">💧</span>
          <span className="temp-value">{heater.humidity.toFixed(0)}%</span>
        </div>
      </div>

      <div className="temp-controls">
        <button
          className="temp-btn"
          onClick={handleTempDecrease}
          disabled={isDisabled || displayTemp <= TEMP_MIN}
        >
          -
        </button>
        <span className="temp-display-large">
          {isDisabled ? <>--</> : <>{displayTemp.toFixed(1)}°</>}
        </span>
        <button
          className="temp-btn"
          onClick={handleTempIncrease}
          disabled={isDisabled || displayTemp >= TEMP_MAX}
        >
          +
        </button>
      </div>

      <div className="mode-selector">
        {MODES.map((mode) => (
          <button
            key={mode.key}
            className={`mode-btn ${
              displayMode === mode.key && mainMode !== mode.key ? "active" : ""
            }`}
            onClick={() => handleModeClick(mode.key)}
          >
            {mode.label}
          </button>
        ))}
      </div>
    </div>
  );
};
