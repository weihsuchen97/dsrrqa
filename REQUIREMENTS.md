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
| F-24 | 視窗可拖拉邊緣調整大小 | ✅ | resizable:true + 自製 ResizeHandles（8 方向），最小 300×500 |
| F-25 | 待辦事項：標題行內編輯（雙擊） | ✅ | Enter/blur 儲存，Escape 取消，已完成項目不可編輯 |
| F-26 | 待辦事項：依優先度篩選 | ✅ | Header 高/中/低 badge 篩選鈕，再點一次取消篩選 |

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

## Phase 2 功能需求

| # | 功能 | 狀態 | 優先度 | 備註 |
|---|------|------|--------|------|
| F2-01 | 完善植物養成系統：多種植物可選、澆水互動、陽光機制、經驗值升級 | ✅ | 中 | 5 種植物、水分/陽光/經驗值系統、澆水/曬太陽按鈕、枯萎機制、任務完成驅動成長 |
| F2-02 | 各區塊可拖拉調整大小 | ✅ | 中 | 植物區/水族箱之間 ResizeDivider，pointer 拖拉改變高度，最小/最大高度限制，設定持久化 |
| F2-03 | 字體大小可調整 + 亮度可調整 | ✅ | 中 | Settings 面板：字體 12~20px 滑桿、亮度 30%~100% 滑桿，settings.json 持久化 |
| F2-04 | 生物 10 套可選：含貓、狗、豬 | ✅ | 中 | 7 種魚 + 貓 + 狗 + 豬 共 10 種 SVG 生物，Settings 面板勾選啟用，水族箱 + overlay 同步 |

---

## Roadmap（規劃中功能）

| # | 功能 | 狀態 | 備註 |
|---|------|------|------|
| R-01 | 優化代辦事項閱讀欄 | ❌ | 提升清單可讀性與排版 |
| R-02 | 發布網站：Release log + CI/CD 自動打包 exe/dmg | ❌ | 供使用者下載各版本 |
| R-03 | 隨手記功能（free format 嵌入式面板） | ✅ | 嵌入主視窗，支援貼上自動去除格式，保留結構（列表/粗體），Geist Mono 字型 |
| R-04 | 已完成事項可收合區塊（三分鐘自動收合） | ❌ | 避免完成項目佔據版面 |
| R-05 | 關閉視窗時縮到系統托盤圖示 | ❌ | × 按鈕改為 hide_to_tray |
| R-06 | 任務完成時同步至網頁版 Todo | ❌ | 需設計後端 API / 同步機制 |
| R-07 | 串接 Fabric 資料顯示於視窗 | ❌ | 整合外部資料來源 |
| R-08 | Settings：視窗顏色主題設定 | ❌ | 多組配色供選擇 |
| R-09 | 商城：選擇自定義動物/角色 | ❌ | 擴充水族箱生物種類 |
| R-10 | 每隻魚對應一筆代辦，點擊展開 | ❌ | 魚作為代辦事項的視覺化載體 |

---

## 技術架構快照

- **前端**: React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui (Nova) + Framer Motion
- **後端**: Tauri 2.0 + Rust + tauri-plugin-store
- **視窗**: 380×680 (min 300×500), decorations:false, transparent, alwaysOnTop, resizable
- **資料**: todos.json via tauri-plugin-store
- **天氣**: ip-api.com (座標) + Open-Meteo (天氣)

---

*最後更新：2026-04-12（Phase 2 完成）*
