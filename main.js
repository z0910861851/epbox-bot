
/* ════════════════════════════════
   CONFIG
════════════════════════════════ */
const FB_URL = "https://trade-in-5135c-default-rtdb.asia-southeast1.firebasedatabase.app/tradein_prices.json";

const VENDORS = ["APPLE BAR", "台哥大", "遠傳", "台北101", "STUDIO", "地標", "米可", "神腦", "trade in價"];
const AVG_VENDORS = new Set(["APPLE BAR", "台哥大", "遠傳", "台北101", "STUDIO", "神腦"]);

/* ── Inline SVG helper (Lucide-style, stroke-only) ── */
function ic(path, color = "currentColor", size = 18) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}
const P = {
  store:    '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  signal:   '<line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>',
  globe:    '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
  palette:  '<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
  mapPin:   '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  heart:    '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  cpu:      '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>',
  bot:      '<rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/>',
  barChart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  crown:    '<path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>',
  upDown:   '<path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>',
  info:     '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  map:      '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>',
  nav:      '<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
  phone:    '<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
  bag:      '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  clock:     '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  arrowRight:'<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  lineChart: '<line x1="3" y1="3" x2="3" y2="21"/><line x1="3" y1="21" x2="21" y2="21"/><polyline points="7 16 11 10 15 14 19 8"/>',
  trash:     '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
  bell:      '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  checkCircle:'<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  alertTri:  '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
};

const VENDOR_ICONS = {
  "APPLE BAR":  P.store,
  "台哥大":     P.store,
  "遠傳":       P.store,
  "台北101":    P.store,
  "STUDIO":     P.store,
  "地標":       P.store,
  "米可":       P.store,
  "神腦":       P.store,
  "trade in價": P.bot,
};
const VENDOR_COLORS = {
  "APPLE BAR": "#1d1d1f", "台哥大": "#e60012", "遠傳": "#00a0e9",
  "台北101": "#8B4513", "STUDIO": "#9b59b6", "地標": "#e67e22",
  "米可": "#8e44ad", "神腦": "#2c3e50", "trade in價": "#ff6b00"
};
const VENDOR_DISPLAY_NAMES = {
  "trade in價": "EPBOX 自助回收",
};

const VENDOR_NOTES = {
  "APPLE BAR": "Apple 授權經銷商", "台哥大": "台灣大哥大門市",
  "遠傳": "遠傳電信門市", "台北101": "台北101門市",
  "STUDIO": "Studio A 門市", "地標": "地標數位門市",
  "米可": "米可數位門市", "神腦": "神腦國際門市",
  "trade in價": "EPBOX 自助回收機參考價"
};

/* ════════════════════════════════
   STATE
════════════════════════════════ */
let allModels = [];      // [{name, prices:{vendor:price}}]
let selectedBase = "";
let selectedStorage = 0;
let batteryGood = true;
let appCondition    = 'perfect'; // 'perfect' | 'scratched' | 'damaged' | 'both'
let condScratch     = false;
let condDamage      = false;
let phoneDestination = 'none';   // 'none' | 'family'

const COND_MULT        = { perfect: 1.0, scratched: 0.9,  damaged: 0.6,  both: 0.5  }; // EPBOX 倍率
const VENDOR_COND_MULT = { perfect: 1.0, scratched: 0.75, damaged: 0.35, both: 0.35 }; // 外部通路（轉賣商）倍率
const COND_LABEL = { perfect: '外觀完美', scratched: '有刮痕', damaged: '螢幕損壞', both: '刮痕+螢幕損壞' };
const COND_EMOJI = { perfect: '✨', scratched: '🔸', damaged: '🔴', both: '🔸🔴' };
let lastUpdated = "";
let lastKnownPrices = {}; // { modelName: price } from Firebase

/* ════════════════════════════════
   HELPERS
════════════════════════════════ */
function baseName(name) {
  return name.replace(/\s+\d+(GB|TB)/gi, "").trim();
}
function storageGB(name) {
  const u = name.toUpperCase();
  if (u.includes("1TB")) return 1024;
  const m = u.match(/(\d+)GB/);
  return m ? parseInt(m[1]) : 0;
}
function storageLabel(gb) { return gb >= 1024 ? "1TB" : `${gb}GB`; }
function fmt(n) { return n.toLocaleString(); }

function generationNumber(name) {
  const u = name.toUpperCase();
  if (u.includes("XS MAX")) return 109;
  if (u.includes("XS"))     return 108;
  if (u.includes("XR"))     return 107;
  if (u.includes("SE") && (u.includes("2022") || u.includes("第3") || u.includes("3RD"))) return 106;
  if (u.includes("SE"))     return 105;
  const nums = [...u.matchAll(/(\d+)/g)].map(m => parseInt(m[1])).filter(n => n >= 11 && n <= 99);
  return (nums[0] ?? 0) * 10;
}
function modelSubRank(name) {
  const u = name.toUpperCase();
  if (u.includes("PRO MAX")) return 6;
  if (u.includes("PRO"))     return 5;
  if (u.includes("PLUS"))    return 4;
  if (u.includes("MINI"))    return 2;
  if (u.endsWith(" E") || u.includes(" E ")) return 1;
  return 3;
}

