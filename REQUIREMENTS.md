# DSRRQA 需求與錯誤追蹤

> 每次啟動前請對照此清單確認所有項目狀態。
> 狀態：✅ 完成 | 🔧 進行中 | ❌ 未完成 | 🐛 已知錯誤

---

## MVP 功能需求

| # | 功能 | 狀態 | 備註 |
|---|------|------|------|
| F-01 | 無邊框、半透明、永遠置頂的浮動視窗 | ✅ | 380×680，毛玻璃效果 |
| F-02 | 視窗可拖曳移動 | ✅ | 使用 startDragging() on mousedown |
| F-03 | 最小化按鈕 | ✅ | allow-minimize 已加入 capabilities |
| F-04 | 隱藏至托盤（× 按鈕） | ✅ | invoke hide_main_window |
| F-05 | 系統托盤右鍵選單（顯示/隱藏/關閉） | ✅ | Rust 端實作 |
| F-06 | 待辦事項：新增（Enter 或點按鈕） | ✅ | |
| F-07 | 待辦事項：勾選完成（含刪除線） | ✅ | |
| F-08 | 待辦事項：刪除（hover 顯示刪除鈕） | ✅ | |
| F-09 | 待辦事項：優先度選擇（高/中/低） | ✅ | Badge 顯示 red/yellow/green |
| F-10 | 待辦資料本地持久化（重開機不消失） | ✅ | tauri-plugin-store → todos.json |
| F-11 | 天氣：IP 自動偵測城市 | ✅ | ip-api.com |
| F-12 | 天氣：Open-Meteo 取得溫度/天氣代碼 | ✅ | 30 分鐘自動更新 |
| F-13 | 天氣：繁體中文描述 + emoji | ✅ | WMO code 對照表 |
| F-14 | 植物生長動畫（4 階段依完成率） | ✅ | SVG + Framer Motion |
| F-15 | 內嵌水族箱（魚群 + 水草 + 氣泡） | ✅ | requestAnimationFrame |
| F-16 | 全螢幕水族箱浮層（滑鼠穿透） | ✅ | 獨立 Tauri window |
| F-17 | 魚：直線游法 | ✅ | linear style |
| F-18 | 魚：波浪游法（正弦） | ✅ | wave style |
| F-19 | 蝦：隨機漂移 | ✅ | drift style |
| F-20 | 魚：衝刺暫停 | ✅ | dart style |
| F-21 | 點擊魚時快速游向隨機方向 | ✅ | scatter 機制，pointer-events auto |
| F-22 | 全螢幕浮層出現在主視窗所在螢幕 | ✅ | current_monitor() 而非 primary |
| F-23 | 預留外部瑕疵單系統欄位 | ✅ | externalKey/Status/Source/Url |

---

## 已修正的錯誤

| # | 錯誤描述 | 狀態 | 修正方式 |
|---|---------|------|---------|
| B-01 | 視窗無法拖曳，維持在正中間 | ✅ | 改用 startDragging() + allow-start-dragging |
| B-02 | 最小化按鈕無反應 | ✅ | 加入 core:window:allow-minimize 到 capabilities |
| B-03 | 關閉視窗後水族箱 overlay 殘留無法關閉 | ✅ | hide/close 時呼叫 close_overlay()；監聽 CloseRequested |
| B-04 | 內容貼邊（左右） | ✅ | widget-card padding + widget-section 水平內距 |
| B-05 | 內容貼邊（上下） | ✅ | widget-card vertical padding 8px |
| B-06 | 雙螢幕模式 overlay 出現在主螢幕而非目前螢幕 | ✅ | current_monitor() 動態取得視窗所在螢幕 |

---

## 已知待處理

| # | 描述 | 優先度 |
|---|------|--------|
| P-01 | 未來串接外部瑕疵單系統（第二階段） | 低 |

---

## 技術架構快照

- **前端**: React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui (Nova) + Framer Motion
- **後端**: Tauri 2.0 + Rust + tauri-plugin-store
- **視窗**: 380×680, decorations:false, transparent, alwaysOnTop
- **資料**: todos.json via tauri-plugin-store
- **天氣**: ip-api.com (座標) + Open-Meteo (天氣)

---

*最後更新：2026-04-06*
