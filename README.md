# Google Sheets MCP & Dashboard

Full-stack application with a modern React dashboard and Claude Desktop MCP server for Google Sheets.

## 🚀 Quick Start

1. **Install Dependencies:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Setup:**
   - Add `service-account.json` to `backend/`
   - Share your Google Sheet with the service account email

3. **Run:**
   ```powershell
   .\start.ps1
   ```
   - Dashboard: http://localhost:5173
   - API: http://localhost:5000

## 🤖 Claude Desktop

Add to `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "google-sheets-mcp": {
      "command": "node",
      "args": ["C:\\Path\\To\\backend\\mcp-server.js"],
      "env": { "SERVICE_ACCOUNT_KEY_PATH": "C:\\Path\\To\\backend\\service-account.json" }
    }
  }
}
```
