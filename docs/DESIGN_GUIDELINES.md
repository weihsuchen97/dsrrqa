# DSRRQA 設計規範

> **本文件是新增／修改任何功能前的「必讀清單」。** 每次開工前請先完整瀏覽一次，結尾附檢查清單，請逐項確認。
> 規範由近期 10 份開發對話的 retrospective 萃取而成，聚焦於實戰中反覆踩到的雷與使用者明確表達的偏好。

---

## 0. 開工前工作流

1. **讀本文件** → 確認新功能不違反設計系統。
2. **讀 [REQUIREMENTS.md](../REQUIREMENTS.md)** → 檢查是否已有對應需求 / 是否修正既有 bug。
3. **開分支前先看 [CLAUDE.md](../CLAUDE.md)** → 所有 Git 操作走 `/git-ops` skill，禁用直接 `git` 指令。
4. **設計完成 → 實作 → `tsc` 檢查 → `/git-ops commit`**。

---

## 1. 技術棧（不可隨意變更）

| 類別 | 使用項目 | 備註 |
|---|---|---|
| 核心框架 | Tauri 2 + React 19 + TypeScript | 嚴禁降版 |
| 樣式 | Tailwind CSS 4 + 自訂 `App.css` class | 原子類優先，共用樣式抽 class |
| UI 元件 | shadcn/ui (radix-ui) + lucide-react icon | 新 UI 元件先找 shadcn 有沒有 |
| 動畫 | Framer Motion | 禁用 CSS `transition` 處理複雜序列 |
| 持久化 | `tauri-plugin-store`（JSON） | 所有設定 / 資料都從 store 讀寫 |
| API | Open-Meteo（天氣）、ip-api（地理） | 不加 key、不加付費服務 |
| 字型 | `@fontsource-variable/geist` | 統一使用 Geist |

**新增依賴前**：先問使用者是否同意。套件數要克制。

---

## 2. 視覺設計系統

### 2.1 字體階梯（僅允許 4 級）

| 用途 | 大小 | Tailwind |
|---|---|---|
| 微型標籤 / badge | 11px | `text-[11px]` |
| 次要文字 | 12px | `text-xs` |
| 主要內文 | 13px | `text-[13px]` |
| 標題 / 強調 | 15–17px | `text-[15px]` / `text-base` |

- **禁止**混用 `text-[9px]`、`text-[10px]`、`text-sm` 等額外尺寸。
- 數字欄位統一 `tabular-nums`（避免寬度跳動）。

### 2.2 色彩

- **深色玻璃擬態**為主：背景 `rgba(20, 20, 28, 0.72)` + `backdrop-filter: blur(...)`。
- **對比度下限 WCAG AA（4.5 : 1）**。淺底不可放淺色文字；badge 必須用「深飽和色」而非「淺色 + 透明度」。
- 所有顏色先寫到 `App.css` 的 CSS variable，再在元件中引用；不要在 JSX 寫一次性 hex。

### 2.3 間距與圓角（最常踩的雷）

- **黃金法則**：`padding ≥ border-radius`。6px padding 搭 16px radius 會把字切掉。
- 共用間距刻度：`gap-1 / gap-1.5 / gap-2 / gap-3`（4px / 6px / 8px / 12px）。
- 卡片間隙用 `App.css` 裡的 `widget-section` / `widget-card` 樣式，不要每個元件自己寫。
- **水平呼吸統一由 `.widget-section` 的 `padding-left/right: 10px` 決定**。元件內不得再加 `px-2` 之類補丁（會疊出 18px / 14px 各自不同、視覺永遠對不齊）。同層的 `Separator`、`ResizeDivider`、直接掛 widget-card 下的 banner（如 UpdateNotification）一律用 `mx-2.5`（10px）對齊 section。
- **內嵌容器（textarea / banner / inline 訊息條）禁止再加 `border border-white/*`**。`.widget-card` 外層已有 1px 邊框，內部再加框 = 框中框，視覺侷促。改用 `bg-white/5`（靜態）與 `focus:bg-white/8`（聚焦）做識別即可。純資訊卡（如 WeatherWidget 的獨立 sub-card）例外。

#### 2.3.1 Banner / Inline 通知類容器的最小 padding

橫向容器（訊息 + 按鈕一行）的 padding 下限：

| 類型 | 縱向 | 橫向 |
|---|---|---|
| Banner / 通知條 | `py-2.5`（10px）以上 | `px-6`（24px）以上 |
| textarea / input 多行輸入 | `py-3.5`（14px）以上 | `px-6`（24px）以上 |
| Badge / pill | `py-0.5` | `px-2` |
| 按鈕（文字） | `py-0.5` | `px-2` |
| 按鈕（純 icon） | `p-1`（4×4px 均等） | 同左 |

