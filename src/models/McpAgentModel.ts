import { JSONSchemaType } from "../types/common.js";

/**
 * Parameters passed to MCP tool execution
 */
export interface MCPToolParams {
  /** OAuth access token for Google API calls */
  accessToken: string;
  /** User ID from Google OAuth */
  userId: string;
  /** User's display name */
  name: string;
  /** User's email address */
  email: string;
  /** OAuth client ID */
  clientId: string;
}

/**
 * Information about an MCP tool for registration
 */
export interface MCPToolInfo {
  /** Unique tool name used by MCP client */
  name: string;
  /** Human-readable description of the tool */
  description: string;
  /** JSON schema describing the tool's input parameters */
  inputSchema: JSONSchemaType;
}

/**
 * Interface that all MCP tools must implement
 */
export interface MCPTool<TArgs = Record<string, unknown>> {
  /** Returns tool information for MCP registration */
  getToolInfo(): MCPToolInfo;
  /** Executes the tool with given arguments and parameters */
  execute(_args: TArgs, _params: MCPToolParams): Promise<MCPToolResult>;
}

/**
 * Standard result format for MCP tool execution
 */
export type MCPToolResult = {
  content: Array<{
    type: "text";
    text: string;
  }>;
};