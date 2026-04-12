---
name: git-ops
model: haiku
description: |
  執行所有 Git 相關操作（commit、status、push、branch、merge、history、conflict、PR）。
  專案中所有 Git 行為必須透過此 skill 執行。
  Use this skill when:
  - 需要執行任何 Git 相關操作
  - 使用者提到 commit、push、branch、merge、status、log、diff、conflict、PR
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
---

# Git Operations Skill

所有 Git 操作的統一入口。

## 指令

| 指令 | 說明 |
|------|------|
| `/git-ops commit` | 分析變更並建立提交 |
| `/git-ops status` | 檢視工作目錄狀態 |
| `/git-ops push` | 推送至遠端 |
| `/git-ops branch` | 分支管理 |
| `/git-ops merge` | 合併分支 |
| `/git-ops history` | 檢視提交歷史 |
| `/git-ops conflict` | 解決合併衝突 |
| `/git-ops pr` | 建立 Pull Request |

## 規範

- 提交訊息格式：`{type}: {繁體中文描述}`，type 使用 Conventional Commits（feat/fix/refactor/docs/chore/test/style/perf）
- 提交訊息結尾加上：`Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>`
- 指定檔名加入暫存區，不使用 `git add -A` 或 `git add .`
- 危險操作（force push、reset --hard、branch -D）必須先詢問使用者確認
- 不得提交敏感檔案（.env、credentials 等）
- 不得使用 `--no-verify` 跳過 hooks
- 優先建立新提交，避免 `--amend`
