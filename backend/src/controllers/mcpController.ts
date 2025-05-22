import { Request, Response } from "express";
import { getToolByName, getToolManifest } from "../services/mcpService";

export const handleMcpCall = async (req: Request, res: Response) => {
  const { tool, parameters } = req.body;
  const matchedTool = getToolByName(tool);

  if (!matchedTool) {
    return res.status(404).json({ error: "Tool not found" });
  }

  try {
    const result = await matchedTool.handler(parameters);
    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getManifest = (_req: Request, res: Response) => {
  res.json({ tools: getToolManifest() });
};
