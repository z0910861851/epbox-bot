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

      // 找出 EPBOX 價格有變動的機型
      const changedModels = {}; // { modelName: { prev, curr } }

      for (const [modelName, priceMap] of Object.entries(currentData)) {
              const curr = priceMap['trade in價'];
              if (!curr || typeof curr !== 'number') continue;

            const prev = lastKnown[modelName];
              if (prev && curr !== prev) {
                        changedModels[modelName] = { prev, curr };
              }
      }

      console.log(`[排程] 價格變動機型：${Object.keys(changedModels).join(', ') || '無'}`);

      // 如果有變動，通知訂閱者
      if (Object.keys(changedModels).length > 0) {
              const allSubs = await getAllSubscriptions();
              let sent = 0;

            for (const sub of allSubs) {
                      // 完全比對優先；舊訂閱若存的是 base model（無容量），改用 prefix 比對
                const change = changedModels[sub.model]
                        ?? Object.entries(changedModels).find(([k]) => k.startsWith(sub.model))?.[1];
                      if (!change) continue;

                try {
                            await client.pushMessage({
                                          to: sub.userId,
                                          messages: [buildChangeFlex(sub.model, change)],
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

function buildChangeFlex(model, change) {
    const dropped = change.curr < change.prev;
    const diff = Math.abs(change.prev - change.curr);
    const icon = dropped ? '📉' : '📈';
    const label = dropped ? 'EPBOX 回收價下跌通知' : 'EPBOX 回收價上漲通知';
    const priceColor = dropped ? '#ff4444' : '#00b96b';
    const changeText = dropped
        ? `▼ 跌幅 NT$${diff.toLocaleString()}`
        : `▲ 漲幅 NT$${diff.toLocaleString()}`;
    const hintText = dropped ? '建議盡快前往回收！' : '回收價上漲，現在是好時機！';

    return {
        type: 'flex',
        altText: `${icon} ${model} EPBOX 回收價${dropped ? '下跌' : '上漲'} NT$${diff.toLocaleString()}`,
        contents: {
            type: 'bubble',
            size: 'mega',
            header: {
                type: 'box',
                layout: 'vertical',
                backgroundColor: '#1a1a1a',
                paddingAll: '16px',
                contents: [
                    { type: 'text', text: `${icon} ${label}`, size: 'xs', color: '#aaaaaa' },
                    { type: 'text', text: model, size: 'md', color: '#ffffff', weight: 'bold', wrap: true, margin: '4px' },
                    { type: 'text', text: `NT$${change.curr.toLocaleString()}`, size: 'xxl', color: priceColor, weight: 'bold', margin: '8px' },
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
                            { type: 'text', text: `NT$${change.prev.toLocaleString()}`, size: 'sm', color: '#888888', align: 'end', flex: 2 },
                        ],
                    },
                    {
                        type: 'box',
                        layout: 'horizontal',
                        contents: [
                            { type: 'text', text: '目前價格', size: 'sm', color: priceColor, weight: 'bold', flex: 3 },
                            { type: 'text', text: `NT$${change.curr.toLocaleString()}`, size: 'sm', color: priceColor, weight: 'bold', align: 'end', flex: 2 },
                        ],
                    },
                    { type: 'separator', margin: 'md' },
                    { type: 'text', text: changeText, size: 'sm', color: priceColor, margin: 'md' },
                    { type: 'text', text: hintText, size: 'sm', color: '#555555', margin: 'sm' },
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
                        color: '#ff6b00',
                        height: 'sm',
                        action: { type: 'message', label: '查詢最新價格', text: `查詢 ${model}` },
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
}

module.exports = { runPriceCheck };
