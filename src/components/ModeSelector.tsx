import React, { useState, useEffect } from "react";
import { Mode } from "services/tiko.service";

interface ModeSelectorProps {
  currentMode: Mode | null;
  onModeChange: (mode: Mode | null) => void;
}

const MODES: Array<{ key: Mode; label: string; icon: string }> = [
  { key: Mode.Comfort, label: "Comfort", icon: "☀️" },
  //   { key: Mode.Sleep, label: "Sleep", icon: "🌙" },
  { key: Mode.Absence, label: "Absence", icon: "🌱" },
  { key: Mode.Frost, label: "Frost", icon: "❄️" },
  //   { key: Mode.Boost, label: "Boost", icon: "🔥" },
  { key: Mode.DisableHeating, label: "Off", icon: "🚫" },
];

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onModeChange,
}) => {
  const [displayMode, setDisplayMode] = useState(currentMode);

  useEffect(() => {
    setDisplayMode(currentMode);
  }, [currentMode]);

  const handleModeClick = (mode: Mode) => {
    const newMode = mode === displayMode ? null : mode;
    setDisplayMode(newMode);
    onModeChange(newMode);
  };

  return (
    <div className="mode-selector-main">
      {MODES.map((mode) => (
        <button
          key={mode.key}
          className={`mode-main-btn ${
            displayMode === mode.key ? "active" : ""
          }`}
          onClick={() => handleModeClick(mode.key)}
        >
          <span className="mode-icon">{mode.icon}</span>
        </button>
      ))}
    </div>
  );
};
