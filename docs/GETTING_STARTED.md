# 快速開始指南 (Getting Started Guide)

這份指南將帶你從零開始,完成 Claude Telegram Bot Enhanced Edition 的完整設定與使用。

## 📋 目錄

1. [前置需求](#前置需求)
2. [環境設定](#環境設定)
3. [Telegram Bot 設定](#telegram-bot-設定)
4. [Claude 認證設定](#claude-認證設定)
5. [專案安裝](#專案安裝)
6. [配置檔案設定](#配置檔案設定)
7. [啟動 Bot](#啟動-bot)
8. [測試功能](#測試功能)
9. [設定為系統服務](#設定為系統服務-macos)
10. [常見問題](#常見問題)

---

## 前置需求

在開始之前,請確認你已具備以下條件:

### 必要條件

- ✅ **macOS** (或 Linux)
- ✅ **Bun 1.0+** 已安裝
- ✅ **Git** 已安裝
- ✅ **Telegram 帳號**
- ✅ **Claude Code 訂閱** (推薦) 或 **Anthropic API Key**

### 可選條件

- 🔹 **OpenAI API Key** (用於語音訊息轉錄)
- 🔹 **基本終端機操作知識**

---

## 環境設定

### 1. 安裝 Bun

如果尚未安裝 Bun:

```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# 驗證安裝
bun --version
```

應該會看到類似 `1.3.7` 的版本號。

### 2. 安裝 Claude Code (推薦)

```bash
# 使用 npm 安裝
npm install -g @anthropic-ai/claude-code

# 驗證安裝
claude --version
```

### 3. Claude 認證

選擇以下其中一種認證方式:

#### 方式 A: CLI 認證 (推薦 - 使用 Claude Code 訂閱)

```bash
# 執行 Claude Code 並登入
claude

# 第一次執行會要求登入
# 按照指示完成 Web 登入流程
# 登入成功後即可關閉 Claude
```

**優點**: 使用你的 Claude Code 訂閱,無額外費用,高用量也划算

#### 方式 B: API Key 認證

1. 前往 [Anthropic Console](https://console.anthropic.com/)
2. 建立 API Key (格式: `sk-ant-api03-...`)
3. 稍後在 `.env` 檔案中設定

**注意**: API 使用按 token 計費,重度使用可能費用較高

---

## Telegram Bot 設定

### 1. 建立 Telegram Bot

在 Telegram 中與 [@BotFather](https://t.me/BotFather) 對話:

```
1. 開啟 Telegram
2. 搜尋 @BotFather
3. 發送 /newbot
4. 按照指示操作:
   - Bot 名稱: 例如 "My Claude Assistant"
   - Bot 用戶名: 例如 "my_claude_bot" (必須以 _bot 結尾)
5. 完成後會收到 Bot Token (類似: 1234567890:ABC-DEF...)
```

**重要**: 妥善保管你的 Bot Token,不要分享給他人!

### 2. 設定 Bot 指令

繼續與 @BotFather 對話:

```
發送: /setcommands
選擇你剛建立的 bot
貼上以下內容:
```

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

### 3. 取得你的 Telegram User ID

1. 在 Telegram 中搜尋 [@userinfobot](https://t.me/userinfobot)
2. 發送任意訊息給它
3. 它會回覆你的 User ID (例如: `123456789`)

**記下這個 ID,稍後會用到!**

---

## 專案安裝

### 1. Clone 專案

```bash
# Clone 到你想要的目錄
cd ~
git clone https://github.com/a23444452/Claude_Code_Telegram_Bot.git
cd Claude_Code_Telegram_Bot
```

### 2. 安裝依賴

```bash
bun install
```

等待安裝完成,應該會安裝約 108 個套件。

### 3. 驗證安裝

```bash
# 執行測試確認一切正常
bun test
```

應該會看到:

```
✓ 51 pass
✓ 0 fail
✓ Ran 51 tests across 10 files
```

---

## 配置檔案設定

### 1. 建立 .env 檔案

```bash
# 複製範例檔案
cp .env.example .env

# 使用編輯器開啟 .env
# 你可以用 nano, vim, 或任何文字編輯器
nano .env
```

### 2. 設定必要環境變數

在 `.env` 檔案中設定以下內容:

```bash
# ============== 必要設定 ==============

# Telegram Bot Token (從 @BotFather 取得)
TELEGRAM_BOT_TOKEN=你的_Bot_Token

# 允許使用的 Telegram User ID (從 @userinfobot 取得)
# 可以設定多個,用逗號分隔: 123456789,987654321
TELEGRAM_ALLOWED_USERS=你的_User_ID

# ============== 推薦設定 ==============

# Claude 工作目錄 (Bot 會在這個目錄下執行命令)
# 建議設定為你的主目錄或專案目錄
CLAUDE_WORKING_DIR=/Users/你的使用者名稱

# ============== 可選設定 ==============

# OpenAI API Key (用於語音訊息轉錄)
# 如果不需要語音功能可以不設定
OPENAI_API_KEY=sk-...

# Anthropic API Key (如果不使用 Claude CLI 認證)
# 只在沒有 Claude Code 訂閱時需要
# ANTHROPIC_API_KEY=sk-ant-api03-...

# 允許存取的路徑 (逗號分隔,會覆蓋預設值)
# 不設定則使用預設: WORKING_DIR, ~/Documents, ~/Downloads, ~/Desktop, ~/.claude
# ALLOWED_PATHS=/path1,/path2,~/.claude
```

### 3. 範例配置

```bash
# 完整範例 (請替換成你自己的值)
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_ALLOWED_USERS=123456789
CLAUDE_WORKING_DIR=/Users/vincewang
OPENAI_API_KEY=sk-proj-abcdefghijklmnopqrstuvwxyz
```

**儲存檔案後關閉編輯器** (nano: Ctrl+X, 然後 Y, 然後 Enter)

### 4. 權限配置 (可選)

如果想自訂權限規則:

```bash
# 編輯權限配置
nano config/permissions.json
```

預設配置已經很完善,建議初次使用者保持預設值。詳細說明請參考 [docs/PERMISSIONS.md](PERMISSIONS.md)。

---

## 啟動 Bot

### 方式一: 直接執行 (測試用)

```bash
cd ~/Claude_Code_Telegram_Bot
bun run src/index.ts
```

你應該會看到:

```
Config loaded: 1 allowed users, working dir: /Users/vincewang
Loaded 0 MCP servers from mcp-config.ts
Bot started as @your_bot_name
```

**保持終端機開啟**,Bot 會持續執行。按 Ctrl+C 可停止。

### 方式二: 背景執行

```bash
# 使用 nohup 在背景執行
cd ~/Claude_Code_Telegram_Bot
nohup bun run src/index.ts > /tmp/telegram-bot.log 2>&1 &

# 查看 log
tail -f /tmp/telegram-bot.log

# 停止 Bot
pkill -f "bun run src/index.ts"
```

---

## 測試功能

### 1. 基本測試

開啟 Telegram,找到你的 Bot,發送:

```
/start
```

應該會看到歡迎訊息和你的 User ID。

### 2. 測試 Claude 對話

發送任意訊息:

```
你好!請介紹一下你自己
```

Bot 應該會開始回應,你會看到即時的串流輸出。

### 3. 測試工作目錄功能

```
/pwd
```

應該顯示當前工作目錄。

```
/ls
```

應該列出當前目錄的內容。

```
/cd Documents
/pwd
```

應該顯示已切換到 Documents 目錄。

### 4. 測試統計功能

```
/stats
```

應該顯示你的使用統計:
- User ID
- 總請求數
- 總 Token 數
- 最後活動時間
- 建立時間

### 5. 測試多媒體功能 (可選)

如果已設定 `OPENAI_API_KEY`:

- **語音訊息**: 長按麥克風錄製語音,發送給 Bot
- **照片**: 發送截圖或照片,Bot 可以分析內容
- **文件**: 發送 PDF、程式碼檔案等,Bot 可以閱讀

### 6. 完整測試清單

更完整的測試清單請參考 [docs/TEST_REPORT.md](TEST_REPORT.md) 的「手動測試檢查清單」章節。

---

## 設定為系統服務 (macOS)

讓 Bot 開機自動啟動,並在背景持續執行:

### 1. 建立 LaunchAgent 配置

```bash
# 複製範例檔案
cp launchagent/com.claude-telegram-ts.plist.template \
   ~/Library/LaunchAgents/com.claude-telegram-enhanced.plist
```

### 2. 編輯配置檔案

```bash
nano ~/Library/LaunchAgents/com.claude-telegram-enhanced.plist
```

修改以下內容:

```xml
<!-- 找到 <key>ProgramArguments</key> 區塊,修改路徑 -->
<string>/Users/你的使用者名稱/.bun/bin/bun</string>
<string>run</string>
<string>/Users/你的使用者名稱/Claude_Code_Telegram_Bot/src/index.ts</string>

<!-- 找到 <key>WorkingDirectory</key>,修改路徑 -->
<string>/Users/你的使用者名稱/Claude_Code_Telegram_Bot</string>

<!-- 找到 <key>EnvironmentVariables</key>,設定環境變數 -->
<key>TELEGRAM_BOT_TOKEN</key>
<string>你的_Bot_Token</string>
<key>TELEGRAM_ALLOWED_USERS</key>
<string>你的_User_ID</string>
<key>CLAUDE_WORKING_DIR</key>
<string>/Users/你的使用者名稱</string>
<!-- 如果有 OPENAI_API_KEY 也加上: -->
<key>OPENAI_API_KEY</key>
<string>你的_OpenAI_Key</string>
```

### 3. 載入服務

```bash
# 載入 LaunchAgent
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.claude-telegram-enhanced.plist

# 或使用舊版命令
launchctl load ~/Library/LaunchAgents/com.claude-telegram-enhanced.plist
```

### 4. 管理服務

建議在 `~/.zshrc` 或 `~/.bashrc` 加入以下別名:

```bash
# 編輯 shell 配置
nano ~/.zshrc

# 加入以下內容
alias tbot='launchctl list | grep com.claude-telegram-enhanced'
alias tbot-start='launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.claude-telegram-enhanced.plist && echo "Bot started"'
alias tbot-stop='launchctl bootout gui/$(id -u)/com.claude-telegram-enhanced && echo "Bot stopped"'
alias tbot-restart='launchctl kickstart -k gui/$(id -u)/com.claude-telegram-enhanced && echo "Bot restarted"'
alias tbot-logs='tail -f /tmp/claude-telegram-bot-ts.log'
alias tbot-errors='tail -f /tmp/claude-telegram-bot-ts.err'

# 重新載入配置
source ~/.zshrc
```

現在你可以使用:

```bash
tbot           # 查看 bot 狀態
tbot-start     # 啟動 bot
tbot-stop      # 停止 bot
tbot-restart   # 重啟 bot
tbot-logs      # 查看日誌
tbot-errors    # 查看錯誤日誌
```

### 5. 防止 Mac 休眠 (可選)

如果希望 Mac 在蓋上螢幕時仍能保持 Bot 運作:

```
系統設定 → 電池 → 選項
→ 勾選「顯示器關閉時防止自動睡眠」(使用電源轉接器時)
```

---

## 常見問題

### Q1: Bot 沒有回應

**檢查清單**:

```bash
# 1. 確認 Bot 正在執行
ps aux | grep "bun run src/index.ts"

# 2. 檢查 log
tail -50 /tmp/claude-telegram-bot-ts.log

# 3. 驗證 Telegram User ID
# 在 Telegram 發送 /start 給 bot
# 如果收到 "❌ Unauthorized" 表示 User ID 設定錯誤

# 4. 檢查環境變數
cat .env | grep TELEGRAM_ALLOWED_USERS
```

### Q2: Claude 認證失敗

```bash
# 如果使用 CLI 認證
claude  # 確認可以正常執行並已登入

# 如果使用 API Key
cat .env | grep ANTHROPIC_API_KEY  # 確認已設定
# 前往 https://console.anthropic.com/ 檢查 API Key 是否有效
```

### Q3: 語音訊息無法轉錄

```bash
# 確認 OpenAI API Key 已設定
cat .env | grep OPENAI_API_KEY

# 檢查 API Key 是否有效
# 前往 https://platform.openai.com/api-keys
```

### Q4: 無法存取某些檔案

這是安全機制!預設只能存取以下路徑:

- `CLAUDE_WORKING_DIR` (你設定的工作目錄)
- `~/Documents`
- `~/Downloads`
- `~/Desktop`
- `~/.claude`

如需存取其他路徑,在 `.env` 中設定:

```bash
ALLOWED_PATHS=/path/to/allow,/another/path,~/.claude
```

### Q5: Permission denied 錯誤

```bash
# 確認檔案權限
ls -la ~/Claude_Code_Telegram_Bot

# 如果需要,修正權限
chmod +x ~/Claude_Code_Telegram_Bot/src/index.ts
```

### Q6: 如何更新 Bot

```bash
cd ~/Claude_Code_Telegram_Bot

# 拉取最新程式碼
git pull

# 重新安裝依賴
bun install

# 執行測試
bun test

# 重啟 Bot
tbot-restart  # 如果設定為服務
# 或
pkill -f "bun run src/index.ts" && bun run src/index.ts &
```

### Q7: Token 用量太高

```bash
# 查看統計
# 在 Telegram 發送: /stats

# 考慮:
# 1. 使用更簡短的訊息
# 2. 避免上傳超大檔案
# 3. 使用 Claude Code 訂閱而非 API Key
```

### Q8: Bot 回應太慢

可能原因:
- Claude API 伺服器負載高(尖峰時段)
- 網路連線不穩
- 查詢太複雜需要長時間處理

建議:
- 稍後再試
- 簡化查詢內容
- 檢查網路連線

---

## 進階功能

### 1. 設定 MCP 伺服器

如果想讓 Claude 存取額外的工具(Things、Notion、GitHub 等):

```bash
# 複製 MCP 配置範例
cp mcp-config.ts mcp-config.local.ts

# 編輯配置
nano mcp-config.local.ts
```

詳細說明請參考原始專案的 [Personal Assistant Guide](personal-assistant-guide.md)。

### 2. 自訂權限規則

```bash
# 編輯權限配置
nano config/permissions.json
```

詳細說明請參考 [docs/PERMISSIONS.md](PERMISSIONS.md)。

### 3. 整合到其他服務

Bot 提供完整的 API,可以整合到:
- Alfred Workflows
- Raycast Extensions
- Apple Shortcuts
- Zapier/Make.com

範例會在未來版本提供。

---

## 下一步

恭喜!你已經成功設定並啟動 Claude Telegram Bot!

**建議閱讀**:
- [📖 完整指令參考](COMMANDS.md)
- [🔐 權限系統說明](PERMISSIONS.md)
- [✅ 測試報告](TEST_REPORT.md)
- [📋 更新日誌](../CHANGELOG.md)

**加入社群**:
- [GitHub Issues](https://github.com/a23444452/Claude_Code_Telegram_Bot/issues) - 回報問題或建議
- [原始專案](https://github.com/linuz90/claude-telegram-bot) - 查看原始專案文件

**貢獻**:
- 如果你發現問題或有改進建議,歡迎開 Issue 或 PR!

---

## 附錄: 完整檔案結構

```
Claude_Code_Telegram_Bot/
├── .env                      # 環境變數配置 (需自行建立)
├── .env.example              # 環境變數範例
├── package.json              # 專案依賴定義
├── CHANGELOG.md              # 更新日誌
├── LICENSE                   # 授權條款
├── README.md                 # 專案說明
│
├── src/                      # 原始碼
│   ├── index.ts              # 主程式入口
│   ├── config.ts             # 配置載入
│   ├── types.ts              # TypeScript 型別定義
│   ├── session.ts            # Session 管理
│   ├── security.ts           # 安全檢查
│   ├── permissions.ts        # 權限控制 (新增)
│   ├── user-manager.ts       # 使用者統計 (新增)
│   └── handlers/             # 訊息處理器
│       ├── index.ts
│       ├── commands.ts       # 指令處理 (新增 4 個指令)
│       └── text.ts           # 文字訊息處理
│
├── config/                   # 配置檔案
│   └── permissions.json      # 權限規則 (新增)
│
├── data/                     # 資料目錄 (執行時建立)
│   └── users.json            # 使用者統計 (自動建立)
│
├── tests/                    # 測試
│   ├── unit/                 # 單元測試 (8 個檔案)
│   └── integration/          # 整合測試 (2 個檔案)
│
├── docs/                     # 文件
│   ├── GETTING_STARTED.md    # 本檔案
│   ├── COMMANDS.md           # 指令參考
│   ├── PERMISSIONS.md        # 權限系統說明
│   ├── TEST_REPORT.md        # 測試報告
│   └── personal-assistant-guide.md  # 個人助理指南
│
└── launchagent/              # macOS 系統服務配置
    └── com.claude-telegram-ts.plist.template
```

---

**祝你使用愉快!** 🎉

如有任何問題,請查看 [常見問題](#常見問題) 或在 GitHub 開 Issue。
