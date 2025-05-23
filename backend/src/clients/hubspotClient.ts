import {Client as HubSpotClient} from '@hubspot/api-client';
import dotenv from 'dotenv';

dotenv.config();

class HubSpotClientWrapper{

    private static instance: HubSpotClient;
    
    public static getClient(): HubSpotClient {
        if (!process.env.HUBSPOT_API_KEY) {
            throw new Error('HUBSPOT_API_KEY is required for HubSpot API');
        }

        if (!this.instance) {
            this.instance = new HubSpotClient({
                accessToken: process.env.HUBSPOT_API_KEY
            });
        }

        return this.instance;
    }
}

export default HubSpotClientWrapper;
