---
name: new-feature
description: |
  依照 Hook + Widget pattern（§4.2）建立新功能的型別、hook、元件骨架，
  並引導完成 App.tsx 接線、設定整合、tsc 驗證、REQUIREMENTS.md 登記。
  Use this skill when:
  - 使用者說「新增功能」、「加一個 widget」、「我要做 XXX 功能」
  - 使用者提到 new-feature
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
  - Edit
  - Write
---

# New Feature Skill

依照 `docs/DESIGN_GUIDELINES.md §4.2` 的 Hook + Widget pattern 建立新功能骨架。

## 用法

```
/new-feature <FeatureName> [widget|panel|section]
```

- `FeatureName`：PascalCase，例如 `Pomodoro`、`HabitTracker`
- 第二個引數決定元件後綴，預設為 `Widget`

## 執行流程

### Step 1 — 收集資訊

若引數不足，詢問使用者：
1. 功能英文名稱（PascalCase）
2. 功能的繁體中文名稱（用於 REQUIREMENTS.md）
3. 元件類型（Widget / Panel / Section）
4. 是否需要持久化資料？（→ 決定是否建立 store）
5. 是否要加進 Settings 面板？（→ 決定是否修改 useSettings）

### Step 2 — 建立型別檔

建立 `src/types/<featureName>.ts`（camelCase 檔名）：

```typescript
// src/types/<featureName>.ts

export interface <FeatureName>Item {
  id: string
  // TODO: 依功能需求補充欄位
}

export interface <FeatureName>State {
  items: <FeatureName>Item[]
  // TODO: 依功能需求補充狀態
}

export const DEFAULT_<FEATURE_NAME>_STATE: <FeatureName>State = {
  items: [],
}
```

### Step 3 — 建立 Hook

建立 `src/hooks/use<FeatureName>.ts`：

```typescript
// src/hooks/use<FeatureName>.ts
import { useState, useCallback, useEffect } from 'react'
// 若需要持久化，加入：
// import { Store } from '@tauri-apps/plugin-store'
import type { <FeatureName>State } from '@/types/<featureName>'
import { DEFAULT_<FEATURE_NAME>_STATE } from '@/types/<featureName>'

export function use<FeatureName>() {
  const [state, setState] = useState<<FeatureName>State>(DEFAULT_<FEATURE_NAME>_STATE)

  // TODO: 若需要持久化
  // useEffect(() => {
  //   Store.load('<featureName>.json').then(store => {
  //     store.get('state').then(v => v && setState(v as <FeatureName>State))
  //   })
  // }, [])

  // TODO: 補充業務邏輯 function，以 useCallback 包裝

  return { state }
}
```

### Step 4 — 建立元件

建立 `src/components/<FeatureName><Suffix>.tsx`（Suffix = Widget/Panel/Section）：

```typescript
// src/components/<FeatureName><Suffix>.tsx
import type { <FeatureName>State } from '@/types/<featureName>'

interface <FeatureName><Suffix>Props {
  state: <FeatureName>State
  // TODO: 補充其他 prop（從 hook 傳入的 function）
}

export function <FeatureName><Suffix>({ state }: <FeatureName><Suffix>Props) {
  return (
    <div className="widget-card">
      {/* TODO: 實作 UI */}
    </div>
  )
}
```

**設計規範提醒（§2）**：
- 字級只用四級：`text-[11px]` / `text-xs` / `text-[13px]` / `text-[15px]`
- Banner 容器：`py-2.5 px-6`；textarea：`py-3.5 px-6`
- `text-xs` 搭 `leading-5`；`text-[13px]` 搭 `leading-6`
- 間距：組間 `gap-2`、組內 `gap-1` 或 `gap-1.5`
- 顏色寫到 `App.css` CSS variable，不在 JSX 硬編 hex
- 禁止在 `widget-section` 子元件內加 `px-*`

### Step 5 — App.tsx 接線

讀取 `src/App.tsx`，告知使用者需要手動加入以下兩處：

```typescript
// 1. import hook
import { use<FeatureName> } from '@/hooks/use<FeatureName>'

// 2. 呼叫 hook
const { state: <featureName>State } = use<FeatureName>()

// 3. 在 JSX 中加入元件
<FeatureName><Suffix> state={<featureName>State} />
```

顯示 App.tsx 目前的結構（hook 呼叫區 + JSX 區），標出建議插入點。

### Step 6 — Settings 整合（若需要）

若使用者在 Step 1 選擇需要加入 Settings：

1. 讀取 `src/types/settings.ts`，提示在 `AppSettings` 介面加入欄位，
   並在 `DEFAULT_SETTINGS` 加入預設值。
2. 讀取 `src/hooks/useSettings.ts`，說明無需修改（自動持久化）。
3. 讀取 `src/components/SettingsPanel.tsx`，提示加入對應的 UI 控制元素。

### Step 7 — TypeScript 驗證

執行：
```bash
npx tsc --noEmit
```

- 有錯誤 → 顯示錯誤，協助修正
- 無錯誤 → ✅

### Step 8 — REQUIREMENTS.md 登記

讀取 `REQUIREMENTS.md`，在對應表格末尾新增一列：

```markdown
| F-XX | <功能繁體名稱> | 🔧 | 由 /new-feature 建立骨架 |
```

狀態填 `🔧 進行中`，完成實作後使用者自行改為 ✅。

### 完成

輸出摘要：

```
✅ 已建立：
  - src/types/<featureName>.ts
  - src/hooks/use<FeatureName>.ts
  - src/components/<FeatureName><Suffix>.tsx

📋 請手動完成：
  - App.tsx：import hook + 呼叫 + 加入 JSX（已標出位置）
  - App.css：若有共用樣式，寫到 CSS variable
  - 實作 hook 中的業務邏輯
  - REQUIREMENTS.md 狀態更新為 ✅

完成後執行 /pre-commit 驗證，再執行 /git-ops commit。
```
