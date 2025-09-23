import { MCPTool, MCPToolParams, MCPToolInfo, MCPToolResult } from "../models/McpAgentModel.js";
import { TagSchema } from "../schemas/TagSchema.js";
import { createErrorResponse, getTagManagerClient } from "../utils/index.js";
import { TagActionsArgs } from "../types/toolArgs.js";

const InputSchema = {
  type: "object",
  properties: {
    action: {
      type: "string",
      enum: ["get", "list", "create", "update", "delete"],
      description: "The tag operation to perform.",
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
    tagId: {
      type: "string",
      description: "The unique ID of the GTM Tag (required for get, update, delete).",
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

export class TagActionsTool implements MCPTool<TagActionsArgs> {
  getToolInfo(): MCPToolInfo {
    return {
      name: "gtm_tag",
      description: "Performs tag operations: get, list, create, update, delete.",
      inputSchema: InputSchema,
    };
  }

  async execute(args: TagActionsArgs, params: MCPToolParams): Promise<MCPToolResult> {
    const { action, accountId, containerId, workspaceId, tagId, config } = args;

    // Validate config for create/update actions using TagSchema
    if ((action === "create" || action === "update") && config) {
      try {
        TagSchema.omit({
          accountId: true,
          containerId: true,
          workspaceId: true, // workspaceId is passed in URL path, not in config body
          tagId: true,
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
          if (!tagId) {
            throw new Error("tagId is required for get action");
          }

          const response = await tagmanager.accounts.containers.workspaces.tags.get({
            path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/tags/${tagId}`,
          });
          return {
            content: [
              { type: "text", text: JSON.stringify(response.data, null, 2) },
            ],
          };
        }
        case "list": {
          const response = await tagmanager.accounts.containers.workspaces.tags.list({
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

          const response = await tagmanager.accounts.containers.workspaces.tags.create({
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
          if (!tagId) {
            throw new Error("tagId is required for update action");
          }
          if (!config) {
            throw new Error("config is required for update action");
          }

          const response = await tagmanager.accounts.containers.workspaces.tags.update({
            path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/tags/${tagId}`,
            requestBody: config,
          });
          return {
            content: [
              { type: "text", text: JSON.stringify(response.data, null, 2) },
            ],
          };
        }
        case "delete": {
          if (!tagId) {
            throw new Error("tagId is required for delete action");
          }

          const response = await tagmanager.accounts.containers.workspaces.tags.delete({
            path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/tags/${tagId}`,
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
        `Error performing ${action} on tag`,
        error,
      );
    }
  }
}

export const tagActions = new TagActionsTool();