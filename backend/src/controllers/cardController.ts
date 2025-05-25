import { Request, Response } from "express";
import { createCard } from "../services/cardService";
import { HubSpotAuthType } from "../types/hubspotAuthTypes";

/**
 * Controller to create a HubSpot CRM card.
 * POST /api/hubspot/cards/create
 * Body: { authType: 'ACCESS_TOKEN' | 'DEV_API_KEY' }
 */
export const createCRMCard = async (
  req: Request,
  res: Response
): Promise<void> => {
  const appId = Number(process.env.HUBSPOT_APP_ID);
  const ngrokUrl = process.env.NGROK_URL;

  // Default to DEV_API_KEY for card creation, allow override via body
  const authType: HubSpotAuthType =
    req.body.authType || HubSpotAuthType.DEV_API_KEY;

  if (!appId || !ngrokUrl) {
    res.status(400).json({ message: "appId and ngrokUrl are required" });
    return;
  }

  try {
    const response = await createCard(appId, ngrokUrl, authType);
    res
      .status(200)
      .json({ message: "Card created successfully", data: response });
  } catch (error: any) {
    console.error("❌ Error building CRM card:", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
