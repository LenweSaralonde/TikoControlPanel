import React, { useState, useEffect } from "react";
import { Room, Mode } from "services/tiko.service";
import { useDebounce } from "hooks/useDebounce";

const TEMP_MIN = 0;
const TEMP_MAX = 40;
const TEMP_INCREMENT = 0.5;
const DEBOUNCE_DELAY = 1000; // ms

interface RoomTileProps {
  room: Room;
  isSettingMainMode: boolean;
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
  room,
  isSettingMainMode,
  onModeChange,
  onTemperatureChange,
}) => {
  // Local state for instant UI updates
  const [displayTemp, setDisplayTemp] = useState(room.targetTemperatureDegrees);
  const [displayMode, setDisplayMode] = useState(room.mode);
  const [isSettingTemp, setIsSettingTemp] = useState(false);
  const [isSettingMode, setIsSettingMode] = useState(false);
  const isDisabled = room.mode === Mode.DisableHeating;

  useEffect(() => {
    if (!isSettingTemp) {
      setDisplayTemp(room.targetTemperatureDegrees);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.targetTemperatureDegrees]);

  useEffect(() => {
    if (!isSettingMode) {
      setDisplayMode(room.mode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.mode]);

  const debouncedTempChange = useDebounce(async (newTemp: number) => {
    setIsSettingTemp(true);
    await onTemperatureChange(room.id, newTemp);
    setIsSettingTemp(false);
  }, DEBOUNCE_DELAY);

  const handleTempChange = (newTemp: number) => {
    setDisplayTemp(newTemp);
    debouncedTempChange(newTemp);
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

  const handleModeClick = async (mode: Mode) => {
    setIsSettingMode(true);
    const newMode = mode === displayMode ? null : mode;
    setDisplayMode(newMode);
    await onModeChange(room.id, newMode);
    setIsSettingMode(false);
  };

  return (
    <div className="room-tile" style={{ borderColor: room.color }}>
      <div className="room-header">
        <h3 className="room-name">{room.name}</h3>
        {room.isHeating && <span className="heating-icon">🔥</span>}
      </div>

      <div className="room-temps">
        <div className="temp-display">
          <span className="temp-label">🌡️</span>
          <span className="temp-value">
            {room.currentTemperatureDegrees.toFixed(1)}°
          </span>
        </div>
        <div className="temp-display">
          <span className="temp-label">💧</span>
          <span className="temp-value">{room.humidity.toFixed(0)}%</span>
        </div>
      </div>

      <div className="temp-controls">
        <button
          className="temp-btn"
          onClick={handleTempDecrease}
          disabled={
            isSettingTemp ||
            isSettingMode ||
            isSettingMainMode ||
            isDisabled ||
            displayTemp <= TEMP_MIN
          }
        >
          -
        </button>
        <span className="temp-display-large">
          {isDisabled ? <>--</> : <>{displayTemp.toFixed(1)}°</>}
        </span>
        <button
          className="temp-btn"
          onClick={handleTempIncrease}
          disabled={
            isSettingTemp ||
            isSettingMode ||
            isSettingMainMode ||
            isDisabled ||
            displayTemp >= TEMP_MAX
          }
        >
          +
        </button>
      </div>

      <div className="mode-selector">
        {MODES.map((mode) => (
          <button
            key={mode.key}
            disabled={isSettingTemp || isSettingMode || isSettingMainMode}
            className={`mode-btn ${displayMode === mode.key ? "active" : ""}`}
            onClick={() => handleModeClick(mode.key)}
          >
            {mode.label}
          </button>
        ))}
      </div>
    </div>
  );
};
