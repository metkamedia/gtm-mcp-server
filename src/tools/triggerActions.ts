import { MCPTool, MCPToolParams, MCPToolInfo, MCPToolResult } from "../models/McpAgentModel.js";
import { TriggerSchema } from "../schemas/TriggerSchema.js";
import { createErrorResponse, getTagManagerClient } from "../utils/index.js";
import { TriggerActionsArgs } from "../types/toolArgs.js";

const InputSchema = {
  type: "object",
  properties: {
    action: {
      type: "string",
      enum: ["get", "list", "create", "update", "delete"],
      description: "The trigger operation to perform.",
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
    triggerId: {
      type: "string",
      description: "The unique ID of the GTM Trigger (required for get, update, delete).",
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

export class TriggerActionsTool implements MCPTool<TriggerActionsArgs> {
  getToolInfo(): MCPToolInfo {
    return {
      name: "gtm_trigger",
      description: "Performs trigger operations: get, list, create, update, delete.",
      inputSchema: InputSchema,
    };
  }

  async execute(args: TriggerActionsArgs, params: MCPToolParams): Promise<MCPToolResult> {
    const { action, accountId, containerId, workspaceId, triggerId, config } = args;

    // Validate config for create/update actions using TriggerSchema
    if ((action === "create" || action === "update") && config) {
      try {
        TriggerSchema.omit({
          accountId: true,
          containerId: true,
          workspaceId: true, // workspaceId is passed in URL path, not in config body
          triggerId: true,
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
          if (!triggerId) {
            throw new Error("triggerId is required for get action");
          }

          const response = await tagmanager.accounts.containers.workspaces.triggers.get({
            path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/triggers/${triggerId}`,
          });
          return {
            content: [
              { type: "text", text: JSON.stringify(response.data, null, 2) },
            ],
          };
        }
        case "list": {
          const response = await tagmanager.accounts.containers.workspaces.triggers.list({
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

          const response = await tagmanager.accounts.containers.workspaces.triggers.create({
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
          if (!triggerId) {
            throw new Error("triggerId is required for update action");
          }
          if (!config) {
            throw new Error("config is required for update action");
          }

          const response = await tagmanager.accounts.containers.workspaces.triggers.update({
            path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/triggers/${triggerId}`,
            requestBody: config,
          });
          return {
            content: [
              { type: "text", text: JSON.stringify(response.data, null, 2) },
            ],
          };
        }
        case "delete": {
          if (!triggerId) {
            throw new Error("triggerId is required for delete action");
          }

          const response = await tagmanager.accounts.containers.workspaces.triggers.delete({
            path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/triggers/${triggerId}`,
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
        `Error performing ${action} on trigger`,
        error,
      );
    }
  }
}

export const triggerActions = new TriggerActionsTool();