**禁用** `py-2`（8px）或更小的縱向 padding 當作主要內容容器——實測中英混排時中文字 glyph 會看起來貼著上緣。

**橫向門檻為何要到 `px-6`（24px）**：使用者眼中的「框」是內嵌容器 `bg-white/5` 的左緣，外層 `.widget-card` 的 `padding: 6px 10px` + widget-section 的 10px 只是讓區段對齊，不參與「文字離可見框的距離」的感知。實測反覆上調：`px-3`（12px）→ `px-4`（16px）→ `px-5`（20px）在中文 NotepadPanel / UpdateNotification 窄容器下都被回報「字貼左邊 / 完全貼在一起」，直到 **24px（`px-6`）** 才穩定。中文字 glyph 本身比 Latin 占位寬、視覺重心靠左，窄容器下只能以更大 padding 補償；門檻一律 `px-6` 起跳，不要回退。

#### 2.3.1b 區塊之間的垂直節奏（Separator 上下間距）

卡片內「banner → Separator → 下一區段」是最容易踩到「內容擠在一起」的位置。規則：

- **Separator 不可裸接兩個內容區段**。`<Separator className="mx-2.5" />` 只加了水平 margin，上下會貼死前後內容 → 必須加 `my-1.5`（上下各 6px）。
- **深色底 Separator 的顏色下限是 `bg-white/15`**（視覺群組分隔線用途）。`widget-card` 的背景 `rgba(15,15,20,0.72)` 上，`bg-white/8` 的對比度僅 ~1.4:1 — 人眼等同隱形。Separator 如果看不見，就失去「視覺分群錨點」的作用 → 腦袋會把上下兩段視為同一群，於是空白再多也覺得「擠」。主要分群用 `bg-white/15`，次要分段（如 weather → todo）才可用 `bg-white/8~10`。
- **Banner 類元件（如 UpdateNotification）** 與下一區段之間的 `margin-bottom` **必須 `mb-3`（12px）**。注意：單獨把 `mb-3` 加上去不會解決「擠在一起」— 若中間 Separator 用 `bg-white/8` 隱形、下段又只有 `py-1`，根因是**沒有可見分隔線做 grouping anchor**，不是 margin 不夠。先修 Separator 顏色到 `bg-white/15`，再看是否還要加 margin。
- **Banner 一律方角 + 無邊框**：禁止加 `rounded-*`，也禁止加 `border border-white/*`。(a) 圓角在小字上視覺擠壓、跟 `widget-card` 16px 外圓角打架；(b) 邊框跟 `widget-card` 外框變成「框中框」，視覺侷促。要視覺脫離只用 `bg-white/5` + `mx-2.5`（10px，對齊 widget-section）即可。
- 可視的最小鏈條：`banner (mx-2.5 mb-3，方角 + bg-white/5、無 border) → Separator (my-1.5 mx-2.5 bg-white/15) → 下一區段容器 (py-1)`。任一環節省略都會出現「擠在一起」。

#### 2.3.2 中英混排字型與 line-height

- 中文字 glyph 在 Latin 字型（Geist）的 line box 內通常會偏上，**Tailwind `text-xs` 預設的 `line-height: 1rem` 會讓中文視覺貼頂**。
- 任何「容器內會混中英」的文字區塊，明確指定 leading：`text-xs` 用 `leading-5`（20px）、`text-[13px]` 用 `leading-6`（24px）、`text-base` 用 `leading-7`（28px）。
- **避免用 `leading-relaxed` / `leading-normal`** 這種「倍數」單位——中文字高度與 Latin 不對稱，用固定 px 數才可預期。
- `.widget-card` 全域的 `line-height: 1.5` 只對「純 CSS 沒加 leading 的元素」生效；一用 Tailwind 的 `text-xs/sm/base` 就會被覆寫回該 utility 自帶的 line-height，所以要另外補 `leading-*`。

### 2.4 貼邊與負 margin

- `w-full` 會吃掉負 margin。要讓子元素貼到父層邊緣，用 `width: calc(100% + <offset>px)` + 對應負 margin。
- 水族箱類型的全寬元件：務必另外加 `ResizeObserver` 同步內部可動範圍，不要只靠初始尺寸。

### 2.5 動畫

- Framer Motion 變化要「呼吸感」：transition duration 以 `0.15s`（微互動）、`0.3s`（狀態切換）、`0.6s+`（進場）為主。
- 避免同時觸發 3 個以上動畫 prop；一次改一個屬性更穩。

### 2.6 Widget 內部佈局（資訊密集型卡片）

當一個 widget 內部有「圖像 + 名稱 + 多個 stats + 按鈕 + footer」這種多層資訊時，採以下原則（源自 Card UI / 虛擬寵物 UI 慣例）：

