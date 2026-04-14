/**
 * 用 Firebase Realtime DB 存訂閱資料
 * 路徑：/epbox_bot_alerts/{pushId} → { userId, model, createdAt }
 */
const fetch = require('node-fetch');

const FIREBASE_BASE = 'https://trade-in-5135c-default-rtdb.asia-southeast1.firebasedatabase.app';

function alertsUrl() {
    return `${FIREBASE_BASE}/epbox_bot_alerts`;
}

async function _getAll() {
    const res  = await fetch(`${alertsUrl()}.json`);
    const data = await res.json();
    if (!data) return [];
    return Object.entries(data).map(([id, val]) => ({ id, ...val }));
}

async function getUserSubscriptions(userId) {
    const all = await _getAll();
    return all
      .filter(a => a.userId === userId)
      .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
}

async function getAllSubscriptions() {
    return _getAll();
}

const MAX_SUBSCRIPTIONS = 10;

async function addSubscription(userId, model) {
    // 防止重複訂閱同一機型
  const existing = await getUserSubscriptions(userId);
    if (existing.some(s => s.model === model)) return { duplicate: true };
    if (existing.length >= MAX_SUBSCRIPTIONS) return { limitReached: true };

  await fetch(`${alertsUrl()}.json`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ userId, model, createdAt: new Date().toISOString() }),
  });
    return { duplicate: false };
}

/**
 * 取得所有訂閱特定機型的 userId 清單（scheduler 推播用）
 * 支援 partial match：訂閱 "IPHONE 16 PRO MAX" 可比對到帶容量的 Firebase key
 * @param {string} model - Firebase 完整 key（例如 "IPHONE 16 PRO MAX 1TB"）
 * @returns {string[]}
 */
async function getSubscribersByModel(model) {
    const all = await _getAll();
    const userIds = new Set();
    for (const sub of all) {
          if (model === sub.model || model.startsWith(sub.model)) {
                  userIds.add(sub.userId);
          }
    }
    return [...userIds];
}

async function removeSubscriptionByIndex(userId, index) {
    const subs = await getUserSubscriptions(userId);
    const sub  = subs[index];
    if (!sub) return false;
    await fetch(`${alertsUrl()}/${sub.id}.json`, { method: 'DELETE' });
    return true;
}

module.exports = { addSubscription, removeSubscriptionByIndex, getUserSubscriptions, getAllSubscriptions, getSubscribersByModel };
