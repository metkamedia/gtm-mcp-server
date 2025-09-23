#!/usr/bin/env node

import { OAuth2Client } from "google-auth-library";
import express from "express";
import { promises as fs } from "fs";
import open from "open";
import { getCredentialsPath, getConfigPath } from "./utils/paths.js";
import { GoogleUserInfo } from "./types/common.js";

// Google OAuth2 configuration
const REDIRECT_URI = "http://localhost:3000/callback";
const SCOPES = [
  "https://www.googleapis.com/auth/tagmanager.readonly",
  "https://www.googleapis.com/auth/tagmanager.edit.containers",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email"
];

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

interface GoogleCredentials {
  web?: {
    client_id: string;
    client_secret: string;
    redirect_uris?: string[];
  };
  installed?: {
    client_id: string;
    client_secret: string;
    redirect_uris?: string[];
  };
}

async function loadCredentials(): Promise<{ client_id: string; client_secret: string }> {
  try {
    const credentialsPath = getCredentialsPath();
    const credentialsFile = await fs.readFile(credentialsPath, "utf-8");
    const credentials: GoogleCredentials = JSON.parse(credentialsFile);
    
    // Поддерживаем оба формата: web и installed
    const creds = credentials.web || credentials.installed;
    
    if (!creds || !creds.client_id || !creds.client_secret) {
      throw new Error("Invalid credentials format");
    }
    
    return {
      client_id: creds.client_id,
      client_secret: creds.client_secret,
    };
  } catch {
    console.error("❌ Не найден файл credentials.json или он поврежден!");
    console.error("");
    console.error("📋 Инструкция по получению credentials.json:");
    console.error("1. Перейдите на https://console.cloud.google.com/");
    console.error("2. Создайте проект или выберите существующий");
    console.error("3. Включите Google Tag Manager API");
    console.error("4. Перейдите в APIs & Services > Credentials");
    console.error("5. Нажмите 'Create Credentials' > 'OAuth 2.0 Client ID'");
    console.error("6. Выберите 'Web application'");
    console.error("7. Добавьте http://localhost:3000/callback в Authorized redirect URIs");
    console.error("8. После создания нажмите на Download JSON");
    console.error("9. Сохраните файл как credentials.json в корень проекта");
    console.error("");
    console.error("💡 Файл должен быть: /Users/wiefix/WORK/gtm-mcp-server/credentials.json");
    process.exit(1);
  }
}

async function startAuthFlow(): Promise<void> {
  console.log("🔍 Загружаем credentials.json...");
  const { client_id, client_secret } = await loadCredentials();
  
  console.log("✅ Credentials загружены успешно!");
  console.log(`🔑 Client ID: ${client_id.substring(0, 20)}...`);
  
  const app = express();
  const server = app.listen(3000);

  console.log("🚀 Запускаем процесс авторизации Google Tag Manager...");

  // Create OAuth2 client
  const oauth2Client = new OAuth2Client(
    client_id,
    client_secret,
    REDIRECT_URI
  );

  // Generate authorization URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });

  console.log("📱 Открываем браузер для авторизации...");
  console.log("🌐 Если браузер не открылся, перейдите по ссылке:", authUrl);

  // Handle the callback
  app.get("/callback", async (req, res) => {
    const { code, error } = req.query;

    if (error) {
      res.send(`❌ Ошибка авторизации: ${error}`);
      server.close();
      process.exit(1);
    }

    if (!code) {
      res.send("❌ Код авторизации не получен");
      server.close();
      process.exit(1);
    }

    try {
      console.log("🔄 Обмениваем код на токены...");
      
      // Exchange code for tokens
      const { tokens } = await oauth2Client.getToken(code as string);

      if (!tokens.access_token || !tokens.refresh_token) {
        throw new Error("Не удалось получить токены");
      }

      console.log("✅ Токены получены!");

      // Set credentials to get user info
      oauth2Client.setCredentials(tokens);

      console.log("👤 Получаем информацию о пользователе...");
      // Get user info
      const userInfoResponse = await oauth2Client.request({
        url: "https://www.googleapis.com/oauth2/v2/userinfo",
      });

      const userData = userInfoResponse.data as GoogleUserInfo;

      // Save configuration
      const config: GTMConfig = {
        credentials: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          client_id: client_id,
          client_secret: client_secret,
          expiry_date: tokens.expiry_date || undefined,
        },
        user: {
          userId: userData.id,
          name: userData.name,
          email: userData.email,
        },
      };

      const configPath = getConfigPath();
      await fs.writeFile(configPath, JSON.stringify(config, null, 2));

      res.send(`
        <html>
          <head>
            <meta charset="UTF-8">
            <title>GTM MCP Server - Авторизация завершена</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial; text-align: center; padding: 50px; background: #f5f5f5;">
            <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto;">
              <h1 style="color: #28a745; margin-bottom: 20px;">✅ Авторизация успешна!</h1>
              <p style="font-size: 18px; margin-bottom: 10px;">Добро пожаловать, <strong>${userData.name}</strong></p>
              <p style="color: #666; margin-bottom: 30px;">${userData.email}</p>
              <p style="color: #28a745; font-weight: bold;">🎉 Теперь вы можете использовать GTM MCP Server!</p>
              <p style="color: #666; font-size: 14px; margin-top: 20px;">Это окно можно закрыть.</p>
            </div>
            <script>setTimeout(() => window.close(), 5000);</script>
          </body>
        </html>
      `);

      console.log("");
      console.log("🎉 ====== АВТОРИЗАЦИЯ ЗАВЕРШЕНА ======");
      console.log(`👤 Пользователь: ${userData.name}`);
      console.log(`📧 Email: ${userData.email}`);
      console.log(`💾 Конфигурация сохранена в: gtm-config.json`);
      console.log("");
      console.log("✅ Теперь вы можете использовать GTM MCP Server в Claude!");
      console.log("🔄 Перезагрузите Claude Desktop, если еще не сделали это.");

      setTimeout(() => {
        server.close();
        process.exit(0);
      }, 2000);
      
    } catch (authError) {
      console.error("❌ Ошибка при авторизации:", authError);
      res.send(`❌ Ошибка авторизации: ${authError}`);
      server.close();
      process.exit(1);
    }
  });

  // Health check endpoint
  app.get("/", (req, res) => {
    res.send(`
      <html>
        <head><title>GTM MCP Server - Auth Server</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1>🔄 GTM MCP Server Authorization</h1>
          <p>Сервер авторизации запущен...</p>
          <p>Переходите по ссылке авторизации из терминала.</p>
        </body>
      </html>
    `);
  });

  // Open browser
  try {
    await open(authUrl);
  } catch {
    console.log("⚠️  Не удалось автоматически открыть браузер.");
    console.log("📋 Скопируйте ссылку выше и откройте в браузере вручную.");
  }
}

startAuthFlow().catch((error) => {
  console.error("❌ Ошибка процесса авторизации:", error);
  process.exit(1);
});