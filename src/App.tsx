import React, { useState, useEffect } from "react";
import { RoomTile } from "components/RoomTile";
import { ModeSelector } from "components/ModeSelector";
import { Room, Mode } from "services/tiko.service";

export const App: React.FC = () => {
  const [heaters, setHeaters] = useState<Room[]>([]);
  const [mainMode, setMainMode] = useState<Mode | null>(null);
  const [isHorizontal, setIsHorizontal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHeaters();

    const handleOrientationChange = () => {
      setIsHorizontal(window.innerWidth > window.innerHeight);
    };

    handleOrientationChange();
    window.addEventListener("resize", handleOrientationChange);
    window.addEventListener("orientationchange", handleOrientationChange);

    const interval = setInterval(() => {
      loadHeaters();
    }, 30000);

    return () => {
      window.removeEventListener("resize", handleOrientationChange);
      window.removeEventListener("orientationchange", handleOrientationChange);
      clearInterval(interval);
    };
  }, []);

  const loadHeaters = async () => {
    try {
      setError(null);
      const response = await fetch("/api/mode_and_rooms");
      const data = await response.json();
      if (!response.ok) {
        throw (data && data.error) || "Failed to fetch data";
      }
      setHeaters(data.rooms);
      setMainMode(data.mode);
      setIsLoading(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setError(err || "Failed to load data");
      setIsLoading(false);
    }
  };

  const handleMainModeChange = async (mode: Mode | null) => {
    try {
      const response = await fetch("/api/mode", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      if (response.ok) {
        loadHeaters();
      }
    } catch (err) {
      console.error("Failed to set main mode:", err);
    }
  };

  const handleRoomModeChange = async (roomId: string, mode: Mode | null) => {
    try {
      const response = await fetch("/api/mode", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: +roomId, mode }),
      });
      if (response.ok) {
        loadHeaters();
      }
    } catch (err) {
      console.error("Failed to set room mode:", err);
    }
  };

  const handleRoomTemperatureChange = async (
    roomId: string,
    temperature: number
  ) => {
    try {
      const response = await fetch("/api/temperature", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: +roomId, temperature }),
      });
      if (response.ok) {
        loadHeaters();
      }
    } catch (err) {
      console.error("Failed to set room temperature:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="app loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app error">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadHeaters}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`app ${isHorizontal ? "horizontal" : "vertical"}`}>
      <div className="room-tiles-container">
        {heaters.map((heater) => (
          <RoomTile
            key={heater.id}
            heater={heater}
            mainMode={mainMode}
            onModeChange={handleRoomModeChange}
            onTemperatureChange={handleRoomTemperatureChange}
          />
        ))}
      </div>

      <div className="controls-container">
        <ModeSelector
          currentMode={mainMode}
          onModeChange={handleMainModeChange}
          isHorizontal={isHorizontal}
        />
      </div>
    </div>
  );
};
