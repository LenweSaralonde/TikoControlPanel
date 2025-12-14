import React, { useState, useEffect, ReactNode } from "react";
import { Mode } from "services/tiko.service";
import SunIcon from "icons/Sun";
import LeafIcon from "icons/Leaf";
import SnowflakeIcon from "icons/Snowflake";
import PowerIcon from "icons/Power";

interface ModeSelectorProps {
  currentMode: Mode | null;
  onModeChange: (mode: Mode | null) => void;
}

const MODES: Array<{
  key: Mode;
  label: string;
  icon: ReactNode;
  color: string;
}> = [
  {
    key: Mode.Comfort,
    label: "Comfort",
    icon: <SunIcon />,
    color: "rgb(253, 170, 79)",
  },
  {
    key: Mode.Absence,
    label: "Absence",
    icon: <LeafIcon />,
    color: "rgb(37, 180, 165)",
  },
  {
    key: Mode.Frost,
    label: "Frost",
    icon: <SnowflakeIcon />,
    color: "rgb(0, 169, 201)",
  },
  {
    key: Mode.DisableHeating,
    label: "Off",
    icon: <PowerIcon />,
    color: "rgb(242, 87, 92)",
  },
];

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onModeChange,
}) => {
  const [displayMode, setDisplayMode] = useState(currentMode);
  const [isSettingMode, setIsSettingMode] = useState(false);

  useEffect(() => {
    setDisplayMode(currentMode);
  }, [currentMode]);

  const handleModeClick = async (mode: Mode) => {
    setIsSettingMode(true);
    const newMode = mode === displayMode ? null : mode;
    setDisplayMode(newMode);
    await onModeChange(newMode);
    setIsSettingMode(false);
  };

  return (
    <div className="mode-selector-main">
      {MODES.map((mode) => (
        <button
          key={mode.key}
          disabled={isSettingMode}
          className={`mode-main-btn ${
            displayMode === mode.key ? "active" : ""
          }`}
          onClick={() => handleModeClick(mode.key)}
          style={
            displayMode === mode.key
              ? {
                  borderColor: mode.color,
                  backgroundColor: mode.color,
                }
              : {
                  borderColor: mode.color,
                  color: mode.color,
                  backgroundColor: "transparent",
                }
          }
        >
          <span className="mode-icon">{mode.icon}</span>
        </button>
      ))}
    </div>
  );
};
