#!/bin/bash

# Claude Telegram Bot - 狀態檢查腳本
# 使用方式: ./status.sh

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   Claude Telegram Bot - 狀態檢查 (Status Check)        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# 檢查 Bot 進程
echo -e "${CYAN}[1] Bot 進程狀態${NC}"
if pgrep -f "bun run src/index.ts" > /dev/null; then
    PID=$(pgrep -f "bun run src/index.ts")
    echo -e "${GREEN}✓ Bot 正在執行${NC}"
    echo "  PID: $PID"

    # 顯示進程資訊
    if command -v ps &> /dev/null; then
        CPU=$(ps -p $PID -o %cpu= | xargs)
        MEM=$(ps -p $PID -o %mem= | xargs)
        START=$(ps -p $PID -o lstart= | xargs)
        echo "  CPU: ${CPU}%"
        echo "  記憶體: ${MEM}%"
        echo "  啟動時間: $START"
    fi
else
    echo -e "${YELLOW}⚠️  Bot 未執行${NC}"
fi

echo ""

# 檢查 Bun
echo -e "${CYAN}[2] Bun 環境${NC}"
if command -v bun &> /dev/null; then
    BUN_VERSION=$(bun --version)
    echo -e "${GREEN}✓ Bun 已安裝${NC}"
    echo "  版本: $BUN_VERSION"
else
    echo -e "${RED}❌ Bun 未安裝${NC}"
fi

echo ""

# 檢查配置檔案
echo -e "${CYAN}[3] 配置檔案${NC}"
if [ -f .env ]; then
    echo -e "${GREEN}✓ .env 存在${NC}"

    source .env

    if [ -n "$TELEGRAM_BOT_TOKEN" ]; then
        TOKEN_PREFIX=$(echo $TELEGRAM_BOT_TOKEN | cut -d: -f1)
        echo "  Bot Token: ${TOKEN_PREFIX}:***"
    else
        echo -e "${RED}  ❌ Bot Token 未設定${NC}"
    fi

    if [ -n "$TELEGRAM_ALLOWED_USERS" ]; then
        echo "  允許的使用者: $TELEGRAM_ALLOWED_USERS"
    else
        echo -e "${RED}  ❌ 允許的使用者未設定${NC}"
    fi

    if [ -n "$CLAUDE_WORKING_DIR" ]; then
        if [ -d "$CLAUDE_WORKING_DIR" ]; then
            echo -e "  工作目錄: $CLAUDE_WORKING_DIR ${GREEN}✓${NC}"
        else
            echo -e "  工作目錄: $CLAUDE_WORKING_DIR ${RED}(不存在)${NC}"
        fi
    else
        echo "  工作目錄: (使用預設)"
    fi

    if [ -n "$OPENAI_API_KEY" ]; then
        echo -e "  OpenAI Key: ${GREEN}已設定${NC} (語音轉錄可用)"
    else
        echo "  OpenAI Key: 未設定 (語音轉錄不可用)"
    fi

    if [ -n "$ANTHROPIC_API_KEY" ]; then
        echo -e "  Anthropic API Key: ${GREEN}已設定${NC}"
    else
        echo "  Anthropic API Key: 未設定 (使用 CLI 認證)"
    fi
else
    echo -e "${RED}❌ .env 不存在${NC}"
fi

echo ""

# 檢查 Claude CLI
echo -e "${CYAN}[4] Claude 認證${NC}"
if command -v claude &> /dev/null; then
    echo -e "${GREEN}✓ Claude CLI 已安裝${NC}"
    CLAUDE_VERSION=$(claude --version 2>&1 | head -1)
    echo "  版本: $CLAUDE_VERSION"
else
    echo -e "${YELLOW}⚠️  Claude CLI 未安裝 (如使用 API Key 則正常)${NC}"
fi

echo ""

# 檢查依賴
echo -e "${CYAN}[5] 專案依賴${NC}"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓ 依賴已安裝${NC}"

    # 計算套件數量
    if [ -d "node_modules" ]; then
        PKG_COUNT=$(find node_modules -maxdepth 1 -type d | wc -l)
        echo "  套件數量: $((PKG_COUNT - 1))"
    fi
