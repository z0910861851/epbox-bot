const { addSubscription, removeSubscriptionByIndex, getUserSubscriptions } = require('./db');
const { fetchPrices } = require('./firebase');

// ── 常數 ──────────────────────────────────────────

// Quick Reply 捷徑
const qr = (label, text) => ({
  type: 'action',
  action: { type: 'message', label, text: text || label },
});

// ── 對話狀態（記憶體，重啟後清除）────────────────
const sessions = new Map();
// session 結構：{ step: 'model' }

// ── 主入口 ───────────────────────────────────────
async function handleEvent(event, client) {
  if (event.type === 'postback') return handlePostback(event, client);
  if (event.type !== 'message' || event.message.type !== 'text') return;

  const userId = event.source.userId;
  const text   = event.message.text.trim();

  // 進行中的設定流程（但主選單指令優先）
  if (sessions.has(userId)) {
    if (/^(設定提醒|訂閱通知|新增訂閱)$/.test(text)) {
      sessions.delete(userId);
      return cmdSetup(event, client);
    }
    if (/^(我的提醒|我的訂閱|訂閱清單|查看提醒)$/.test(text)) {
      sessions.delete(userId);
      return cmdList(event, client);
    }
    if (/^查詢/.test(text)) {
      sessions.delete(userId);
      return cmdQuery(event, client, text);
    }
    if (/^刪除\s*(\d+)$/.test(text)) {
      sessions.delete(userId);
      return cmdDelete(event, client, text);
    }
    if (text === '取消') return cmdCancel(event, client);
    return handleSetup(event, client, sessions.get(userId), text);
  }

  // 主選單指令
  if (/^(設定提醒|訂閱通知|新增訂閱)$/.test(text))   return cmdSetup(event, client);
  if (/^(我的提醒|我的訂閱|訂閱清單|查看提醒)$/.test(text)) return cmdList(event, client);
  if (/^刪除\s*(\d+)$/.test(text))                   return cmdDelete(event, client, text);
  if (/^查詢/.test(text))                             return cmdQuery(event, client, text);
  if (/^訂閱\s+(.+)/.test(text))                     return cmdDirectSubscribe(event, client, text);
  if (/^取消訂閱\s*(.*)/.test(text))                 return cmdUnsubscribe(event, client, text);
  if (text === '取消')                                return cmdCancel(event, client);

  return cmdHelp(event, client);
}

// ── 說明 ─────────────────────────────────────────
async function cmdHelp(event, client) {
  return client.replyMessage({
    replyToken: event.replyToken,
    messages: [{
      type: 'text',
      text: '嗨！我是 EPBOX 回收價通知機器人 📦\n\n請選擇操作：',
      quickReply: {
        items: [
          qr('訂閱通知'),
          qr('我的訂閱'),
          qr('查詢 iPhone 16 Pro Max'),
        ],
      },
    }],
  });
}

// ── 訂閱：第一步（選機型）────────────────────────
async function cmdSetup(event, client) {
  const userId = event.source.userId;
  sessions.set(userId, { step: 'model' });

  let items = defaultModelQR();
  try {
    const data  = await fetchPrices();
    const names = [...new Set(Object.keys(data).map(k => baseModel(k)))].slice(0, 13);
    items = names.map(n => qr(n));
  } catch {}

  return client.replyMessage({
    replyToken: event.replyToken,
    messages: [{
      type: 'text',
      text: '請選擇要訂閱的機型：（或直接輸入型號）',
      quickReply: { items },
    }],
  });
}

// ── 設定流程中的對話處理 ─────────────────────────
async function handleSetup(event, client, session, text) {
  const userId = event.source.userId;

  if (text === '取消') return cmdCancel(event, client);

  if (session.step === 'model') {
    const model = text.toUpperCase();
    await addSubscription(userId, model);
    sessions.delete(userId);

    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [{
        ...subscribeSuccessFlex(model),
      }],
    });
  }
}

// ── 訂閱成功 Flex Message ─────────────────────────
function subscribeSuccessFlex(model) {
  return {
    type: 'flex',
    altText: `✅ 已訂閱 ${model}`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#1a1a1a',
        paddingAll: '16px',
        contents: [
          { type: 'text', text: '📦 EPBOX 訂閱通知', size: 'xs', color: '#aaaaaa' },
          { type: 'text', text: model, size: 'md', color: '#ffffff', weight: 'bold', wrap: true, margin: '4px' },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '16px',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: '✅', size: 'xl', flex: 0 },
              {
                type: 'box',
                layout: 'vertical',
                margin: 'md',
                contents: [
                  { type: 'text', text: '訂閱成功！', size: 'md', weight: 'bold', color: '#00b96b' },
                  { type: 'text', text: '當 EPBOX 回收價下跌時，\n我會立即通知你。', size: 'sm', color: '#555555', wrap: true, margin: 'sm' },
                ],
              },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'horizontal',
        spacing: 'sm',
        paddingAll: '12px',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: '#00b96b',
            height: 'sm',
            action: { type: 'message', label: '我的訂閱', text: '我的訂閱' },
          },
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: { type: 'message', label: '繼續訂閱', text: '訂閱通知' },
          },
        ],
      },
    },
  };
}

