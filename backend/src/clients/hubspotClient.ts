import { Client as HubSpotClient } from "@hubspot/api-client";
import { HubSpotAuthType } from "../types/hubspotAuthTypes";
import dotenv from "dotenv";

dotenv.config();

class HubSpotClientWrapper {
  private static accessTokenClient: HubSpotClient | null = null;

  public static getClient(authType: HubSpotAuthType): HubSpotClient {
    if (!process.env.HUBSPOT_ACCESS_TOKEN) {
      throw new Error("Missing HUBSPOT_ACCESS_TOKEN");
    }
    if (!this.accessTokenClient) {
      this.accessTokenClient = new HubSpotClient({
        accessToken: process.env.HUBSPOT_ACCESS_TOKEN,
      });
    }
    return this.accessTokenClient;
  }
}

export default HubSpotClientWrapper;