else
    echo -e "${RED}❌ 依賴未安裝${NC}"
    echo "  請執行: bun install"
fi

echo ""

# 檢查日誌檔案
echo -e "${CYAN}[6] 日誌檔案${NC}"
if [ -f /tmp/claude-telegram-bot.log ]; then
    SIZE=$(ls -lh /tmp/claude-telegram-bot.log | awk '{print $5}')
    LINES=$(wc -l < /tmp/claude-telegram-bot.log)
    echo -e "${GREEN}✓ 日誌檔案存在${NC}"
    echo "  位置: /tmp/claude-telegram-bot.log"
    echo "  大小: $SIZE"
    echo "  行數: $LINES"

    echo ""
    echo "  最後 5 行:"
    tail -5 /tmp/claude-telegram-bot.log | sed 's/^/    /'
else
    echo -e "${YELLOW}⚠️  日誌檔案不存在 (Bot 可能未在背景執行)${NC}"
fi

echo ""

# 檢查使用者資料
echo -e "${CYAN}[7] 使用者資料${NC}"
if [ -f data/users.json ]; then
    echo -e "${GREEN}✓ 使用者資料存在${NC}"

    # 解析 JSON (如果有 jq)
    if command -v jq &> /dev/null; then
        USER_COUNT=$(jq 'length' data/users.json 2>/dev/null || echo "?")
        echo "  使用者數量: $USER_COUNT"
    else
        SIZE=$(ls -lh data/users.json | awk '{print $5}')
        echo "  檔案大小: $SIZE"
    fi
else
    echo -e "${YELLOW}⚠️  使用者資料不存在 (尚未有人使用)${NC}"
fi

echo ""

# 測試狀態
echo -e "${CYAN}[8] 測試狀態${NC}"
if command -v bun &> /dev/null && [ -d "node_modules" ]; then
    echo -e "${YELLOW}執行快速測試...${NC}"
    TEST_OUTPUT=$(bun test 2>&1 | tail -5)

    if echo "$TEST_OUTPUT" | grep -q "pass"; then
        PASS=$(echo "$TEST_OUTPUT" | grep -oP '\d+(?= pass)' | head -1)
        FAIL=$(echo "$TEST_OUTPUT" | grep -oP '\d+(?= fail)' | head -1)

        if [ "$FAIL" = "0" ]; then
            echo -e "${GREEN}✓ 所有測試通過 ($PASS/$PASS)${NC}"
        else
            echo -e "${YELLOW}⚠️  部分測試失敗 ($PASS pass, $FAIL fail)${NC}"
        fi
    else
        echo -e "${RED}❌ 無法執行測試${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  無法執行測試 (Bun 或依賴未安裝)${NC}"
fi

echo ""

# 系統資訊
echo -e "${CYAN}[9] 系統資訊${NC}"
echo "  作業系統: $(uname -s)"
echo "  版本: $(uname -r)"
echo "  架構: $(uname -m)"
echo "  主機名稱: $(hostname)"

echo ""

# 總結
echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                      狀態總結                           ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"

# 判斷整體狀態
ISSUES=0

if ! pgrep -f "bun run src/index.ts" > /dev/null; then
    echo -e "${YELLOW}⚠️  Bot 未執行${NC}"
    echo "   → 執行 ./start.sh 啟動"
    ISSUES=$((ISSUES + 1))
fi

if [ ! -f .env ]; then
    echo -e "${RED}❌ 配置檔案缺失${NC}"
    echo "   → 複製 .env.example 並編輯"
    ISSUES=$((ISSUES + 1))
fi

if [ ! -d "node_modules" ]; then
    echo -e "${RED}❌ 依賴未安裝${NC}"
    echo "   → 執行 bun install"
    ISSUES=$((ISSUES + 1))
fi

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✓ 所有檢查通過!系統運作正常${NC}"
fi

echo ""
echo -e "${BLUE}常用指令:${NC}"
echo "  ./start.sh  - 啟動 Bot"
echo "  ./stop.sh   - 停止 Bot"
echo "  ./status.sh - 檢查狀態 (本腳本)"
echo ""
echo -e "${YELLOW}查看完整日誌: tail -f /tmp/claude-telegram-bot.log${NC}"
