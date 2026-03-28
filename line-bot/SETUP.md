# EPBOX LINE Bot 設定教學

---

## 整體流程概覽

```
① 建立 LINE 官方帳號（或使用現有的）
        ↓
② 在 LINE Developers 建立 Messaging API Channel 並綁定
        ↓
③ 部署 Bot 伺服器到 Railway（取得 HTTPS 網址）
        ↓
④ 把網址填回 LINE Webhook URL → 完成
```

---

## Step 1：建立 LINE 官方帳號

> 如果你已經有 LINE 官方帳號，跳到 Step 2。

1. 前往 https://www.linebiz.com/tw/
2. 點「免費開始使用」→ 登入 LINE 帳號
3. 填寫帳號資訊（名稱填「EPBOX 回收提醒」）
4. 建立完成後進入 **LINE Official Account Manager**

---

## Step 2：建立 Messaging API Channel

1. 前往 https://developers.line.biz → 登入
2. 點「Create a Provider」→ 輸入名稱（例：EPBOX）
3. 點「Create a new channel」→ 選擇 **Messaging API**
4. 「LINE Official Account」選擇你在 Step 1 建立的帳號
5. 建立完成後，進入 Channel 頁面記下以下兩個值：

| 項目 | 位置 |
|------|------|
| **Channel Secret** | Basic settings → Channel secret |
| **Channel Access Token** | Messaging API → Issue（點 Issue 產生）|

---

## Step 2.5：開放 Firebase 寫入權限

Bot 需要將提醒資料寫入 Firebase，請至 Firebase Console：
1. Realtime Database → Rules
2. 將規則改為：
```json
{
  "rules": {
    "tradein_prices": { ".read": true, ".write": false },
    "epbox_bot_alerts": { ".read": true, ".write": true }
  }
}
```

---

## Step 3：部署伺服器到 Railway

1. 前往 https://railway.app → 用 GitHub 登入
2. 點「New Project」→「Deploy from GitHub repo」
3. 選擇包含 `line-bot/` 的 repo（或先把這個資料夾推上 GitHub）
4. 進入專案設定 → **Variables**，新增以下三個變數：

```
LINE_CHANNEL_SECRET        = 你的 Channel Secret
LINE_CHANNEL_ACCESS_TOKEN  = 你的 Channel Access Token
FIREBASE_URL               = https://trade-in-5135c-default-rtdb.asia-southeast1.firebasedatabase.app/tradein_prices.json
```

5. Railway 部署完成後，點「Settings」→「Domains」→ 產生網址（例：`https://epbox-bot.up.railway.app`）

---

## Step 4：設定 Webhook URL

1. 回到 LINE Developers Console → 你的 Channel → **Messaging API**
2. Webhook URL 填入：
   ```
   https://epbox-bot.up.railway.app/webhook
   ```
3. 點「Verify」→ 出現 **Success** 表示連線成功
4. 開啟「**Use webhook**」開關

---

## Step 5：關閉自動回覆（重要）

1. 進入 **LINE Official Account Manager**
2. 設定 → 回應設定
3. 關閉「自動回應訊息」和「加入好友的歡迎訊息」（否則 Bot 和官方帳號會搶著回覆）

---

## 完成！測試方式

用手機掃描官方帳號 QR Code 加好友，傳送：

- `設定提醒` → 開始引導流程
- `查詢 iPhone 16 Pro Max` → 查詢目前各通路回收價
- `我的提醒` → 查看已設定的提醒

---

## 費用說明

| 方案 | 月費 | Bot 主動推播則數 |
|------|------|----------------|
| 免費 | $0 | 200 則/月 |
| 輕用量 | $800 | 3,000 則/月 |
| 中用量 | $2,000 | 無限 |

> 用戶主動傳訊息給 Bot 不計費，只有 Bot 主動推播才算。
> 初期用免費方案即可。
