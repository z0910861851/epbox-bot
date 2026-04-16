require('dotenv').config();
const path = require('path');

const express = require('express');
const line    = require('@line/bot-sdk');
const cron    = require('node-cron');

const { handleEvent }   = require('./handlers');
const { runPriceCheck } = require('./scheduler');

// ── LINE Client ───────────────────────────────────
const lineConfig = {
    channelSecret:      process.env.LINE_CHANNEL_SECRET,
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
};

const client = new line.messagingApi.MessagingApiClient({
    channelAccessToken: lineConfig.channelAccessToken,
});

// ── Express ───────────────────────────────────────
const app = express();

app.post(
    '/webhook',
    line.middleware(lineConfig),
    (req, res) => {
          Promise.all(req.body.events.map(e => handleEvent(e, client)))
            .then(() => res.json({ ok: true }))
            .catch(err => {
                      console.error(err);
                      res.status(500).end();
            });
    }
  );

// ── 舊換新網頁 ───────────────────────────────────
app.get('/', (_, res) => res.sendFile(path.join(__dirname, '..', 'epbox.html')));
app.get('/epbox.html', (_, res) => res.sendFile(path.join(__dirname, '..', 'epbox.html')));
app.get('/epbox-analytics.html', (_, res) => res.sendFile(path.join(__dirname, '..', 'epbox-analytics.html')));
app.get('/epbox-best-deals.html', (_, res) => res.sendFile(path.join(__dirname, '..', 'epbox-best-deals.html')));
app.get('/epbox-price-uploader.html', (_, res) => res.sendFile(path.join(__dirname, '..', 'epbox-price-uploader.html')));

app.get('/health', (_, res) => res.json({ ok: true, time: new Date().toISOString() }));

// ── 手動觸發價格比對推播 ──────────────────────────
// POST /price-check  Header: x-admin-secret: <ADMIN_SECRET>
app.post('/price-check', express.json(), async (req, res) => {
    const secret = process.env.ADMIN_SECRET;
    if (secret && req.headers['x-admin-secret'] !== secret) {
        return res.status(401).json({ error: '未授權' });
    }
    res.json({ ok: true, message: '已開始執行價格比對，結果請查看伺服器 log' });
    runPriceCheck(client).catch(e => console.error('[手動觸發] 錯誤:', e));
});

// ── 排程 ─────────────────────────────────────────
// 每天早上 9:00 台灣時間（UTC+8）= UTC 01:00
cron.schedule('0 1 * * *', () => runPriceCheck(client));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`EPBOX LINE Bot 已啟動，port ${PORT}`);
    console.log('Webhook URL: https://你的網域/webhook');
  console.log('[epbox.html] 版本: 2026-04-16 移除補貼顯示');
});
