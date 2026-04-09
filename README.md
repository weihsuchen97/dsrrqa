# DSRRQA 桌面小工具

一個常駐於 Windows 桌面的輕量小工具，整合待辦事項管理、即時天氣、植物生長動畫與全螢幕水族箱。

技術棧：Tauri 2.0 + React + TypeScript + Tailwind CSS v4 + shadcn/ui + Framer Motion

---

## 環境需求

- [Node.js](https://nodejs.org/) v18 以上
- [Rust](https://www.rust-lang.org/tools/install)（rustup + cargo）
- Windows 10/11

---

## 開發模式啟動

```bash
# 安裝前端相依套件
npm install

# 啟動 Tauri 開發模式（含熱更新）
npm run tauri dev
```

首次啟動會編譯 Rust 後端，需等待 1–3 分鐘。之後的啟動會快很多。

---

## 打包成獨立安裝檔

```bash
npm run tauri build
```

輸出路徑：`src-tauri/target/release/bundle/`
- `.msi` — Windows 安裝程式
- `.exe` — 免安裝執行檔

---

## 功能說明

| 功能 | 說明 |
|------|------|
| 待辦事項 | 新增、勾選、刪除，支援高/中/低優先度，資料持久儲存 |
| 天氣 | IP 自動偵測城市，顯示即時溫度與天氣狀態 |
| 植物動畫 | 依任務完成率生長（幼苗 → 盛開） |
| 內嵌水族箱 | 視窗底部魚群游動，可點擊魚使其逃跑 |
| 全螢幕水族箱 | 點標題列 🐠 按鈕，魚在整個桌面游動（可穿透點擊） |

---

## 視窗操作

| 操作 | 行為 |
|------|------|
| 拖曳標題列 | 移動視窗位置 |
| − 按鈕 | 最小化至工作列 |
| × 按鈕 | 關閉應用程式 |
| 系統托盤左鍵 | 顯示並聚焦視窗 |
| 系統托盤右鍵「顯示」 | 顯示並聚焦視窗 |
| 系統托盤右鍵「關閉」 | 退出應用程式 |

---

## 推薦開發環境

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
