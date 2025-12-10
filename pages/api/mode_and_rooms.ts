import type { NextApiRequest, NextApiResponse } from "next";
import { tikoService, ModeAndRooms } from "services/tiko.service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ModeAndRooms | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const data = await tikoService.getModeAndRooms();
    res.status(200).json(data);
  } catch (error) {
    console.error("Failed to get mode and rooms:", error);
    res.status(500).json({ error: "Failed to fetch data from Tiko API" });
  }
}
