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
    if (event.type === 'follow') return cmdWelcome(event, client);
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
        if (/^廣播\s+(.+)/.test(text)) return cmdBroadcast(event, client, text);
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
    if (/^廣播\s+(.+)/.test(text))                      return cmdBroadcast(event, client, text);

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
          // 直接用 Firebase 完整 key（含容量），確保訂閱資料與 Firebase 一致
      const names = Object.keys(data).sort().slice(0, 13);
          items = names.map(n => qr(shortLabel(n), n));
    } catch (e) {
          console.error('[cmdSetup] 無法取得機型清單，使用預設值:', e.message);
    }

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
        const result = await addSubscription(userId, model);
        sessions.delete(userId);

      if (result.duplicate) {
              return client.replyMessage({
                        replyToken: event.replyToken,
                        messages: [{
                                    type: 'text',
                                    text: `你已經訂閱過「${model}」了，不需要重複設定。`,
                                    quickReply: { items: [qr('我的訂閱'), qr('訂閱通知')] },
                        }],
              });
      }

      if (result.limitReached) {
              return client.replyMessage({
                        replyToken: event.replyToken,
                        messages: [{
                                    type: 'text',
                                    text: `訂閱數量已達上限（最多 10 筆）。\n請先刪除不需要的訂閱再新增。`,
                                    quickReply: { items: [qr('我的訂閱')] },
                        }],
              });
      }

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
          const result = await addSubscription(userId, model);

      if (result.duplicate) {
              return client.replyMessage({
                        replyToken: event.replyToken,
                        messages: [{ type: 'text', text: `你已經訂閱過「${model}」了。`, quickReply: { items: [qr('我的訂閱')] } }],
              });
      }

      if (result.limitReached) {
              return client.replyMessage({
                        replyToken: event.replyToken,
                        messages: [{ type: 'text', text: `訂閱數量已達上限（最多 10 筆）。\n請先刪除不需要的訂閱再新增。`, quickReply: { items: [qr('我的訂閱')] } }],
              });
      }

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

  const rows = subs.map((s, i) => ({
        type: 'box',
        layout: 'horizontal',
        paddingAll: '12px',
        borderWidth: 'light',
        borderColor: '#e8e8e8',
        contents: [
          {
                    type: 'box',
                    layout: 'vertical',
                    flex: 1,
                    contents: [
                      { type: 'text', text: `${i + 1}. ${s.model}`, size: 'sm', weight: 'bold', wrap: true },
                    ],
          },
          {
                    type: 'button',
                    style: 'secondary',
                    height: 'sm',
                    flex: 0,
                    action: { type: 'message', label: '刪除', text: `刪除 ${i + 1}` },
          },
        ],
  }));

  const flexMsg = {
        type: 'flex',
        altText: `你的訂閱（共 ${subs.length} 筆）`,
        contents: {
                type: 'bubble',
                size: 'mega',
                header: {
                          type: 'box',
                          layout: 'vertical',
                          backgroundColor: '#1a1a1a',
                          paddingAll: '16px',
                          contents: [
                            { type: 'text', text: '📋 我的訂閱清單', size: 'xs', color: '#aaaaaa' },
                            { type: 'text', text: `共 ${subs.length} 筆`, size: 'lg', color: '#ffffff', weight: 'bold', margin: '4px' },
                          ],
                },
                body: {
                          type: 'box',
                          layout: 'vertical',
                          paddingAll: '0px',
                          spacing: 'none',
                          contents: rows,
                },
                footer: {
                          type: 'box',
                          layout: 'horizontal',
                          paddingAll: '12px',
                          contents: [
                            {
                                        type: 'button',
                                        style: 'primary',
                                        color: '#00b96b',
                                        height: 'sm',
                                        action: { type: 'message', label: '新增訂閱', text: '訂閱通知' },
                            },
                          ],
                },
        },
  };

  return client.replyMessage({ replyToken: event.replyToken, messages: [flexMsg] });
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
                                      { type: 'text', text: `NT$${epboxPrice.toLocaleString()}`, size: 'xxl', color: '#ff6b00', weight: 'bold', margin: '8px' },
                                                ],
                        },
                        body: {
                                    type: 'box',
                                    layout: 'vertical',
                                    paddingAll: '16px',
                                    spacing: 'sm',
                                    contents: (() => {
                                      const COMPETITORS = ['APPLE BAR', 'STUDIO', '台北101', '台哥大', '地標', '米可', '神腦', '遠傳'];
                                      const compPrices = COMPETITORS.map(k => ({ name: k, price: priceMap[k] })).filter(c => c.price && typeof c.price === 'number');
                                      const best = compPrices.sort((a, b) => b.price - a.price)[0];
                                      const rows = [
                                        {
                                                      type: 'box',
                                                      layout: 'horizontal',
                                                      contents: [
                                                        { type: 'text', text: 'EPBOX 自助回收 📦', size: 'md', color: '#ff6b00', weight: 'bold', flex: 3 },
                                                        { type: 'text', text: `NT$${epboxPrice.toLocaleString()}`, size: 'md', color: '#ff6b00', weight: 'bold', align: 'end', flex: 2 },
                                                      ],
                                        },
                                      ];
                                      if (best) {
                                        const diff = epboxPrice - best.price;
                                        rows.push({ type: 'separator', margin: 'sm' });
                                        rows.push({
                                                      type: 'box',
                                                      layout: 'horizontal',
                                                      margin: 'sm',
                                                      contents: [
                                                        { type: 'text', text: `最高競業（${best.name}）`, size: 'xs', color: '#888888', flex: 3 },
                                                        { type: 'text', text: `NT$${best.price.toLocaleString()}`, size: 'xs', color: '#888888', align: 'end', flex: 2 },
                                                      ],
                                        });
                                        rows.push({
                                                      type: 'text',
                                                      text: diff > 0 ? `✅ EPBOX 領先 NT$${diff.toLocaleString()}` : diff < 0 ? `📊 EPBOX 落後 NT$${Math.abs(diff).toLocaleString()}` : `⚖️ 與最高競業同價`,
                                                      size: 'xs',
                                                      color: diff >= 0 ? '#00b96b' : '#888888',
                                                      margin: 'sm',
                                        });
                                      }
                                      return rows;
                                    })(),
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
                                                      color: '#ff6b00',
                                                      height: 'sm',
                                                      action: { type: 'message', label: '訂閱此機型', text: `訂閱 ${modelName}` },
                                      },
                                      {
                                                      type: 'button',
                                                      style: 'secondary',
                                                      height: 'sm',
                                                      action: { type: 'message', label: '我的訂閱', text: '我的訂閱' },
                                      },
                                                ],
                        },
              },
      };

      return client.replyMessage({ replyToken: event.replyToken, messages: [flexMsg] });

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
/** Quick Reply label 上限 20 字元，超過則截斷 */
function shortLabel(name = '') {
    return name.length > 20 ? name.slice(0, 19) + '…' : name;
}

