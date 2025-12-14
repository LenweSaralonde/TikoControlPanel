import React, { useState, useEffect, useRef } from "react";
import { RoomTile } from "components/RoomTile";
import { ModeSelector } from "components/ModeSelector";
import { Room, Mode } from "services/tiko.service";

export const App: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [mainMode, setMainMode] = useState<Mode | null>(null);
  const [isAppLoading, setIsAppLoading] = useState<boolean>(true);
  const isModeAndRoomsLoading = useRef<boolean>(false);
  const [isSettingMainMode, setIsSettingMainMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadModeAndRooms = async (forceReload = false) => {
    if (isModeAndRoomsLoading.current && !forceReload) {
      return;
    }

    try {
      isModeAndRoomsLoading.current = true;
      setError(null);
      const response = await fetch("/api/mode_and_rooms");
      const data = await response.json();
      if (!response.ok) {
        throw (data && data.error) || "Failed to fetch data";
      }
      if (data.rooms !== undefined) {
        setRooms(data.rooms);
      }
      if (data.mode !== undefined) {
        setMainMode(data.mode);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setError(err || "Failed to load data");
    }

    setIsAppLoading(false);
    isModeAndRoomsLoading.current = false;
  };

  useEffect(() => {
    loadModeAndRooms();

    let interval: NodeJS.Timeout | null = null;

    const startPolling = () => {
      if (interval) return; // Already polling
      interval = setInterval(() => {
        loadModeAndRooms();
      }, 30000);
    };

    const stopPolling = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        loadModeAndRooms();
        startPolling();
      }
    };

    const handleFocus = () => {
      loadModeAndRooms();
      startPolling();
    };

    const handleBlur = () => {
      stopPolling();
    };

    // Start initial polling
    startPolling();

    // Listen for visibility changes (sleep mode, tab switching)
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Listen for window focus/blur events
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  const handleMainModeChange = async (mode: Mode | null) => {
    try {
      setIsSettingMainMode(true);
      const response = await fetch("/api/mode", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      if (response.ok) {
        await loadModeAndRooms(true);
      }
    } catch (err) {
      console.error("Failed to set main mode:", err);
    }
    setIsSettingMainMode(false);
  };

  const handleRoomModeChange = async (roomId: string, mode: Mode | null) => {
    try {
      const response = await fetch("/api/mode", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: +roomId, mode }),
      });
      if (response.ok) {
        await loadModeAndRooms(true);
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
        await loadModeAndRooms(true);
      }
    } catch (err) {
      console.error("Failed to set room temperature:", err);
    }
  };

  if (isAppLoading) {
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
          <button onClick={() => loadModeAndRooms(true)}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="room-tiles-container">
        {rooms.map((room) => (
          <RoomTile
            key={room.id}
            room={room}
            isSettingMainMode={isSettingMainMode}
            onModeChange={handleRoomModeChange}
            onTemperatureChange={handleRoomTemperatureChange}
          />
        ))}
      </div>

      <div className="controls-container">
        <ModeSelector
          currentMode={mainMode}
          onModeChange={handleMainModeChange}
        />
      </div>
    </div>
  );
};
