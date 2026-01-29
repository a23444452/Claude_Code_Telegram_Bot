# 快速參考指南 (Quick Reference)

這是一份簡潔的速查表,包含所有常用操作和指令。

## 📌 目錄

- [管理腳本](#管理腳本)
- [Telegram Bot 指令](#telegram-bot-指令)
- [常用操作](#常用操作)
- [故障排除](#故障排除)
- [配置參考](#配置參考)

---

## 管理腳本

### 基本操作

```bash
./start.sh    # 一鍵啟動 Bot(自動檢查環境)
./stop.sh     # 停止 Bot
./status.sh   # 完整健康檢查
```

### 手動操作

```bash
# 前台執行(可看輸出)
bun run src/index.ts

# 背景執行
nohup bun run src/index.ts > /tmp/bot.log 2>&1 &

# 查看日誌
tail -f /tmp/claude-telegram-bot.log

# 停止 Bot
pkill -f "bun run src/index.ts"
```

### 測試

```bash
# 執行所有測試
bun test

# TypeScript 類型檢查
bun run typecheck
```

---

## Telegram Bot 指令

### 基本指令

| 指令 | 說明 | 範例 |
|------|------|------|
| `/start` | 顯示歡迎訊息和狀態 | `/start` |
| `/new` | 開始新的 session | `/new` |
| `/stop` | 中斷當前查詢 | `/stop` |
| `/status` | 查看 Claude 狀態 | `/status` |
| `/resume` | 恢復舊 session | `/resume` |
| `/restart` | 重啟 bot | `/restart` |

### 工作目錄管理

| 指令 | 說明 | 範例 |
|------|------|------|
| `/pwd` | 顯示當前工作目錄 | `/pwd` |
| `/ls [path]` | 列出目錄內容 | `/ls`<br>`/ls Documents`<br>`/ls ~/projects` |
| `/cd <path>` | 切換工作目錄 | `/cd projects`<br>`/cd ~/Documents`<br>`/cd ..` |

### 統計與監控

| 指令 | 說明 | 範例 |
|------|------|------|
| `/stats` | 查看使用統計 | `/stats` |

### 使用技巧

```
# 觸發深度思考
在訊息中包含 "think", "pensa", "ragiona"

# 中斷並立即發送
訊息開頭加 !
範例: !這是緊急訊息

# 發送多則訊息
正常發送多則,會自動排隊處理
```

---

## 常用操作

### 初次設定

```bash
# 1. Clone 專案
git clone https://github.com/a23444452/Claude_Code_Telegram_Bot.git
cd Claude_Code_Telegram_Bot

# 2. 設定環境變數
cp .env.example .env
nano .env  # 編輯設定

# 3. 啟動
./start.sh
```

### 更新專案

```bash
# 停止 Bot
./stop.sh

# 拉取更新
git pull

# 重新安裝依賴
bun install

# 執行測試
bun test

# 重新啟動
./start.sh
```

### 查看日誌

```bash
# 即時日誌
tail -f /tmp/claude-telegram-bot.log

# 最後 50 行
tail -50 /tmp/claude-telegram-bot.log

# 錯誤日誌
tail -f /tmp/claude-telegram-bot-ts.err

# 搜尋關鍵字
grep "ERROR" /tmp/claude-telegram-bot.log
```

### 檢查狀態

```bash
# 完整狀態檢查
./status.sh

# 快速檢查是否執行
ps aux | grep "bun run src/index.ts"

# 查看 PID
pgrep -f "bun run src/index.ts"
```

---

## 故障排除

### Bot 無法啟動

```bash
# 1. 檢查 Bun
bun --version

# 2. 檢查配置
cat .env | grep TELEGRAM_BOT_TOKEN
cat .env | grep TELEGRAM_ALLOWED_USERS

# 3. 檢查依賴
ls node_modules/
# 如果為空:
bun install

# 4. 執行測試
bun test

# 5. 查看詳細錯誤
bun run src/index.ts
```

### Bot 不回應

```bash
# 1. 確認 Bot 在執行
./status.sh

# 2. 檢查日誌
tail -50 /tmp/claude-telegram-bot.log

# 3. 檢查 User ID
# 在 Telegram 發送 /start
# 如果收到 "Unauthorized" → User ID 錯誤

# 4. 重啟 Bot
./stop.sh
./start.sh
```

### 語音訊息失敗

```bash
# 檢查 OpenAI Key
cat .env | grep OPENAI_API_KEY

# 如果未設定,編輯 .env:
nano .env
# 加入: OPENAI_API_KEY=sk-...
```

### Claude 認證失敗

```bash
# CLI 認證
claude  # 確認可執行

# API Key 認證
cat .env | grep ANTHROPIC_API_KEY
# 檢查 https://console.anthropic.com/
```

### 權限錯誤

```bash
# 查看允許的路徑
cat .env | grep ALLOWED_PATHS

# 編輯允許路徑
nano .env
# 加入: ALLOWED_PATHS=/path1,/path2,~/.claude

# 重啟 Bot
./stop.sh && ./start.sh
```

---

## 配置參考

### .env 必要設定

```bash
# Telegram 設定 (必要)
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
TELEGRAM_ALLOWED_USERS=123456789

# Claude 工作目錄 (推薦)
CLAUDE_WORKING_DIR=/Users/你的使用者名稱
```

### .env 可選設定

```bash
# OpenAI (語音轉錄)
OPENAI_API_KEY=sk-...

# Anthropic API (如不用 CLI)
ANTHROPIC_API_KEY=sk-ant-api03-...

# 自訂允許路徑
ALLOWED_PATHS=/path1,/path2,~/.claude

# 思考觸發關鍵字
THINKING_KEYWORDS=think,pensa,ragiona
THINKING_DEEP_KEYWORDS=ultrathink,think hard
```

### 權限配置 (config/permissions.json)

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
      "ls", "pwd", "cat", "grep",
      "find", "echo", "which"
    ],
    "requireConfirmation": [
      "rm", "mv", "cp",
      "git commit", "git push",
      "npm install", "bun install"
    ]
  }
}
```

---

## 系統服務設定 (macOS)

### LaunchAgent 快速設定

```bash
# 1. 複製配置
cp launchagent/com.claude-telegram-ts.plist.template \
   ~/Library/LaunchAgents/com.claude-telegram-enhanced.plist

# 2. 編輯路徑
nano ~/Library/LaunchAgents/com.claude-telegram-enhanced.plist

# 3. 載入服務
launchctl bootstrap gui/$(id -u) \
  ~/Library/LaunchAgents/com.claude-telegram-enhanced.plist
```

### Shell 別名設定

加入到 `~/.zshrc` 或 `~/.bashrc`:

```bash
alias tbot='launchctl list | grep com.claude-telegram-enhanced'
alias tbot-start='launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.claude-telegram-enhanced.plist'
alias tbot-stop='launchctl bootout gui/$(id -u)/com.claude-telegram-enhanced'
alias tbot-restart='launchctl kickstart -k gui/$(id -u)/com.claude-telegram-enhanced'
alias tbot-logs='tail -f /tmp/claude-telegram-bot-ts.log'
alias tbot-errors='tail -f /tmp/claude-telegram-bot-ts.err'
```

使用:
```bash
tbot           # 查看狀態
tbot-start     # 啟動
tbot-stop      # 停止
tbot-restart   # 重啟
tbot-logs      # 查看日誌
tbot-errors    # 查看錯誤
```

---

## 環境變數完整列表

| 變數名稱 | 必要 | 說明 | 預設值 |
|---------|------|------|--------|
| `TELEGRAM_BOT_TOKEN` | ✅ | Telegram Bot Token | - |
| `TELEGRAM_ALLOWED_USERS` | ✅ | 允許的 User ID (逗號分隔) | - |
| `CLAUDE_WORKING_DIR` | 🔸 | Claude 工作目錄 | `$HOME` |
| `OPENAI_API_KEY` | ⭕ | OpenAI API Key (語音) | - |
| `ANTHROPIC_API_KEY` | ⭕ | Anthropic API Key | - |
| `ALLOWED_PATHS` | ⭕ | 允許存取的路徑 | 見下方預設 |
| `THINKING_KEYWORDS` | ⭕ | 思考觸發關鍵字 | `think,pensa,ragiona` |
| `THINKING_DEEP_KEYWORDS` | ⭕ | 深度思考關鍵字 | `ultrathink,think hard` |
| `RATE_LIMIT_ENABLED` | ⭕ | 啟用速率限制 | `true` |
| `RATE_LIMIT_REQUESTS` | ⭕ | 速率限制請求數 | `20` |
| `RATE_LIMIT_WINDOW` | ⭕ | 速率限制時間窗口(秒) | `60` |

**預設 ALLOWED_PATHS**:
- `$CLAUDE_WORKING_DIR`
- `~/Documents`
- `~/Downloads`
- `~/Desktop`
- `~/.claude`

---

## 檔案路徑速查

```
Claude_Code_Telegram_Bot/
├── .env                    # 環境變數配置
├── start.sh                # 啟動腳本
├── stop.sh                 # 停止腳本
├── status.sh               # 狀態檢查腳本
│
├── src/
│   ├── index.ts            # 主程式
│   ├── config.ts           # 配置載入
│   ├── permissions.ts      # 權限控制
│   ├── user-manager.ts     # 使用者統計
│   └── handlers/
│       └── commands.ts     # 指令處理
│
├── config/
│   └── permissions.json    # 權限規則
│
├── data/
│   └── users.json          # 使用者資料
│
├── docs/
│   ├── GETTING_STARTED.md  # 完整操作指南
│   ├── SETUP_FLOWCHART.md  # 設定流程圖
│   ├── COMMANDS.md         # 指令參考
│   ├── PERMISSIONS.md      # 權限系統說明
│   ├── TEST_REPORT.md      # 測試報告
│   └── QUICK_REFERENCE.md  # 本檔案
│
└── tests/
    ├── unit/               # 單元測試
    └── integration/        # 整合測試
```

---

## 常見使用情境

### 情境 1: 日常開發助手

```
在 Telegram 發送:

你: /cd ~/projects/my-app
Bot: ✅ 已切換到 /Users/you/projects/my-app

你: /ls src
Bot: 📁 components
     📁 utils
     📄 index.ts

你: 幫我重構 src/utils/helpers.ts,移除重複的程式碼
Bot: [開始分析並重構...]
```

### 情境 2: 快速查詢資訊

```
你: 什麼是 Docker 容器化?
Bot: [詳細解釋...]

你: think 比較 Docker 和 Podman 的優缺點
Bot: [顯示思考過程] → [詳細比較...]
```

### 情境 3: 文件分析

```
你: /cd ~/Downloads
你: [上傳 PDF 檔案]
你: 幫我整理這份報告的重點
Bot: [分析並整理重點...]
```

### 情境 4: 程式碼審查

```
你: /cd ~/projects/feature-branch
你: 審查 src/components/Button.tsx 並提出改進建議
Bot: [進行程式碼審查...]
```

---

## 效能優化建議

### 減少 Token 使用

- ✅ 使用簡潔的提問
- ✅ 避免上傳超大檔案
- ✅ 使用 Claude Code 訂閱而非 API Key
- ✅ 善用 `/new` 重置 context

### 提升回應速度

- ✅ 保持網路連線穩定
- ✅ 避免尖峰時段使用(如可能)
- ✅ 簡化複雜查詢為多個步驟

### 系統資源管理

- ✅ 定期清理日誌檔案
- ✅ 監控 Bot 記憶體使用
- ✅ 適時重啟 Bot (每週一次)

```bash
# 清理日誌
> /tmp/claude-telegram-bot.log

# 檢查記憶體使用
ps aux | grep "bun run src/index.ts"

# 重啟 Bot
./stop.sh && ./start.sh
```

---

## 安全性最佳實踐

### 環境變數安全

- ✅ 永遠不要提交 `.env` 到 Git
- ✅ 使用強密碼管理器儲存 Token
- ✅ 定期輪換 API Key
- ✅ 限制 `ALLOWED_PATHS` 範圍

### 權限控制

- ✅ 從嚴格權限開始,逐步放寬
- ✅ 定期審查 `permissions.json`
- ✅ 記錄重要權限變更
- ✅ 使用 Git 追蹤配置變更

### 使用者管理

- ✅ 只添加信任的 User ID
- ✅ 定期檢查 `data/users.json`
- ✅ 監控異常使用量

---

## 取得幫助

### 文件資源

- 📖 [完整操作指南](GETTING_STARTED.md)
- 📊 [設定流程圖](SETUP_FLOWCHART.md)
- 📋 [指令參考](COMMANDS.md)
- 🔐 [權限系統](PERMISSIONS.md)
- ✅ [測試報告](TEST_REPORT.md)
- 📝 [更新日誌](CHANGELOG.md)

### 社群支援

- 🐛 [回報問題](https://github.com/a23444452/Claude_Code_Telegram_Bot/issues)
- 💡 [功能建議](https://github.com/a23444452/Claude_Code_Telegram_Bot/issues/new)
- 📚 [原始專案](https://github.com/linuz90/claude-telegram-bot)

### 除錯步驟

1. 執行 `./status.sh` 檢查整體狀態
2. 查看日誌 `tail -f /tmp/claude-telegram-bot.log`
3. 執行測試 `bun test`
4. 查看相關文件
5. 在 GitHub 開 Issue (提供日誌和配置)

---

**最後更新**: v1.0.0 (2026-01-29)

**維護者**: [a23444452](https://github.com/a23444452)

**授權**: MIT License