1. **分群（grouping）優先於平鋪**：把資訊切成 3–5 組（例如「標題」、「主進度」、「狀態」、「動作」、「footer」），每組之間用 `gap-2` 以上呼吸，組內用 `gap-1` 或 `gap-1.5` 緊貼。**禁止**把所有列全部 `gap-1` 連在一起——會變成「擠在一起」的視覺災難。
2. **同類 stats 橫向並列而非縱向堆疊**：兩個以上同位階的進度條（例如「水分 / 陽光」、「HP / MP」），用 `grid grid-cols-2 gap-3` 並列；縱向堆疊會讓右欄異常拉長、左右失衡。
3. **主進度 bar 比次要 stats bar 粗**：主進度（如 Exp）用 `h-1.5`，次要（如水、陽光）用 `h-1`，以視覺層級告訴使用者誰才是主角。禁止所有 bar 都同粗細。
4. **圖像側視覺重量要對齊資訊側**：用 `items-stretch` + `flex items-center` 把左側圖像垂直置中到整列高度，避免「左邊孤伶伶一個小圖 vs 右邊一長串資訊」。圖像至少 `w-24`。
5. **數字強調**：stats 的數字用 `tabular-nums` + 比 label 略亮一級（例如 label `text-white/55`、數字 `text-white/70 font-medium`）。
6. **Footer 從左對齊改右對齊**：非主要資訊（如「任務 4/5」）右對齊、縮短敘述，避免佔據視覺動線起點。

---

## 3. 互動原則

- **直觀優先、模態框最少**。仿 Windows 自黏便條紙：內嵌編輯、Enter 送出、點外面即 blur 儲存。
- 危險操作（刪除）用 hover 揭露 + 單次點擊，**不要**再加二次確認對話框。
- 已完成／非活躍內容要能自動收合（參考 todo 15 秒規則），避免版面膨脹。
- 鍵盤：`Enter` 送出、`Escape` 取消、雙擊進入編輯；全站一致。

---

## 4. 檔案與程式碼組織

### 4.1 目錄分工

```
src/
├── components/         元件（PascalCase.tsx）
│   └── ui/             shadcn 生成的底層元件，除非 shadcn 更新否則不手改
├── hooks/              自訂 hooks，檔名 camelCase：useFoo.ts
├── lib/                純函式工具，無 React 依賴
├── types/              共用型別（*.ts，檔名跟領域同名）
└── App.{tsx,css}       主容器與全域樣式
```

### 4.2 新功能標準流程（Hook + Widget pattern）

1. **型別**：在 `src/types/<feature>.ts` 定義 data shape。
2. **Hook**：在 `src/hooks/use<Feature>.ts` 封裝狀態 + store 讀寫 + 業務邏輯。
3. **元件**：在 `src/components/<Feature>Widget.tsx`（或 Panel / Section）宣告 UI，透過 props 接 hook 回傳值。
4. **接線**：在 `App.tsx` 呼叫 hook、把結果傳給元件。
5. **樣式**：共用 class 寫到 `App.css`，一次性微調才用 Tailwind 原子類。
6. **設定**：若元件有可調選項，加到 `useSettings` + `SettingsPanel`，不要各自做開關 UI。
7. **型別檢查**：跑 `npx tsc --noEmit`（或 `npm run build`）。
8. **需求登記**：在 `REQUIREMENTS.md` 對應表格新增列。

### 4.3 命名慣例

- 元件檔與元件名：`PascalCase`（`NotepadPanel.tsx` → `NotepadPanel`）。
- Hook：`use<Feature>`，檔名與 export 名一致。
- Tauri command：`snake_case`，跟 Rust 端同名。
- CSS class：`kebab-case`，共用樣式用 `widget-*` 前綴表示跨元件可重用。

### 4.4 註解準則

- **預設不寫**。命名好，就是文件。
- 只在「非顯而易見的原因」才寫：隱藏限制、workaround、效能陷阱。
- 禁寫 `// 新增 X 功能`、`// 給 Y 用`、歷史敘述註解——這些屬於 commit message。

---

## 5. 狀態與持久化

- 任何「使用者會希望重開仍在」的資料 → 用 `tauri-plugin-store`，每個領域一個 JSON 檔（`todos.json` / `settings.json` / `notepad.json`）。
- Store 的讀寫集中在 hook 內部，元件層不可直接呼叫 store。
- 讀取失敗要給預設值，**不要**讓畫面壞掉；但不要加沒必要的 try/catch 把錯誤吞掉。

---

## 6. Tauri 相關規則

- 新 window / 權限 → 修改 `src-tauri/capabilities/default.json`，只開必要權限。
- 視窗定位用 `current_monitor()`，**禁用** `primary_monitor()`（雙螢幕會錯位，已修過一次）。
- 關閉主視窗必須一併 close overlay / notepad 子視窗，避免殘留。

---

## 7. 版本與 Git

