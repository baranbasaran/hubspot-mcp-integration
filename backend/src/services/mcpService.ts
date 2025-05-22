import { fetchContactTool } from "../tools/fetchContact";

const tools = [fetchContactTool];

export const getToolByName = (toolName: string) =>
  tools.find(t => t.name === toolName);

export const getToolManifest = () =>
  tools.map(({ name, description, parameters }) => ({
    name, description, parameters
  }));
