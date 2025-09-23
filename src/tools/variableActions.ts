import { MCPTool, MCPToolParams, MCPToolInfo, MCPToolResult } from "../models/McpAgentModel.js";
import { VariableSchema } from "../schemas/VariableSchema.js";
import { createErrorResponse, getTagManagerClient } from "../utils/index.js";
import { VariableActionsArgs } from "../types/toolArgs.js";

const InputSchema = {
  type: "object",
  properties: {
    action: {
      type: "string",
      enum: ["get", "list", "create", "update", "delete"],
      description: "The variable operation to perform.",
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
    variableId: {
      type: "string",
      description: "The unique ID of the GTM Variable (required for get, update, delete).",
    },
    config: {
      type: "object",
      description: "Configuration for create/update actions.",
      optional: true,
    },
  },
  required: ["action", "accountId", "containerId", "workspaceId"],
  additionalProperties: false,
};

export class VariableActionsTool implements MCPTool<VariableActionsArgs> {
  getToolInfo(): MCPToolInfo {
    return {
      name: "gtm_variable",
      description: "Performs variable operations: get, list, create, update, delete.",
      inputSchema: InputSchema,
    };
  }

  async execute(args: VariableActionsArgs, params: MCPToolParams): Promise<MCPToolResult> {
    const { action, accountId, containerId, workspaceId, variableId, config } = args;

    // Validate config for create/update actions using VariableSchema
    if ((action === "create" || action === "update") && config) {
      try {
        VariableSchema.omit({
          accountId: true,
          containerId: true,
          workspaceId: true, // workspaceId is passed in URL path, not in config body
          variableId: true,
          fingerprint: true,
        }).parse(config);
      } catch (validationError) {
        return createErrorResponse(
          `Invalid config format for ${action} action`,
          validationError,
        );
      }
    }

    try {
      const tagmanager = await getTagManagerClient(params.accessToken);

      switch (action) {
        case "get": {
          if (!variableId) {
            throw new Error("variableId is required for get action");
          }

          const response = await tagmanager.accounts.containers.workspaces.variables.get({
            path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/variables/${variableId}`,
          });
          return {
            content: [
              { type: "text", text: JSON.stringify(response.data, null, 2) },
            ],
          };
        }
        case "list": {
          const response = await tagmanager.accounts.containers.workspaces.variables.list({
            parent: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
          });
          return {
            content: [
              { type: "text", text: JSON.stringify(response.data, null, 2) },
            ],
          };
        }
        case "create": {
          if (!config) {
            throw new Error("config is required for create action");
          }

          const response = await tagmanager.accounts.containers.workspaces.variables.create({
            parent: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
            requestBody: config,
          });
          return {
            content: [
              { type: "text", text: JSON.stringify(response.data, null, 2) },
            ],
          };
        }
        case "update": {
          if (!variableId) {
            throw new Error("variableId is required for update action");
          }
          if (!config) {
            throw new Error("config is required for update action");
          }

          const response = await tagmanager.accounts.containers.workspaces.variables.update({
            path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/variables/${variableId}`,
            requestBody: config,
          });
          return {
            content: [
              { type: "text", text: JSON.stringify(response.data, null, 2) },
            ],
          };
        }
        case "delete": {
          if (!variableId) {
            throw new Error("variableId is required for delete action");
          }

          const response = await tagmanager.accounts.containers.workspaces.variables.delete({
            path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/variables/${variableId}`,
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
        `Error performing ${action} on variable`,
        error,
      );
    }
  }
}

export const variableActions = new VariableActionsTool();