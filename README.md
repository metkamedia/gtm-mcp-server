# Google Tag Manager MCP Server

Local Model Context Protocol (MCP) server for Google Tag Manager, allowing Claude to interact with your GTM accounts, containers, tags, triggers, and variables.

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd gtm-mcp-server
npm install
```

### 2. Setup Google Cloud Project and API

1. 🌐 Go to [Google Cloud Console](https://console.cloud.google.com/)
2. 📁 **Create a new project** (important: create a new project specifically for this)
3. 🔧 **Enable Google Tag Manager API**:
   - Inside your project, go to "APIs & Services" > "Library"
   - Search for "Tag Manager API"
   - Click on it and press "Enable"

### 3. Create OAuth 2.0 Credentials

1. 🔑 On the Tag Manager API page, click **"Create Credentials"** button
2. ❓ In "What data will you be accessing?" select **"User data"**  
3. 📱 In "OAuth Client ID" section:
   - Application type: select **"Desktop app"**
   - Give it any name you want
4. 📥 **Download the JSON file** and save it as `credentials.json` in the project root

### 4. Configure Test Users

1. 👤 Go to "APIs & Services" > "Credentials" (left sidebar)
2. 🔍 Find your newly created "OAuth 2.0 Client ID" and click on it
3. 👥 Go to "Audience" tab, scroll down to "Test Users" section
4. ➕ Add your email address as a test user

### 5. Run Authorization

```bash
# Build the project first
npm run build

# Run authorization
npm run auth
```

This will:
- Open a browser window for Google authorization
- Redirect you to sign in with the email you added as a test user
- After successful authorization, show a success page at `http://localhost:3000/callback`
- Create a `gtm-config.json` file with access tokens in your project
### 6. Configure Claude Desktop

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "google-tag-manager": {
      "command": "node",
      "args": ["/FULL/PATH/TO/YOUR/gtm-mcp-server/dist/index.js"],
      "env": {
        "PATH": "/usr/local/bin:/usr/bin:/bin"
      }
    }
  }
}
```

**⚠️ Important:** Replace `/FULL/PATH/TO/YOUR/gtm-mcp-server/` with the actual absolute path to your project folder.

For example:
- macOS: `"/Users/wiefix/WORK/gtm-mcp-server/dist/index.js"`
- Windows: `"C:\\Users\\YourName\\Documents\\gtm-mcp-server\\dist\\index.js"`

**PATH explanation:** The `PATH` environment variable specifies directories where system executables (like `node`) are located. On macOS/Linux, these standard paths ensure the MCP server can find Node.js.

### 7. Restart Claude Desktop

After saving the configuration file, **restart Claude Desktop** to connect the MCP server.

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
- Verify that Google Tag Manager API is enabled in your Google Cloud project
- Check that your email is added as a test user in OAuth consent screen
- Try running `npm run auth` again

### API Errors
- Ensure your Google account has access to GTM accounts
- Check access permissions in GTM interface
- Verify that the API is enabled and credentials are correct

### Connection Errors
- Restart Claude Desktop after making configuration changes
- Verify correct absolute paths in `claude_desktop_config.json`
- Check that the `dist/index.js` file exists (run `npm run build` if missing)

## 📁 File Structure

```
gtm-mcp-server/
├── credentials.json          # Your Google OAuth credentials (downloaded from Google Cloud)
├── gtm-config.json          # Access tokens (auto-created after successful authorization)
├── src/                     # TypeScript source code
├── dist/                    # Compiled JavaScript (created by npm run build)
├── package.json             # Project dependencies and scripts
└── README.md               # This instruction file
```

## ⚠️ Security

- Files `credentials.json` and `gtm-config.json` contain sensitive authentication data
- These files are automatically added to `.gitignore` to prevent accidental commits
- **Never publish these files in public repositories or share them**
- Keep your Google Cloud project credentials secure

## 🔄 Development

```bash
# Development mode with auto-reload
npm run dev

# Build project for production
npm run build

# Code linting and formatting
npm run lint

# Re-run authorization if needed
npm run auth
```

## 📞 Support

If you encounter problems:

1. **Double-check all setup steps** - make sure you followed the exact sequence
2. **Verify Node.js version** - ensure you're using Node.js v20.19.5 or higher
3. **Check Google Cloud setup**:
   - Project created and Tag Manager API enabled
   - OAuth credentials created as Desktop app
   - Your email added as test user
4. **Verify file paths** in Claude Desktop config are absolute and correct
5. **Check logs** in Claude Desktop terminal for error messages
6. **Rebuild the project** with `npm run build` if needed

## 🎯 Quick Verification

To verify everything works:
1. Complete all setup steps above
2. Restart Claude Desktop
3. Open a new chat in Claude
4. Ask: "List my GTM accounts"
5. You should see your Google Tag Manager accounts listed
