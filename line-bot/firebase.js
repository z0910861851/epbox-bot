const fetch = require('node-fetch');

const FIREBASE_BASE = 'https://trade-in-5135c-default-rtdb.asia-southeast1.firebasedatabase.app';

async function fetchPrices() {
  const res = await fetch(`${FIREBASE_BASE}/tradein_prices/prices.json`);
  if (!res.ok) throw new Error(`Firebase 回應錯誤：${res.status}`);
  return res.json();
  // 結構：{ "IPHONE 16 PRO MAX 256GB": { "APPLE BAR": 32000, "trade in價": 28000, "model": "...", ... } }
}

// 讀取上次記錄的 EPBOX 價格
// Firebase 路徑：/epbox_last_known_prices → { "IPHONE 16 PRO MAX 256GB": 28000, ... }
async function getLastKnownPrices() {
  const res = await fetch(`${FIREBASE_BASE}/epbox_last_known_prices.json`);
  if (!res.ok) throw new Error(`Firebase 回應錯誤：${res.status}`);
  const data = await res.json();
  return data || {};
}

// 更新上次記錄的 EPBOX 價格
async function updateLastKnownPrices(data) {
  const res = await fetch(`${FIREBASE_BASE}/epbox_last_known_prices.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Firebase 寫入錯誤：${res.status}`);
}

module.exports = { fetchPrices, getLastKnownPrices, updateLastKnownPrices };