function averagePrice(prices) {
  const vals = Object.entries(prices)
    .filter(([v, p]) => AVG_VENDORS.has(v) && p > 0)
    .map(([, p]) => p);
  if (!vals.length) return null;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function getSeriesNum(name) {
  const u = name.toUpperCase();
  const m = u.match(/IPHONE\s+(\d+)/);
  return m ? parseInt(m[1]) : 0;
}

/* ════════════════════════════════
   FETCH from Firebase
════════════════════════════════ */
async function fetchData() {
  try {
    const [r, lkpRes] = await Promise.all([
      fetch(FB_URL),
      fetch("https://trade-in-5135c-default-rtdb.asia-southeast1.firebasedatabase.app/epbox_last_known_prices.json"),
    ]);
    if (!r.ok) throw new Error("HTTP " + r.status);
    const json = await r.json();
    if (lkpRes.ok) { const lkp = await lkpRes.json(); if (lkp) lastKnownPrices = lkp; }

    // Parse last updated
    if (json?.meta?.lastUpdated) {
      const d = new Date(json.meta.lastUpdated);
      const tw = new Intl.DateTimeFormat("zh-TW", {
        timeZone: "Asia/Taipei",
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit"
      }).format(d);
      lastUpdated = tw;
      const el1 = document.getElementById("last-updated-1"); if (el1) el1.textContent = "更新時間：" + tw;
      const el2 = document.getElementById("last-updated-2"); if (el2) el2.textContent = "更新時間：" + tw;
      const el3 = document.getElementById("last-updated-calc"); if (el3) el3.textContent = "更新時間：" + tw;
    }

    // Parse prices
    const pricesData = json?.prices ?? {};
    const parsed = [];
    const KEY_MAP = {
      "Trade in價": "trade in價",
      "STUDIO A": "STUDIO",
      "神腦_門市回收價": "神腦"
    };
    for (const entry of Object.values(pricesData)) {
      if (!entry?.model) continue;
      const name = entry.model;
      if (!name.toUpperCase().includes("IPHONE")) continue;
      const prices = {};
      // 先把 entry 的 key 正規化
      const normalizedEntry = {};
      for (const [k, v] of Object.entries(entry)) {
        normalizedEntry[KEY_MAP[k] ?? k] = v;
      }
      for (const v of VENDORS) {
        const val = normalizedEntry[v];
        if (val != null && val > 0) prices[v] = Number(val);
      }
      parsed.push({ name, prices });
    }

    // Sort
    allModels = parsed.sort((a, b) => {
      const gA = generationNumber(a.name), gB = generationNumber(b.name);
      if (gA !== gB) return gB - gA;
      const rA = modelSubRank(a.name), rB = modelSubRank(b.name);
      if (rA !== rB) return rB - rA;
      return storageGB(a.name) - storageGB(b.name);
    });

    saveHistorySnapshot(allModels);
    initCompare();
    computeBestData();
    renderBestAll();
    checkAlerts(allModels);
    updateHeroBadges();
  } catch (e) {
    console.error(e);
    document.getElementById("compare-result").innerHTML =
      '<div class="no-result">⚠️ 無法載入資料，請確認網路連線後重新整理</div>';
  }
}

/* ════════════════════════════════
   Tab 1: Compare
════════════════════════════════ */
function uniqueBaseNames() {
  const seen = new Set();
  return allModels.filter(m => {
    const b = baseName(m.name);
    if (seen.has(b)) return false;
    seen.add(b); return true;
  }).map(m => baseName(m.name));
}

function availableStorages(base) {
  return [...new Set(
    allModels.filter(m => baseName(m.name) === base).map(m => storageGB(m.name)).filter(g => g > 0)
  )].sort((a, b) => a - b);
}

function getModel(base, gb) {
  if (!gb) return allModels.find(m => baseName(m.name) === base);
  return allModels.find(m => baseName(m.name) === base && storageGB(m.name) === gb);
}

function initCompare() {
  const sel = document.getElementById("compare-model");
  sel.innerHTML = '<option value="">── 請選擇機型 ──</option>';
  uniqueBaseNames().forEach(b => {
    const o = document.createElement("option");
    o.value = b; o.textContent = b; sel.appendChild(o);
  });
  // Auto-select first
  if (allModels.length) {
    const first = baseName(allModels[0].name);
    sel.value = first;
    onModelChange();
  }
  initCalc();
  initAlerts();
}

function setBattery(good) {
  batteryGood = good;

  // 同步 Tab 1 電池 pills
  document.querySelectorAll('#battery-pills .pill').forEach(p => {
    const isGoodPill = p.textContent.includes('≥');
    p.classList.toggle('active', isGoodPill === good);
  });

  // 同步 Tab 5 電池 pills
  document.querySelectorAll('.sp-batt-pill').forEach(b => {
    const isGoodBtn = b.dataset.good === '1';
    const isActive  = isGoodBtn === good;
    b.style.border     = isActive ? '2px solid var(--ep-green)' : '2px solid var(--border)';
    b.style.background = isActive ? '#edfaf3' : '#fff';
    b.style.color      = isActive ? 'var(--ep-green)' : 'var(--text-gray)';
    b.style.fontWeight = isActive ? '700' : '500';
  });

  renderCompare();
  generateSalesScript();
}

function getBatteryDeduction(modelName) {
  if (batteryGood) return 0;
  // iPhone 14+：原廠 NT$2,290 / 副廠 ~NT$1,000 → 中位數 NT$1,600
  // iPhone 13-：原廠 NT$1,590 / 副廠 ~NT$1,000 → 中位數 NT$1,300
  return getSeriesNum(modelName) >= 14 ? 1600 : 1300;
}

function onModelChange() {
  selectedBase = document.getElementById("compare-model").value;
  const batteryRow = document.getElementById("battery-row");
  if (!selectedBase) {
    document.getElementById("storage-row").style.display = "none";
    batteryRow.style.display = "none";
    renderCompare();
    return;
  }
  const storages = availableStorages(selectedBase);
  const row = document.getElementById("storage-row");
  if (storages.length > 1) {
    row.style.display = "block";
    const pills = document.getElementById("storage-pills");
    pills.innerHTML = "";
    selectedStorage = storages[0];
    storages.forEach(gb => {
      const btn = document.createElement("button");
      btn.className = "pill" + (gb === selectedStorage ? " active" : "");
      btn.textContent = storageLabel(gb);
      btn.onclick = () => { selectedStorage = gb; document.querySelectorAll("#storage-pills .pill").forEach(p => p.classList.remove("active")); btn.classList.add("active"); renderCompare(); };
      pills.appendChild(btn);
    });
  } else {
    row.style.display = "none";
    selectedStorage = storages[0] ?? 0;
  }
  batteryRow.style.display = "block";
  const conditionRow = document.getElementById("condition-row");
  if (conditionRow) conditionRow.style.display = "block";
  renderCompare();
}

function renderCompare() {
  const container = document.getElementById("compare-result");
  if (!selectedBase) { container.innerHTML = '<div class="no-result" style="padding:40px 0">請選擇機型</div>'; return; }
  const model = getModel(selectedBase, selectedStorage);
  if (!model) { container.innerHTML = '<div class="no-result">找不到此機型資料</div>'; return; }

  const prices = model.prices;
  const deduction = getBatteryDeduction(model.name);

  // EPBOX 套 COND_MULT，外部通路套 VENDOR_COND_MULT（轉賣商對外觀扣更多）
  const condMult       = COND_MULT[appCondition] ?? 1;
  const vendorCondMult = VENDOR_COND_MULT[appCondition] ?? 1;
  const adjustedPrices = {};
  for (const [v, p] of Object.entries(prices)) {
    if (v === "trade in價") {
      adjustedPrices[v] = Math.round(p * condMult);
    } else {
      adjustedPrices[v] = Math.round(Math.max(0, p - deduction) * vendorCondMult);
    }
  }

  const avg = averagePrice(adjustedPrices);
  const epboxPrice = adjustedPrices["trade in價"] || null;
  const vendorPrices = Object.entries(adjustedPrices)
    .filter(([v]) => v !== "trade in價")
    .map(([v, p]) => ({ vendor: v, price: p }))
    .sort((a, b) => b.price - a.price);
  const maxP = vendorPrices.length ? vendorPrices[0].price : 1;
  const diff = (epboxPrice && avg) ? epboxPrice - avg : null;

  let html = "";

  // 電池 < 80% 優勢橫幅
  if (!batteryGood) {
    html += `
    <div style="background:linear-gradient(135deg,#1a1a1a,#2d2d2d);border-radius:16px;padding:14px 16px;margin-bottom:12px;display:flex;align-items:center;gap:12px;">
      <div style="font-size:24px;flex-shrink:0;">🔋</div>
      <div>
        <div style="font-size:13px;font-weight:800;color:#30d158;">EPBOX 不扣換電池費用！</div>
        <div style="font-size:11px;color:#aaa;margin-top:2px;">其他通路已扣除換電池估算費用 NT$${fmt(deduction)}，EPBOX 不受影響</div>
      </div>
    </div>`;
  }

  // EPBOX 合併卡片
  if (epboxPrice) {
    const epDelta = deltaBadge(getPriceDelta(model.name, 'trade in價'));
    const adjTotal = epboxPrice;
    let cardHtml = '<div style="background:linear-gradient(135deg,#ff6b00,#ff9a3c);border-radius:18px;padding:18px 20px;display:flex;align-items:center;gap:16px;margin-bottom:12px;box-shadow:0 6px 20px rgba(255,107,0,0.3);">';
    cardHtml += '<div style="width:48px;height:48px;background:rgba(255,255,255,0.2);border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">' + ic(P.bot,'#fff',24) + '</div>';
    cardHtml += '<div style="flex:1;">';
    cardHtml += '<div style="font-size:12px;color:rgba(255,255,255,0.85);font-weight:500;">EPBOX 自助回收機 ' + epDelta + (!batteryGood ? ' · <span style="color:#a0ffca;font-weight:700;">電池不扣款</span>' : '') + '</div>';
    cardHtml += '<div style="font-size:30px;font-weight:900;color:#fff;font-variant-numeric:tabular-nums;">NT$' + fmt(adjTotal) + '</div>';
    cardHtml += '</div>';
    cardHtml += '<div style="background:rgba(255,255,255,0.2);color:#fff;border-radius:10px;padding:8px 14px;text-align:center;font-size:12px;font-weight:700;flex-shrink:0;line-height:1.8;">';
    cardHtml += COND_EMOJI[appCondition] + ' ' + COND_LABEL[appCondition] + '<br>';
    cardHtml += '× ' + Math.round(condMult * 100) + '% 機況<br>';
    cardHtml += '× 110% 含補貼';
    cardHtml += '</div>';
    cardHtml += '</div>';
    html += cardHtml;
  }

  // Average banner
  if (avg) {
    html += `
    <div class="avg-banner">
      <div style="display:flex;align-items:center;justify-content:center;width:48px;height:48px;background:rgba(255,255,255,0.2);border-radius:14px;flex-shrink:0">${ic(P.barChart,'#fff',24)}</div>
      <div>
        <div class="label">6家通路平均回收價</div>
        <div class="price">NT$${fmt(avg)}</div>
      </div>
      <div class="tag">Apple Bar · 台哥大<br>遠傳 · 101 · STUDIO · 神腦</div>
    </div>`;
  }

  // Vendor prices
  if (vendorPrices.length) {
    const uid = 'vlist_' + Date.now();
    const deductNote = !batteryGood ? `<span style="font-size:10px;color:#e74c3c;margin-left:6px;">已扣換電池費 $${fmt(deduction)}</span>` : '';
    let rows = vendorPrices.map(({ vendor, price }, i) => {
      const color = VENDOR_COLORS[vendor] ?? "#86868b";
      const dn = !batteryGood ? `<span style="font-size:10px;color:#e74c3c;display:block;">已扣換電池費 $${fmt(deduction)}</span>` : '';
      return `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 4px;${i < vendorPrices.length-1 ? 'border-bottom:1px solid var(--border);' : ''}">
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;"></div>
          <div>
            <div style="font-size:14px;font-weight:500;color:var(--text-dark);">${vendor}</div>
            <div style="font-size:11px;color:var(--text-gray);">${VENDOR_NOTES[vendor] ?? ''}${dn}</div>
          </div>
        </div>
        <div style="font-size:15px;font-weight:700;color:${i===0 ? '#ff9500' : 'var(--text-dark)'};">$${fmt(price)}</div>
      </div>`;
    }).join('');
    html += `
    <div class="vendor-header" onclick="(function(el){
      const body = document.getElementById('${uid}');
      const arrow = el.querySelector('.vlist-arrow');
      const isOpen = body.style.display !== 'none';
      body.style.display = isOpen ? 'none' : 'block';
      arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
    })(this)" style="cursor:pointer;user-select:none;">
      <span class="title">各通路回收報價</span>
      <span class="vlist-arrow" style="transition:transform 0.2s;display:inline-block;font-size:12px;color:var(--text-gray);">▼</span>
    </div>
    <div id="${uid}" style="display:none;padding:0 4px 12px;">
      ${rows}
    </div>`;
  }

  // Diff
  if (diff !== null) {
    const sign = diff >= 0 ? "+" : "";
    html += `
    <div class="diff-card">
      <div class="diff-icon">${ic(P.upDown,'#5e5ce6',20)}</div>
      <div>
        <div class="diff-label">EPBOX 與均價差異</div>
        <div class="diff-sub">EPBOX $${fmt(epboxPrice)} vs 均價 $${fmt(avg)}</div>
      </div>
      <div class="diff-val">${sign}$${fmt(diff)}</div>
    </div>`;
  }

  // Disclaimer
  const batteryNote = !batteryGood ? `換電池費用以原廠 / 副廠中位數估算（NT$${fmt(deduction)}），實際扣款依各通路現場而定。` : '';
  html += `<div class="disclaimer" style="gap:8px">${ic(P.info,'#86868b',14)} 以上為參考估算，實際回收價依各通路現場評估、機況及活動優惠而不同。${batteryNote}</div>`;
  container.innerHTML = html;
}

/* ════════════════════════════════
   Tab 2: EPBOX Table
════════════════════════════════ */
/* ════════════════════════════════
   Tab 2: Best Deals
════════════════════════════════ */
const BD_OTHER_KEYS = ['APPLE BAR','STUDIO','台北101','台哥大','地標'];
let bdAllData = [];
let bdCurrentFilter = 'all';
let bdReady = false;

function computeBestData() {
  bdAllData = allModels.map(m => {
    const epbox = Math.round(Number(m.prices['trade in價']) || 0);
    const others = BD_OTHER_KEYS.map(k => Number(m.prices[k]) || 0).filter(v => v > 0);
    const maxOther = others.length ? Math.max(...others) : 0;
    const diff = epbox - maxOther;
    return { model: m.name, epbox, maxOther, diff };
  }).filter(d => d.epbox > 0 && d.maxOther > 0);
  bdAllData.sort((a,b) => b.diff - a.diff || b.epbox - a.epbox);
  bdReady = true;
}

function getBdModelSeries(model) {
  const m = model.toUpperCase();
  if (m.includes('IPHONE 16')) return 'iphone16';
  if (m.includes('IPHONE 15')) return 'iphone15';
  if (m.includes('IPHONE 14')) return 'iphone14';
  if (m.includes('IPHONE 13')) return 'iphone13';
  if (m.includes('IPHONE 12')) return 'iphone12';
  return 'older';
}

function setBestFilter(filter, btn) {
  bdCurrentFilter = filter;
  document.querySelectorAll('.bd-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderBestAll();
}

function bdFiltered(arr) {
  if (bdCurrentFilter === 'all') return arr;
  return arr.filter(d => getBdModelSeries(d.model) === bdCurrentFilter);
}

function renderBestAll() {
  if (!bdReady) return;
  const goodEl = document.getElementById("bd-good-section");
  const lowEl = document.getElementById("bd-low-section");
  if (!goodEl || !lowEl) return;
  const good  = bdFiltered(bdAllData.filter(d => d.diff >= 0)); // wins + ties
  const lower = bdFiltered(bdAllData.filter(d => d.diff < 0));

  if (good.length) {
    goodEl.style.display = 'block';
    document.getElementById('bd-good-count').textContent = `${good.length} 款`;
    document.getElementById('bd-good-list').innerHTML = good.map(d => bdRow(d)).join('');
  } else { goodEl.style.display = 'none'; }

  if (lower.length) {
    lowEl.style.display = 'block';
    document.getElementById('bd-low-count').textContent = `${lower.length} 款`;
    document.getElementById('bd-low-list').innerHTML = lower.map(d => bdRow(d)).join('');
  } else { lowEl.style.display = 'none'; }
}

function bdRow(d) {
  const modelDisplay = d.model.replace('IPHONE ', 'iPhone ');
  const parts = modelDisplay.match(/^(iPhone \d+(?:\s+Pro(?:\s+Max)?)?(?:\s+Plus)?(?:\s+mini)?)\s+(.+)$/i);
  const name = parts ? parts[1] : modelDisplay;
  const cap  = parts ? parts[2] : '';

  let rowClass, subClass, subText;
  if (d.diff > 0) {
    rowClass = 'win';  subClass = 'win';
    subText = `比其他通路多 NT$${Math.round(d.diff).toLocaleString()}`;
  } else if (d.diff === 0) {
    rowClass = 'tie';  subClass = 'tie';
    subText = '各通路同價，EPBOX 更方便';
  } else {
    rowClass = 'low';  subClass = 'low';
    subText = `其他通路多 NT$${Math.round(Math.abs(d.diff)).toLocaleString()}`;
  }

  return `
    <div class="bd-row ${rowClass}">
      <div class="bd-row-left">
        <div class="bd-row-model">${name}<span class="bd-row-cap">${cap}</span></div>
        <div class="bd-row-sub ${subClass}">${subText}</div>
      </div>
      <div class="bd-row-right">
        <div class="bd-row-price">NT$${d.epbox.toLocaleString()}<small> /台</small></div>
      </div>
    </div>`;
}

function toggleBdLower() {
  const wrap  = document.getElementById('bd-low-list-wrap');
  const arrow = document.getElementById('bd-low-arrow');
  wrap.classList.toggle('open');
  arrow.classList.toggle('open');
}

/* ════════════════════════════════
   Tab 3: Locations
════════════════════════════════ */
const LOCATIONS = [
  // AppleShop 3.0
  { store: "燦坤 新岡山門市", city: "高雄市", district: "岡山區", addr: "高雄市岡山區溪東路68號2樓", appleShopLevel: "3.0", hours: "11:00–21:30" },
  { store: "燦坤 新光華門市", city: "高雄市", district: "苓雅區", addr: "高雄市苓雅區光華一路160號1樓", appleShopLevel: "3.0", hours: "11:00–21:30" },
  { store: "燦坤 斗六門市", city: "雲林縣", district: "斗六市", addr: "雲林縣斗六市中建西路64號", appleShopLevel: "3.0", hours: "11:00–21:30" },
  // AppleShop 2.0
  { store: "燦坤 華榮門市", city: "高雄市", district: "鼓山區", addr: "高雄市鼓山區華榮路345號", appleShopLevel: "2.0", hours: "11:00–21:30" },
  { store: "燦坤 永華門市", city: "台南市", district: "安平區", addr: "台南市安平區永華路二段35號", appleShopLevel: "2.0", hours: "11:00–21:30" },
  { store: "燦坤 中華門市", city: "台南市", district: "永康區", addr: "台南市永康區中華路149號", appleShopLevel: "2.0", hours: "11:00–21:30" },
  { store: "燦坤 五甲門市", city: "高雄市", district: "鳳山區", addr: "高雄市鳳山區五甲二路219號", appleShopLevel: "2.0", hours: "11:00–21:30" },
  // AppleShop White+
  { store: "燦坤 右昌門市", city: "高雄市", district: "楠梓區", addr: "高雄市楠梓區德民路836號", appleShopLevel: "White+", hours: "11:00–21:30" },
  // 其他
  { store: "燦坤 內湖店",       city: "台北市", district: "內湖區", addr: "台北市內湖區堤頂大道一段331號",       hours: "11:00–21:30" },
  { store: "燦坤 公益店",       city: "台中市", district: "南屯區", addr: "台中市南屯區公益路二段125號",         hours: "11:00–21:30" },
  { store: "燦坤 新莊店",       city: "新北市", district: "新莊區", addr: "新北市新莊區中平路108號",             hours: "11:00–21:30" },
  { store: "燦坤 基隆旗艦店",   city: "基隆市", district: "中正區", addr: "基隆市中正區義一路18號",              hours: "11:00–21:30" },
  { store: "燦坤 新文心店",     city: "台中市", district: "北屯區", addr: "台中市北屯區文心路四段671號",         hours: "11:00–21:30" },
  { store: "燦坤 新豐原旗艦店", city: "台中市", district: "豐原區", addr: "台中市豐原區大社街39號",              hours: "11:00–21:30" },
  { store: "燦坤 桃園旗艦店",   city: "桃園市", district: "桃園區", addr: "桃園市桃園區中山東路51號",            hours: "11:00–21:30" },
  { store: "燦坤 光復店",       city: "新竹市", district: "東區",   addr: "新竹市東區光復路二段194巷19號",       hours: "11:00–21:30" },
  { store: "燦坤 大甲店",       city: "台中市", district: "大甲區", addr: "台中市大甲區民生路13號",              hours: "11:00–21:30" },
  { store: "燦坤 信義店",       city: "台北市", district: "信義區", addr: "台北市信義區信義路四段375號",         hours: "11:00–21:30" },
  { store: "燦坤 林口文化店",   city: "新北市", district: "林口區", addr: "新北市林口區文化二路一段269號2樓",    hours: "11:00–21:30" },
  { store: "燦坤 北投新旗艦店", city: "台北市", district: "北投區", addr: "台北市北投區大業路452巷6號B1",        hours: "11:00–21:30" },
];

function renderLocations() {
  const sel = document.getElementById("loc-select");
  const detail = document.getElementById("loc-detail");
  const countEl = document.getElementById("loc-count");
  if (countEl) countEl.textContent = `共 ${LOCATIONS.length} 間`;
  // 初始化選單（只執行一次）
  if (sel.options.length <= 1) {
    LOCATIONS.forEach((l, i) => {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = "🏪 " + l.store;
      sel.appendChild(opt);
    });
  }
  const idx = sel.value;
  if (idx === "") { detail.innerHTML = ""; return; }
  const l = LOCATIONS[parseInt(idx)];
  const googleUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(l.store + " " + l.addr)}`;
  const appleUrl  = `maps://maps.apple.com/?q=${encodeURIComponent(l.store)}&near=${encodeURIComponent(l.addr)}`;
  const LEVEL_TAG = {
    "3.0":    `<span class="loc-tag tag-blue">AppleShop 3.0</span>`,
    "2.0":    `<span class="loc-tag tag-green">AppleShop 2.0</span>`,
    "White+": `<span class="loc-tag tag-purple">AppleShop White+</span>`,
  };
  const levelTag = LEVEL_TAG[l.appleShopLevel] ?? "";
  detail.innerHTML = `
    <div class="loc-card">
      <div class="loc-icon">${ic(P.store,"#00b96b",20)}</div>
      <div style="flex:1">
        <div class="loc-store">${l.store}</div>
        <div class="loc-addr">${l.addr}</div>
        <div class="loc-tags">
          ${levelTag}
          <span class="loc-tag tag-gray">${ic(P.clock,"#555",11)} ${l.hours}</span>
        </div>
        <div>
          <a class="nav-btn" href="${googleUrl}" target="_blank" rel="noopener">${ic(P.map,"#fff",13)} Google Maps</a>
          <a class="nav-btn nav-btn-apple" href="${appleUrl}">${ic(P.nav,"#fff",13)} Apple Maps</a>
        </div>
      </div>
    </div>`;
}

/* ════════════════════════════════
   NEW IPHONES
════════════════════════════════ */
const NEW_IPHONES = [
  { name: "iPhone 17",         price: 29900, best: false },
  { name: "iPhone Air",        price: 36900, best: false },
  { name: "iPhone 17 Pro",     price: 39900, best: true  },
  { name: "iPhone 17 Pro Max", price: 44900, best: true  },
];

/* ════════════════════════════════
   PRICE HISTORY  (localStorage)
════════════════════════════════ */
function todayKey() { return new Date().toISOString().slice(0, 10); }

function getHistory() {
  try { return JSON.parse(localStorage.getItem('epbox_ph') || '{}'); } catch { return {}; }
}
function saveHistorySnapshot(models) {
  const h = getHistory();
  const today = todayKey();
  if (h[today]) return; // already saved today
  h[today] = {};
  models.forEach(m => { h[today][m.name] = { ...m.prices }; });
  // keep last 60 days
  const keys = Object.keys(h).sort();
  if (keys.length > 60) keys.slice(0, keys.length - 60).forEach(k => delete h[k]);
  localStorage.setItem('epbox_ph', JSON.stringify(h));
}

function getPriceDelta(modelName, vendor) {
  if (vendor !== "trade in價") return null;
  const m = allModels.find(x => x.name === modelName);
  const cur = m?.prices?.["trade in價"];
  const old = lastKnownPrices[modelName];
  if (!cur || !old) return null;
  return cur - old;
}

function deltaBadge(delta) {
  if (delta === null || delta === 0) return '';
  if (delta > 0) return `<span class="delta-up">▲ +$${fmt(Math.abs(delta))}</span>`;
  return `<span class="delta-down">▼ −$${fmt(Math.abs(delta))}</span>`;
}

/* ════════════════════════════════
   CALCULATOR  (Tab 3)
════════════════════════════════ */
let calcBase = '', calcStorage = 0;
let trendChartInstance = null;

function initCalc() {
  if (!document.getElementById('calc-model')) return;
  const sel = document.getElementById('calc-model');
  sel.innerHTML = '<option value="">── 請選擇 ──</option>';
  uniqueBaseNames().forEach(b => {
    const o = document.createElement('option');
    o.value = b; o.textContent = b; sel.appendChild(o);
  });
}

function onCalcModelChange() {
  calcBase = document.getElementById('calc-model').value;
  const row = document.getElementById('calc-storage-row');
  if (!calcBase) { row.style.display = 'none'; renderCalculator(); return; }
  const storages = availableStorages(calcBase);
  if (storages.length > 1) {
    row.style.display = 'block';
    const pills = document.getElementById('calc-storage-pills');
    pills.innerHTML = '';
    calcStorage = storages[0];
    storages.forEach(gb => {
      const btn = document.createElement('button');
      btn.className = 'pill' + (gb === calcStorage ? ' active' : '');
      btn.textContent = storageLabel(gb);
      btn.onclick = () => {
        calcStorage = gb;
        document.querySelectorAll('#calc-storage-pills .pill').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        renderCalculator();
      };
      pills.appendChild(btn);
    });
  } else {
    row.style.display = 'none';
    calcStorage = storages[0] ?? 0;
  }
  renderCalculator();
}

function renderCalculator() {
  const container = document.getElementById('calc-result');
  if (!calcBase) { container.innerHTML = '<div class="no-result" style="padding:40px 0">請選擇舊機型號</div>'; return; }
  const model = getModel(calcBase, calcStorage);
  if (!model) { container.innerHTML = '<div class="no-result">找不到此機型資料</div>'; return; }

  const tradeIn = model.prices['trade in價'] ?? 0;
  const avg = averagePrice(model.prices) ?? 0;
  const bestEntry = Object.entries(model.prices).filter(([v]) => v !== 'trade in價').sort((a,b)=>b[1]-a[1])[0];
  const epDelta = deltaBadge(getPriceDelta(model.name, 'trade in價'));

  let html = '';

  // ── Value banner ──
  html += `
  <div class="avg-banner" style="margin-bottom:14px;">
    <div style="width:52px;height:52px;background:rgba(255,255,255,0.2);border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
      ${ic(P.phone,'#fff',26)}
    </div>
    <div style="flex:1">
      <div class="label" style="margin-bottom:2px">${model.name}</div>
      <div class="price">NT$${fmt(tradeIn)}</div>
      <div style="font-size:11px;color:rgba(255,255,255,0.65);margin-top:2px;">EPBOX 自助回收參考價 ${epDelta}</div>
    </div>
    ${avg ? `<div class="tag" style="text-align:center">6家均價<br><strong>$${fmt(avg)}</strong></div>` : ''}
  </div>`;

  // ── Gap cards ──
  html += `<div style="font-size:14px;font-weight:700;margin-bottom:10px;padding:0 2px;display:flex;align-items:center;gap:6px">
    ${ic(P.arrowRight,'var(--text-dark)',15)} 換到新 iPhone 需補差價
  </div>
  <div class="calc-result-grid">`;

  NEW_IPHONES.forEach(({ name, price, best }) => {
    const gap     = price - tradeIn;
    const monthly = Math.round(gap / 12);
    const daily   = Math.round(gap / 365);
    html += `
    <div class="calc-card${best ? ' best' : ''}">
      <div class="calc-model">${name}</div>
      <div style="font-size:11px;margin-bottom:4px;opacity:.7">定價 NT$${fmt(price)}</div>
      <div class="calc-gap">補 $${fmt(gap)}</div>
      <div class="calc-meta">
        月付 <strong>$${fmt(monthly)}</strong>・日付 <strong class="calc-daily">$${daily}</strong>
      </div>
    </div>`;
  });
  html += `</div>`;

  // ── Trend chart ──
  const history  = getHistory();
  const histKeys = Object.keys(history).sort();
  html += `
  <div class="card" style="margin-top:4px;">
    <div class="card-title" style="margin-bottom:12px">${ic(P.lineChart,'var(--apple-blue)',16)} 回收價走勢（EPBOX vs 6家均價）</div>`;

  if (histKeys.length < 2) {
    html += `<div class="chart-empty">
      ${ic(P.lineChart,'#d2d2d7',44)}
      <div style="font-size:13px;font-weight:600;margin-top:10px;">資料累積中</div>
      <div style="font-size:11px;margin-top:6px;">每次造訪都會自動記錄一筆，歷史走勢將隨時間建立</div>
    </div>`;
  } else {
    html += `<div class="chart-wrap"><canvas id="trend-chart"></canvas></div>`;
  }
  html += `</div>`;

  container.innerHTML = html;

  if (histKeys.length >= 2) {
    if (trendChartInstance) { trendChartInstance.destroy(); trendChartInstance = null; }
    drawTrendChart(model.name, history, histKeys);
  }
}

function drawTrendChart(modelName, history, keys) {
  const canvas = document.getElementById('trend-chart');
  if (!canvas) return;
  const labels   = keys.map(k => k.slice(5));
  const epData   = keys.map(k => history[k]?.[modelName]?.['trade in價'] ?? null);
  const avgData  = keys.map(k => {
    const prices = history[k]?.[modelName];
    if (!prices) return null;
    const vals = Object.entries(prices).filter(([v,p]) => AVG_VENDORS.has(v) && p > 0).map(([,p]) => p);
    return vals.length ? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) : null;
  });

  trendChartInstance = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'EPBOX 自助機', data: epData,  borderColor: '#ff6b00', backgroundColor: 'rgba(255,107,0,0.08)', tension: 0.35, fill: true,  pointRadius: 4, pointBackgroundColor: '#ff6b00' },
        { label: '6家均價',      data: avgData, borderColor: '#0071e3', backgroundColor: 'rgba(0,113,227,0.05)', tension: 0.35, fill: false, pointRadius: 4, pointBackgroundColor: '#0071e3', borderDash: [5,4] },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 18, padding: 14 } },
        tooltip: { callbacks: { label: c => `${c.dataset.label}: NT$${c.raw?.toLocaleString() ?? '─'}` } }
      },
      scales: {
        y: { ticks: { callback: v => '$' + (v/1000).toFixed(0) + 'k', font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.04)' } },
        x: { ticks: { font: { size: 10 } }, grid: { display: false } }
      }
    }
  });
}

