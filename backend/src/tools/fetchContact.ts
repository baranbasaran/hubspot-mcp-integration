import hubspotClient from "../clients/hubspotClient";

export const fetchContactTool = {
  name: "fetch_contact",
  description: "Fetch a contact from HubSpot by contactId.",
  parameters: {
    type: "object",
    properties: {
      contactId: { type: "string", description: "HubSpot contact ID" }
    },
    required: ["contactId"]
  },
  handler: async ({ contactId }: { contactId: string }) => {
    const contact = await hubspotClient.getClient().crm.contacts.basicApi.getById(contactId, [
      "firstname", "lastname", "email", "company", "hs_lastcontacted"
    ]);
    return {
      id: contact.id,
      properties: contact.properties
    };
  }
};
