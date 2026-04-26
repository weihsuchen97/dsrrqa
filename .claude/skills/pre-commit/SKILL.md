---
name: pre-commit
description: |
  提交前完整自檢：型別檢查 → 設計規範審查 → dev server 啟動驗證 → REQUIREMENTS.md 更新確認 → 引導進入 /git-ops commit。
  Use this skill when:
  - 使用者說「準備提交」、「可以 commit 了嗎」、「pre-commit」
  - 完成功能實作後想確認一切正常
  - 使用者提到「跑一下 check」、「幫我驗證」
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
---

# Pre-Commit Skill

實作完成後、呼叫 `/git-ops commit` 之前的完整自檢流程。
對應 `docs/DESIGN_GUIDELINES.md §9` 的 12 項實作前檢查清單。

## 流程

### Step 1 — TypeScript 型別檢查

執行：
```bash
npx tsc --noEmit
```

- 若有型別錯誤 → **停在這裡**，列出錯誤並提示修正，修好後再繼續。
- 若無錯誤 → ✅ 繼續。

### Step 2 — 設計規範審查（/design-review）

對 `git diff --name-only HEAD` 中所有已修改的 `.tsx` 與 `App.css` 檔案，
逐一執行設計規範掃描（等同呼叫 `/design-review`）：

檢查項目：
- 字級只用 §2.1 四級
- banner 縱向 ≥ `py-2.5`、橫向 ≥ `px-6`
- textarea 縱向 ≥ `py-3.5`、橫向 ≥ `px-6`
- 無 `border border-white/*` 於內嵌容器
- 無 `rounded-*` 於 banner
- Separator 顏色 ≥ `bg-white/15` + `my-1.5`
- `text-xs` 搭 `leading-5`、`text-[13px]` 搭 `leading-6`
- progress bar 主 `h-1.5` / 次 `h-1`（若有多條）

有違規 → 列出，提示修正；使用者確認修好後繼續。

### Step 3 — Rust 後端編譯檢查

執行：
```bash
cd src-tauri && cargo check 2>&1
```

- 若有錯誤（`error[...]`）→ **停在這裡**，列出錯誤並提示修正，修好後再繼續。
- 若只有 warning → ✅ 繼續（但列出 warning 供參考）。
- 若無錯誤 → ✅ 繼續。

> **為何需要這步**：`tsc` 只驗證前端 TypeScript，Rust 後端的編譯錯誤（如
> 平台限定 API、型別不符、trait 未實作）完全不會被前端 build 發現。
> 曾發生 `RunEvent::Reopen` 在 Windows 不存在，但前端測試全過的案例。

### Step 4 — Dev Server 啟動驗證

在背景啟動 dev server 並確認是否能正常運行：

```bash
# 先確認 port 5173 沒有殘留的舊 process
npx kill-port 5173 2>/dev/null || true

# 以 timeout 方式啟動並抓 stdout，確認 ready 訊息出現
timeout 30 npm run dev 2>&1 | head -40
```

判斷標準：
- 輸出含 `Local:` 或 `ready in` → ✅ dev server 正常
- 出現 `Error`、`SyntaxError`、`Cannot find module` → ❌ **停在這裡**，
  顯示錯誤訊息，提示修正後重跑 pre-commit。
- 若 Tauri 環境不支援純 `npm run dev`，改跑 `npm run build`（`tsc && vite build`）：
  - Build 成功 → ✅
  - Build 失敗 → ❌ 停下並顯示錯誤

> **為何需要這步**：型別檢查通過不代表 runtime 正常。
> 曾發生過 Tauri plugin import 錯誤、動態 import 路徑問題等，
> 只有實際啟動才能發現。

### Step 5 — REQUIREMENTS.md 更新確認

讀取 `REQUIREMENTS.md`，對照本次修改的功能：

- 若新增功能 → 確認是否已在對應表格新增列（F-xx / F2-xx / R-xx）
- 若修正 bug → 確認是否已在「已修正的錯誤」表格更新狀態為 ✅
- 若兩者均無 → 提示「這次改動需要更新 REQUIREMENTS.md 嗎？」

### Step 6 — 全部通過，引導 commit

輸出摘要：

```
✅ TypeScript 型別檢查通過
✅ 設計規範審查通過（或：已修正 N 個違規）
✅ Rust 後端編譯通過
✅ Dev server 啟動正常
✅ REQUIREMENTS.md 已更新

所有檢查通過。請執行 /git-ops commit 完成提交。
```

若使用者希望立刻 commit，自動呼叫 `/git-ops commit` 流程。

## 快速跳過

若使用者明確說「跳過 dev server 檢查」，可省略 Step 4，
但必須在輸出中標記 `⚠️ Dev server 啟動未驗證`。