// ── 直接訂閱（從網頁跳轉）────────────────────────
async function cmdDirectSubscribe(event, client, text) {
  const userId = event.source.userId;
  const model  = text.replace(/^訂閱\s+/i, '').toUpperCase().trim();
  try {
    await addSubscription(userId, model);

    // 抓現在 EPBOX 回收價，回傳查詢卡片 + 訂閱成功標示
    const data   = await fetchPrices();
    const entry  = Object.entries(data).find(([key]) => key.toUpperCase() === model);
    const epboxPrice = entry ? entry[1]['trade in價'] : null;

    if (epboxPrice && typeof epboxPrice === 'number') {
      const flexMsg = {
        type: 'flex',
        altText: `✅ 已訂閱！${model} 目前 EPBOX 回收價 NT$${epboxPrice.toLocaleString()}`,
        contents: {
          type: 'bubble',
          size: 'mega',
          header: {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#1a1a1a',
            paddingAll: '16px',
            contents: [
              { type: 'text', text: '📦 EPBOX 回收價查詢', size: 'xs', color: '#aaaaaa' },
              { type: 'text', text: model, size: 'md', color: '#ffffff', weight: 'bold', wrap: true, margin: '4px' },
              { type: 'text', text: `NT$${epboxPrice.toLocaleString()}`, size: 'xxl', color: '#ff6b00', weight: 'bold', margin: '8px' },
            ],
          },
          body: {
            type: 'box',
            layout: 'vertical',
            paddingAll: '16px',
            contents: [
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  { type: 'text', text: 'EPBOX 自助回收 📦', size: 'md', color: '#ff6b00', weight: 'bold', flex: 3 },
                  { type: 'text', text: `NT$${epboxPrice.toLocaleString()}`, size: 'md', color: '#ff6b00', weight: 'bold', align: 'end', flex: 2 },
                ],
              },
              { type: 'separator', margin: 'md' },
              { type: 'text', text: '✅ 已訂閱！價格下跌時將立即通知你。', size: 'sm', color: '#00b96b', margin: 'md', wrap: true },
            ],
          },
          footer: {
            type: 'box',
            layout: 'horizontal',
            paddingAll: '12px',
            contents: [
              {
                type: 'button',
                style: 'primary',
                color: '#ff6b00',
                height: 'sm',
                action: { type: 'message', label: '我的訂閱', text: '我的訂閱' },
              },
            ],
          },
        },
      };
      return client.replyMessage({ replyToken: event.replyToken, messages: [flexMsg] });
    }

    // 無法取得價格時，退回純文字確認
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [{ type: 'text', text: `✅ 已訂閱！\n\n當 ${model} 的 EPBOX 回收價下跌時，我會立即通知你。`, quickReply: { items: [qr('我的訂閱')] } }],
    });
  } catch (e) {
    console.error('[訂閱] 失敗:', e.message);
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [{ type: 'text', text: '訂閱時發生錯誤，請稍後再試。' }],
    });
  }
}

// ── 取消訂閱 ─────────────────────────────────────
async function cmdUnsubscribe(event, client, text) {
  const userId = event.source.userId;
  const modelRaw = text.replace(/^取消訂閱\s*/i, '').toUpperCase().trim();

  // 直接指定機型：取消訂閱 IPHONE 16 PRO MAX 256GB
  if (modelRaw) {
    const subs = await getUserSubscriptions(userId);
    const idx  = subs.findIndex(s => s.model === modelRaw);
    if (idx === -1) {
      return client.replyMessage({
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: `找不到「${modelRaw}」的訂閱紀錄。`, quickReply: { items: [qr('我的訂閱')] } }],
      });
    }
    await removeSubscriptionByIndex(userId, idx);
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [{ type: 'text', text: `✅ 已取消訂閱 ${modelRaw}。`, quickReply: { items: [qr('我的訂閱')] } }],
    });
  }

  // 沒指定機型：顯示清單讓使用者選
  return cmdList(event, client);
}

// ── 查看訂閱清單 ──────────────────────────────────
async function cmdList(event, client) {
  const userId = event.source.userId;
  const subs   = await getUserSubscriptions(userId);

  if (!subs.length) {
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [{
        type: 'text',
        text: '你目前沒有任何訂閱。',
        quickReply: { items: [qr('訂閱通知')] },
      }],
    });
  }

  const list = subs.map((s, i) => `${i + 1}. ${s.model}`).join('\n');
  const delItems = subs.slice(0, 5).map((_, i) => qr(`刪除 ${i + 1}`));

  return client.replyMessage({
    replyToken: event.replyToken,
    messages: [{
      type: 'text',
      text: `你的訂閱（共 ${subs.length} 筆）：\n\n${list}\n\n輸入「刪除 1」可刪除對應訂閱。`,
      quickReply: { items: [qr('訂閱通知'), ...delItems] },
    }],
  });
}

