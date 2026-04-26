---
name: new-creature
description: |
  新增水族箱生物：SVG 元件 → types/settings.ts 登記 → FishTank/FishOverlay 接線 → Settings 勾選開關。
  Use this skill when:
  - 使用者說「新增生物」、「加一隻魚」、「加新動物」、「new-creature」
  - 使用者提到要擴充水族箱種類
allowed-tools:
  - Read
  - Edit
  - Glob
  - Grep
  - Bash
---

# New Creature Skill

新增一種水族箱生物，完整接線到 types、Settings、FishTank、FishOverlay。

## 用法

```
/new-creature <id> <ChineseName> <emoji> <swimStyle>
```

範例：
```
/new-creature turtle 烏龜 🐢 drift
/new-creature jellyfish 水母 🪼 wave
```

- `id`：kebab-case，加到 `CreatureId` union（例如 `turtle`、`jellyfish`）
- `ChineseName`：繁體中文名稱
- `emoji`：顯示在 Settings 面板的 emoji
- `swimStyle`：`linear` / `wave` / `drift` / `dart`（詳見下方說明）

若引數不足，詢問使用者以上四項。

## 游泳風格說明

| 風格 | 行為 | 適合生物 |
|------|------|---------|
| `linear` | 直線橫向游，速度均勻 | 一般魚類 |
| `wave` | 正弦波上下起伏 | 細長魚、鰻魚 |
| `drift` | 隨機漂移，慢速 | 蝦、水母、慢速生物 |
| `dart` | 衝刺後停頓 | 快魚、蝦、貓狗豬（陸生動物也用此） |

## 執行流程

### Step 1 — 新增 CreatureId（src/types/settings.ts）

讀取 `src/types/settings.ts`，進行以下修改：

**1a. CreatureId union type**：在末尾加入新 id
```typescript
// 修改前
export type CreatureId =
  | 'fish-tropical' | ... | 'pig'

// 修改後
export type CreatureId =
  | 'fish-tropical' | ... | 'pig'
  | '<new-id>'
```

**1b. CREATURE_CONFIG**：加入設定項目
```typescript
'<new-id>': { name: '<中文名>', emoji: '<emoji>' },
```

### Step 2 — 建立 SVG 元件（src/components/FishCreatures.tsx）

讀取 `src/components/FishCreatures.tsx`，在檔案末尾加入新元件：

```typescript
// ── <中文名>（<id>） ──
export function Creature<PascalId>({ color = '<default_color>', scale = 1 }: CreatureProps) {
  return (
    <svg width={<W> * scale} height={<H> * scale} viewBox="0 0 <W> <H>" xmlns="http://www.w3.org/2000/svg">
      {/* TODO: SVG 路徑 */}
      {/* 提供基礎骨架，使用者可後續精修 */}
      <ellipse cx={<W/2>} cy={<H/2>} rx={<W/2 - 4>} ry={<H/2 - 4>} fill={color} />
      {/* 眼睛 */}
      <circle cx={<W * 0.7>} cy={<H * 0.4>} r="2.5" fill="white" />
      <circle cx={<W * 0.7 + 0.6>} cy={<H * 0.4>} r="1.2" fill="#1a1a2e" />
      <circle cx={<W * 0.7 + 1>} cy={<H * 0.35>} r="0.4" fill="white" />
    </svg>
  )
}
```

SVG 設計原則（沿用專案慣例）：
- 尾鰭／尾部：`<polygon>` 或 `<path>`，放在左側（facing right 時）
- 身體：`<ellipse>` 為主體
- 腹部反光：`<ellipse fill="rgba(255,255,255,0.15~0.18)">`
- 眼睛：三層圓（白底 + 深色瞳孔 + 白光點）
- 顏色參數化：主色用 `{color}`，半透明效果用 `rgba(255,255,255,N)`

### Step 3 — 接入 render switch（FishTank & FishOverlay）

讀取 `src/components/FishTank.tsx` 與 `src/components/FishOverlay.tsx`，
找到 creature render 的 switch/map 區塊（通常是 `renderCreature` function 或 `switch(type)` 結構）。

加入新的 case：
```typescript
case '<new-id>': return <Creature<PascalId> color={fish.color} scale={fish.scale} />
```

同時補上 import：
```typescript
import { ..., Creature<PascalId> } from '@/components/FishCreatures'
```

### Step 4 — useFishAnimation 設定（src/hooks/useFishAnimation.ts）

讀取 `src/hooks/useFishAnimation.ts`，找 `FishDef` 初始化或 `DEFAULT_FISH` 設定：

若有預設生物列表，加入新生物的預設設定：
```typescript
{
  id: '<new-id>-1',
  type: '<new-id>' as CreatureId,
  style: '<swimStyle>',
  color: '<default_color>',
  scale: 1,
  speed: <適合該生物的速度，drift 用 0.4~0.6，dart 用 1.2~1.8，linear 用 0.8~1.2>,
}
```

速度參考：
- `drift`（漂移）：`speed: 0.5`
- `wave`（波浪）：`speed: 1.0`
- `linear`（直線）：`speed: 1.0`
- `dart`（衝刺）：`speed: 1.5`

### Step 5 — TypeScript 驗證

執行：
```bash
npx tsc --noEmit
```

有錯誤 → 顯示並修正；無錯誤 → ✅。

### Step 6 — REQUIREMENTS.md 登記

新增到適當 Roadmap 列，或在技術架構快照更新生物數量。

### 完成

輸出摘要：

```
✅ 已完成：
  - src/types/settings.ts：CreatureId + CREATURE_CONFIG
  - src/components/FishCreatures.tsx：Creature<PascalId> SVG 元件
  - src/components/FishTank.tsx：render switch 接線
  - src/components/FishOverlay.tsx：render switch 接線
  - src/hooks/useFishAnimation.ts：預設生物設定

📋 建議後續：
  - 用 npm run tauri dev 目視確認生物外觀
  - 在 Settings 面板勾選啟用新生物並測試游泳動畫
  - 精修 SVG 造型（目前為基礎橢圓骨架）

完成後執行 /pre-commit → /git-ops commit。
```
