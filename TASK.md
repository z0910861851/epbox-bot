# EPBOX 回收價 LINE Bot — 專案基底說明

## 專案背景
這是一個部署在 Node.js 的 LINE Bot，讓使用者透過 LINE 查詢 iPhone 各通路回收價，
並可設定價格提醒，當 EPBOX 回收價跌破目標金額時自動推播通知。

資料來源為 Firebase Realtime Database，回收價由外部更新，Bot 只負責讀取與通知。

---

## 專案結構

```
trade/
├── epbox.html              ← 前端查價網頁（獨立，不影響 Bot）
└── line-bot/
    ├── index.js            ← Webhook 入口，接收 LINE 事件並分派
    ├── handlers.js         ← 所有對話邏輯（主要修改對象）
    ├── firebase.js         ← 從 Firebase 讀取回收價
    ├── db.js               ← 讀寫使用者提醒設定
    ├── scheduler.js        ← 每天 09:00 定時檢查並推播
    ├── package.json
    └── .env                ← 機密設定（不進 Git）
```

---

## Firebase 資料結構

**回收價路徑：** `/tradein_prices/prices`

```json
{
  "IPHONE 16 PRO MAX 1TB": {
    "trade in價": 24090,
    "APPLE BAR": 27000,
    "台哥大": 30000,
    "遠傳": 30000,
    "STUDIO": 27200,
    "神腦": 21900,
    "台北101": 22800,
    "地標": 30000,
    "米可": 30500,
    "model": "IPHONE 16 PRO MAX",
    "平均回收價": 27000
  }
}
```

> ⚠️ EPBOX 自助回收的欄位名稱是 `"trade in價"`（有空格，注意不要打錯）

**提醒設定路徑：** `/epbox_bot_alerts`

---

## handlers.js 函式對照表

| 函式 | 功能 |
|------|------|
| `handleEvent` | 主入口，判斷指令並路由 |
| `cmdSetup` | 設定提醒第一步（選機型） |
| `handleSetup` | 設定流程對話（容量→通路→金額） |
| `cmdList` | 顯示我的提醒清單 |
| `cmdDelete` | 刪除指定提醒 |
| `cmdQuery` | 查詢回收價，回傳 Flex Message |
| `cmdCancel` | 取消目前流程 |
| `cmdHelp` | 預設說明訊息 |

---

## VENDORS 對照表（欄位 key → 顯示名稱）

```js
const VENDORS = {
  'trade in價': 'EPBOX 自助回收',
  'APPLE BAR':  'Apple Bar',
  '台哥大':     '台哥大',
  '遠傳':       '遠傳',
  'STUDIO':     'Studio A',
  '神腦':       '神腦',
  '台北101':    '台北101',
  '地標':       '地標',
  '米可':       '米可',
};
```

---

## 已完成的修改紀錄

| 日期 | 修改內容 |
|------|---------|
| 2026-03-28 | `cmdQuery` 改為只顯示 EPBOX 自助回收價，移除競業比較列表 |

---

## 注意事項

- `.env` 包含 LINE Channel Secret、Access Token、Firebase 設定，**絕對不能進 Git**
- `node_modules/` 不進 Git，clone 後需執行 `npm install`
- Firebase 讀取在 `firebase.js`，修改欄位邏輯時以此為準
- Flex Message 格式請參考 LINE 官方文件：https://developers.line.biz/flex-simulator/

---

## 任務區（每次新需求填這裡）

### 任務名稱：
### 目標：
### 涉及檔案：
### 具體修改說明：
### 注意事項：
