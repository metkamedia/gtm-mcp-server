import { MCPTool, MCPToolParams, MCPToolInfo, MCPToolResult } from "../models/McpAgentModel.js";
import { WorkspaceSchema } from "../schemas/WorkspaceSchema.js";
import { createErrorResponse, getTagManagerClient } from "../utils/index.js";
import { WorkspaceActionsArgs } from "../types/toolArgs.js";

const InputSchema = {
  type: "object",
  properties: {
    action: {
      type: "string",
      enum: ["get", "list", "create", "update", "delete"],
      description: "The workspace operation to perform.",
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
      description: "The unique ID of the GTM Workspace (required for get, update, delete).",
    },
    config: {
      type: "object",
      description: "Configuration for create/update actions.",
      optional: true,
    },
  },
  required: ["action", "accountId", "containerId"],
  additionalProperties: false,
};

export class WorkspaceActionsTool implements MCPTool<WorkspaceActionsArgs> {
  getToolInfo(): MCPToolInfo {
    return {
      name: "gtm_workspace",
      description: "Performs workspace operations: get, list, create, update, delete.",
      inputSchema: InputSchema,
    };
  }

  async execute(args: WorkspaceActionsArgs, params: MCPToolParams): Promise<MCPToolResult> {
    const { action, accountId, containerId, workspaceId, config } = args;

    // Validate config for create/update actions using WorkspaceSchema
    if ((action === "create" || action === "update") && config) {
      try {
        WorkspaceSchema.omit({
          accountId: true,
          containerId: true,
          workspaceId: true,
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
          if (!workspaceId) {
            throw new Error("workspaceId is required for get action");
          }

          const response = await tagmanager.accounts.containers.workspaces.get({
            path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
          });
          return {
            content: [
              { type: "text", text: JSON.stringify(response.data, null, 2) },
            ],
          };
        }
        case "list": {
          const response = await tagmanager.accounts.containers.workspaces.list({
            parent: `accounts/${accountId}/containers/${containerId}`,
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

          const response = await tagmanager.accounts.containers.workspaces.create({
            parent: `accounts/${accountId}/containers/${containerId}`,
            requestBody: config,
          });
          return {
            content: [
              { type: "text", text: JSON.stringify(response.data, null, 2) },
            ],
          };
        }
        case "update": {
          if (!workspaceId) {
            throw new Error("workspaceId is required for update action");
          }
          if (!config) {
            throw new Error("config is required for update action");
          }

          const response = await tagmanager.accounts.containers.workspaces.update({
            path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
            requestBody: config,
          });
          return {
            content: [
              { type: "text", text: JSON.stringify(response.data, null, 2) },
            ],
          };
        }
        case "delete": {
          if (!workspaceId) {
            throw new Error("workspaceId is required for delete action");
          }

          const response = await tagmanager.accounts.containers.workspaces.delete({
            path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
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
        `Error performing ${action} on workspace`,
        error,
      );
    }
  }
}

export const workspaceActions = new WorkspaceActionsTool();