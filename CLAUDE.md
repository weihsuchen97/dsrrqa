# DSRRQA 開發規範

## Git 操作規則

**所有 Git 相關操作必須透過 `/git-ops` skill 執行。**

禁止直接執行 git 命令，包括但不限於：
- `git commit`、`git push`、`git merge`、`git branch`、`git checkout`、`git pull`
- 必須使用 `/git-ops commit`、`/git-ops push`、`/git-ops merge` 等對應指令

這確保所有 Git 行為由 Haiku 模型統一處理，維持提交訊息格式與安全規範的一致性。
