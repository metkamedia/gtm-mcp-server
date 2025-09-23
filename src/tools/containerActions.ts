import { MCPTool, MCPToolParams, MCPToolInfo, MCPToolResult } from "../models/McpAgentModel.js";
import { ContainerSchema } from "../schemas/ContainerSchema.js";
import { createErrorResponse, getTagManagerClient } from "../utils/index.js";
import { ContainerActionsArgs } from "../types/toolArgs.js";

const InputSchema = {
  type: "object",
  properties: {
    action: {
      type: "string",
      enum: ["get", "list", "create", "update", "delete"],
      description: "The container operation to perform.",
    },
    accountId: {
      type: "string",
      description: "The unique ID of the GTM Account.",
    },
    containerId: {
      type: "string",
      description: "The unique ID of the GTM Container (required for get, update, delete).",
    },
    config: {
      type: "object",
      description: "Configuration for create/update actions.",
      optional: true,
    },
  },
  required: ["action", "accountId"],
  additionalProperties: false,
};

export class ContainerActionsTool implements MCPTool<ContainerActionsArgs> {
  getToolInfo(): MCPToolInfo {
    return {
      name: "gtm_container",
      description: "Performs container operations: get, list, create, update, delete.",
      inputSchema: InputSchema,
    };
  }

  async execute(args: ContainerActionsArgs, params: MCPToolParams): Promise<MCPToolResult> {
    const { action, accountId, containerId, config } = args;

    // Validate config for create/update actions using ContainerSchema
    if ((action === "create" || action === "update") && config) {
      try {
        ContainerSchema.omit({
          accountId: true,
          containerId: true,
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
          if (!containerId) {
            throw new Error("containerId is required for get action");
          }

          const response = await tagmanager.accounts.containers.get({
            path: `accounts/${accountId}/containers/${containerId}`,
          });
          return {
            content: [
              { type: "text", text: JSON.stringify(response.data, null, 2) },
            ],
          };
        }
        case "list": {
          const response = await tagmanager.accounts.containers.list({
            parent: `accounts/${accountId}`,
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

          const response = await tagmanager.accounts.containers.create({
            parent: `accounts/${accountId}`,
            requestBody: config,
          });
          return {
            content: [
              { type: "text", text: JSON.stringify(response.data, null, 2) },
            ],
          };
        }
        case "update": {
          if (!containerId) {
            throw new Error("containerId is required for update action");
          }
          if (!config) {
            throw new Error("config is required for update action");
          }

          const response = await tagmanager.accounts.containers.update({
            path: `accounts/${accountId}/containers/${containerId}`,
            requestBody: config,
          });
          return {
            content: [
              { type: "text", text: JSON.stringify(response.data, null, 2) },
            ],
          };
        }
        case "delete": {
          if (!containerId) {
            throw new Error("containerId is required for delete action");
          }

          const response = await tagmanager.accounts.containers.delete({
            path: `accounts/${accountId}/containers/${containerId}`,
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
        `Error performing ${action} on container`,
        error,
      );
    }
  }
}

export const containerActions = new ContainerActionsTool();