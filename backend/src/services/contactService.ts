import HubSpotClientWrapper from "../clients/hubspotClient";
import { ContactInput } from "../types/contactTypes";

export async function batchCreateContacts(contacts: ContactInput[]){
    const hubStopClient = HubSpotClientWrapper.getClient();
    const formatted = contacts.map((c) => ({ properties: c }));

    try{
        const response = await hubStopClient.crm.contacts.batchApi.create({
            inputs: formatted
        });
        return response.results;;
    }catch(error){
        console.error("Error creating contacts:", error);
        throw error;
    }
}