import { MCPToolResult } from "../models/McpAgentModel.js";
import { ErrorType } from "../types/common.js";

export function createErrorResponse(message: string, error: ErrorType): MCPToolResult {
  let errorMessage: string;
  
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'object' && error !== null && 'response' in error) {
    // Handle Google API errors
    const apiError = error as { response?: { data?: { error?: { message?: string }; message?: string } } };
    const data = apiError.response?.data;
    errorMessage = data?.error?.message || data?.message || String(error);
  } else {
    errorMessage = String(error);
  }
  
  return {
    content: [
      {
        type: "text",
        text: `❌ ${message}: ${errorMessage}`,
      },
    ],
  };
}