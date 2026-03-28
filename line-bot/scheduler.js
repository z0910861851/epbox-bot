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
        const drop = droppedModels[sub.model];
        if (!drop) continue;

        try {
          await client.pushMessage({
            to: sub.userId,
            messages: [{
              type: 'text',
              text: [
                `📉 ${sub.model}`,
                `EPBOX 回收價下跌！`,
                ``,
                `昨日：NT$${drop.prev.toLocaleString()}`,
                `今日：NT$${drop.curr.toLocaleString()}`,
                `跌幅：NT$${(drop.prev - drop.curr).toLocaleString()}`,
                ``,
                `建議盡快前往回收！`,
              ].join('\n'),
            }],
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

module.exports = { runPriceCheck };