// ── 刪除訂閱 ─────────────────────────────────────
async function cmdDelete(event, client, text) {
  const userId = event.source.userId;
  const n      = parseInt(text.match(/\d+/)[0], 10) - 1;
  const ok     = await removeSubscriptionByIndex(userId, n);

  return client.replyMessage({
    replyToken: event.replyToken,
    messages: [{
      type: 'text',
      text: ok ? `✅ 第 ${n + 1} 筆訂閱已刪除。` : '找不到該筆訂閱。',
      quickReply: { items: [qr('我的訂閱'), qr('訂閱通知')] },
    }],
  });
}

// ── 查詢目前回收價（僅顯示 EPBOX）────────────────
async function cmdQuery(event, client, text) {
  const keyword = text.replace(/^查詢\s*/i, '').toUpperCase().trim();

  try {
    const data  = await fetchPrices();
    const entry = Object.entries(data).find(([key]) => key.includes(keyword));

    if (!entry) {
      return client.replyMessage({
        replyToken: event.replyToken,
        messages: [{
          type: 'text',
          text: `找不到「${keyword}」的資料。\n\n請確認型號，例如：\n查詢 IPHONE 16 PRO MAX`,
          quickReply: { items: [qr('訂閱通知'), qr('我的訂閱')] },
        }],
      });
    }

    const [modelName, priceMap] = entry;
    const epboxPrice = priceMap['trade in價'];

    if (!epboxPrice || typeof epboxPrice !== 'number') {
      return client.replyMessage({
        replyToken: event.replyToken,
        messages: [{
          type: 'text',
          text: `找不到「${modelName}」的 EPBOX 回收價。`,
          quickReply: { items: [qr('訂閱通知'), qr('我的訂閱')] },
        }],
      });
    }

    const flexMsg = {
      type: 'flex',
      altText: `${modelName} EPBOX 回收價 NT$${epboxPrice.toLocaleString()}`,
      contents: {
        type: 'bubble',
        size: 'mega',
        header: {
          type: 'box',
          layout: 'vertical',
          backgroundColor: '#1a1a1a',
          paddingAll: '16px',
          contents: [
            { type: 'text', text: '📦 EPBOX 回收價查詢', size: 'xs', color: '#aaaaaa' },
            { type: 'text', text: modelName, size: 'md', color: '#ffffff', weight: 'bold', wrap: true, margin: '4px' },
            {
              type: 'text',
              text: `NT$${epboxPrice.toLocaleString()}`,
              size: 'xxl',
              color: '#ff6b00',
              weight: 'bold',
              margin: '8px',
            },
          ],
        },
        body: {
          type: 'box',
          layout: 'vertical',
          paddingAll: '16px',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: 'EPBOX 自助回收 📦',
                  size: 'md',
                  color: '#ff6b00',
                  weight: 'bold',
                  flex: 3,
                },
                {
                  type: 'text',
                  text: `NT$${epboxPrice.toLocaleString()}`,
                  size: 'md',
                  color: '#ff6b00',
                  weight: 'bold',
                  align: 'end',
                  flex: 2,
                },
              ],
            },
          ],
        },
        footer: {
          type: 'box',
          layout: 'horizontal',
          paddingAll: '12px',
          contents: [
            {
              type: 'button',
              style: 'primary',
              color: '#ff6b00',
              height: 'sm',
              action: { type: 'message', label: '我的訂閱', text: '我的訂閱' },
            },
          ],
        },
      },
    };

    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [flexMsg],
    });

  } catch (e) {
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [{ type: 'text', text: '目前無法取得資料，請稍後再試。' }],
    });
  }
}

// ── 取消目前流程 ──────────────────────────────────
async function cmdCancel(event, client) {
  sessions.delete(event.source.userId);
  return client.replyMessage({
    replyToken: event.replyToken,
    messages: [{ type: 'text', text: '已取消。', quickReply: { items: [qr('訂閱通知'), qr('我的訂閱')] } }],
  });
}

// ── Postback（保留擴充）────────────────────────────
async function handlePostback(event, client) {
  // 目前未使用，保留未來 Flex Message 按鈕用
}

// ── 工具函式 ─────────────────────────────────────
function baseModel(name = '') {
  return name.replace(/\s*(64|128|256|512|1T)GB\s*/i, '').trim();
}

function defaultModelQR() {
  return [
    'IPHONE 16 PRO MAX', 'IPHONE 16 PRO', 'IPHONE 16 PLUS', 'IPHONE 16',
    'IPHONE 15 PRO MAX', 'IPHONE 15 PRO', 'IPHONE 15',
    'IPHONE 14 PRO MAX', 'IPHONE 14 PRO', 'IPHONE 14',
  ].slice(0, 13).map(n => qr(n));
}

module.exports = { handleEvent };
