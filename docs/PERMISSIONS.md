# 權限控制系統

Bot 使用混合模式權限控制系統，在安全性和便利性之間取得平衡。

## 目錄

- [系統概述](#系統概述)
- [權限配置](#權限配置)
- [工具分類](#工具分類)
- [Bash 指令規則](#bash-指令規則)
- [運作流程](#運作流程)
- [自訂權限](#自訂權限)
- [安全考量](#安全考量)
- [常見問題](#常見問題)

---

## 系統概述

### 設計理念

傳統的 Claude Code 在執行每個操作時都需要使用者確認，這在桌面環境中可以接受，但在手機上會造成嚴重的使用體驗問題。本系統採用**風險分級**的方式：

- ✅ **低風險操作**：自動執行，提供流暢體驗
- ⚠️ **高風險操作**：需要確認，保護資料安全

### 核心功能

1. **智慧分類**：根據工具特性自動判斷風險等級
2. **靈活配置**：透過 JSON 檔案輕鬆調整規則
3. **指令級控制**：Bash 指令支援細粒度規則
4. **預設安全**：未知工具預設需要確認

### 架構圖

```
Telegram 訊息
    ↓
Claude 決定使用工具
    ↓
權限檢查系統 ← config/permissions.json
    ↓
    ├─ 自動執行 → 立即執行工具
    └─ 需要確認 → 發送確認訊息
                      ↓
                   使用者點選按鈕
                      ↓
                   執行或取消
```

---

## 權限配置

### 配置檔案位置

```
config/permissions.json
```

### 完整配置範例

```json
{
  "autoApprove": [
    "Read",
    "Glob",
    "Grep",
    "WebSearch",
    "WebFetch"
  ],
  "requireConfirmation": [
    "Edit",
    "Write",
    "Bash"
  ],
  "bashCommandRules": {
    "autoApprove": [
      "ls",
      "pwd",
      "cat",
      "grep",
      "find",
      "echo",
      "which"
    ],
    "requireConfirmation": [
      "rm",
      "mv",
      "cp",
      "git commit",
      "git push",
      "npm install",
      "bun install",
      "pip install"
    ]
  }
}
```

### 配置欄位說明

#### `autoApprove` (陣列)

列出可以自動執行的工具名稱。

**特性：**
- 這些工具執行時不會顯示確認訊息
- 適用於唯讀或低風險操作
- 提供最流暢的使用體驗

**預設值：**
```json
["Read", "Glob", "Grep", "WebSearch", "WebFetch"]
```

#### `requireConfirmation` (陣列)

列出需要使用者確認的工具名稱。

**特性：**
- 執行前會在 Telegram 顯示確認訊息
- 使用者透過按鈕確認或取消
- 適用於修改性或高風險操作

**預設值：**
```json
["Edit", "Write", "Bash"]
```

#### `bashCommandRules` (物件)

針對 Bash 工具的細粒度控制。

**結構：**
```json
{
  "autoApprove": ["安全指令列表"],
  "requireConfirmation": ["危險指令列表"]
}
```

**匹配邏輯：**
1. 檢查指令是否以 `autoApprove` 中的任一模式開頭
2. 如果是，自動執行
3. 檢查指令是否包含 `requireConfirmation` 中的任一模式
4. 如果是，需要確認
5. 其他情況，預設需要確認

---

## 工具分類

### 自動執行的工具

#### Read

**功能：** 讀取檔案內容

**風險等級：** ✅ 低

**原因：**
- 唯讀操作
- 不修改任何資料
- 受 `ALLOWED_PATHS` 限制

**範例使用：**
```
Claude: 我需要檢視 package.json
→ 自動執行 Read("/path/to/package.json")
```

---

#### Glob

**功能：** 搜尋符合模式的檔案

**風險等級：** ✅ 低

**原因：**
- 唯讀操作
- 只回傳檔案路徑列表
- 不存取檔案內容

**範例使用：**
```
Claude: 我需要找到所有 TypeScript 檔案
→ 自動執行 Glob("**/*.ts")
```

---

#### Grep

**功能：** 搜尋檔案內容

**風險等級：** ✅ 低

**原因：**
- 唯讀操作
- 只搜尋不修改
- 高效率內容查找

**範例使用：**
```
Claude: 我需要找到使用 useState 的地方
→ 自動執行 Grep("useState")
```

---

#### WebSearch

**功能：** 網路搜尋

**風險等級：** ✅ 低

**原因：**
- 外部 API 呼叫
- 不影響本地系統
- 唯讀資訊取得

**範例使用：**
```
Claude: 讓我搜尋 React 19 的新功能
→ 自動執行 WebSearch("React 19 features")
```

---

#### WebFetch

**功能：** 取得網頁內容

**風險等級：** ✅ 低

**原因：**
- 只讀取遠端資料
- 不修改本地檔案
- 受網路安全限制

**範例使用：**
```
Claude: 讓我檢查這個 API 文件
→ 自動執行 WebFetch("https://api.example.com/docs")
```

---

### 需要確認的工具

#### Edit

**功能：** 編輯現有檔案內容

**風險等級：** ⚠️ 中高

**原因：**
- 修改檔案內容
- 可能覆蓋重要資料
- 需要使用者審核變更

**確認訊息範例：**
```
🔒 需要確認操作

即將編輯檔案：
/Users/vincewang/project/src/index.ts

[✅ 確認] [❌ 取消]
```

**使用建議：**
- 重要檔案修改前建議先備份
- 確認前可用 Git 檢視差異
- 不確定時選擇取消

---

#### Write

**功能：** 寫入新檔案或覆蓋現有檔案

**風險等級：** ⚠️ 高

**原因：**
- 建立新檔案
- 可能覆蓋現有檔案
- 影響檔案系統結構

**確認訊息範例：**
```
🔒 需要確認操作

即將寫入檔案：
/Users/vincewang/project/config.json

[✅ 確認] [❌ 取消]
```

**使用建議：**
- 檢查檔案路徑是否正確
- 確認不會覆蓋重要檔案
- 考慮使用 Edit 而非 Write（如果檔案已存在）

---

#### Bash

**功能：** 執行 Shell 指令

**風險等級：** ⚠️ 視指令而定

**原因：**
- 可執行任意系統指令
- 潛在破壞性極高
- 需要細粒度控制

**特殊處理：**
Bash 工具使用 `bashCommandRules` 進行細粒度控制（見下節）。

---

## Bash 指令規則

### 自動執行的安全指令

#### `ls` - 列出檔案

**範例：**
```bash
ls -la /path/to/directory
ls -R src/
```

**風險：** ✅ 無風險（唯讀）

---

#### `pwd` - 顯示當前目錄

**範例：**
```bash
pwd
```

**風險：** ✅ 無風險（唯讀）

---

#### `cat` - 顯示檔案內容

**範例：**
```bash
cat package.json
cat src/config.ts | grep API
```

**風險：** ✅ 無風險（唯讀）

---

#### `grep` - 搜尋內容

**範例：**
```bash
grep -r "TODO" src/
grep -i "error" logs/*.log
```

**風險：** ✅ 無風險（唯讀）

---

#### `find` - 搜尋檔案

**範例：**
```bash
find . -name "*.ts"
find src/ -type f -mtime -7
```

**風險：** ✅ 無風險（唯讀）

---

#### `echo` - 顯示文字

**範例：**
```bash
echo "Hello World"
echo $PATH
```

**風險：** ✅ 無風險（除非配合重導向）

---

#### `which` - 尋找可執行檔

**範例：**
```bash
which node
which python3
```

**風險：** ✅ 無風險（唯讀）

---

### 需要確認的危險指令

#### `rm` - 刪除檔案

**風險：** ⚠️⚠️⚠️ 極高（不可逆）

**範例：**
```bash
rm file.txt
rm -rf directory/
```

**確認訊息：**
```
🔒 需要確認操作

即將執行指令：
rm -rf old_backups/

⚠️ 警告：此操作不可逆！

[✅ 確認] [❌ 取消]
```

**建議：**
- 仔細檢查路徑
- 考慮先用 `ls` 確認
- 重要資料務必備份

---

#### `mv` - 移動/重新命名

**風險：** ⚠️⚠️ 高（可能覆蓋）

**範例：**
```bash
mv old.txt new.txt
mv src/ backup/src/
```

**風險點：**
- 可能覆蓋現有檔案
- 路徑錯誤會遺失檔案

---

#### `cp` - 複製檔案

**風險：** ⚠️ 中（可能覆蓋）

**範例：**
```bash
cp file.txt backup/
cp -r src/ dist/
```

**風險點：**
- 可能覆蓋現有檔案
- 大量複製影響磁碟空間

---

#### `git commit` - Git 提交

**風險：** ⚠️ 中（修改版本歷史）

**範例：**
```bash
git commit -m "Update features"
git commit --amend
```

**建議：**
- 確認 commit message 正確
- 檢查暫存的變更
- 避免 `--amend` 在已推送的 commit

---

#### `git push` - Git 推送

**風險：** ⚠️⚠️ 高（影響遠端）

**範例：**
```bash
git push origin main
git push --force
```

**確認訊息：**
```
🔒 需要確認操作

即將執行指令：
git push origin main

⚠️ 這會推送變更到遠端 repository

[✅ 確認] [❌ 取消]
```

**建議：**
- 確認分支正確
- 禁止 `--force` 到主要分支
- 先檢查 diff

---

#### 套件管理指令

**指令：**
- `npm install`
- `bun install`
- `pip install`
- `yarn add`

**風險：** ⚠️⚠️ 高（執行第三方程式碼）

**範例：**
```bash
npm install express
bun add react
pip install requests
```

**風險點：**
- 下載並執行第三方程式碼
- 可能包含惡意套件
- postinstall scripts 可能執行任意指令

**建議：**
- 確認套件名稱正確
- 檢查是否為官方套件
- 考慮先搜尋套件資訊

---

## 運作流程

### 自動執行流程

```
1. Claude 決定使用 Read 工具
       ↓
2. 權限系統檢查 permissions.json
       ↓
3. 發現 Read 在 autoApprove 列表中
       ↓
4. 立即執行工具
       ↓
5. 回傳結果給 Claude
```

**使用者體驗：**
- 無感知延遲
- 流暢的對話體驗
- 適合探索性操作

---

### 需要確認流程

```
1. Claude 決定使用 Edit 工具
       ↓
2. 權限系統檢查 permissions.json
       ↓
3. 發現 Edit 在 requireConfirmation 列表中
       ↓
4. 生成確認訊息
       ↓
5. 在 Telegram 顯示訊息和按鈕
       ↓
6. 等待使用者回應
       ↓
7a. 使用者點選「確認」 → 執行工具
7b. 使用者點選「取消」 → 取消操作
```

**確認訊息格式：**

```
🔒 需要確認操作

即將編輯檔案：
/Users/vincewang/project/src/app.ts

變更內容：
- 新增 API 端點
- 更新錯誤處理

[✅ 確認執行] [❌ 取消]
```

---

### Bash 指令特殊處理

```
1. Claude 決定執行 Bash 指令：`npm install express`
       ↓
2. 權限系統檢查 Bash 在 requireConfirmation 中
       ↓
3. 進入 bashCommandRules 檢查
       ↓
4. 檢查指令是否以 autoApprove 模式開頭
   → "npm install" 不符合 ["ls", "pwd", ...] 任一項
       ↓
5. 檢查指令是否包含 requireConfirmation 模式
   → 包含 "npm install" ✓
       ↓
6. 需要確認，顯示確認訊息
```

**確認訊息：**

```
🔒 需要確認操作

即將執行指令：
npm install express

⚠️ 這會安裝新套件並可能執行 scripts

[✅ 確認執行] [❌ 取消]
```

---

## 自訂權限

### 新增自動執行工具

**場景：** 想讓 `NotebookEdit` 工具自動執行

**步驟：**

1. 編輯 `config/permissions.json`

```json
{
  "autoApprove": [
    "Read",
    "Glob",
    "Grep",
    "WebSearch",
    "WebFetch",
    "NotebookEdit"  // ← 新增這行
  ],
  ...
}
```

2. 重啟 bot

```bash
/restart
```

3. 測試

```
你：「幫我更新 notebook 的第一個 cell」
Claude：（自動執行 NotebookEdit，無需確認）
```

---

### 新增需確認工具

**場景：** 想讓 `WebFetch` 需要確認（因為擔心抓取敏感網站）

**步驟：**

1. 編輯 `config/permissions.json`

```json
{
  "autoApprove": [
    "Read",
    "Glob",
    "Grep",
    "WebSearch"
    // ← 移除 WebFetch
  ],
  "requireConfirmation": [
    "Edit",
    "Write",
    "Bash",
    "WebFetch"  // ← 新增這行
  ],
  ...
}
```

2. 重啟 bot

3. 測試

```
你：「幫我抓取這個網站的內容」
Bot：
🔒 需要確認操作

即將取得網頁內容：
https://example.com

[✅ 確認] [❌ 取消]
```

---

### 自訂 Bash 指令規則

**場景：** 想讓 `git status` 自動執行，但 `git reset` 需要確認

**步驟：**

1. 編輯 `config/permissions.json`

```json
{
  ...
  "bashCommandRules": {
    "autoApprove": [
      "ls",
      "pwd",
      "cat",
      "grep",
      "find",
      "echo",
      "which",
      "git status",   // ← 新增
      "git log",      // ← 新增
      "git diff"      // ← 新增
    ],
    "requireConfirmation": [
      "rm",
      "mv",
      "cp",
      "git commit",
      "git push",
      "git reset",    // ← 新增
      "npm install",
      "bun install",
      "pip install"
    ]
  }
}
```

2. 重啟 bot

3. 測試

```
你：「檢查 git 狀態」
Claude：執行 `git status`
→ 自動執行 ✓

你：「重置最後一個 commit」
Claude：執行 `git reset --hard HEAD~1`
→ 需要確認 ⚠️
```

---

### 模式匹配技巧

#### 精確匹配

```json
"autoApprove": ["git status"]
```

只匹配：
- ✅ `git status`
- ✅ `git status --short`
- ❌ `git status-check`（不是以空格開頭）

#### 前綴匹配

```json
"autoApprove": ["git diff"]
```

匹配：
- ✅ `git diff`
- ✅ `git diff HEAD~1`
- ✅ `git diff --staged`
- ❌ `git-diff-tool`

#### 包含匹配（requireConfirmation）

```json
"requireConfirmation": ["rm"]
```

匹配：
- ✅ `rm file.txt`
- ✅ `rm -rf directory/`
- ✅ `sudo rm important.db`
- ⚠️ 也會匹配 `echo "rm"` （假陽性）

**建議：** requireConfirmation 使用較具體的模式，如 `rm ` 或 `rm -`

---

## 安全考量

### 多層防護

權限系統只是安全機制的一部分，bot 採用深度防禦策略：

```
┌─────────────────────────────────────┐
│  1. 使用者授權檢查                    │
│     TELEGRAM_ALLOWED_USERS           │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  2. 路徑驗證                          │
│     ALLOWED_PATHS                    │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  3. 權限控制系統 ← 本文件              │
│     config/permissions.json          │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  4. 指令安全檢查                      │
│     阻擋 rm -rf /, dd 等              │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  5. 審計日誌                          │
│     /tmp/claude-telegram-audit.log   │
└─────────────────────────────────────┘
```

### 路徑限制

即使權限系統允許，所有檔案操作仍受 `ALLOWED_PATHS` 限制：

```bash
# .env
ALLOWED_PATHS=/Users/vincewang,/Users/vincewang/projects,~/.claude
```

**範例：**

```
Claude：執行 Read("/etc/passwd")
→ 權限：自動執行 ✓
→ 路徑檢查：不在 ALLOWED_PATHS ✗
→ 結果：拒絕存取
```

### 指令黑名單

某些極度危險的指令模式會被直接阻擋，不論權限設定：

**阻擋模式：**
- `rm -rf /`
- `dd if=/dev/zero`
- `:(){ :|:& };:`（fork bomb）
- `chmod -R 777 /`

**保護機制：**
即使在 autoApprove 清單中，這些指令也會被拒絕。

### 審計日誌

所有操作都會記錄到審計日誌：

**位置：**
```
/tmp/claude-telegram-audit.log
```

**日誌格式：**
```
[2026-01-29 14:30:15] USER=123456789 TOOL=Edit FILE=/path/to/file.ts STATUS=approved
[2026-01-29 14:30:20] USER=123456789 TOOL=Bash CMD="npm install" STATUS=approved
[2026-01-29 14:30:25] USER=123456789 TOOL=Write FILE=/path/to/new.ts STATUS=denied
```

**用途：**
- 追蹤所有操作
- 安全事件調查
- 使用模式分析

---

## 常見問題

### Q: 為什麼 `git commit` 需要確認？

**A:** 雖然 commit 是本地操作，但它會永久記錄變更到版本歷史。確認步驟可以讓你：

1. 檢查 commit message 是否恰當
2. 確認沒有包含敏感資訊
3. 避免錯誤的 commit（如 `--amend`）

如果你信任 Claude 的判斷，可以將 `git commit` 移至 `autoApprove`。

---

### Q: 可以完全關閉權限系統嗎？

**A:** 不建議，但技術上可行。將所有工具移至 `autoApprove`：

```json
{
  "autoApprove": [
    "Read", "Glob", "Grep", "WebSearch", "WebFetch",
    "Edit", "Write", "Bash"
  ],
  "requireConfirmation": []
}
```

**風險：**
- Claude 可以執行任何操作
- 無法防止意外破壞
- 失去最後一道防線

**替代方案：**
- 只自動執行你信任的特定指令
- 使用更細粒度的 bashCommandRules

---

### Q: 如何知道哪些工具可用？

**A:** 可用工具取決於 MCP 伺服器配置。常見的 Claude Code 內建工具：

**檔案操作：**
- Read, Write, Edit
- Glob, Grep

**執行：**
- Bash

**網路：**
- WebSearch, WebFetch

**其他：**
- Task, Agent
- 自訂 MCP 工具

要查看完整列表，可以：
1. 檢視 `mcp-config.ts`
2. 在對話中問 Claude：「你有哪些工具可用？」

---

### Q: 權限設定何時生效？

**A:** 權限配置在以下情況重新載入：

1. **Bot 重啟時**
   ```
   /restart
   ```

2. **程式啟動時**
   ```bash
   bun run src/index.ts
   ```

**注意：** 修改 `permissions.json` 後必須重啟 bot。

---

### Q: 如何測試新的權限規則？

**步驟：**

1. **備份原配置**
   ```bash
   cp config/permissions.json config/permissions.json.backup
   ```

2. **修改規則**
   編輯 `config/permissions.json`

3. **重啟 bot**
   ```
   /restart
   ```

4. **測試操作**
   ```
   你：「請讀取 package.json」（測試 Read）
   你：「請修改 README.md」（測試 Edit）
   ```

5. **檢查行為**
   - 自動執行 → 無確認訊息
   - 需要確認 → 顯示確認按鈕

6. **如果出錯，恢復備份**
   ```bash
   cp config/permissions.json.backup config/permissions.json
   ```

---

### Q: 確認訊息可以自訂嗎？

**A:** 目前確認訊息格式是固定的，由 `src/permissions.ts` 中的 `createConfirmationMessage()` 函數產生。

**客製化方式：**

編輯 `src/permissions.ts`：

```typescript
export function createConfirmationMessage(
  tool: string,
  params: any
): string {
  let message = `🔒 需要確認操作\n\n`;

  if (tool === "Bash") {
    message += `即將執行指令：\n\`\`\`bash\n${params.command}\n\`\`\`\n`;

    // ← 在這裡新增自訂訊息
    message += `\n⚠️ 請仔細檢查指令是否正確\n`;
  }

  // ... 其他工具

  return message;
}
```

---

### Q: 多使用者環境如何處理？

**A:** 目前權限配置是全域的，所有使用者共用相同規則。

**多使用者場景：**

如果你有多個授權使用者（`TELEGRAM_ALLOWED_USERS` 包含多個 ID），他們都受相同權限規則約束。

**未來改進：**
可以擴展系統支援每個使用者的自訂規則：

```json
{
  "users": {
    "123456789": {
      "autoApprove": ["Read", "Edit", "Write"]
    },
    "987654321": {
      "autoApprove": ["Read"],
      "requireConfirmation": ["Edit", "Write"]
    }
  }
}
```

---

### Q: 如何處理長時間執行的指令？

**A:** 權限確認有時效限制（預設 5 分鐘），超時未回應會自動取消。

**調整方式：**

編輯 `src/permissions.ts`（假設有超時機制）：

```typescript
const CONFIRMATION_TIMEOUT = 5 * 60 * 1000; // 5 分鐘
```

**建議：**
- 不要設定太長的超時（安全風險）
- 長時間操作應該拆分成多個步驟
- 使用 `/status` 監控執行狀態

---

### Q: 權限系統對效能有影響嗎？

**A:** 影響極小。

**效能特性：**
- 配置檔案在首次使用時載入並快取
- 檢查權限只需簡單的陣列查詢（O(n)）
- 沒有網路請求或磁碟 I/O

**測量結果：**
- 權限檢查 < 1ms
- 使用者無感知延遲

---

### Q: 發生權限錯誤如何除錯？

**步驟：**

1. **檢查配置檔案格式**
   ```bash
   cat config/permissions.json | bun run -
   ```
   確保是有效的 JSON。

2. **查看 bot 日誌**
   ```bash
   tail -f /tmp/claude-telegram-bot-ts.err
   ```
   尋找權限相關錯誤訊息。

3. **測試權限模組**
   ```bash
   bun test src/permissions.test.ts
   ```

4. **驗證工具名稱**
   工具名稱大小寫必須精確匹配：
   - ✅ `"Read"`
   - ❌ `"read"`
   - ❌ `"READ"`

5. **檢查 Bash 規則語法**
   ```json
   {
     "bashCommandRules": {
       "autoApprove": ["ls"],      // ✅ 正確
       "autoApprove": ["ls -la"]   // ⚠️ 會匹配 "ls -la" 開頭的指令
     }
   }
   ```

---

## 最佳實踐

### 1. 從嚴格開始，逐步放寬

**初始配置：**
```json
{
  "autoApprove": ["Read", "Glob", "Grep"],
  "requireConfirmation": ["Edit", "Write", "Bash"]
}
```

觀察使用模式 1-2 週後，根據實際需求調整。

---

### 2. 定期審查權限設定

**檢查清單：**
- [ ] 是否有不再使用的工具可以移除？
- [ ] 是否有頻繁確認但安全的操作可以自動執行？
- [ ] 是否有新增的危險操作需要加入確認？

**頻率：** 每月一次

---

### 3. 為專案建立獨立配置

不同專案可能有不同的安全需求。

**範例：**

**個人筆記專案**（較寬鬆）：
```json
{
  "autoApprove": ["Read", "Glob", "Grep", "Edit", "Write"],
  "requireConfirmation": ["Bash"]
}
```

**生產環境程式碼**（嚴格）：
```json
{
  "autoApprove": ["Read", "Glob", "Grep"],
  "requireConfirmation": ["Edit", "Write", "Bash"]
}
```

**實作方式：**
可以用環境變數切換配置檔案：
```bash
PERMISSIONS_CONFIG=config/permissions-strict.json
```

---

### 4. 記錄重要決策

在 `permissions.json` 同目錄建立 `permissions-notes.md` 記錄：
- 為什麼某個工具在 autoApprove
- 特殊規則的原因
- 調整歷史

**範例：**
```markdown
# 權限配置說明

## 2026-01-29
- 將 git status 加入 autoApprove
- 理由：頻繁使用且無風險

## 2026-01-25
- 將 npm install 移至 requireConfirmation
- 理由：發生過一次錯誤安裝
```

---

### 5. 使用 Git 追蹤權限變更

```bash
git add config/permissions.json
git commit -m "permissions: add git status to auto-approve"
```

好處：
- 可以回溯變更歷史
- 團隊協作時同步設定
- 出問題時可以快速恢復

---

## 進階主題

### 條件式權限（概念）

未來可能支援基於條件的權限規則：

```json
{
  "conditionalRules": [
    {
      "tool": "Edit",
      "condition": {
        "pathPattern": "docs/**/*.md"
      },
      "action": "autoApprove"
    },
    {
      "tool": "Edit",
      "condition": {
        "pathPattern": "src/**/*.ts"
      },
      "action": "requireConfirmation"
    }
  ]
}
```

**說明：**
- 編輯文件檔案（docs/）自動執行
- 編輯程式碼（src/）需要確認

---

### 權限預設集（Presets）

可以定義常用的權限組合：

```json
{
  "presets": {
    "strict": {
      "autoApprove": ["Read", "Glob", "Grep"],
      "requireConfirmation": ["Edit", "Write", "Bash"]
    },
    "moderate": {
      "autoApprove": ["Read", "Glob", "Grep", "Edit"],
      "requireConfirmation": ["Write", "Bash"]
    },
    "permissive": {
      "autoApprove": ["Read", "Glob", "Grep", "Edit", "Write"],
      "requireConfirmation": ["Bash"]
    }
  },
  "activePreset": "moderate"
}
```

**切換方式：**
```
/permissions strict
/permissions moderate
```

---

### 工作階段權限升級

允許在特定工作階段暫時提升權限：

```
你：「接下來的操作請自動執行所有指令」
Bot：「🔓 已啟用權限升級模式（持續 30 分鐘）」

（30 分鐘內所有操作自動執行）

Bot：「🔒 權限升級模式已過期，恢復正常模式」
```

**實作建議：**
- 時間限制（例如 30 分鐘）
- 需要明確指令啟用
- 自動過期並通知

---

## 相關文件

- [COMMANDS.md](COMMANDS.md) - 完整指令參考
- [README.md](../README.md) - 專案概述
- [SECURITY.md](../SECURITY.md) - 整體安全模型
- [config/permissions.json](../config/permissions.json) - 實際配置檔案

---

**最後更新：** 2026-01-29

**貢獻：** 如有改進建議，歡迎提出 issue 或 PR。
