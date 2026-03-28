/**
 * 用 Firebase Realtime DB 存訂閱資料
 * 路徑：/epbox_bot_alerts/{pushId} → { userId, model, createdAt }
 */
const fetch = require('node-fetch');

function alertsUrl() {
  const base = (process.env.FIREBASE_URL || '')
    .replace(/\/[^/]+\.json$/, '');
  return `${base}/epbox_bot_alerts`;
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

async function addSubscription(userId, model) {
  await fetch(`${alertsUrl()}.json`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ userId, model, createdAt: new Date().toISOString() }),
  });
}

async function removeSubscriptionByIndex(userId, index) {
  const subs = await getUserSubscriptions(userId);
  const sub  = subs[index];
  if (!sub) return false;
  await fetch(`${alertsUrl()}/${sub.id}.json`, { method: 'DELETE' });
  return true;
}

// 保留相容介面
function initDB() {}

module.exports = { initDB, addSubscription, removeSubscriptionByIndex, getUserSubscriptions, getAllSubscriptions };
