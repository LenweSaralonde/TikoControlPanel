import type { NextApiRequest, NextApiResponse } from "next";
import { tikoService } from "services/tiko.service";

interface TemperatureRequest {
  room_id: number;
  temperature: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ success: boolean } | { error: string }>
) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { room_id, temperature } = req.body as TemperatureRequest;

    if (!room_id) {
      return res.status(400).json({ error: "room_id is required" });
    }

    if (typeof temperature !== "number") {
      return res.status(400).json({ error: "Temperature must be a number" });
    }

    if (typeof room_id !== "number") {
      return res.status(400).json({ error: "Room ID must be a number" });
    }

    await tikoService.setRoomTemperature(room_id, temperature);
    res.status(200).json({ success: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Failed to set temperature:", error);
    res
      .status(500)
      .json({ error: `Failed to set temperature: ${error?.message}` });
  }
}
