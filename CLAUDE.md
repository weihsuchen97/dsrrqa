# DSRRQA 開發規範

## 冷啟動速查（新 Session 必讀，取代探索整個專案）

### 技術棧
Tauri 2 + React 19 + TypeScript | Tailwind CSS 4 | shadcn/ui + lucide-react | Framer Motion | tauri-plugin-store

### 檔案職責地圖

| 檔案 | 職責 |
|---|---|
| `src/App.tsx` | 根元件，所有 widget 掛載點，視窗拖曳邏輯 |
| `src/types/settings.ts` | 全域設定型別（新增設定項從這裡開始）|
| `src/hooks/useSettings.ts` | 設定讀寫（tauri-plugin-store）|
| `src/hooks/useWeather.ts` | 天氣資料（Open-Meteo + ip-api，無需 API key）|
| `src/hooks/useTodos.ts` | 待辦事項 CRUD |
| `src/hooks/useNotepad.ts` | 記事本內容管理 |
| `src/hooks/useFishAnimation.ts` | 魚群動畫邏輯 |
| `src/hooks/useUpdater.ts` | 自動更新檢查 |
| `src/components/SettingsPanel.tsx` | 設定面板 UI |
| `src/components/WeatherWidget.tsx` | 天氣元件 |
| `src/components/TodoSection.tsx` | 待辦事項元件 |
| `src/components/NotepadPanel.tsx` | 記事本元件 |
| `src/components/FishTank.tsx` | 水族箱背景 |
| `src/components/FishOverlay.tsx` | 魚群渲染層 |
| `src/components/FishCreatures.tsx` | 各生物 SVG 元件 |
| `src/components/TitleBar.tsx` | 視窗標題列 |
| `src/components/ResizeHandles.tsx` | 視窗縮放把手 |
| `src-tauri/src/main.rs` | Rust 後端（視窗設定、plugin 初始化）|

### 常見 Bug 偵錯起點（直接跳到這裡，不用漫無目的探索）

| 問題類型 | 先看這裡 |
|---|---|
| 設定沒存 / 沒讀 | `useSettings.ts` → `settings.ts` 型別定義 |
| UI 版面跑掉 | `App.tsx` + 對應 widget component |
| 天氣不更新 / API 錯誤 | `useWeather.ts` |
| Rust 編譯錯誤 | `src-tauri/src/main.rs` + `Cargo.toml` |
| TypeScript 編譯錯誤 | 先跑 `npx tsc --noEmit` |
| 動畫異常 | `useFishAnimation.ts` + `FishOverlay.tsx` |
| 新功能找不到 hook | 對照 `REQUIREMENTS.md` 最新狀態 |

### 當前需求 / Bug 狀態
→ 讀 `REQUIREMENTS.md`（這是最新的功能/bug 清單，每次 session 開始先確認）

---

## 新增／修改功能前必讀

**開工前第一件事：讀 [docs/DESIGN_GUIDELINES.md](docs/DESIGN_GUIDELINES.md)。**

該文件定義：
- 技術棧邊界（不得隨意替換）
- 視覺系統（字級、色彩、間距、圓角、動畫）
- 互動原則與檔案組織規範（Hook + Widget pattern）
- 歷史踩雷清單與預防方式
- 實作前的檢查清單

違反設計規範的程式碼不得提交。若規範與新需求衝突，先更新規範再寫程式。

## Git 操作規則

**所有 Git 相關操作必須透過 `/git-ops` skill 執行。**

禁止直接執行 git 命令，包括但不限於：
- `git commit`、`git push`、`git merge`、`git branch`、`git checkout`、`git pull`
- 必須使用 `/git-ops commit`、`/git-ops push`、`/git-ops merge` 等對應指令

這確保所有 Git 行為由 Haiku 模型統一處理，維持提交訊息格式與安全規範的一致性。
