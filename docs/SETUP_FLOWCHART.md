# 設定流程圖 (Setup Flowchart)

這是一個視覺化的設定流程,幫助你快速了解整個設定過程。

## 📊 完整設定流程

```
┌─────────────────────────────────────────────────────────────┐
│                     開始設定 Claude Telegram Bot              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │  檢查前置需求        │
           │  ✓ macOS/Linux      │
           │  ✓ Bun 1.0+         │
           │  ✓ Git              │
           │  ✓ Telegram 帳號    │
           └──────────┬───────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │  選擇 Claude 認證方式 │
           └──────────┬───────────┘
                      │
           ┌──────────┴──────────┐
           │                     │
           ▼                     ▼
   ┌───────────────┐    ┌───────────────┐
   │ CLI 認證      │    │ API Key 認證  │
   │ (推薦)        │    │               │
   │               │    │               │
   │ 1. 安裝 Claude│    │ 1. 前往 Console│
   │    Code       │    │ 2. 建立 API Key│
   │ 2. 執行 claude│    │ 3. 複製 Key    │
   │ 3. Web 登入   │    │               │
   └───────┬───────┘    └───────┬───────┘
           │                     │
           └──────────┬──────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │  建立 Telegram Bot   │
           │                      │
           │  1. 開啟 @BotFather  │
           │  2. /newbot          │
           │  3. 設定名稱與用戶名  │
           │  4. 複製 Bot Token   │
           │  5. /setcommands     │
           │     (設定指令列表)    │
           └──────────┬───────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │  取得 User ID        │
           │                      │
           │  1. 開啟 @userinfobot│
           │  2. 發送訊息         │
           │  3. 複製 User ID     │
           └──────────┬───────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │  Clone 並安裝專案    │
           │                      │
           │  git clone [repo]    │
           │  cd [project]        │
           │  bun install         │
           └──────────┬───────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │  設定 .env 檔案      │
           │                      │
           │  cp .env.example .env│
           │  編輯並設定:         │
           │  • Bot Token         │
           │  • User ID           │
           │  • Working Dir       │
           │  • (可選) OpenAI Key │
           └──────────┬───────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │  執行測試            │
           │                      │
           │  bun test            │
           │                      │
           │  ✓ 51 tests pass?    │
           └──────────┬───────────┘
                      │
                   是 │ 否 → 檢查設定並重試
                      │
                      ▼
           ┌──────────────────────┐
           │  啟動 Bot            │
           └──────────┬───────────┘
                      │
           ┌──────────┴──────────┐
           │                     │
           ▼                     ▼
   ┌───────────────┐    ┌───────────────┐
   │ 測試模式      │    │ 正式部署      │
   │               │    │               │
   │ bun run       │    │ LaunchAgent   │
   │ src/index.ts  │    │ (macOS)       │
   │               │    │               │
   │ 保持終端開啟  │    │ 背景服務執行  │
   └───────┬───────┘    └───────┬───────┘
           │                     │
           └──────────┬──────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │  測試功能            │
           │                      │
           │  1. /start           │
           │  2. 發送訊息測試     │
           │  3. /pwd, /ls, /cd   │
           │  4. /stats           │
           │  5. 語音/照片測試    │
           └──────────┬───────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │  設定完成!開始使用   │
           └──────────────────────┘
```

## 🎯 關鍵決策點

### 1. Claude 認證方式選擇

```
你有 Claude Code 訂閱嗎?
│
├─ 有 → 使用 CLI 認證 (推薦)
│       • 成本效益高
│       • 無額外費用
│       • 適合重度使用
│
└─ 沒有 → 使用 API Key
        • 按 token 計費
        • 適合輕度使用
        • 需要預付費用
```

### 2. 部署方式選擇

```
如何使用 Bot?
│
├─ 測試/開發 → 直接執行模式
│               • bun run src/index.ts
│               • 終端機保持開啟
│               • 方便除錯
│
└─ 長期使用 → 系統服務模式
                • LaunchAgent (macOS)
                • 開機自動啟動
                • 背景執行
                • 自動重啟
```

## ⏱️ 預估時間表

| 步驟 | 預估時間 | 難度 |
|------|----------|------|
| 安裝 Bun | 2 分鐘 | ⭐ |
| Claude 認證 (CLI) | 3 分鐘 | ⭐ |
| Claude 認證 (API) | 5 分鐘 | ⭐⭐ |
| 建立 Telegram Bot | 5 分鐘 | ⭐ |
| 取得 User ID | 1 分鐘 | ⭐ |
| Clone & 安裝 | 5 分鐘 | ⭐ |
| 設定 .env | 3 分鐘 | ⭐ |
| 執行測試 | 1 分鐘 | ⭐ |
| 啟動 Bot (測試) | 1 分鐘 | ⭐ |
| 設定 LaunchAgent | 10 分鐘 | ⭐⭐⭐ |

**總時間**:
- 基本設定 (測試模式): **15-20 分鐘**
- 完整設定 (含服務): **25-35 分鐘**

## 🔧 故障排除流程

