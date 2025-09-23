# Google Tag Manager MCP Server

Local Model Context Protocol (MCP) server for Google Tag Manager, allowing Claude to interact with your GTM accounts, containers, tags, triggers, and variables.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Get Google OAuth2 Credentials

1. 🌐 Go to [Google Cloud Console](https://console.cloud.google.com/)
2. 📁 Create a new project or select an existing one
3. 🔧 Enable Google Tag Manager API:
   - Go to "APIs & Services" > "Library"
   - Find "Tag Manager API" and click "Enable"
4. 🔑 Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Select "Web application"
   - Add `http://localhost:3000/callback` to "Authorized redirect URIs"
   - Click "Create"
5. 📥 **Download the JSON file** and save it as `credentials.json` in the project root

### 3. Authorization

```bash
# Build the project
npm run build

# Run authorization
npm run auth
```

This will open a browser for Google authorization. After successful authorization, a `gtm-config.json` file with access tokens will be created.

### 4. Configure Claude Desktop

Add to Claude Desktop configuration:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "google-tag-manager": {
      "command": "node",
      "args": ["/Users/wiefix/WORK/gtm-mcp-server/dist/index.js"],
      "env": {
        "PATH": "/usr/local/bin:/usr/bin:/bin"
      }
    }
  }
}
```

### 5. Restart Claude Desktop

After configuration, restart Claude Desktop to connect the MCP server.

## 🛠️ Available Tools

### 📊 gtm_account
GTM account management
- `get` - get account details
- `list` - list all accounts  
- `update` - update account settings

### 📦 gtm_container  
GTM container management
- `get` - get container details
- `list` - list containers in account
- `create` - create new container
- `update` - update container
- `delete` - delete container

### 🚀 gtm_workspace
GTM workspace management
- `get` - get workspace details
- `list` - list workspaces in container
- `create` - create new workspace
- `update` - update workspace
- `delete` - delete workspace

### 📁 gtm_folder
Folder management for organizing elements
- `get` - get folder details
- `list` - list folders in workspace
- `create` - create new folder
- `update` - update folder
- `delete` - delete folder

### 🏷️ gtm_tag
GTM tag management
- `get` - get tag details  
- `list` - list tags in workspace
- `create` - create new tag
- `update` - update tag
- `delete` - delete tag

### ⚡ gtm_trigger
GTM trigger management
- `get` - get trigger details
- `list` - list triggers in workspace  
- `create` - create new trigger
- `update` - update trigger
- `delete` - delete trigger

### 🔢 gtm_variable
GTM variable management
- `get` - get variable details
- `list` - list variables in workspace
- `create` - create new variable
- `update` - update variable  
- `delete` - delete variable

### 🔧 gtm_builtin_variable
GTM built-in variable management
- `list` - list built-in variables
- `create` - enable built-in variable (pageUrl, pageTitle, etc.)
- `delete` - disable built-in variable

## 💬 Usage Examples

After setup, you can ask Claude:

**Basic navigation:**
- "Show all my GTM accounts"
- "List containers in account 123456"
- "Show workspaces in container 456789"

**Organization:**
- "Create folder 'Analytics Tags' for organizing tags"
- "List all folders in workspace"

**Working with tags:**
- "Create Google Analytics tag with Measurement ID GA_MEASUREMENT_ID"
- "Show all tags in workspace 7"
- "Update tag with ID 15 with new settings"
- "Delete unused tag"

**Triggers:**
- "Create trigger for all page views"
- "Create click trigger for button with class 'download-btn'"
- "List all triggers"

**Variables:**
- "Enable built-in variable Page URL"
- "Create custom variable for GA Measurement ID"
- "Show all variables in workspace"

## 🔧 Troubleshooting

### Authorization Errors
- Make sure `credentials.json` is in the project root
- Verify that Google Tag Manager API is enabled
- Restart `npm run auth`

### API Errors
- Ensure your Google account has access to GTM accounts
- Check access permissions in GTM

### Connection Errors
- Restart Claude Desktop after configuration changes
- Verify correct paths in claude_desktop_config.json

## 📁 File Structure

```
gtm-mcp-server/
├── credentials.json          # Your Google OAuth credentials (downloaded file)
├── gtm-config.json          # Access tokens (created after authorization)
├── src/                     # Source code
├── dist/                    # Compiled code
└── README.md               # This instruction
```

## ⚠️ Security

- Files `credentials.json` and `gtm-config.json` contain secret data
- They are automatically added to `.gitignore`
- Never publish these files in public repositories

## 🔄 Development

```bash
# Development mode with auto-reload
npm run dev

# Build project
npm run build

# Code check
npm run lint
```

## 📞 Support

If you encounter problems:
1. Verify that all steps were completed correctly
2. Make sure you're using Node.js v20.19.5+
3. Check logs in Claude Desktop terminal