- **Commit**：只透過 `/git-ops`。格式 `feat|fix|refactor|chore|docs: <繁中描述>`。
- **版本號**：`patch` 由 CI 每次 push 自動 +1；`minor`（新功能）／`major`（破壞性更動）手動跑 `npm run bump` 觸發 `/release` skill。
- **PR**：由 `/git-ops` 產生，勿手動 `git push --force`。

---

## 8. 反覆踩過的雷 — 預防表

| 症狀 | 根因 | 預防 |
|---|---|---|
| 字被圓角切掉 | `padding < border-radius` | 永遠讓 padding ≥ radius |
| 中文字貼著上邊框 | `text-xs` 自帶 line-height 1rem + `py-2` | banner 類用 `leading-5` + `py-2.5`（§2.3.1／2.3.2） |
| badge 看不清 | 淺背景 + 淺前景 | 深飽和色，對比 ≥ 4.5 : 1 |
| 水族箱魚游到卡片內 | `w-full` 吃掉負 margin | `calc(100% + Npx)` + 負 margin |
| Resize 後魚卡邊 | 只用初始寬度 | 加 `ResizeObserver` |
| overlay 在別的螢幕 | 用 `primary_monitor` | 改 `current_monitor` |
| 主視窗關了 overlay 留著 | 沒監聽 `CloseRequested` | 關閉流程統一 `close_overlay()` |
| HMR 未更新 shadcn 元件 | Vite 快取 | 重啟 `npm run tauri dev` + 硬重整 |
| 字級不和諧 | 私自加 `text-[9px]` 等 | 只用 §2.1 四級 |
| 提交訊息格式亂 | 直接 `git commit` | 強制 `/git-ops commit` |
| Widget 內容擠成一團 | 所有列同 `gap-1`、stats 縱向堆疊 | 按 §2.6 分群 + stats 橫向並列 |
| 左右欄視覺失衡 | 左圖 80×80 vs 右欄 7 列文字 | 左欄 `items-stretch` 垂直置中、圖至少 `w-24` |
| 多條 bar 沒有層級 | Exp / 水 / 陽光都 `h-1` | 主進度 `h-1.5`、次要 stats `h-1` |
| Banner 跟下一區段貼死（加了 `mb-3` 仍貼） | 真正根因：Separator `bg-white/8` 在深底對比度 ~1.4:1 完全隱形 → 失去視覺分群錨點，上下段被腦袋歸為同群 | 主要分群用 Separator 升到 `bg-white/15` + `my-1.5`，banner 維持 `mb-3`（§2.3.1b） |
| Banner / textarea 字貼左邊（反覆回報多次） | 使用者感知的「框」= 內嵌容器 `bg-white/5` 的左緣；widget-card / widget-section 的 10px 只對齊區段，不會被當成文字的呼吸空間。`px-3` / `px-4` / `px-5` 中文窄容器下都被回報貼邊 | 內部水平 padding 一律 **`px-6`（24px）** 起跳；不加 border（避免框中框）；外層 widget-section 10px 不能替代內部 padding（§2.3.1） |

---

## 9. 新功能前必讀檢查清單 ✅

實作前逐項打勾（心裡打也行，但要打完）：

- [ ] 我讀完了本文件與 `REQUIREMENTS.md`。
- [ ] 字級只用 §2.1 的 4 級，沒有自創新尺寸。
- [ ] 對比度 ≥ 4.5 : 1；沒有淺底 + 淺字的 badge。
- [ ] padding ≥ border-radius，不會切字。
- [ ] Banner / 通知條縱向 padding ≥ `py-2.5`、橫向 ≥ `px-6`；textarea / input 縱向 ≥ `py-3.5`、橫向 ≥ `px-6`；中英混排文字有加 `leading-5`、下方 `mb-3`（§2.3.1／2.3.1b／2.3.2）。
- [ ] Widget 內部若含多層資訊：已按 §2.6 分群（組間 `gap-2`、組內 `gap-1`）、同類 stats 橫向並列、bar 有粗細層級、左右欄視覺重量平衡。
- [ ] 新增資料有走 `useSettings` 或對應 store hook，不是散落在元件裡。
- [ ] Hook / 元件 / 型別 / 樣式 遵循 §4.1 目錄分工。
- [ ] 有跑 `npx tsc --noEmit` 或 `npm run build`，無型別錯誤。
- [ ] 視窗 resize、最小化、托盤隱藏都測過。
- [ ] Commit 走 `/git-ops`，訊息含 `feat|fix|...` 前綴。
- [ ] `REQUIREMENTS.md` 的對應表格已更新狀態。

---

_最後更新：2026-04-19（§2.3.1 橫向 padding 門檻再上調至 `px-6`（24px）：`px-3 → px-4 → px-5` 在中文 NotepadPanel / UpdateNotification 窄容器下仍被反覆回報「字貼左邊」「完全貼在一起」，實測到 24px 才穩定）_
