#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { promises as fs } from "fs";
import { tools } from "./tools/index.js";
import { getConfigPath } from "./utils/index.js";
import { OAuth2Client } from "google-auth-library";

// Configuration interface
interface GTMConfig {
  credentials: {
    access_token: string;
    refresh_token: string;
    client_id: string;
    client_secret: string;
    expiry_date?: number;
  };
  user: {
    userId: string;
    name: string;
    email: string;
  };
}

class GoogleTagManagerMCPServer {
  private server: Server;
  private config: GTMConfig | null = null;

  constructor() {
    this.server = new Server(
      {
        name: "google-tag-manager-mcp-server",
        version: "3.0.3",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private async loadConfig(): Promise<GTMConfig | null> {
    try {
      const configPath = getConfigPath();
      const configFile = await fs.readFile(configPath, "utf-8");
      const config = JSON.parse(configFile) as GTMConfig;
      
      // Check if token needs refresh
      if (config.credentials.expiry_date && config.credentials.expiry_date < Date.now()) {
        await this.refreshToken(config);
        await this.saveConfig(config);
      }
      
      return config;
    } catch {
      // Config not found - will show error when tools are called
      return null;
    }
  }

  private async saveConfig(config: GTMConfig): Promise<void> {
    const configPath = getConfigPath();
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
  }

  private async refreshToken(config: GTMConfig): Promise<void> {
    try {
      const oauth2Client = new OAuth2Client(
        config.credentials.client_id,
        config.credentials.client_secret
      );

      oauth2Client.setCredentials({
        refresh_token: config.credentials.refresh_token,
      });

      const { credentials } = await oauth2Client.refreshAccessToken();
      
      if (credentials.access_token) {
        config.credentials.access_token = credentials.access_token;
        config.credentials.expiry_date = credentials.expiry_date || Date.now() + 3600 * 1000;
      }
    } catch (error) {
      throw error;
    }
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const toolList = tools.map((tool) => {
        const toolInfo = tool.getToolInfo();
        return {
          name: toolInfo.name,
          description: toolInfo.description,
          inputSchema: toolInfo.inputSchema,
        };
      });

      return {
        tools: toolList,
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (!this.config) {
        this.config = await this.loadConfig();
        if (!this.config) {
          throw new Error(
            "Авторизация не найдена. Выполните команду 'npm run auth' для авторизации с Google."
          );
        }
      }

      // Find the tool
      const tool = tools.find((toolObj) => {
        const toolInfo = toolObj.getToolInfo();
        return toolInfo.name === name;
      });

      if (!tool) {
        throw new Error(`Неизвестный инструмент: ${name}`);
      }

      try {
        // Execute the tool with the config
        const result = await tool.execute(args as Record<string, unknown>, {
          accessToken: this.config.credentials.access_token,
          userId: this.config.user.userId,
          name: this.config.user.name,
          email: this.config.user.email,
          clientId: this.config.credentials.client_id,
        });

        return result;
      } catch (error) {
        
        // Если ошибка связана с токеном, попробуем обновить его
        if (error instanceof Error && (
          error.message.includes('401') || 
          error.message.includes('unauthorized') ||
          error.message.includes('invalid_token')
        )) {
          try {
            await this.refreshToken(this.config);
            await this.saveConfig(this.config);
            
            // Повторить запрос с новым токеном
            const retryResult = await tool.execute(args as Record<string, unknown>, {
              accessToken: this.config.credentials.access_token,
              userId: this.config.user.userId,
              name: this.config.user.name,
              email: this.config.user.email,
              clientId: this.config.credentials.client_id,
            });
            
            return retryResult;
          } catch {
            throw new Error("Ошибка авторизации. Выполните 'npm run auth' для повторной авторизации.");
          }
        }
        
        throw error;
      }
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    // MCP servers should not log to stdout - it interferes with the protocol
  }
}

// Start the server
const server = new GoogleTagManagerMCPServer();
server.run().catch((error) => {
  // Log to stderr, not stdout
  console.error("Server error:", error);
  process.exit(1);
});