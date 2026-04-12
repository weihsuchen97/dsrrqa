---
name: release
description: |
  手動升級版本號（minor 或 major）。patch 由 CI 每次 push 自動 +1，不需要手動操作。
  Use this skill when:
  - 使用者想要升版（加新功能升 minor、大改版升 major）
  - 使用者提到 release、發布、發版、升版、bump version
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
---

# Release Skill

## 什麼時候需要這個 skill

- **patch（第三位）**：不需要！CI 每次 push 自動 +1
- **minor（第二位）**：新增功能時，用這個 skill 升版
- **major（第一位）**：破壞性變更時，用這個 skill 升版

## 流程

1. 讀取 `package.json` 目前的版本號
2. 讀取自上次 release tag 以來的 commit 歷史
3. 根據 commit 內容建議升級類型：
   - 有 `feat:` → 建議 **minor**
   - 有 `BREAKING CHANGE` 或 `feat!:` → 建議 **major**
4. 告知使用者建議的新版本號，等待確認
5. 更新 `package.json` 的 `version`（只改前兩位，patch 歸零）
6. 執行 `node scripts/bump.js` 同步到 `Cargo.toml`
7. commit + push（CI 自動打包）

## 版本規則

```
major.minor.patch
  ↑      ↑     ↑
  手動   手動   CI 自動 +1
```

- `package.json` 是版本的唯一來源
- `tauri.conf.json` 不含 version，Tauri 自動讀 `Cargo.toml`
- CI 每次 push 自動把 patch +1 再打包
