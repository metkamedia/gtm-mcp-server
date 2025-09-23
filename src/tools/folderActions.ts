import { MCPTool, MCPToolParams, MCPToolInfo, MCPToolResult } from "../models/McpAgentModel.js";
import { FolderSchema } from "../schemas/FolderSchema.js";
import { createErrorResponse, getTagManagerClient } from "../utils/index.js";
import { FolderActionsArgs } from "../types/toolArgs.js";

const InputSchema = {
  type: "object",
  properties: {
    action: {
      type: "string",
      enum: ["get", "list", "create", "update", "delete"],
      description: "The folder operation to perform.",
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
    folderId: {
      type: "string",
      description: "The unique ID of the GTM Folder (required for get, update, delete).",
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

export class FolderActionsTool implements MCPTool<FolderActionsArgs> {
  getToolInfo(): MCPToolInfo {
    return {
      name: "gtm_folder",
      description: "Manages GTM folders for organizing tags, triggers, and variables.",
      inputSchema: InputSchema,
    };
  }

  async execute(args: FolderActionsArgs, params: MCPToolParams): Promise<MCPToolResult> {
    const { action, accountId, containerId, workspaceId, folderId, config } = args;

    // Validate config for create/update actions using FolderSchema
    if ((action === "create" || action === "update") && config) {
      try {
        FolderSchema.omit({
          accountId: true,
          containerId: true,
          workspaceId: true,
          folderId: true,
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
          if (!folderId) {
            throw new Error("folderId is required for get action");
          }

          const response = await tagmanager.accounts.containers.workspaces.folders.get({
            path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/folders/${folderId}`,
          });
          return {
            content: [
              { type: "text", text: JSON.stringify(response.data, null, 2) },
            ],
          };
        }
        case "list": {
          const response = await tagmanager.accounts.containers.workspaces.folders.list({
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

          const response = await tagmanager.accounts.containers.workspaces.folders.create({
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
          if (!folderId) {
            throw new Error("folderId is required for update action");
          }
          if (!config) {
            throw new Error("config is required for update action");
          }

          const response = await tagmanager.accounts.containers.workspaces.folders.update({
            path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/folders/${folderId}`,
            requestBody: config,
          });
          return {
            content: [
              { type: "text", text: JSON.stringify(response.data, null, 2) },
            ],
          };
        }
        case "delete": {
          if (!folderId) {
            throw new Error("folderId is required for delete action");
          }

          const response = await tagmanager.accounts.containers.workspaces.folders.delete({
            path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/folders/${folderId}`,
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
        `Error performing ${action} on folder`,
        error,
      );
    }
  }
}

export const folderActions = new FolderActionsTool();