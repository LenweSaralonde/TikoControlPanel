import type { NextApiRequest, NextApiResponse } from "next";
import { tikoService, Mode } from "services/tiko.service";

interface ModeRequest {
  room_id?: number;
  mode?: Mode | null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ success: boolean } | { error: string }>
) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { room_id, mode } = req.body as ModeRequest;

    if (mode && typeof mode !== "string") {
      return res.status(400).json({ error: "Mode must be a Mode or null" });
    }

    if (room_id && typeof room_id !== "number") {
      return res.status(400).json({ error: "Room ID must be a number" });
    }

    if (room_id) {
      await tikoService.setRoomMode(room_id, mode || null);
    } else {
      await tikoService.setMode(mode || null);
    }

    res.status(200).json({ success: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Failed to set mode:", error);
    res.status(500).json({ error: `Failed to set mode: ${error?.message}` });
  }
}
