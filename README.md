# Claude Telegram Bot - Enhanced Edition

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-1.0+-black.svg)](https://bun.sh/)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/a23444452/Claude_Code_Telegram_Bot/releases)
[![Tests](https://img.shields.io/badge/tests-51%20passing-brightgreen.svg)](https://github.com/a23444452/Claude_Code_Telegram_Bot)

**透過 Telegram 隨時隨地存取 [Claude Code](https://claude.com/product/claude-code)，打造你的個人 AI 助理。**

發送文字、語音、照片和文件，即時查看回應和工具使用狀況。支援工作目錄管理、智慧權限控制和使用統計追蹤。

基於 [linuz90/claude-telegram-bot](https://github.com/linuz90/claude-telegram-bot) 開發的增強版本。

---

## ✨ 主要特色

### 💬 多媒體互動
- **文字對話** - 提問、下指令、進行對話
- **語音訊息** - 自然說話，透過 OpenAI 轉錄後由 Claude 處理
- **照片分析** - 發送截圖、文件或任何視覺內容進行分析
- **文件處理** - PDF、程式碼檔案、壓縮檔 (ZIP, TAR) 自動解壓並分析

### 🗂️ 工作目錄管理 ⭐ 新功能
輕鬆管理 Claude 的工作目錄，讓 Claude 能在正確的專案路徑下工作：

- **`/pwd`** - 顯示當前工作目錄
- **`/ls [path]`** - 列出目錄內容
  - 支援相對路徑：`/ls Documents`
  - 支援絕對路徑：`/ls ~/projects/my-app`
  - 顯示檔案類型圖示 (📁 資料夾、📄 檔案)
- **`/cd <path>`** - 切換工作目錄
  - 支援相對路徑：`/cd projects`
  - 支援回到上層：`/cd ..`
  - 內建路徑安全驗證

**使用範例：**
```
你: /cd ~/projects/my-app
Bot: ✅ 已切換到 /Users/vincewang/projects/my-app

你: /ls src
Bot: 📁 components
     📁 utils
     📄 index.ts
     📄 App.tsx

你: 幫我重構 src/utils/helpers.ts
Bot: [Claude 開始分析並重構...]
```

### 🔐 混合模式權限控制 ⭐ 新功能
智慧型權限系統，在安全性和使用體驗間取得最佳平衡：

**自動執行（無需確認）**
- 檔案讀取：`Read`, `Glob`, `Grep`
- 網路查詢：`WebSearch`, `WebFetch`
- 安全指令：`ls`, `pwd`, `cat`, `grep`, `find`, `echo`, `which`

**需要確認**
- 檔案修改：`Edit`, `Write`
- 危險指令：`rm`, `mv`, `cp`, `git commit`, `git push`, `npm install`, `bun install`

**可自訂配置** - 透過 `config/permissions.json` 調整規則

詳細說明請參考 [權限系統文件](docs/PERMISSIONS.md)

### 📊 使用統計追蹤 ⭐ 新功能
即時追蹤你的使用狀況：

```
你: /stats
Bot: 📊 使用統計

     👤 User ID: 8570068728
     📝 總請求數: 42
     🔢 總 Token 數: 125,430
     ⏰ 最後活動: 2026/01/29 下午2:45
     📅 建立時間: 2026/01/29 上午10:30
```

### 🔄 Session 管理
- **Session 持久化** - 對話跨訊息持續進行
- **訊息佇列** - 可同時發送多則訊息，自動排隊處理
- **中斷控制** - 訊息開頭加 `!` 或使用 `/stop` 立即中斷並發送
- **Session 恢復** - 使用 `/resume` 從最近的對話中選擇並繼續

### 🧠 深度思考模式
在訊息中包含特定關鍵字，觸發 Claude 的推理過程，你會看到完整的思考步驟：

- 預設關鍵字：`think`, `pensa`, `ragiona`
- 深度思考：`ultrathink`, `think hard`, `pensa bene`
- 可透過環境變數自訂關鍵字

**使用範例：**
```
你: think 比較 React 和 Vue 的優缺點
Bot: [顯示思考過程...]
     [提供詳細比較分析...]
```

### 🔘 互動式按鈕
Claude 可透過內建的 `ask_user` MCP 工具呈現選項，以可點擊的按鈕方式讓你選擇。

---

## 🚀 快速開始

### 超快速啟動（一鍵腳本）

```bash
# 1. Clone 專案
git clone https://github.com/a23444452/Claude_Code_Telegram_Bot.git
cd Claude_Code_Telegram_Bot

# 2. 設定環境變數（首次需要）
cp .env.example .env
nano .env  # 編輯並填入你的 Bot Token 和 User ID

# 3. 執行一鍵啟動腳本
./start.sh
```

腳本會自動：
- ✅ 檢查 Bun 安裝
- ✅ 驗證配置檔案
- ✅ 安裝依賴（如需要）
- ✅ 執行測試驗證
- ✅ 提供啟動選項（前台/背景）

### 手動啟動

```bash
# 1. Clone 專案
git clone https://github.com/a23444452/Claude_Code_Telegram_Bot.git
cd Claude_Code_Telegram_Bot

# 2. 安裝依賴
bun install

# 3. 設定環境變數
cp .env.example .env
nano .env  # 編輯設定

# 4. 啟動 Bot
bun run src/index.ts
```

### 管理腳本

- **`./start.sh`** - 一鍵啟動（含環境檢查）
- **`./stop.sh`** - 停止 Bot
- **`./status.sh`** - 完整健康檢查

---

## 📋 前置需求

- **Bun 1.0+** - [安裝 Bun](https://bun.sh/)
- **Claude Agent SDK** - `@anthropic-ai/claude-agent-sdk` (透過 bun install 自動安裝)
- **Telegram Bot Token** - 從 [@BotFather](https://t.me/BotFather) 取得
- **Claude 認證** - CLI 認證（推薦）或 API Key
- **OpenAI API Key** (可選) - 用於語音訊息轉錄

---

## ⚙️ 設定步驟

### 1. 建立 Telegram Bot

1. 在 Telegram 開啟 [@BotFather](https://t.me/BotFather)
2. 發送 `/newbot` 並按照指示建立你的 bot
3. 複製 bot token (格式：`1234567890:ABC-DEF...`)

設定 bot 指令，發送 `/setcommands` 給 BotFather 並貼上：

```
start - 顯示狀態和使用者 ID
new - 開始新的 session
resume - 從最近的 session 中選擇並恢復
stop - 中斷當前查詢
status - 檢查 Claude 正在做什麼
restart - 重啟 bot
pwd - 顯示當前工作目錄
ls - 列出目錄內容
cd - 切換工作目錄
stats - 顯示使用統計
```

### 2. 取得你的 Telegram User ID

1. 在 Telegram 搜尋 [@userinfobot](https://t.me/userinfobot)
2. 發送任意訊息
3. 複製你的 User ID (例如：`123456789`)

### 3. Claude 認證

Bot 使用 `@anthropic-ai/claude-agent-sdk`，支援兩種認證方式：

| 方式 | 適用情境 | 設定方法 |
|------|----------|----------|
| **CLI 認證**（推薦） | 高用量、成本效益 | 執行 `claude` 一次並完成認證 |
| **API Key** | CI/CD、無 Claude Code 的環境 | 在 `.env` 設定 `ANTHROPIC_API_KEY` |

**CLI 認證**（推薦）：SDK 會自動使用你的 Claude Code 登入。只需確保你至少執行過一次 `claude` 並完成認證。這會使用你的 Claude Code 訂閱，對於重度使用來說更划算。

**API Key**：適用於沒有安裝 Claude Code 的環境。從 [console.anthropic.com](https://console.anthropic.com/) 取得 API key 並加入 `.env`：

```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
```

注意：API 使用按 token 計費，重度使用可能費用較高。

### 4. 設定環境變數

建立 `.env` 檔案並填入設定：

```bash
# ============== 必要設定 ==============

# Telegram Bot Token (從 @BotFather 取得)
TELEGRAM_BOT_TOKEN=1234567890:ABC-DEF...

# 允許使用的 Telegram User ID (從 @userinfobot 取得)
# 可設定多個，用逗號分隔：123456789,987654321
TELEGRAM_ALLOWED_USERS=123456789

# ============== 推薦設定 ==============

# Claude 工作目錄（Bot 會在這個目錄下執行命令）
CLAUDE_WORKING_DIR=/Users/你的使用者名稱

# ============== 可選設定 ==============

# OpenAI API Key（用於語音訊息轉錄）
OPENAI_API_KEY=sk-...

# Anthropic API Key（如果不使用 CLI 認證）
# ANTHROPIC_API_KEY=sk-ant-api03-...
```

**檔案存取路徑**：預設情況下，Claude 可以存取：

- `CLAUDE_WORKING_DIR` (或 home 目錄，如未設定)
- `~/Documents`, `~/Downloads`, `~/Desktop`
- `~/.claude` (用於 Claude Code 的計畫和設定)

若要自訂，在 `.env` 設定 `ALLOWED_PATHS` (逗號分隔)。注意：這會**覆蓋**所有預設值，如果你需要 plan mode 運作，請包含 `~/.claude`：

```bash
ALLOWED_PATHS=/your/project,/other/path,~/.claude
```

### 5. (可選) 設定 MCP 伺服器

複製並編輯 MCP 配置：

```bash
cp mcp-config.ts mcp-config.local.ts
# 編輯 mcp-config.local.ts，加入你的 MCP 伺服器
```

Bot 內建 `ask_user` MCP 伺服器，讓 Claude 能以可點擊的 inline keyboard 按鈕呈現選項。你可以加入自己的 MCP 伺服器 (Things, Notion, Typefully 等)，讓 Claude 存取你的工具。

---

## 🎮 Bot 指令

### 基本指令

| 指令 | 說明 |
|------|------|
| `/start` | 顯示狀態和你的 user ID |
| `/new` | 開始新的 session |
| `/resume` | 從最近 5 個 session 中選擇並恢復（含摘要） |
| `/stop` | 中斷當前查詢 |
| `/status` | 檢查 Claude 正在做什麼 |
| `/restart` | 重啟 bot |

### 工作目錄管理 ⭐

| 指令 | 說明 | 範例 |
|------|------|------|
| `/pwd` | 顯示當前工作目錄 | `/pwd` |
| `/ls [path]` | 列出目錄內容 | `/ls`<br>`/ls Documents`<br>`/ls ~/projects` |
| `/cd <path>` | 切換工作目錄 | `/cd projects`<br>`/cd ..` |

### 統計功能 ⭐

| 指令 | 說明 |
|------|------|
| `/stats` | 顯示使用統計（請求數、token 使用量等） |

詳細指令說明請參考 [指令參考文件](docs/COMMANDS.md)

---

## 🔧 進階功能

### 權限控制自訂

編輯 `config/permissions.json` 自訂權限規則：

```json
{
  "autoApprove": [
    "Read", "Glob", "Grep",
    "WebSearch", "WebFetch"
  ],
  "requireConfirmation": [
    "Edit", "Write", "Bash"
  ],
  "bashCommandRules": {
    "autoApprove": [
      "ls", "pwd", "cat", "grep", "find"
    ],
    "requireConfirmation": [
      "rm", "mv", "cp", "git commit", "git push"
    ]
  }
}
```

詳細說明請參考 [權限系統文件](docs/PERMISSIONS.md)

### 系統服務設定（macOS）

讓 Bot 開機自動啟動並在背景持續執行：

```bash
# 複製並編輯 plist 檔案
cp launchagent/com.claude-telegram-ts.plist.template \
   ~/Library/LaunchAgents/com.claude-telegram-enhanced.plist

# 編輯路徑和環境變數
nano ~/Library/LaunchAgents/com.claude-telegram-enhanced.plist

# 載入服務
launchctl bootstrap gui/$(id -u) \
  ~/Library/LaunchAgents/com.claude-telegram-enhanced.plist
```

**防止 Mac 休眠**（可選）：

前往 **系統設定 → 電池 → 選項**，啟用「顯示器關閉時防止自動睡眠」（使用電源轉接器時）。

**管理別名**：在 `~/.zshrc` 加入：

```bash
alias tbot='launchctl list | grep com.claude-telegram-enhanced'
alias tbot-start='launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.claude-telegram-enhanced.plist'
alias tbot-stop='launchctl bootout gui/$(id -u)/com.claude-telegram-enhanced'
alias tbot-restart='launchctl kickstart -k gui/$(id -u)/com.claude-telegram-enhanced'
alias tbot-logs='tail -f /tmp/claude-telegram-bot-ts.log'
```

---

## 🧪 測試

```bash
# 執行所有測試
bun test

# TypeScript 類型檢查
bun run typecheck
```

**測試結果**：
- ✅ 51 項測試全部通過
- ✅ 100% 通過率
- ✅ 涵蓋單元測試和整合測試

詳細測試報告請參考 [測試文件](docs/TEST_REPORT.md)

---

## 📚 完整文件

- 📖 **[快速開始指南](docs/GETTING_STARTED.md)** - 詳細的一步步設定教學
- 📊 **[設定流程圖](docs/SETUP_FLOWCHART.md)** - 視覺化設定流程
- 📋 **[指令參考](docs/COMMANDS.md)** - 所有可用指令的完整說明
- 🔐 **[權限系統](docs/PERMISSIONS.md)** - 權限控制系統的詳細文件
- ✅ **[測試報告](docs/TEST_REPORT.md)** - 測試結果和手動測試清單
- ⚡ **[快速參考](QUICK_REFERENCE.md)** - 所有指令和操作的速查表
- 📝 **[更新日誌](CHANGELOG.md)** - 版本更新歷史

---

## 🔒 安全性

> **⚠️ 重要提醒**：此 bot 執行 Claude Code 時會**繞過所有權限提示**。Claude 可以在允許的路徑內讀取、寫入和執行命令，無需確認。這是為了提供流暢的行動體驗而刻意設計的，但在部署前你應該了解其影響。

**→ [閱讀完整安全模型說明](docs/PERMISSIONS.md)** 了解權限運作方式和防護措施。

多重防護層級：

1. **使用者白名單** - 只有你的 Telegram ID 可以使用 bot
2. **混合權限控制** - 安全操作自動執行，危險操作需確認
3. **路徑驗證** - 檔案存取限制在 `ALLOWED_PATHS`
4. **指令安全** - 封鎖危險模式如 `rm -rf /`
5. **速率限制** - 防止失控使用
6. **審計日誌** - 所有互動記錄到 `/tmp/claude-telegram-audit.log`

---

## 🐛 故障排除

### Bot 沒有回應

- 確認你的 user ID 在 `TELEGRAM_ALLOWED_USERS` 中
- 檢查 bot token 是否正確
- 查看日誌：`tail -f /tmp/claude-telegram-bot-ts.log`
- 確認 bot 進程正在執行：`./status.sh`

### Claude 認證問題

- CLI 認證：在終端機執行 `claude` 確認已登入
- API key：檢查 `ANTHROPIC_API_KEY` 已設定且格式為 `sk-ant-api03-`
- 在 [console.anthropic.com](https://console.anthropic.com/) 確認 API key 有額度

### 語音訊息失敗

- 確認 `OPENAI_API_KEY` 已在 `.env` 設定
- 確認 key 有效且有額度

### Claude 無法存取檔案

- 檢查 `CLAUDE_WORKING_DIR` 指向存在的目錄
- 確認 `ALLOWED_PATHS` 包含你要存取的目錄
- 確認 bot 進程有讀寫權限

### MCP 工具無法運作

- 確認 `mcp-config.ts` 存在且正確匯出
- 檢查 MCP 伺服器的依賴已安裝
- 查看日誌中的 MCP 錯誤訊息

更多故障排除資訊請參考 [快速開始指南](docs/GETTING_STARTED.md) 的「常見問題」章節。

---

## 🎯 使用範例

### 日常開發助手

```
你: /cd ~/projects/my-app
Bot: ✅ 已切換到 /Users/vincewang/projects/my-app

你: /ls src
Bot: 📁 components
     📁 utils
     📄 index.ts

你: 幫我重構 src/utils/helpers.ts，移除重複的程式碼
Bot: [開始分析並重構...]
```

### 文件分析

```
你: /cd ~/Downloads
你: [上傳 PDF 檔案]
你: 幫我整理這份報告的重點
Bot: [分析並整理重點...]
```

### 深度思考

```
你: think 比較 Docker 和 Podman 的優缺點
Bot: [顯示思考過程]
     [提供詳細比較分析...]
```

---

## 🤝 貢獻

歡迎貢獻！請隨時：

- 🐛 [回報問題](https://github.com/a23444452/Claude_Code_Telegram_Bot/issues)
- 💡 [提出功能建議](https://github.com/a23444452/Claude_Code_Telegram_Bot/issues/new)
- 🔀 提交 Pull Request

---

## 📄 授權

MIT License - 詳見 [LICENSE](LICENSE) 檔案

---

## 🙏 致謝

- **原始專案**：[linuz90/claude-telegram-bot](https://github.com/linuz90/claude-telegram-bot) - 感謝提供優秀的基礎架構
- **框架**：[Grammy](https://grammy.dev/) - Telegram Bot Framework
- **AI SDK**：[Anthropic Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk-typescript)
- **Runtime**：[Bun](https://bun.sh/) - Fast all-in-one JavaScript runtime

---

## 📊 專案統計

- **版本**：v1.0.0
- **程式語言**：TypeScript
- **測試**：51 項測試，100% 通過率
- **文件**：7 個主要文件，總計 60+ KB
- **授權**：MIT

---

**有問題嗎？** 查看 [完整文件](docs/GETTING_STARTED.md) 或在 [GitHub Issues](https://github.com/a23444452/Claude_Code_Telegram_Bot/issues) 提問。

**準備開始了嗎？** 執行 `./start.sh` 並在 Telegram 開始使用！🚀
