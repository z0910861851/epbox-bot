const { getAllSubscriptions } = require('./db');
const { fetchPrices, getLastKnownPrices, updateLastKnownPrices } = require('./firebase');

async function runPriceCheck(client) {
    console.log('[排程] 開始檢查 EPBOX 回收價變動...');
    try {
          const [currentData, lastKnown] = await Promise.all([
                  fetchPrices(),
                  getLastKnownPrices(),
                ]);

      if (!currentData) return;

      // 找出 EPBOX 價格下跌的機型
      const droppedModels = {}; // { modelName: { prev, curr } }

      for (const [modelName, priceMap] of Object.entries(currentData)) {
              const curr = priceMap['trade in價'];
              if (!curr || typeof curr !== 'number') continue;

            const prev = lastKnown[modelName];
              if (prev && curr < prev) {
                        droppedModels[modelName] = { prev, curr };
              }
      }

      console.log(`[排程] 下跌機型：${Object.keys(droppedModels).join(', ') || '無'}`);

      // 如果有下跌，通知訂閱者
      if (Object.keys(droppedModels).length > 0) {
              const allSubs = await getAllSubscriptions();
              let sent = 0;

            for (const sub of allSubs) {
                      // 完全比對優先；舊訂閱若存的是 base model（無容量），改用 prefix 比對
                const drop = droppedModels[sub.model]
                        ?? Object.entries(droppedModels).find(([k]) => k.startsWith(sub.model))?.[1];
                      if (!drop) continue;

                try {
                            await client.pushMessage({
                                          to: sub.userId,
                                          messages: [buildDropFlex(sub.model, drop)],
                            });
                            sent++;
                } catch (e) {
                            console.error(`[排程] 推播失敗 ${sub.userId}:`, e.message);
                }
            }

            console.log(`[排程] 共推播 ${sent} 則通知。`);
      }

      // 更新上次記錄的價格（所有機型）
      const newSnapshot = {};
          for (const [modelName, priceMap] of Object.entries(currentData)) {
                  const price = priceMap['trade in價'];
                  if (price && typeof price === 'number') {
                            newSnapshot[modelName] = price;
                  }
          }
          await updateLastKnownPrices(newSnapshot);
          console.log(`[排程] 已更新 ${Object.keys(newSnapshot).length} 筆價格記錄。`);

    } catch (e) {
          console.error('[排程] 錯誤:', e);
    }
}

function buildDropFlex(model, drop) {
    const diff = drop.prev - drop.curr;
    return {
        type: 'flex',
        altText: `📉 ${model} EPBOX 回收價下跌 NT$${diff.toLocaleString()}`,
        contents: {
            type: 'bubble',
            size: 'mega',
            header: {
                type: 'box',
                layout: 'vertical',
                backgroundColor: '#1a1a1a',
                paddingAll: '16px',
                contents: [
                    { type: 'text', text: '📉 EPBOX 回收價下跌通知', size: 'xs', color: '#aaaaaa' },
                    { type: 'text', text: model, size: 'md', color: '#ffffff', weight: 'bold', wrap: true, margin: '4px' },
                    { type: 'text', text: `NT$${drop.curr.toLocaleString()}`, size: 'xxl', color: '#ff4444', weight: 'bold', margin: '8px' },
                ],
            },
            body: {
                type: 'box',
                layout: 'vertical',
                paddingAll: '16px',
                spacing: 'sm',
                contents: [
                    {
                        type: 'box',
                        layout: 'horizontal',
                        contents: [
                            { type: 'text', text: '前次記錄', size: 'sm', color: '#888888', flex: 3 },
                            { type: 'text', text: `NT$${drop.prev.toLocaleString()}`, size: 'sm', color: '#888888', align: 'end', flex: 2 },
                        ],
                    },
                    {
                        type: 'box',
                        layout: 'horizontal',
                        contents: [
                            { type: 'text', text: '目前價格', size: 'sm', color: '#ff4444', weight: 'bold', flex: 3 },
                            { type: 'text', text: `NT$${drop.curr.toLocaleString()}`, size: 'sm', color: '#ff4444', weight: 'bold', align: 'end', flex: 2 },
                        ],
                    },
                    { type: 'separator', margin: 'md' },
                    { type: 'text', text: `▼ 跌幅 NT$${diff.toLocaleString()}`, size: 'sm', color: '#ff4444', margin: 'md' },
                    { type: 'text', text: '建議盡快前往回收！', size: 'sm', color: '#555555', margin: 'sm' },
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
}

module.exports = { runPriceCheck };
