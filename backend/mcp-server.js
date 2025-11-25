#!/usr/bin/env node
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');

server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: 'google_sheets_append',
            description: 'Append rows to a Google Sheet',
            inputSchema: {
                type: 'object',
                properties: {
                    spreadsheetId: { type: 'string' },
                    range: { type: 'string' },
                    values: { type: 'array', items: { type: 'array', items: { type: 'string' } } },
                },
                required: ['spreadsheetId', 'range', 'values'],
            },
        },
        {
            name: 'google_sheets_read',
            description: 'Read data from a Google Sheet range',
            inputSchema: {
                type: 'object',
                properties: {
                    spreadsheetId: { type: 'string' },
                    range: { type: 'string' },
                },
                required: ['spreadsheetId', 'range'],
            },
        },
        {
            name: 'google_sheets_update',
            description: 'Update a specific range',
            inputSchema: {
                type: 'object',
                properties: {
                    spreadsheetId: { type: 'string' },
                    range: { type: 'string' },
                    values: { type: 'array', items: { type: 'array', items: { type: 'string' } } },
                },
                required: ['spreadsheetId', 'range', 'values'],
            },
        },
        {
            name: 'google_sheets_clear',
            description: 'Clear data from a range',
            inputSchema: {
                type: 'object',
                properties: {
                    spreadsheetId: { type: 'string' },
                    range: { type: 'string' },
                },
                required: ['spreadsheetId', 'range'],
            },
        },
    ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        let result;
        switch (name) {
            case 'google_sheets_append':
                result = await sheets.spreadsheets.values.append({
                    spreadsheetId: args.spreadsheetId,
                    range: args.range,
                    valueInputOption: 'USER_ENTERED',
                    requestBody: { values: args.values },
                });
                break;
            case 'google_sheets_read':
                result = await sheets.spreadsheets.values.get({
                    spreadsheetId: args.spreadsheetId,
                    range: args.range,
                });
                break;
            case 'google_sheets_update':
                result = await sheets.spreadsheets.values.update({
                    spreadsheetId: args.spreadsheetId,
                    range: args.range,
                    valueInputOption: 'USER_ENTERED',
                    requestBody: { values: args.values },
                });
                break;
            case 'google_sheets_clear':
                result = await sheets.spreadsheets.values.clear({
                    spreadsheetId: args.spreadsheetId,
                    range: args.range,
                });
                break;
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
        return { content: [{ type: 'text', text: JSON.stringify(result.data, null, 2) }] };
    } catch (error) {
        return { content: [{ type: 'text', text: JSON.stringify({ error: error.message }, null, 2) }], isError: true };
    }
});

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
});
