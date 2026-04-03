require('dotenv').config();
const path = require('path');

const express = require('express');
const line    = require('@line/bot-sdk');
const cron    = require('node-cron');
const fetch   = require('node-fetch');

const { initDB }        = require('./db');
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

app.get('/health', (_, res) => res.json({ ok: true, time: new Date().toISOString() }));

// ── Claude Proxy (解決前端 CORS 問題) ──────────────
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

if (!CLAUDE_API_KEY) {
    console.warn('[警告] CLAUDE_API_KEY 未設定，/claude-proxy 將無法使用');
}

app.options('/claude-proxy', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.sendStatus(204);
});

app.post('/claude-proxy', express.json({ limit: '15mb' }), async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    if (!CLAUDE_API_KEY) return res.status(503).json({ error: 'CLAUDE_API_KEY 未設定' });
    try {
          const { base64, mediaType } = req.body;
          if (!base64) return res.status(400).json({ error: '缺少 base64 圖片' });

      const prompt = `請分析這張 EPBOX 手機回收機的估價截圖，並完成以下兩件事：

      第一部分：從圖中擷取以下資訊（若無法辨識請填「無資料」）
      - 機型名稱
      - 電池健康度（只回傳數字加%，例如：85%）
      - 外觀狀況描述
      - 基本回收價（只填數字）
      - 加碼補貼金額（只填數字，沒有則填 0）
      - 補貼後回收價（只填數字）
      - 黃色警告文字：只擷取 EPBOX 機器介面「檢測報告」區域內，以黃色或橘色顯示的手機狀況警告，每條單獨列出。背景中無關的通知或文字請忽略。若無警告則回傳空陣列。注意：請仔細辨識中文字，「液晶」不是「液體」，「摔點」不是「液體痕跡」，常見警告詞包括：液晶顯示異常、液晶痕跡、暗點、壓痕、烙印、邊框破損、螢幕刮痕、外觀損傷

      第二部分：根據擷取的資料，用繁體中文撰寫給銷售人員的說服話術
      - 客觀理性，直接引用圖中的數字，不要自行猜測或更改任何金額
      - 強調現在回收的時機優勢
      - 若電池健康度低於 80%，話術中必須說明：換電池費用已接近回收價的一定比例，等於白花錢讓舊機續命，現在直接回收換現金才是最實際的選擇
      - 若有外觀損傷警告，說明繼續使用只會讓殘值越來越低
      - 必須加入一個引導銷售員詢問顧客的提示句，格式如下：
        「【詢問顧客】可以問一下，這支舊手機有家人要繼續用嗎？」
          然後條列兩個情境的對應話術：
            【如果有家人要承接】
              - 電池健康度低於80%，勢必要換電池才能給家人用
                - 換電池費用不便宜，而且電池不好不只是續航力差，手機速度也會受影響
                  - 家人用起來體驗很差，甚至會覺得蘋果手機不好用
                    - 建議直接回收換現金，讓家人直接用更好的機器
                      【如果打算留著當備用機】
                        - 現在蘋果維修站都可以預約，一般小問題當天就能處理，手機不用留在維修站
                          - 但如果手機嚴重到無法操作（例如螢幕破裂、摔壞），那時候反而沒辦法把資料轉到備用機
                            - 真正需要備用機的時候卻用不了，留著意義其實不大
                              - 不如現在回收換現金，更實際
                              - 語氣專業但白話親切，像在跟朋友說話
                              - 總共4至5個重點條列，每點單獨一行，用換行符號分隔，不要用符號開頭
                              - 全程使用白話繁體中文，絕對不可以出現任何英文單字

                              請直接輸出以下 JSON，不要加任何說明或 markdown：
                              {"modelName":"機型","batteryHealth":"電池%","condition":"外觀","basePrice":數字,"bonus":數字,"finalPrice":數字,"warnings":["警告1","警告2"],"aiAdvice":"話術內容"}`;

      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': CLAUDE_API_KEY,
                        'anthropic-version': '2023-06-01',
              },
              body: JSON.stringify({
                        model: 'claude-sonnet-4-20250514',
                        max_tokens: 2500,
                        messages: [{
                                    role: 'user',
                                    content: [
                                      { type: 'image', source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: base64 } },
                                      { type: 'text', text: prompt }
                                                ]
                        }]
              })
      });

      const data = await claudeRes.json();
          if (data.error) return res.status(500).json({ error: data.error.message });
          const text = data.content?.[0]?.text || '';
          const start = text.indexOf('{'), end = text.lastIndexOf('}');
          if (start === -1) return res.status(500).json({ error: '無法解析 AI 回應' });
          const parsed = JSON.parse(text.slice(start, end + 1));
          res.json({ ok: true, result: parsed });
    } catch (e) {
          console.error('[claude-proxy]', e);
          res.status(500).json({ error: e.message });
    }
});

// ── 初始化 & 排程 ──────────────────────────────────
initDB();

// 每天早上 9:00 台灣時間（UTC+8）= UTC 01:00
cron.schedule('0 1 * * *', () => runPriceCheck(client));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`EPBOX LINE Bot 已啟動，port ${PORT}`);
    console.log('Webhook URL: https://你的網域/webhook');
  console.log('[epbox.html] 版本: 2026-04-03 訂閱一條龍');
});
