# DSRRQA 開發規範

## 新增／修改功能前必讀

**開工前第一件事：讀 [docs/DESIGN_GUIDELINES.md](docs/DESIGN_GUIDELINES.md)。**

該文件定義：
- 技術棧邊界（不得隨意替換）
- 視覺系統（字級、色彩、間距、圓角、動畫）
- 互動原則與檔案組織規範（Hook + Widget pattern）
- 歷史踩雷清單與預防方式
- 實作前的檢查清單

違反設計規範的程式碼不得提交。若規範與新需求衝突，先更新規範再寫程式。

## Git 操作規則

**所有 Git 相關操作必須透過 `/git-ops` skill 執行。**

禁止直接執行 git 命令，包括但不限於：
- `git commit`、`git push`、`git merge`、`git branch`、`git checkout`、`git pull`
- 必須使用 `/git-ops commit`、`/git-ops push`、`/git-ops merge` 等對應指令

這確保所有 Git 行為由 Haiku 模型統一處理，維持提交訊息格式與安全規範的一致性。