/* ════════════════════════════════
   ALERTS  (Tab 4)
════════════════════════════════ */
function getAlerts() { try { return JSON.parse(localStorage.getItem('epbox_alerts') || '[]'); } catch { return []; } }
function saveAlerts(a) { localStorage.setItem('epbox_alerts', JSON.stringify(a)); }
function getLastPrices() { try { return JSON.parse(localStorage.getItem('epbox_last_prices') || '{}'); } catch { return {}; } }
function saveLastPrices(p) { localStorage.setItem('epbox_last_prices', JSON.stringify(p)); }

function initAlerts() {
  if (!document.getElementById('alert-model-sel')) return;
  const sel = document.getElementById('alert-model-sel');
  sel.innerHTML = '<option value="">── 選擇機型 ──</option>';
  allModels.forEach(m => {
    const o = document.createElement('option');
    o.value = m.name; o.textContent = m.name; sel.appendChild(o);
  });
  renderAlertList();
  updateNotifyTip();
}

function addAlert() {
  const model = document.getElementById('alert-model-sel').value;
  if (!model) { alert('請先選擇機型'); return; }
  const msg = encodeURIComponent('訂閱 ' + model);
  const lineUrl = 'https://line.me/R/oaMessage/@wea3313n/?' + msg;
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  if (isMobile) {
    window.open(lineUrl, '_blank');
  } else {
    showLineQRModal(model, lineUrl);
  }
}

