import { MCPTool } from "../models/McpAgentModel.js";
import { accountActions } from "./accountActions.js";
import { containerActions } from "./containerActions.js";
import { workspaceActions } from "./workspaceActions.js";
import { folderActions } from "./folderActions.js";
import { tagActions } from "./tagActions.js";
import { triggerActions } from "./triggerActions.js";
import { variableActions } from "./variableActions.js";
import { builtInVariableActions } from "./builtInVariableActions.js";

// Use unknown instead of any for better type safety
export const tools: MCPTool<unknown>[] = [
  accountActions,
  containerActions,
  workspaceActions,
  folderActions,
  tagActions,
  triggerActions,
  variableActions,
  builtInVariableActions,
];