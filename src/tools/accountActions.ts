import { MCPTool, MCPToolParams, MCPToolInfo, MCPToolResult } from "../models/McpAgentModel.js";
import { AccountSchema } from "../schemas/AccountSchema.js";
import { createErrorResponse, getTagManagerClient } from "../utils/index.js";
import { AccountActionsArgs } from "../types/toolArgs.js";

const InputSchema = {
  type: "object",
  properties: {
    action: {
      type: "string",
      enum: ["get", "list", "update"],
      description: "The account operation to perform. Must be one of: 'get', 'list', 'update'.",
    },
    accountId: {
      type: "string",
      description: "The unique ID of the GTM Account.",
    },
    config: {
      type: "object",
      description: "Configuration for 'update' action. All fields correspond to the GTM Account resource.",
      optional: true,
    },
  },
  required: ["action"],
  additionalProperties: false,
};

export class AccountActionsTool implements MCPTool<AccountActionsArgs> {
  getToolInfo(): MCPToolInfo {
    return {
      name: "gtm_account",
      description: "Performs all account-related operations: get, list, update. Use the 'action' parameter to select the operation.",
      inputSchema: InputSchema,
    };
  }

  async execute(args: AccountActionsArgs, params: MCPToolParams): Promise<MCPToolResult> {
    const { action, accountId, config } = args;

    // Validate config for update action using AccountSchema
    if (action === "update" && config) {
      try {
        AccountSchema.omit({ accountId: true }).parse(config);
      } catch (validationError) {
        return createErrorResponse(
          "Invalid config format for update action",
          validationError,
        );
      }
    }

    try {
      const tagmanager = await getTagManagerClient(params.accessToken);

      switch (action) {
        case "get": {
          if (!accountId) {
            throw new Error(`accountId is required for ${action} action`);
          }

          const response = await tagmanager.accounts.get({
            path: `accounts/${accountId}`,
          });
          return {
            content: [
              { type: "text", text: JSON.stringify(response.data, null, 2) },
            ],
          };
        }
        case "list": {
          const response = await tagmanager.accounts.list({});
          return {
            content: [
              { type: "text", text: JSON.stringify(response.data, null, 2) },
            ],
          };
        }
        case "update": {
          if (!accountId) {
            throw new Error(`accountId is required for ${action} action`);
          }

          if (!config) {
            throw new Error(`config is required for ${action} action`);
          }

          const response = await tagmanager.accounts.update({
            path: `accounts/${accountId}`,
            requestBody: config,
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
        `Error performing ${action} on account`,
        error,
      );
    }
  }
}

export const accountActions = new AccountActionsTool();