/**
 * Type definitions for all GTM MCP tool arguments
 */

// Account Actions
export interface AccountActionsArgs {
  action: "get" | "list" | "update";
  accountId?: string;
  config?: Record<string, unknown>;
}

// Container Actions
export interface ContainerActionsArgs {
  action: "get" | "list" | "create" | "update" | "delete";
  accountId: string;
  containerId?: string;
  config?: Record<string, unknown>;
}

// Workspace Actions
export interface WorkspaceActionsArgs {
  action: "get" | "list" | "create" | "update" | "delete";
  accountId: string;
  containerId: string;
  workspaceId?: string;
  config?: Record<string, unknown>;
}

// Folder Actions
export interface FolderActionsArgs {
  action: "get" | "list" | "create" | "update" | "delete";
  accountId: string;
  containerId: string;
  workspaceId: string;
  folderId?: string;
  config?: Record<string, unknown>;
}

// Tag Actions
export interface TagActionsArgs {
  action: "get" | "list" | "create" | "update" | "delete";
  accountId: string;
  containerId: string;
  workspaceId: string;
  tagId?: string;
  config?: Record<string, unknown>;
}

// Trigger Actions
export interface TriggerActionsArgs {
  action: "get" | "list" | "create" | "update" | "delete";
  accountId: string;
  containerId: string;
  workspaceId: string;
  triggerId?: string;
  config?: Record<string, unknown>;
}

// Variable Actions
export interface VariableActionsArgs {
  action: "get" | "list" | "create" | "update" | "delete";
  accountId: string;
  containerId: string;
  workspaceId: string;
  variableId?: string;
  config?: Record<string, unknown>;
}

// Built-in Variable Actions
export interface BuiltInVariableActionsArgs {
  action: "list" | "create" | "delete";
  accountId: string;
  containerId: string;
  workspaceId: string;
  type?: string;
}
