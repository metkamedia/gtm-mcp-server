/**
 * Type definitions for Google API responses and other common types
 */

// Google OAuth2 User Info Response
export interface GoogleUserInfo {
  id: string;
  name: string;
  email: string;
  verified_email?: boolean;
  picture?: string;
  locale?: string;
}

// Generic error type
export type ErrorType = Error | { 
  response?: { 
    data?: { 
      error?: { message?: string };
      message?: string;
    } 
  };
  message?: string;
} | unknown;

// JSON Schema type for tool definitions
export type JSONSchemaType = {
  type: string;
  properties?: Record<string, unknown>;
  required?: string[];
  enum?: string[];
  description?: string;
  additionalProperties?: boolean;
  [key: string]: unknown;
};