function showLineQRModal(model, lineUrl) {
  const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(lineUrl);
  document.getElementById('line-qr-model-name').textContent = model;
  document.getElementById('line-qr-img').src = qrUrl;
  document.getElementById('line-qr-modal').style.display = 'flex';
}

function closeLineQRModal() {
  document.getElementById('line-qr-modal').style.display = 'none';
}

function removeAlert(i) {
  const alerts = getAlerts();
  alerts.splice(i, 1);
  saveAlerts(alerts);
  renderAlertList();
}

function renderAlertList() {
  const alerts  = getAlerts();
  const container = document.getElementById('alert-list');
  if (!container) return;
  if (!alerts.length) {
    container.innerHTML = '<div class="no-result" style="padding:24px">尚未訂閱任何機型</div>';
    return;
  }
  container.innerHTML = alerts.map((model, i) => `
    <div class="alert-item">
      <div style="width:36px;height:36px;border-radius:10px;background:var(--ep-light);display:flex;align-items:center;justify-content:center;flex-shrink:0">
        ${ic(P.bell,'#00b96b',16)}
      </div>
      <div class="alert-item-info">
        <div class="alert-model-name">${model}</div>
        <div class="alert-thresh">EPBOX 回收價下跌時通知</div>
      </div>
      <button class="alert-del" onclick="removeAlert(${i})">${ic(P.trash,'#86868b',14)}</button>
    </div>`).join('');
}

