#!/bin/bash

# Claude Telegram Bot - 一鍵啟動腳本
# 使用方式: ./start.sh

set -e  # 遇到錯誤立即停止

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 顯示 banner
echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║     Claude Telegram Bot - Enhanced Edition v1.0.0       ║"
echo "║              一鍵啟動腳本 (Start Script)                ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# 檢查 Bun
echo -e "${YELLOW}[1/5] 檢查 Bun 安裝...${NC}"
if ! command -v bun &> /dev/null; then
    echo -e "${RED}❌ Bun 未安裝!${NC}"
    echo -e "${YELLOW}請執行: curl -fsSL https://bun.sh/install | bash${NC}"
    exit 1
fi
BUN_VERSION=$(bun --version)
echo -e "${GREEN}✓ Bun 已安裝 (版本: $BUN_VERSION)${NC}"

# 檢查 .env 檔案
echo -e "${YELLOW}[2/5] 檢查配置檔案...${NC}"
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env 檔案不存在!${NC}"
    echo -e "${YELLOW}正在從 .env.example 建立...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ 已建立 .env 檔案${NC}"
        echo -e "${YELLOW}⚠️  請編輯 .env 檔案並填入你的設定:${NC}"
        echo "   - TELEGRAM_BOT_TOKEN"
        echo "   - TELEGRAM_ALLOWED_USERS"
        echo "   - CLAUDE_WORKING_DIR"
        echo ""
        echo -e "${YELLOW}編輯完成後請重新執行此腳本${NC}"
        exit 0
    else
        echo -e "${RED}❌ .env.example 也不存在!${NC}"
        exit 1
    fi
fi

# 檢查必要環境變數
source .env
if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo -e "${RED}❌ TELEGRAM_BOT_TOKEN 未設定!${NC}"
    echo -e "${YELLOW}請編輯 .env 檔案並設定 TELEGRAM_BOT_TOKEN${NC}"
    exit 1
fi

if [ -z "$TELEGRAM_ALLOWED_USERS" ]; then
    echo -e "${RED}❌ TELEGRAM_ALLOWED_USERS 未設定!${NC}"
    echo -e "${YELLOW}請編輯 .env 檔案並設定 TELEGRAM_ALLOWED_USERS${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 配置檔案完整${NC}"

# 檢查依賴
echo -e "${YELLOW}[3/5] 檢查專案依賴...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}首次執行,正在安裝依賴...${NC}"
    bun install
    echo -e "${GREEN}✓ 依賴安裝完成${NC}"
else
    echo -e "${GREEN}✓ 依賴已安裝${NC}"
fi

# 執行測試
echo -e "${YELLOW}[4/5] 執行快速測試...${NC}"
TEST_OUTPUT=$(bun test 2>&1)
if echo "$TEST_OUTPUT" | grep -q "0 fail"; then
    PASS_COUNT=$(echo "$TEST_OUTPUT" | grep -oP '\d+(?= pass)' | head -1)
    echo -e "${GREEN}✓ 所有測試通過 ($PASS_COUNT 項)${NC}"
else
    echo -e "${RED}❌ 測試失敗!${NC}"
    echo "$TEST_OUTPUT"
    echo -e "${YELLOW}建議先修復測試問題再啟動 Bot${NC}"
    read -p "是否仍要繼續啟動? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 檢查是否已有執行中的實例
echo -e "${YELLOW}[5/5] 檢查執行中的實例...${NC}"
if pgrep -f "bun run src/index.ts" > /dev/null; then
    echo -e "${YELLOW}⚠️  偵測到已有 Bot 正在執行!${NC}"
    read -p "是否要停止舊的實例並啟動新的? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}正在停止舊實例...${NC}"
        pkill -f "bun run src/index.ts"
        sleep 2
        echo -e "${GREEN}✓ 舊實例已停止${NC}"
    else
        echo -e "${BLUE}保持現有實例執行中${NC}"
        exit 0
    fi
fi

# 啟動選項
echo ""
echo -e "${BLUE}請選擇啟動模式:${NC}"
echo "  1) 前台執行 (可看到即時輸出,按 Ctrl+C 停止)"
echo "  2) 背景執行 (輸出到 log 檔案)"
echo "  3) 取消"
echo ""
read -p "請選擇 (1-3): " -n 1 -r
echo

case $REPLY in
    1)
        echo -e "${GREEN}🚀 啟動 Bot (前台模式)...${NC}"
        echo -e "${YELLOW}提示: 按 Ctrl+C 可停止 Bot${NC}"
        echo ""
        bun run src/index.ts
        ;;
    2)
        echo -e "${GREEN}🚀 啟動 Bot (背景模式)...${NC}"
        nohup bun run src/index.ts > /tmp/claude-telegram-bot.log 2>&1 &
        PID=$!
        sleep 2
        if ps -p $PID > /dev/null; then
            echo -e "${GREEN}✓ Bot 已在背景啟動 (PID: $PID)${NC}"
            echo ""
            echo "查看日誌: tail -f /tmp/claude-telegram-bot.log"
            echo "停止 Bot: pkill -f 'bun run src/index.ts'"
            echo "或使用: kill $PID"
        else
            echo -e "${RED}❌ Bot 啟動失敗!${NC}"
            echo -e "${YELLOW}請查看日誌: cat /tmp/claude-telegram-bot.log${NC}"
            exit 1
        fi
        ;;
    3)
        echo -e "${BLUE}已取消${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}無效的選擇${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                   Bot 啟動成功! 🎉                      ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}下一步:${NC}"
echo "  1. 開啟 Telegram"
echo "  2. 找到你的 Bot"
echo "  3. 發送 /start 開始使用"
echo ""
echo -e "${BLUE}常用指令:${NC}"
echo "  /pwd        - 顯示當前目錄"
echo "  /ls         - 列出檔案"
echo "  /cd <path>  - 切換目錄"
echo "  /stats      - 查看統計"
echo "  /new        - 開始新對話"
echo ""
echo -e "${YELLOW}需要幫助? 請參考: docs/GETTING_STARTED.md${NC}"
