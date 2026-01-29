# 指令說明文件

完整的 Claude Telegram Bot 指令參考手冊。

## 目錄

- [基本指令](#基本指令)
- [工作目錄管理](#工作目錄管理)
- [統計與監控](#統計與監控)
- [使用技巧](#使用技巧)

---

## 基本指令

### `/start`

顯示 bot 歡迎訊息、當前狀態和可用指令列表。

**用途：**
- 檢查 bot 是否正常運作
- 查看自己的 User ID
- 快速參考可用指令

**輸出範例：**
```
🤖 Claude Telegram Bot

Status: Active session
Working directory: /Users/vincewang

Commands:
/new - Start fresh session
/stop - Stop current query
/status - Show detailed status
...

Tips:
• Prefix with ! to interrupt current query
• Use "think" keyword for extended reasoning
• Send photos, voice, or documents
```

---

### `/new`

開始全新的對話 session，清除所有對話歷史。

**使用時機：**
- 開始完全不相關的新話題
- 想要 Claude 忘記之前的對話內容
- Session 狀態異常需要重置

**行為：**
1. 停止當前正在執行的查詢（如果有）
2. 清除 session 記憶
3. 下一則訊息將建立新 session

**輸出：**
```
🆕 Session cleared. Next message starts fresh.
```

---

### `/stop`

靜默停止當前正在執行的查詢，不顯示訊息。

**使用時機：**
- Claude 執行太久想中斷
- 發現請求錯誤想重新開始
- 準備發送新的緊急請求

**特性：**
- 靜默操作，不會顯示確認訊息
- 不影響 session 歷史
- 停止後可立即發送新訊息

**替代方式：**
發送以 `!` 開頭的訊息也會自動中斷當前查詢：
```
!這是緊急訊息，會立即處理
```

---

### `/status`

顯示詳細的 bot 運作狀態資訊。

**顯示內容：**
- ✅ Session 狀態（活動中/無）
- 🔄 查詢狀態（執行中/閒置）
- 當前執行的工具
- ⏱️ 最後活動時間
- 📈 最近查詢的 Token 使用量
- 📁 當前工作目錄
- ⚠️ 最近錯誤（如果有）

**輸出範例：**
```
📊 Bot Status

✅ Session: Active (a3b4c5d6...)
🔄 Query: Running (12s)
   └─ Bash: npm install

⏱️ Last activity: 5s ago

📈 Last query usage:
   Input: 2,456 tokens
   Output: 1,234 tokens
   Cache read: 15,678

📁 Working dir: /Users/vincewang/projects
```

---

### `/resume`

從最近 5 個儲存的 session 中選擇恢復。

**使用時機：**
- 想繼續之前的對話
- 回到先前的專案討論
- 查看歷史對話內容

**互動方式：**
1. 發送 `/resume`
2. Bot 顯示可用的 session 列表（含時間和摘要）
3. 點選想要恢復的 session
4. Bot 載入 session 並顯示對話摘要

**輸出範例：**
```
📋 Sessioni salvate

Seleziona una sessione da riprendere:

📅 29/01 10:30 - "討論 React 專案架構..."
📅 28/01 15:45 - "Python 腳本除錯..."
📅 27/01 09:20 - "部署 Node.js 應用..."
```

---

### `/restart`

重新啟動 bot 程序（需要 LaunchAgent 或類似服務）。

**使用時機：**
- Bot 行為異常
- 更新配置檔案後需要重載
- 記憶體使用過高需要重啟

**注意事項：**
- 需要 macOS LaunchAgent 或 systemd 等服務管理器
- 重啟會中斷當前所有操作
- 重啟完成後會更新訊息狀態

**輸出：**
```
🔄 Restarting bot...
（重啟後）
✅ Bot restarted
```

---

### `/retry`

重試上一則訊息，在當前 session 中重新執行。

**使用時機：**
- Claude 回應不完整
- 執行過程中發生錯誤
- 想要不同的回應結果

**行為：**
1. 檢查是否有可重試的訊息
2. 在當前 session 中重新發送該訊息
3. Claude 重新處理請求

**輸出範例：**
```
🔄 Retrying: "幫我分析這段程式碼..."
（接著顯示 Claude 的新回應）
```

---

## 工作目錄管理

### `/pwd`

顯示 Claude 當前的工作目錄。

**用途：**
- 確認 Claude 在正確的目錄下工作
- 檢查路徑配置
- 除錯路徑問題

**輸出範例：**
```
📁 Current working directory:

/Users/vincewang/projects/my-app
```

**配置來源：**
- 從環境變數 `CLAUDE_WORKING_DIR` 讀取
- 預設為使用者家目錄
- 可在 `.env` 檔案中設定

---

### `/ls [path]`

列出指定目錄的內容，顯示檔案和資料夾。

**語法：**
```
/ls                              # 列出當前工作目錄
/ls src                          # 列出相對路徑
/ls /Users/vincewang/Documents   # 列出絕對路徑
/ls ..                           # 列出上層目錄
```

**顯示格式：**
- 📁 表示資料夾
- 📄 表示檔案
- ❓ 表示無法判斷類型

**輸出範例：**
```
📁 /Users/vincewang/projects/my-app

📁 src
📁 tests
📁 node_modules
📄 package.json
📄 tsconfig.json
📄 README.md
```

**安全限制：**
- 只能列出 `ALLOWED_PATHS` 中的目錄
- 嘗試存取未授權路徑會顯示錯誤：
```
❌ Access denied

Path not in allowed directories:
/etc
```

**錯誤處理：**
- 目錄不存在：顯示找不到
- 無權限存取：顯示錯誤訊息
- 空目錄：顯示 "(empty directory)"

---

### `/cd <path>`

切換 Claude 的工作目錄。

**語法：**
```
/cd Documents                    # 相對路徑
/cd /Users/vincewang/projects    # 絕對路徑
/cd ..                           # 上層目錄
/cd ~/Desktop                    # 家目錄展開
```

**使用範例：**
```
/cd ~/projects/telegram-bot
→ ✅ Changed working directory to:
   /Users/vincewang/projects/telegram-bot

/pwd
→ 📁 /Users/vincewang/projects/telegram-bot

/ls
→ 📁 src
  📁 docs
  📄 package.json
```

**安全檢查：**
1. **路徑授權檢查**：目標路徑必須在 `ALLOWED_PATHS` 內
2. **存在性檢查**：目標路徑必須存在
3. **類型檢查**：目標必須是目錄（非檔案）

**錯誤訊息：**

存取被拒：
```
❌ Access denied

Path not in allowed directories:
/private/etc

Allowed paths are defined in ALLOWED_PATHS config.
```

目錄不存在：
```
❌ Directory not found:

/Users/vincewang/nonexistent
```

目標不是目錄：
```
❌ Not a directory:

/Users/vincewang/file.txt
```

**注意事項：**
- ⚠️ 目前版本切換目錄後不會持久化到 session
- 重新啟動 bot 會重置為預設目錄
- 未來版本將支援目錄持久化

---

## 統計與監控

### `/stats`

顯示當前使用者的使用統計資訊。

**顯示內容：**
- 👤 User ID：你的 Telegram 使用者 ID
- 📝 總請求數：發送給 Claude 的訊息總數
- 🔢 總 Token 數：累計使用的 Token 數量
- ⏰ 最後活動：最近一次互動時間
- 📅 建立時間：首次使用 bot 的時間

**輸出範例：**
```
📊 使用統計

👤 User ID: 123456789
📝 總請求數: 156
🔢 總 Token 數: 245,678
⏰ 最後活動: 2026/01/29 14:30
📅 建立時間: 2026/01/25 09:15
```

**資料來源：**
- 統計資料儲存在 `data/users.json`
- 每次發送訊息自動更新
- 跨重啟持久化保存

**追蹤內容：**
1. **請求數追蹤**：
   - 每則文字訊息 +1
   - 語音訊息 +1
   - 照片上傳 +1
   - 文件上傳 +1

2. **Token 追蹤**：
   - 從 Claude API 回應中取得
   - 包含 input tokens 和 output tokens
   - 包含 cache read tokens（如果有）

**用途：**
- 監控 API 使用量
- 了解使用模式
- 預估成本（如使用 API key）
- 追蹤活動頻率

---

## 使用技巧

### 中斷執行中的查詢

有兩種方式可以中斷 Claude 正在執行的操作：

**方式 1：使用 `/stop` 指令**
```
/stop
```
- 靜默停止，不顯示訊息
- 適合單純想停止執行

**方式 2：使用 `!` 前綴**
```
!停止，我要問別的問題
```
- 自動中斷並立即處理新訊息
- 適合有緊急新請求時

---

### 觸發深度思考模式

在訊息中使用特定關鍵字可以觸發 Claude 的延伸推理模式：

**觸發關鍵字：**
- "think" / "思考"
- "reason" / "推理"
- "analyze" / "分析"

**範例：**
```
請仔細思考這個架構設計的利弊...
```

當觸發深度思考時，你會看到 Claude 的思考過程（用不同顏色標示）。

**配置：**
可在 `.env` 中調整 `THINKING_TRIGGER_KEYWORDS` 來自訂觸發詞。

---

### 發送多則訊息

Bot 支援訊息佇列，可以在 Claude 處理時繼續發送訊息：

**正常訊息：**
```
第一則訊息
（Claude 開始處理）
第二則訊息
第三則訊息
```
- 訊息會排隊等待處理
- 按順序依次執行

**緊急訊息（中斷佇列）：**
```
!緊急訊息
```
- 立即中斷當前查詢
- 清空佇列
- 優先處理

---

### 使用語音訊息

Bot 支援語音轉文字功能（需要 OpenAI API key）：

**使用方式：**
1. 在 Telegram 錄製語音訊息
2. 發送給 bot
3. Bot 自動轉錄為文字（透過 OpenAI Whisper）
4. 以文字形式傳給 Claude 處理

**配置：**
在 `.env` 中設定：
```bash
OPENAI_API_KEY=sk-...
```

---

### 上傳照片分析

直接發送照片給 Claude 進行視覺分析：

**支援格式：**
- JPG, PNG, WebP
- 單張或多張（相簿）

**使用範例：**
- 截圖分析
- 圖表解讀
- UI/UX 檢視
- 錯誤訊息辨識

**相簿處理：**
- 可一次發送多張照片
- Bot 會等待 1 秒收集所有照片
- 一次性傳給 Claude 分析

---

### 上傳文件處理

支援多種文件格式：

**支援類型：**
- **PDF**：自動提取文字內容（需要 `pdftotext`）
- **文字檔**：.txt, .md, .json, .xml 等
- **程式碼**：.js, .ts, .py, .java 等所有文字格式
- **壓縮檔**：ZIP, TAR（會解壓並分析內容）

**使用範例：**
```
[上傳 PDF 文件]
「幫我總結這份文件的重點」
```

**限制：**
- 檔案大小限制依 Telegram API 規定
- 非文字內容會嘗試轉換

---

### 互動式按鈕

Claude 可以透過內建的 `ask_user` MCP 工具顯示可點選的按鈕：

**範例場景：**
- 選擇性問題（是/否）
- 多選項決策
- 確認操作

**互動方式：**
1. Claude 顯示問題和按鈕選項
2. 點選按鈕回應
3. Claude 根據選擇繼續處理

**範例：**
```
Claude: 我應該繼續安裝這些套件嗎？

[✅ 繼續安裝] [❌ 取消]
```

---

## 錯誤排解

### Bot 沒有回應

**檢查項目：**
1. 確認你的 User ID 在 `TELEGRAM_ALLOWED_USERS` 中
2. 檢查 bot token 是否正確
3. 查看錯誤日誌：`tail -f /tmp/claude-telegram-bot-ts.err`
4. 確認 bot 程序正在執行

### 語音訊息失敗

**原因：**
- `OPENAI_API_KEY` 未設定
- API key 無效或額度用完

**解決方式：**
```bash
# 在 .env 中設定
OPENAI_API_KEY=sk-...
```

### 無法存取檔案

**原因：**
- 路徑不在 `ALLOWED_PATHS` 中
- 檔案權限不足

**解決方式：**
```bash
# 在 .env 中調整允許的路徑
ALLOWED_PATHS=/path1,/path2,~/.claude
```

### 工作目錄切換失敗

**常見錯誤：**

**1. Access denied**
- 目標路徑不在 `ALLOWED_PATHS` 中
- 解決：更新 `.env` 的 `ALLOWED_PATHS`

**2. Directory not found**
- 路徑拼寫錯誤
- 目錄不存在
- 解決：使用 `/ls` 確認路徑

**3. Not a directory**
- 目標是檔案而非目錄
- 解決：確認路徑指向目錄

---

## 設定 BotFather 指令列表

在 [@BotFather](https://t.me/BotFather) 中發送 `/setcommands`，然後貼上：

```
start - 顯示狀態和使用者 ID
new - 開始新的對話 session
resume - 從最近的 session 中選擇恢復
stop - 中斷當前查詢
status - 顯示詳細狀態資訊
restart - 重新啟動 bot
retry - 重試上一則訊息
pwd - 顯示當前工作目錄
ls - 列出目錄內容
cd - 切換工作目錄
stats - 顯示使用統計
```

---

## 相關文件

- [README.md](../README.md) - 專案概述和快速開始
- [PERMISSIONS.md](PERMISSIONS.md) - 權限控制系統詳細說明
- [SECURITY.md](../SECURITY.md) - 安全模型和防護機制
- [Personal Assistant Guide](personal-assistant-guide.md) - 個人助理設定指南

---

**最後更新：** 2026-01-29