function checkAlerts(models) {
  const subs = getAlerts();
  if (!subs.length) return;
  const lastPrices = getLastPrices();
  const triggered = [];
  const newPrices = { ...lastPrices };

  models.forEach(m => {
    const epboxPrice = m.prices['trade in價'];
    if (!epboxPrice) return;
    const prev = lastPrices[m.name];
    if (subs.includes(m.name) && prev && epboxPrice < prev) {
      triggered.push({ model: m.name, prev, curr: epboxPrice });
      if (Notification.permission === 'granted') {
        new Notification('📉 EPBOX 回收價下跌', {
          body: `${m.name} EPBOX 價格：NT$${prev.toLocaleString()} → NT$${epboxPrice.toLocaleString()}`,
        });
      }
    }
    newPrices[m.name] = epboxPrice;
  });

  saveLastPrices(newPrices);

  const wrap = document.getElementById('alert-triggered-wrap');
  if (wrap) {
    wrap.innerHTML = triggered.map(t => `
      <div class="alert-triggered">
        ${ic(P.alertTri,'#d48806',14)}
        <div><strong>${t.model}</strong> EPBOX 回收價下跌：NT$${t.prev.toLocaleString()} → NT$${t.curr.toLocaleString()}</div>
      </div>`).join('');
  }
}