```
Bot 無法啟動?
│
├─ 檢查 Bun 安裝
│   └─ bun --version
│       ├─ 有版本號 → 繼續
│       └─ 錯誤 → 重新安裝 Bun
│
├─ 檢查依賴安裝
│   └─ bun install
│       └─ 重新安裝依賴
│
├─ 檢查 .env 設定
│   ├─ Token 正確?
│   ├─ User ID 正確?
│   └─ Working Dir 存在?
│
├─ 檢查 Claude 認證
│   ├─ CLI: claude (能執行?)
│   └─ API: Key 有效?
│
└─ 查看錯誤日誌
    └─ tail -f /tmp/claude-telegram-bot-ts.err
```

```
Bot 啟動但不回應?
│
├─ 檢查 User ID
│   └─ /start 收到 Unauthorized?
│       └─ User ID 設定錯誤
│
├─ 檢查 Claude 認證
│   └─ 看到認證錯誤?
│       ├─ CLI: 重新登入 claude
│       └─ API: 檢查 Key 和額度
│
└─ 檢查網路連線
    └─ Claude API 可連線?
```

## 📝 檢查清單

設定完成前,確認以下項目:

### 環境檢查
- [ ] Bun 已安裝且版本 >= 1.0
- [ ] Git 已安裝
- [ ] 有穩定的網路連線

### Telegram 設定
- [ ] 已建立 Telegram Bot
- [ ] 已取得 Bot Token
- [ ] 已設定 Bot 指令 (/setcommands)
- [ ] 已取得自己的 User ID

### Claude 認證
- [ ] CLI 認證: 已執行 `claude` 並成功登入
- [ ] 或 API 認證: 已取得有效的 API Key

### 專案設定
- [ ] 已 clone 專案
- [ ] 已執行 `bun install`
- [ ] 已建立 `.env` 檔案
- [ ] 已在 `.env` 中設定:
  - [ ] TELEGRAM_BOT_TOKEN
  - [ ] TELEGRAM_ALLOWED_USERS
  - [ ] CLAUDE_WORKING_DIR
  - [ ] (可選) OPENAI_API_KEY
  - [ ] (可選) ANTHROPIC_API_KEY

### 測試
- [ ] `bun test` 全部通過 (51/51)
- [ ] Bot 可以啟動 (無錯誤訊息)
- [ ] 在 Telegram 發送 `/start` 有回應
- [ ] 發送文字訊息有回應
- [ ] `/pwd`, `/ls` 指令正常
- [ ] `/stats` 指令正常

### 部署 (可選)
- [ ] LaunchAgent plist 已建立並編輯
- [ ] 服務已載入 (launchctl load)
- [ ] 服務正在執行 (launchctl list)
- [ ] 已設定 shell 別名 (tbot-*)

## 🎓 學習路徑建議

### 新手路徑 (第一次使用)
1. 閱讀 [GETTING_STARTED.md](GETTING_STARTED.md) 完整指南
2. 跟著步驟一步步操作
3. 使用測試模式啟動 Bot
4. 在 Telegram 測試基本功能
5. 熟悉後再設定為系統服務

### 進階路徑 (有經驗)
1. 快速瀏覽 README 的快速開始
2. 直接設定 .env 並啟動
3. 閱讀 [COMMANDS.md](COMMANDS.md) 了解全部指令
4. 閱讀 [PERMISSIONS.md](PERMISSIONS.md) 自訂權限
5. 設定 LaunchAgent 背景服務

### 開發者路徑
1. Fork 專案到自己的 GitHub
2. 閱讀 [CHANGELOG.md](../CHANGELOG.md) 了解架構
3. 執行 `bun test` 了解測試
4. 閱讀原始碼了解實作
5. 根據需求客製化功能

## 📚 相關文件

- [📖 完整操作指南](GETTING_STARTED.md) - 詳細的一步步設定教學
- [📋 指令參考](COMMANDS.md) - 所有可用指令的完整說明
- [🔐 權限系統](PERMISSIONS.md) - 權限控制系統的詳細文件
- [✅ 測試報告](TEST_REPORT.md) - 測試結果和手動測試清單
- [📝 更新日誌](../CHANGELOG.md) - 版本更新歷史

## 💡 小技巧

### 快速重啟 Bot
```bash
# 設定別名後
tbot-restart

# 或手動
pkill -f "bun run src/index.ts" && bun run src/index.ts &
```

### 即時查看日誌
```bash
tail -f /tmp/claude-telegram-bot-ts.log
```

### 測試配置是否正確
```bash
# 在專案目錄執行
bun run src/index.ts

# 看到以下訊息表示成功:
# Config loaded: 1 allowed users, working dir: /Users/xxx
# Bot started as @your_bot_name
```

### 備份重要資料
```bash
# 備份 .env
cp .env .env.backup

# 備份使用者統計
cp data/users.json data/users.json.backup
```

---

希望這個流程圖能幫助你順利完成設定! 🎉

如有問題,請參考 [GETTING_STARTED.md](GETTING_STARTED.md) 的「常見問題」章節。
