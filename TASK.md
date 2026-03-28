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

## 已完成的修改紀錄

| 日期 | 修改內容 |
|------|---------|
| 2026-03-28 | `cmdQuery` 改為只顯示 EPBOX 自助回收價，移除競業比較列表 |
| 2026-03-28 | Render 改連新 repo `epbox-bot`，設定 Root Directory 為 `line-bot` |

---

## 任務區

### 任務名稱：
取代「設定提醒」功能 → 改為「訂閱價格變動通知」

### 目標：
移除原本需要使用者輸入目標金額的提醒機制，改為只要訂閱某個機型，當 EPBOX 回收價與前一天相比有下跌，就自動推播通知。不需要設定目標金額。

### 涉及檔案：
- `handlers.js` — 修改設定提醒流程（移除容量、通路、金額步驟，改為只選機型訂閱）
- `db.js` — 修改資料結構（訂閱只存 userId + model，不存 vendor/threshold）
- `scheduler.js` — 修改推播邏輯（比對今日與昨日 EPBOX 價格，有跌才推播）
- `firebase.js` — 新增「儲存昨日價格快照」的功能

### 具體修改說明：

**1. db.js**
- 訂閱資料結構改為：`{ userId, model, createdAt }`
- Firebase 路徑維持 `/epbox_bot_alerts`
- 新增函式：`addSubscription(userId, model)`、`removeSubscriptionByIndex(userId, n)`、`getUserSubscriptions(userId)`

**2. handlers.js**
- `cmdSetup` 流程改為只選機型（Quick Reply），選完直接儲存訂閱，不再問容量/通路/金額
- 回應文字改為「✅ 已訂閱！當 [機型] 的 EPBOX 回收價下跌時，我會立即通知你。」
- `cmdList` 改為顯示訂閱的機型清單
- `cmdDelete` 邏輯不變，刪除對應訂閱
- `cmdHelp` Quick Reply 按鈕文字對應更新

**3. firebase.js**
- 新增函式 `savePriceSnapshot()`：把今日所有機型的 EPBOX 價格存到 Firebase `/epbox_price_history/YYYY-MM-DD`
- 新增函式 `getYesterdaySnapshot()`：讀取昨日價格快照

**4. scheduler.js**
- 每天 09:00 執行：
  1. 呼叫 `savePriceSnapshot()` 存今日價格
  2. 讀取昨日快照 `getYesterdaySnapshot()`
  3. 比對每個機型的 EPBOX 價格，找出今日 < 昨日的機型
  4. 查詢所有訂閱這些機型的使用者
  5. 推播通知：「📉 [機型] EPBOX 回收價下跌！昨日 NT$X → 今日 NT$Y」

### 注意事項：
- `sessions` 對話狀態的 step 要對應更新（移除 `storage`、`vendor`、`price` 步驟）
- 舊的 `/epbox_bot_alerts` 資料格式會不相容，需在 `db.js` 處理或直接清空
- LINE 推播用 `client.pushMessage`，需要 userId
- 日期格式統一用 `new Date().toISOString().slice(0, 10)`（YYYY-MM-DD）
- **價格比對邏輯：** 不用「今天 vs 昨天」，改用「現在 vs 上次記錄的價格」。Firebase 路徑 `/epbox_last_known_prices` 存每個機型最後一次記錄的 EPBOX 價格。每次 scheduler 跑時：比對現在價格 vs 上次記錄，有跌才推播並更新記錄。這樣不管資料幾天更新一次，都只在真的有價格變動時通知，不會重複推播。請把 `firebase.js` 的 `savePriceSnapshot` 和 `getYesterdaySnapshot` 改為 `getLastKnownPrices()` 和 `updateLastKnownPrices(data)` 對應新邏輯。

---

## 任務區 2

### 任務名稱：
更新 epbox.html 設置地點頁面

### 目標：
把設置地點頁面改成只顯示高雄、台南、雲林的燦坤 AppleShop 門市，並標註櫃位等級。

### 涉及檔案：
- `epbox.html` — 找到設置地點的資料陣列，替換成以下門市清單

### 具體修改說明：

把設置地點資料換成以下內容：

**AppleShop 3.0**
- 新岡山門市｜高雄市岡山區西東路68號2樓｜11:00–21:30
- 新光華門市｜高雄市苓雅區光華一路160號1樓｜11:00–21:30
- 斗六門市｜雲林縣斗六市中建西路64號｜11:00–21:30

**AppleShop 2.0**
- 自由門市｜高雄市左營區自由二路329號｜11:00–21:30
- 華榮門市｜高雄市鼓山區華榮路345號｜11:00–21:30
- 永華門市｜台南市安平區永華路二段35號｜11:00–21:30
- 中華門市｜台南市永康區中華路149號｜11:00–21:30
- 五甲門市｜高雄市鳳山區五甲二路219號｜11:00–21:30

**AppleShop White+**
- 右昌門市｜高雄市楠梓區德民路836號｜11:00–21:30

每間門市卡片要顯示：
1. 門市名稱（加上 AppleShop 3.0 / 2.0 / White+ 標籤）
2. 地址
3. 營業時間
4. Google Maps 和 Apple Maps 連結（用地址產生）

### 注意事項：
- 移除原本其他縣市的門市資料
- AppleShop 3.0 用藍色標籤、2.0 用綠色標籤、White+ 用紫色標籤（參考截圖配色）
- 營業時間如果原本有各店不同設定，先統一用 11:00–21:30，之後再調整
