const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const SERVICE_ACCOUNT_KEY_PATH = process.env.SERVICE_ACCOUNT_KEY_PATH || './service-account.json';
const GOOGLE_CREDENTIALS = process.env.GOOGLE_CREDENTIALS;

let sheets;
try {
    let auth;
    if (GOOGLE_CREDENTIALS) {
        const credentials = JSON.parse(GOOGLE_CREDENTIALS);
        auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
    } else {
        auth = new google.auth.GoogleAuth({
            keyFile: SERVICE_ACCOUNT_KEY_PATH,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
    }
    sheets = google.sheets({ version: 'v4', auth });
    console.log('✅ Google Sheets API initialized');
} catch (error) {
    console.error('❌ API Init Failed:', error.message);
    process.exit(1);
}

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

app.get('/api/spreadsheet/:spreadsheetId/metadata', async (req, res) => {
    try {
        const { spreadsheetId } = req.params;
        const response = await sheets.spreadsheets.get({ spreadsheetId });
        res.json({
            success: true,
            title: response.data.properties.title,
            sheets: response.data.sheets.map(s => ({
                sheetId: s.properties.sheetId,
                title: s.properties.title,
                index: s.properties.index
            })),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/spreadsheet/:spreadsheetId/data', async (req, res) => {
    try {
        const { spreadsheetId } = req.params;
        const { range } = req.query;
        if (!range) return res.status(400).json({ error: 'Missing range' });

        const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
        res.json({
            success: true,
            values: response.data.values || [],
            rowCount: response.data.values?.length || 0,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/spreadsheet/:spreadsheetId/append', async (req, res) => {
    try {
        const { spreadsheetId } = req.params;
        const { range, values } = req.body;
        if (!range || !values) return res.status(400).json({ error: 'Missing fields' });

        const response = await sheets.spreadsheets.values.append({
            spreadsheetId, range, valueInputOption: 'USER_ENTERED', requestBody: { values },
        });
        res.json({ success: true, updates: response.data.updates });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/spreadsheet/:spreadsheetId/update', async (req, res) => {
    try {
        const { spreadsheetId } = req.params;
        const { range, values } = req.body;
        if (!range || !values) return res.status(400).json({ error: 'Missing fields' });

        const response = await sheets.spreadsheets.values.update({
            spreadsheetId, range, valueInputOption: 'USER_ENTERED', requestBody: { values },
        });
        res.json({ success: true, updates: response.data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/spreadsheet/:spreadsheetId/clear', async (req, res) => {
    try {
        const { spreadsheetId } = req.params;
        const { range } = req.body;
        if (!range) return res.status(400).json({ error: 'Missing range' });

        const response = await sheets.spreadsheets.values.clear({ spreadsheetId, range });
        res.json({ success: true, clearedRange: response.data.clearedRange });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
