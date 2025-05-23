import HubSpotClientWrapper from "../clients/hubspotClient";
import { ContactInput, ListContactsOptions } from "../types/contactTypes";

export const batchCreateContacts = async (contacts: ContactInput[]) => {
    const hubStopClient = HubSpotClientWrapper.getClient();
    const formatted = contacts.map((c) => ({ properties: c }));

    try {
        const response = await hubStopClient.crm.contacts.batchApi.create({
            inputs: formatted
        });
        return response.results;
    } catch (error) {
        console.error("Error creating contacts:", error);
        throw error;
    }
}

export const searchContactById = async (id: string) => {
    const hubSpotClient = HubSpotClientWrapper.getClient();
    try {
        const response = await hubSpotClient.crm.contacts.basicApi.getById(id);
        return response;
    } catch (error) {
        console.error("Error searching contact:", error);
        throw error;
    }
}


export const deleteContactById = async (id: string) => {
    const hubSpotClient = HubSpotClientWrapper.getClient();
    try {
        const response = await hubSpotClient.crm.contacts.basicApi.archive(id);
        return response;
    } catch (error) {
        console.error("Error deleting contact:", error);
        throw error;
    }
}

export const listPaginatedContacts = async (options: ListContactsOptions = {}) => {
    const hubSpotClient = HubSpotClientWrapper.getClient();
    try {
        console.log("Listing contacts with options:", options);
        const response = await hubSpotClient.crm.contacts.basicApi.getPage(
            
        );
        return response;
    } catch (error) {
        console.error("Error fetching contacts list:", error);
        throw error;
    }
}