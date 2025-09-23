import { MCPTool, MCPToolParams, MCPToolInfo, MCPToolResult } from "../models/McpAgentModel.js";
import { createErrorResponse, getTagManagerClient } from "../utils/index.js";
import { BuiltInVariableActionsArgs } from "../types/toolArgs.js";

const InputSchema = {
  type: "object",
  properties: {
    action: {
      type: "string",
      enum: ["list", "create", "delete"],
      description: "The built-in variable operation to perform.",
    },
    accountId: {
      type: "string",
      description: "The unique ID of the GTM Account.",
    },
    containerId: {
      type: "string",
      description: "The unique ID of the GTM Container.",
    },
    workspaceId: {
      type: "string",
      description: "The unique ID of the GTM Workspace.",
    },
    type: {
      type: "string",
      description: "Type of built-in variable (required for create/delete). Examples: 'pageUrl', 'pagePath', 'pageTitle', 'referrer', 'event', etc.",
    },
  },
  required: ["action", "accountId", "containerId", "workspaceId"],
  additionalProperties: false,
};

export class BuiltInVariableActionsTool implements MCPTool<BuiltInVariableActionsArgs> {
  getToolInfo(): MCPToolInfo {
    return {
      name: "gtm_builtin_variable",
      description: "Manages GTM built-in variables: list, create (enable), delete (disable).",
      inputSchema: InputSchema,
    };
  }

  async execute(args: BuiltInVariableActionsArgs, params: MCPToolParams): Promise<MCPToolResult> {
    const { action, accountId, containerId, workspaceId, type } = args;

    try {
      const tagmanager = await getTagManagerClient(params.accessToken);

      switch (action) {
        case "list": {
          const response = await tagmanager.accounts.containers.workspaces.built_in_variables.list({
            parent: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
          });
          return {
            content: [
              { type: "text", text: JSON.stringify(response.data, null, 2) },
            ],
          };
        }
        case "create": {
          if (!type) {
            throw new Error("type is required for create action");
          }

          const response = await tagmanager.accounts.containers.workspaces.built_in_variables.create({
            parent: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
            type: [type], // type should be an array
          });
          return {
            content: [
              { type: "text", text: JSON.stringify(response.data, null, 2) },
            ],
          };
        }
        case "delete": {
          if (!type) {
            throw new Error("type is required for delete action");
          }

          const response = await tagmanager.accounts.containers.workspaces.built_in_variables.delete({
            path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/built_in_variables/${type}`,
          });
          return {
            content: [
              { type: "text", text: JSON.stringify(response.data, null, 2) },
            ],
          };
        }
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      return createErrorResponse(
        `Error performing ${action} on built-in variable`,
        error,
      );
    }
  }
}

export const builtInVariableActions = new BuiltInVariableActionsTool();