---
name: design-review
description: |
  掃描元件檔案，對照 DESIGN_GUIDELINES.md 的規則，逐條回報違規。
  Use this skill when:
  - 實作完某個元件想確認是否符合設計規範
  - 使用者提到 design-review、設計審查、規範檢查
  - /pre-commit 流程中自動呼叫
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
---

# Design Review Skill

掃描指定的元件檔案（或所有已修改的元件），對照 `docs/DESIGN_GUIDELINES.md` 回報違規。

## 用法

```
/design-review                    # 掃描 git diff 中的所有 .tsx/.css 檔
/design-review src/components/Foo # 掃描指定元件
```

## 執行流程

### Step 1 — 決定掃描範圍

- 若有傳入路徑引數，讀取該檔案。
- 若無引數，執行 `git diff --name-only HEAD` 取得已修改清單，
  篩出 `src/components/**/*.tsx` 與 `src/App.css`。
- 若 git diff 也沒有結果，掃描 `src/components/` 下所有 .tsx 檔。

### Step 2 — 逐條規則掃描

對每個目標檔案，依下列規則逐一檢查，**列出違規行號與原始程式碼片段**：

#### 規則 1：字級只允許四級（§2.1）

合法值：`text-[11px]`、`text-xs`、`text-[13px]`、`text-[15px]`、`text-base`

違規模式（grep）：
```
text-\[(?!11px|13px|15px)[0-9]+px\]
text-sm|text-lg|text-xl|text-[29]px
```

#### 規則 2：Banner / 通知條 padding（§2.3.1）

Banner 或通知容器（含 `UpdateNotification`、`mx-2.5` 容器）必須：
- 縱向 ≥ `py-2.5`（禁用 `py-1`、`py-1.5`、`py-2`）
- 橫向 ≥ `px-6`（禁用 `px-1` 到 `px-5`）

偵測方式：找含 `bg-white/` 且帶 `mx-2.5` 的 div，確認其 py 與 px 值。

#### 規則 3：textarea / input 多行 padding（§2.3.1）

`<textarea` 元素必須：
- 縱向 ≥ `py-3.5`
- 橫向 ≥ `px-6`

#### 規則 4：禁止 banner 加邊框（§2.3.1）

內嵌容器（非 `widget-card` 外層）禁止 `border border-white/`。
例外：獨立 sub-card（如 WeatherWidget 內的子卡）。

偵測：含 `bg-white/5` 或 `bg-white/8` 的元素，若同時有 `border border-white/` → 違規。

#### 規則 5：禁止 banner 加圓角（§2.3.1b）

Banner 類容器禁止 `rounded-*`（圓角值不為空）。
含 `mx-2.5 mb-3` 的 div 若有 `rounded-` → 違規。

#### 規則 6：Separator 顏色與間距（§2.3.1b）

主要分群 Separator 必須：
- `bg-white/15` 以上（`bg-white/8`、`bg-white/10` 在深底隱形）
- 加上 `my-1.5`（上下各 6px）

偵測：找 `<Separator`，確認其 className 中的 bg-white 值與 my 值。

#### 規則 7：中英混排 leading（§2.3.2）

- `text-xs` 必須搭配 `leading-5`
- `text-[13px]` 必須搭配 `leading-6`
- 禁止使用 `leading-relaxed`、`leading-normal`（倍數單位）

偵測：找 `text-xs`、`text-[13px]` 的行，確認同行或同元素是否有對應的 leading。

#### 規則 8：Progress bar 粗細層級（§2.6）

若元件內有多個 progress bar（`h-1` / `h-1.5`）：
- 主進度（Exp）必須用 `h-1.5`
- 次要 stats 必須用 `h-1`
- 禁止所有 bar 都相同粗細

偵測：找多個含 `h-1` 的 bar 元素，若無任何 `h-1.5` → 可能違規（提醒確認）。

#### 規則 9：widget-section 不可疊加 px（§2.3）

在 `.widget-section` 子元件內禁止再加 `px-2`、`px-3` 等水平 padding，
會造成 18px / 14px 各自不同。

偵測：位於 `widget-section` 或 `widget-card` 下的直接子 div 若有 `px-` utility → 標記警告。

### Step 3 — 輸出結果

以下格式回報：

```
## Design Review：<檔案名>

### ✅ 通過規則
- 規則 1：字級
- 規則 5：Banner 圓角

### ⚠️ 違規
| 規則 | 行號 | 程式碼片段 | 修正建議 |
|------|------|-----------|---------|
| 規則 2 | 42 | `py-2 px-4` | 改為 `py-2.5 px-6` |
| 規則 6 | 87 | `bg-white/8` | 改為 `bg-white/15 my-1.5` |
```

若無違規，輸出「✅ 全部規則通過，可執行 /git-ops commit」。
