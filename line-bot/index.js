require('dotenv').config();

const express = require('express');
const line    = require('@line/bot-sdk');
const cron    = require('node-cron');

const { initDB }       = require('./db');
const { handleEvent }  = require('./handlers');
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

app.get('/health', (_, res) => res.json({ ok: true, time: new Date().toISOString() }));

// ── 初始化 & 排程 ──────────────────────────────────
initDB();

// 每天早上 9:00 台灣時間（UTC+8）= UTC 01:00
cron.schedule('0 1 * * *', () => runPriceCheck(client));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`EPBOX LINE Bot 已啟動，port ${PORT}`);
  console.log('Webhook URL: https://你的網域/webhook');
});