function defaultModelQR() {
    return [
          'IPHONE 16 PRO MAX', 'IPHONE 16 PRO', 'IPHONE 16 PLUS', 'IPHONE 16',
          'IPHONE 15 PRO MAX', 'IPHONE 15 PRO', 'IPHONE 15',
          'IPHONE 14 PRO MAX', 'IPHONE 14 PRO', 'IPHONE 14',
        ].slice(0, 13).map(n => qr(n));
}


// ── B: 歡迎訊息（加入 Bot 時）────────────────────
async function cmdWelcome(event, client) {
    return client.replyMessage({
          replyToken: event.replyToken,
          messages: [{
                  type: 'flex',
                  altText: '歡迎加入 EPBOX 回收價通知機器人！',
                  contents: {
                            type: 'bubble',
                            size: 'mega',
                            header: {
                                      type: 'box',
                                      layout: 'vertical',
                                      backgroundColor: '#1a1a1a',
                                      paddingAll: '20px',
                                      contents: [
                                        { type: 'text', text: '📦 EPBOX 回收價通知', size: 'xs', color: '#aaaaaa' },
                                        { type: 'text', text: '歡迎！', size: 'xxl', color: '#ffffff', weight: 'bold', margin: '6px' },
                                        { type: 'text', text: '我會在 EPBOX 回收價下跌時，立即通知你', size: 'sm', color: '#aaaaaa', wrap: true, margin: '6px' },
                                      ],
                            },
                            body: {
                                      type: 'box',
                                      layout: 'vertical',
                                      paddingAll: '16px',
                                      spacing: 'sm',
                                      contents: [
                                        { type: 'text', text: '你可以做什麼', size: 'xs', color: '#aaaaaa', weight: 'bold' },
                                        { type: 'text', text: '📲  訂閱通知 — 選機型，價格跌了就推播', size: 'sm', wrap: true },
                                        { type: 'text', text: '🔍  查詢 iPhone 16 Pro Max — 查即時回收價', size: 'sm', wrap: true },
                                        { type: 'text', text: '📋  我的訂閱 — 查看與管理訂閱清單', size: 'sm', wrap: true },
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
                                                    action: { type: 'message', label: '訂閱通知', text: '訂閱通知' },
                                        },
                                        {
                                                    type: 'button',
                                                    style: 'secondary',
                                                    height: 'sm',
                                                    action: { type: 'message', label: '查詢價格', text: '查詢 IPHONE 16 PRO MAX' },
                                        },
                                      ],
                            },
                  },
          }],
    });
}

// ── A: 管理員廣播 ─────────────────────────────────
async function cmdBroadcast(event, client, text) {
    const adminId = process.env.ADMIN_USER_ID;
    if (!adminId || event.source.userId !== adminId) return;

    const { getAllSubscriptions } = require('./db');
    const msg = text.replace(/^廣播\s+/i, '').trim();
    if (!msg) return;

    const subs = await getAllSubscriptions();
    const userIds = [...new Set(subs.map(s => s.userId))];
    let sent = 0;
    for (const userId of userIds) {
          try {
                  await client.pushMessage({ to: userId, messages: [{ type: 'text', text: msg }] });
                  sent++;
          } catch (e) {
                  console.error('[廣播] 推播失敗', userId, e.message);
          }
    }
    return client.replyMessage({
          replyToken: event.replyToken,
          messages: [{ type: 'text', text: `✅ 已廣播給 ${sent} 位使用者。` }],
    });
}

module.exports = { handleEvent };
