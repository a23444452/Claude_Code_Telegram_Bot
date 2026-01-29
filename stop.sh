#!/bin/bash

# Claude Telegram Bot - 停止腳本
# 使用方式: ./stop.sh

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║     Claude Telegram Bot - 停止腳本 (Stop Script)        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# 檢查是否有執行中的實例
if ! pgrep -f "bun run src/index.ts" > /dev/null; then
    echo -e "${YELLOW}⚠️  沒有偵測到執行中的 Bot${NC}"
    echo ""
    echo "如果你確定 Bot 正在執行,可能是使用其他方式啟動的。"
    echo "請使用以下命令檢查:"
    echo "  ps aux | grep 'bun run src/index.ts'"
    exit 0
fi

# 顯示執行中的實例
echo -e "${YELLOW}執行中的實例:${NC}"
ps aux | grep "bun run src/index.ts" | grep -v grep

echo ""
read -p "確定要停止 Bot? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}已取消${NC}"
    exit 0
fi

echo -e "${YELLOW}正在停止 Bot...${NC}"
pkill -f "bun run src/index.ts"

# 等待進程結束
sleep 2

# 確認是否已停止
if pgrep -f "bun run src/index.ts" > /dev/null; then
    echo -e "${RED}❌ Bot 仍在執行,嘗試強制停止...${NC}"
    pkill -9 -f "bun run src/index.ts"
    sleep 1

    if pgrep -f "bun run src/index.ts" > /dev/null; then
        echo -e "${RED}❌ 無法停止 Bot!${NC}"
        echo "請手動檢查並停止進程:"
        ps aux | grep "bun run src/index.ts" | grep -v grep
        exit 1
    fi
fi

echo -e "${GREEN}✓ Bot 已成功停止${NC}"
echo ""
echo -e "${BLUE}提示:${NC}"
echo "  重新啟動: ./start.sh"
echo "  查看日誌: cat /tmp/claude-telegram-bot.log"