function requestNotifyPermission() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    Notification.requestPermission().then(() => updateNotifyTip());
  }
}

function updateNotifyTip() {
  const el = document.getElementById('notify-tip');
  if (!el) return;
  if (!('Notification' in window)) { el.textContent = '此瀏覽器不支援通知功能'; return; }
  if (Notification.permission === 'granted') {
    el.innerHTML = `${ic(P.checkCircle,'#00915a',13)} 通知已啟用，價格觸發時會自動提醒你`;
  } else if (Notification.permission === 'denied') {
    el.innerHTML = `${ic(P.alertTri,'#d48806',13)} 通知已被封鎖，請至瀏覽器設定中允許本頁通知`;
  } else {
    el.innerHTML = `<button class="perm-btn" onclick="requestNotifyPermission()">啟用瀏覽器通知</button>`;
  }
}

/* ════════════════════════════════
   Tab 5: EPBOX AI 分析
════════════════════════════════ */
/* ── Battery replacement fee ── */
function batteryReplacementFee(model) {
  const n = (model || '').toUpperCase();
  if (n.includes('16') && n.includes('PRO')) return 4150;
  if (n.includes('15') && n.includes('PRO')) return 4150;
  if (n.includes('16')) return 3350;
  if (n.includes('15')) return 3350;
  if (n.includes('14')) return 3350;
  if (n.includes('13')) return 2990;
  if (n.includes('12')) return 2990;
  if (n.includes('11')) return 2990;
  return 2990;
}

/* ════════════════════════════════
   Tab 5: Condition Selector
════════════════════════════════ */
function syncCondition() {
  if (condScratch && condDamage) appCondition = 'both';
  else if (condScratch)          appCondition = 'scratched';
  else if (condDamage)           appCondition = 'damaged';
  else                           appCondition = 'perfect';
}

function resetCondition() {
  condScratch = false; condDamage = false;
  syncCondition(); updateCondUI(); renderCompare(); generateSalesScript();
}

function toggleCondition(type) {
  if (type === 'scratched') condScratch = !condScratch;
  if (type === 'damaged')   condDamage  = !condDamage;
  syncCondition(); updateCondUI(); renderCompare(); generateSalesScript();
}

function updateCondUI() {
  const isPerfect = appCondition === 'perfect';
  const combo     = appCondition === 'both';
  const btn = document.getElementById('cond-perfect-btn');
  if (btn) {
    btn.style.borderColor = isPerfect ? 'var(--apple-blue)' : 'var(--border)';
    btn.style.background  = isPerfect ? '#e8f1fd' : 'transparent';
  }
  const hint = document.getElementById('cond-perfect-hint');
  if (hint) hint.style.display = isPerfect ? 'block' : 'none';

  [['scratched', condScratch], ['damaged', condDamage]].forEach(([type, checked]) => {
    const prefix = type === 'scratched' ? 'scratch' : 'damage';
    const row   = document.getElementById('cond-' + prefix + '-row');
    const cb    = document.getElementById('cond-' + prefix + '-cb');
    const badge = document.getElementById('cond-' + prefix + '-badge');
    if (row)   { row.style.borderColor = checked ? 'var(--apple-blue)' : 'var(--border)'; row.style.background = checked ? '#f5f8ff' : '#fff'; }
    if (cb)    { cb.style.background = checked ? 'var(--apple-blue)' : ''; cb.style.borderColor = checked ? 'var(--apple-blue)' : '#ccc'; cb.style.color = checked ? '#fff' : ''; cb.textContent = checked ? '✓' : ''; }
    if (badge) badge.style.display = checked ? 'inline-block' : 'none';
  });
  const alert = document.getElementById('cond-combo-alert');
  if (alert) alert.style.display = combo ? 'block' : 'none';
}

function setDestination(dest) {
  phoneDestination = dest;
  const DEST_STYLE = {
    none:   { border: 'var(--apple-blue)', bg: '#e8f0ff', color: 'var(--apple-blue)' },
    family: { border: 'var(--apple-blue)', bg: '#e8f0ff', color: 'var(--apple-blue)' },
    backup: { border: 'var(--purple)',     bg: '#f0eeff', color: 'var(--purple)' },
  };
  document.querySelectorAll('.dest-btn').forEach(btn => {
    const isActive = btn.dataset.dest === dest;
    const s = DEST_STYLE[btn.dataset.dest] || DEST_STYLE.none;
    btn.style.border     = isActive ? `2px solid ${s.border}` : '2px solid var(--border)';
    btn.style.background = isActive ? s.bg : '#fff';
    btn.style.color      = isActive ? s.color : 'var(--text-gray)';
    btn.style.fontWeight = isActive ? '700' : '500';
  });
  generateSalesScript();
}

/* ════════════════════════════════
   Tab 5: Sales Script Generator
════════════════════════════════ */
function generateSalesScript() {
  const resultEl = document.getElementById('sp-result');

  // 讀 Tab 1 已選的狀態
  const model = getModel(selectedBase, selectedStorage);
  if (!model) {
    resultEl.innerHTML = `
      <div style="text-align:center;padding:48px 20px;color:var(--text-gray);">
        <div style="font-size:36px;margin-bottom:12px;">👈</div>
        <div style="font-size:15px;font-weight:700;color:var(--text-dark);margin-bottom:6px;">請先選好機型</div>
        <div style="font-size:13px;line-height:1.6;">到「各通路比較」選好顧客的手機型號和容量，<br>回到這裡話術就會自動出現。</div>
      </div>`;
    return;
  }

  const modelDisplay = model.name.replace('IPHONE ', 'iPhone ');
  const basePrice    = Math.round(Number(model.prices['trade in價']) || 0);
  const mult         = COND_MULT[appCondition];
  const adjBase      = Math.round(basePrice * mult);
  const adjBonus     = 0;
  const adjTotal     = adjBase;

  const otherPrices  = BD_OTHER_KEYS.map(k => Number(model.prices[k]) || 0).filter(v => v > 0);
  const maxOther     = otherPrices.length ? Math.max(...otherPrices) : 0;
  const diff         = adjTotal - maxOther;
  const fee          = batteryReplacementFee(model.name);
  const deduction    = getBatteryDeduction(model.name);

  const sections = [];

  // 開場（依外觀狀況調整說法）
  if (appCondition === 'perfect') {
    sections.push({ icon: '👋', label: '開場白', color: '#e8f4ff', border: '#b0d4f0', text:
      `我幫您查了一下，您的 ${modelDisplay} 外觀這麼好，EPBOX 自助回收報價大約是 NT$${adjTotal.toLocaleString()}（含補貼）。`
    });
  } else if (appCondition === 'scratched') {
    sections.push({ icon: '👋', label: '開場白', color: '#e8f4ff', border: '#b0d4f0', text:
      `我幫您查了一下，即使外觀有些刮痕，EPBOX 自助回收報價大約還是 NT$${adjTotal.toLocaleString()}（含補貼）。`
    });
  } else if (appCondition === 'damaged') {
    sections.push({ icon: '👋', label: '開場白', color: '#e8f4ff', border: '#b0d4f0', text:
      `我幫您查了一下，螢幕有損傷的話，EPBOX 自助回收報價大約是 NT$${adjTotal.toLocaleString()}（含補貼）。`
    });
  } else {
    sections.push({ icon: '👋', label: '開場白', color: '#e8f4ff', border: '#b0d4f0', text:
      `我幫您查了一下，外觀有刮痕加上螢幕損壞，EPBOX 自助回收報價大約是 NT$${adjTotal.toLocaleString()}（含補貼），在這個狀況下算是相當透明的報價。`
    });
  }

  // 價格優勢 / 外觀加分說明
  if (appCondition === 'scratched') {
    sections.push({ icon: '💡', label: '外觀刮痕說明', color: '#fff8e6', border: '#ffd880', text:
      `其他通路遇到有刮痕的手機也會扣錢，而且通常沒有明確標準、講不清楚。EPBOX 固定只扣一成，非常透明，不會被殺價。`
    });
  } else if (appCondition === 'damaged') {
    sections.push({ icon: '💡', label: '螢幕損壞說明', color: '#fff0f0', border: '#f0b0b0', text:
      `其他通路遇到螢幕損壞大多是直接大砍或不收。EPBOX 還是給六成的回收價，加上 10% 補貼，這個條件下算是相當好的選擇了。`
    });
  } else if (appCondition === 'both') {
    sections.push({ icon: '💡', label: '刮痕+螢幕損壞說明', color: '#fff0f0', border: '#f0b0b0', text:
      `外觀刮痕加螢幕損壞，其他通路通常直接不收或大砍。EPBOX 固定給五折，不講價、不現場殺價，讓顧客知道拿到的已經是這個狀況下最好的選擇。`
    });
  } else if (diff > 0) {
    sections.push({ icon: '💰', label: '價格優勢', color: '#edfaf3', border: '#a8e0c4', text:
      `這個價格比 Apple Bar、台哥大、遠傳等其他通路都還要高，比最高的通路還多 NT$${diff.toLocaleString()}，是目前市場上最好的回收價！`
    });
  } else if (diff >= -1000) {
    sections.push({ icon: '💰', label: '價格說明', color: '#edf4ff', border: '#b0c8f0', text:
      `這個價格跟其他通路差不多，但 EPBOX 不用預約、不用等、不用議價，現在就能馬上完成，比去其他地方方便很多。`
    });
  } else {
    sections.push({ icon: '💰', label: '價格說明', color: '#f5f5f7', border: '#d0d0d5', text:
      `雖然其他通路報價稍高一些，但 EPBOX 全程自助、即時入帳，不用跑去別家，就在這裡幾分鐘搞定。`
    });
  }

  // 電池 × 去向 — 四種組合
  if (!batteryGood && phoneDestination === 'family') {
    // 有家人承接 + 電池差 → 最強勸回收論點
    sections.push({ icon: '👨‍👩‍👧🔋', label: '傳家人 × 電池考量', color: '#fff4e6', border: '#ffc078', text:
      `想傳給家人用，但電池低於 80%，直接拿去用會很快沒電、體驗很差，傳之前通常要先換電池。官方換電池要 NT$${fee.toLocaleString()}，加上手機本身年紀，花這筆錢維修其實不太划算。\n\n不如現在用 EPBOX 回收拿到 NT$${adjTotal.toLocaleString()}，再用這筆錢幫家人貼一支新機，從頭到尾都是新的，用起來也更安心！`
    });
  } else if (!batteryGood && phoneDestination === 'none') {
    // 沒有人承接 + 電池差 → 雙重理由立即回收
    sections.push({ icon: '🔋', label: '電池建議', color: '#fff8e6', border: '#ffd880', text:
      `電池低於 80%，換電池官方要 NT$${fee.toLocaleString()}，維修成本偏高。加上手機沒有人要承接，放著只會越來越不值錢。現在回收能拿 NT$${adjTotal.toLocaleString()}，是目前最划算的選擇！`
    });
  } else if (!batteryGood) {
    // 電池差（去向未選）
    const notWorth = deduction >= adjTotal * 0.8;
    sections.push({ icon: '🔋', label: '電池建議', color: '#fff8e6', border: '#ffd880', text:
      notWorth
        ? `您的電池健康度低，換電池官方要收 NT$${fee.toLocaleString()}，換了也沒多少錢，直接回收換現金反而比較划算！`
        : `您的電池健康度偏低，換電池大概要 NT$${fee.toLocaleString()}。直接回收省掉這筆開銷，把現金拿去貼換新機更實在。`
    });
  }

  // 舊機用途建議
  if (phoneDestination === 'none') {
    sections.push({ icon: '📅', label: '舊機用途', color: '#f0f0ff', border: '#c0b8f0', text:
      `如果沒有家人要承接這支手機，放著只會越來越不值錢——手機殘值每年都在下滑，現在能拿 NT$${adjTotal.toLocaleString()}，放個一兩年可能就剩一半。趁現在殘值還在，早回收早划算！`
    });
  } else if (phoneDestination === 'family' && batteryGood) {
    // 有家人承接 + 電池健康 → 溫和建議，不強推
    sections.push({ icon: '👨‍👩‍👧', label: '傳家人建議', color: '#f0f4ff', border: '#b0c4f0', text:
      `如果家人確定要用，電池狀況還不錯，傳下去完全沒問題。不過這支手機現在還有 NT$${adjTotal.toLocaleString()} 的回收殘值，也可以評估看看：用這筆錢幫家人貼一支更新的機型，使用體驗會更好，之後換機也更有彈性。`
    });
  } else if (phoneDestination === 'backup') {
    // 備用機 — 兩段：修機空窗 + 資料安全
    const batteryNote = !batteryGood
      ? `而且電池低於 80%，備用機本身撐不了多久，緊急時刻根本不夠用。` : '';
    sections.push({ icon: '🔒', label: '備用機：修機空窗？', color: '#f3eeff', border: '#c8b0f0', text:
      `如果留備用機是為了修機期間有機可用——現在 Apple 授權維修站都可以線上預約，在預約時間內送到就好，當天就能取機，完全不需要備用機來填空窗期。${batteryNote}`
    });
    sections.push({ icon: '☁️', label: '備用機：資料安全？', color: '#e8f4ff', border: '#b0d4f0', text:
      `如果是擔心手機突然壞掉、資料不見才留備用機——這個邏輯其實有個盲點：手機如果嚴重到無法開機，根本沒辦法手動把資料轉移到備用機，備用機這時候完全幫不上忙。\n\n真正的解法是開啟 iCloud 備份，只要有在充電、連 Wi-Fi，資料就自動上雲端。手機壞了換新機直接還原，完全不依賴備用機。iCloud 50GB 方案一個月才幾十塊，比讓舊機閒置折舊划算太多了。\n\n現在回收拿 NT$${adjTotal.toLocaleString()}，再訂個 iCloud，兩個問題一次解決！`
    });
  }

  // EPBOX 優點
  sections.push({ icon: '⚡', label: 'EPBOX 優點', color: '#f3eeff', border: '#c8b0f0', text:
    `EPBOX 全程自助，大概 5 到 10 分鐘就完成，錢馬上就到帳。不用預約、不用跑去別的地方，就在我們店裡現在就可以做。`
  });

  // 邀請
  sections.push({ icon: '😊', label: '邀請試算', color: '#edfaf3', border: '#a8e0c4', text:
    `要不要讓我帶您去試試看？放進去完全免費估價，不滿意可以不用賣，完全沒有任何壓力！`
  });

  const fullText = sections.map(s => `【${s.label}】\n${s.text}`).join('\n\n');
  const safeText = fullText.replace(/\\/g,'\\\\').replace(/`/g,'\\`');

  // 標題列：機型 + 外觀 + 電池 badge
  const condBadgeColor = appCondition === 'perfect' ? '#00b96b' : appCondition === 'scratched' ? '#b07000' : 'var(--red)';
  let html = `
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
      <div style="font-size:15px;font-weight:800;">${modelDisplay}</div>
      <div style="font-size:11px;font-weight:700;padding:3px 8px;border-radius:20px;background:${condBadgeColor};color:#fff;">
        ${COND_EMOJI[appCondition]} ${COND_LABEL[appCondition]}
      </div>
      <div style="font-size:11px;color:var(--text-gray);font-weight:500;">${batteryGood ? '🟢 電池健康' : '🔴 電池偏低'}</div>
    </div>
    <div style="background:#f0faf5;border:1px solid #a8e0c4;border-radius:12px;padding:12px 14px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-size:11px;color:var(--text-gray);font-weight:600;margin-bottom:2px;">EPBOX 預估報價</div>
        <div style="font-size:22px;font-weight:900;color:var(--ep-green);">NT$${adjTotal.toLocaleString()}</div>
        </div>
      <div style="text-align:right;font-size:11px;color:var(--text-gray);line-height:1.8;">
        <div>× ${(mult * 100).toFixed(0)}% 機況</div>
        <div>× 110% 含補貼</div>
      </div>
    </div>`;

  sections.forEach(s => {
    html += `<div style="background:${s.color};border:1px solid ${s.border};border-radius:14px;padding:14px 16px;margin-bottom:10px;">
      <div style="font-size:11px;font-weight:700;color:#555;margin-bottom:6px;">${s.icon} ${s.label}</div>
      <div style="font-size:15px;line-height:1.75;color:var(--text-dark);font-weight:500;">${s.text}</div>
    </div>`;
  });

  html += `<button style="width:100%;padding:14px;background:var(--ep-dark);color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;margin-top:2px;"
    onclick="(function(btn){ navigator.clipboard.writeText(\`${safeText}\`).then(()=>{ btn.textContent='✅ 已複製！'; setTimeout(()=>{ btn.textContent='📋 複製完整話術'; },1500); }); })(this)">
    📋 複製完整話術
  </button>`;

  resultEl.innerHTML = html;
}

/* ════════════════════════════════
   Tab Switch
════════════════════════════════ */
function switchTab(id, btn) {
  document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach(el => el.classList.remove("active"));
  document.getElementById("tab-" + id).classList.add("active");
  btn.classList.add("active");
  if (id === 'analytics') generateSalesScript();
}

/* ════════════════════════════════
   INIT
════════════════════════════════ */
document.getElementById("compare-result").innerHTML = '<div class="loading-state"><div class="spinner"></div>載入最新回收價格中…</div>';

renderLocations();
fetchData();
trackPageView();

/* ════════════════════════════════
   Hero Banner 動態 badge
════════════════════════════════ */
function updateHeroBadges() {
  const stores = LOCATIONS.length;
  const models = uniqueBaseNames().length;
  const s1 = document.getElementById("hero-badge-stores");
  const m1 = document.getElementById("hero-badge-models");
  if (s1) s1.textContent = `🏪 共 ${stores} 間門市`;
  if (m1) m1.textContent = `📱 ${models} 款機型`;
}

/* ════════════════════════════════
   Page View Counter (Firebase, 全站共用一個計數)
════════════════════════════════ */
async function trackPageView() {
  const url = "https://trade-in-5135c-default-rtdb.asia-southeast1.firebasedatabase.app/page_views.json";
  const els = document.querySelectorAll(".page-views-num");
  try {
    let cur = await fetch(url).then(r => r.json());
    // 相容處理：若 Firebase 既有資料是物件（之前的 per-tab 結構），加總起來
    if (cur && typeof cur === "object") {
      cur = Object.values(cur).reduce((a, b) => a + (Number(b) || 0), 0);
    }
    cur = Number(cur) || 0;
    let next = cur;
    if (!sessionStorage.getItem("pv_counted")) {
      next = cur + 1;
      await fetch(url, { method: "PUT", body: JSON.stringify(next) });
      sessionStorage.setItem("pv_counted", "1");
    }
    els.forEach(el => el.textContent = next.toLocaleString());
  } catch (e) {
    els.forEach(el => { if (el.parentElement) el.parentElement.style.display = "none"; });
  }
}

// Init Lucide static icons after DOM ready
document.addEventListener("DOMContentLoaded", () => lucide.createIcons());
if (document.readyState !== "loading") lucide.createIcons();

/* ════════════════════════════════
   EPBOX Estimate Card
════════════════════════════════ */
function renderEpboxEstimate() { /* merged into renderCompare */ }
