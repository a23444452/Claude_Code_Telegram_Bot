/**
 * Command handlers for Claude Telegram Bot.
 *
 * /start, /new, /stop, /status, /resume, /restart
 */

import type { Context } from "grammy";
import { session } from "../session";
import { WORKING_DIR, ALLOWED_USERS, RESTART_FILE } from "../config";
import { isAuthorized, isPathAllowed } from "../security";
import { readdirSync, statSync, existsSync } from "fs";
import { resolve } from "path";
import { UserManager } from "../user-manager";

// Initialize user manager
const userManager = new UserManager();

/**
 * /start - Show welcome message and status.
 */
export async function handleStart(ctx: Context): Promise<void> {
  const userId = ctx.from?.id;
  const username = ctx.from?.username || "unknown";

  if (!isAuthorized(userId, ALLOWED_USERS)) {
    await ctx.reply("Unauthorized. Contact the bot owner for access.");
    return;
  }

  const status = session.isActive ? "Active session" : "No active session";
  const workDir = WORKING_DIR;

  await ctx.reply(
    `🤖 <b>Claude Telegram Bot</b>\n\n` +
      `Status: ${status}\n` +
      `Working directory: <code>${workDir}</code>\n\n` +
      `<b>Commands:</b>\n` +
      `/new - Start fresh session\n` +
      `/stop - Stop current query\n` +
      `/status - Show detailed status\n` +
      `/resume - Resume last session\n` +
      `/retry - Retry last message\n` +
      `/restart - Restart the bot\n\n` +
      `<b>Tips:</b>\n` +
      `• Prefix with <code>!</code> to interrupt current query\n` +
      `• Use "think" keyword for extended reasoning\n` +
      `• Send photos, voice, or documents`,
    { parse_mode: "HTML" }
  );
}

/**
 * /new - Start a fresh session.
 */
export async function handleNew(ctx: Context): Promise<void> {
  const userId = ctx.from?.id;

  if (!isAuthorized(userId, ALLOWED_USERS)) {
    await ctx.reply("Unauthorized.");
    return;
  }

  // Stop any running query
  if (session.isRunning) {
    const result = await session.stop();
    if (result) {
      await Bun.sleep(100);
      session.clearStopRequested();
    }
  }

  // Clear session
  await session.kill();

  await ctx.reply("🆕 Session cleared. Next message starts fresh.");
}

/**
 * /stop - Stop the current query (silently).
 */
export async function handleStop(ctx: Context): Promise<void> {
  const userId = ctx.from?.id;

  if (!isAuthorized(userId, ALLOWED_USERS)) {
    await ctx.reply("Unauthorized.");
    return;
  }

  if (session.isRunning) {
    const result = await session.stop();
    if (result) {
      // Wait for the abort to be processed, then clear stopRequested so next message can proceed
      await Bun.sleep(100);
      session.clearStopRequested();
    }
    // Silent stop - no message shown
  }
  // If nothing running, also stay silent
}

/**
 * /status - Show detailed status.
 */
export async function handleStatus(ctx: Context): Promise<void> {
  const userId = ctx.from?.id;

  if (!isAuthorized(userId, ALLOWED_USERS)) {
    await ctx.reply("Unauthorized.");
    return;
  }

  const lines: string[] = ["📊 <b>Bot Status</b>\n"];

  // Session status
  if (session.isActive) {
    lines.push(`✅ Session: Active (${session.sessionId?.slice(0, 8)}...)`);
  } else {
    lines.push("⚪ Session: None");
  }

  // Query status
  if (session.isRunning) {
    const elapsed = session.queryStarted
      ? Math.floor((Date.now() - session.queryStarted.getTime()) / 1000)
      : 0;
    lines.push(`🔄 Query: Running (${elapsed}s)`);
    if (session.currentTool) {
      lines.push(`   └─ ${session.currentTool}`);
    }
  } else {
    lines.push("⚪ Query: Idle");
    if (session.lastTool) {
      lines.push(`   └─ Last: ${session.lastTool}`);
    }
  }

  // Last activity
  if (session.lastActivity) {
    const ago = Math.floor(
      (Date.now() - session.lastActivity.getTime()) / 1000
    );
    lines.push(`\n⏱️ Last activity: ${ago}s ago`);
  }

  // Usage stats
  if (session.lastUsage) {
    const usage = session.lastUsage;
    lines.push(
      `\n📈 Last query usage:`,
      `   Input: ${usage.input_tokens?.toLocaleString() || "?"} tokens`,
      `   Output: ${usage.output_tokens?.toLocaleString() || "?"} tokens`
    );
    if (usage.cache_read_input_tokens) {
      lines.push(
        `   Cache read: ${usage.cache_read_input_tokens.toLocaleString()}`
      );
    }
  }

  // Error status
  if (session.lastError) {
    const ago = session.lastErrorTime
      ? Math.floor((Date.now() - session.lastErrorTime.getTime()) / 1000)
      : "?";
    lines.push(`\n⚠️ Last error (${ago}s ago):`, `   ${session.lastError}`);
  }

  // Working directory
  lines.push(`\n📁 Working dir: <code>${WORKING_DIR}</code>`);

  await ctx.reply(lines.join("\n"), { parse_mode: "HTML" });
}

/**
 * /resume - Show list of sessions to resume with inline keyboard.
 */
export async function handleResume(ctx: Context): Promise<void> {
  const userId = ctx.from?.id;

  if (!isAuthorized(userId, ALLOWED_USERS)) {
    await ctx.reply("Unauthorized.");
    return;
  }

  if (session.isActive) {
    await ctx.reply("Sessione già attiva. Usa /new per iniziare da capo.");
    return;
  }

  // Get saved sessions
  const sessions = session.getSessionList();

  if (sessions.length === 0) {
    await ctx.reply("❌ Nessuna sessione salvata.");
    return;
  }

  // Build inline keyboard with session list
  const buttons = sessions.map((s) => {
    // Format date: "18/01 10:30"
    const date = new Date(s.saved_at);
    const dateStr = date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
    });
    const timeStr = date.toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Truncate title for button (max ~40 chars to fit)
    const titlePreview =
      s.title.length > 35 ? s.title.slice(0, 32) + "..." : s.title;

    return [
      {
        text: `📅 ${dateStr} ${timeStr} - "${titlePreview}"`,
        callback_data: `resume:${s.session_id}`,
      },
    ];
  });

  await ctx.reply("📋 <b>Sessioni salvate</b>\n\nSeleziona una sessione da riprendere:", {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: buttons,
    },
  });
}

/**
 * /restart - Restart the bot process.
 */
export async function handleRestart(ctx: Context): Promise<void> {
  const userId = ctx.from?.id;
  const chatId = ctx.chat?.id;

  if (!isAuthorized(userId, ALLOWED_USERS)) {
    await ctx.reply("Unauthorized.");
    return;
  }

  const msg = await ctx.reply("🔄 Restarting bot...");

  // Save message info so we can update it after restart
  if (chatId && msg.message_id) {
    try {
      await Bun.write(
        RESTART_FILE,
        JSON.stringify({
          chat_id: chatId,
          message_id: msg.message_id,
          timestamp: Date.now(),
        })
      );
    } catch (e) {
      console.warn("Failed to save restart info:", e);
    }
  }

  // Give time for the message to send
  await Bun.sleep(500);

  // Exit - launchd will restart us
  process.exit(0);
}

/**
 * /retry - Retry the last message (resume session and re-send).
 */
export async function handleRetry(ctx: Context): Promise<void> {
  const userId = ctx.from?.id;

  if (!isAuthorized(userId, ALLOWED_USERS)) {
    await ctx.reply("Unauthorized.");
    return;
  }

  // Check if there's a message to retry
  if (!session.lastMessage) {
    await ctx.reply("❌ No message to retry.");
    return;
  }

  // Check if something is already running
  if (session.isRunning) {
    await ctx.reply("⏳ A query is already running. Use /stop first.");
    return;
  }

  const message = session.lastMessage;
  await ctx.reply(`🔄 Retrying: "${message.slice(0, 50)}${message.length > 50 ? "..." : ""}"`);

  // Simulate sending the message again by emitting a fake text message event
  // We do this by directly calling the text handler logic
  const { handleText } = await import("./text");

  // Create a modified context with the last message
  const fakeCtx = {
    ...ctx,
    message: {
      ...ctx.message,
      text: message,
    },
  } as Context;

  await handleText(fakeCtx);
}

/**
 * /pwd - Show current working directory.
 */
export async function handlePwd(ctx: Context): Promise<void> {
  const userId = ctx.from?.id;
  if (!userId) {
    await ctx.reply("❌ Cannot identify user");
    return;
  }

  if (!isAuthorized(userId, ALLOWED_USERS)) {
    await ctx.reply("Unauthorized.");
    return;
  }

  // Get working directory from session or use default
  const workingDir = WORKING_DIR;

  await ctx.reply(
    `📁 Current working directory:\n\n` +
    `<code>${workingDir}</code>`,
    { parse_mode: "HTML" }
  );
}

/**
 * /ls - List directory contents.
 */
export async function handleLs(ctx: Context): Promise<void> {
  const userId = ctx.from?.id;
  if (!userId) {
    await ctx.reply("❌ Cannot identify user");
    return;
  }

  if (!isAuthorized(userId, ALLOWED_USERS)) {
    await ctx.reply("Unauthorized.");
    return;
  }

  // Parse path argument
  const text = ctx.message?.text || "";
  const parts = text.split(" ");
  const pathArg = parts.length > 1 ? parts.slice(1).join(" ") : ".";

  // Resolve path (relative to working directory)
  const targetPath = resolve(WORKING_DIR, pathArg);

  // Security check
  if (!isPathAllowed(targetPath)) {
    await ctx.reply(
      `❌ Access denied\n\n` +
      `Path not in allowed directories:\n` +
      `<code>${targetPath}</code>`,
      { parse_mode: "HTML" }
    );
    return;
  }

  try {
    const entries = readdirSync(targetPath);

    if (entries.length === 0) {
      await ctx.reply(
        `📁 <code>${targetPath}</code>\n\n(empty directory)`,
        { parse_mode: "HTML" }
      );
      return;
    }

    // Format entries with type indicators
    const formatted = entries
      .map(name => {
        try {
          const fullPath = resolve(targetPath, name);
          const stats = statSync(fullPath);
          const indicator = stats.isDirectory() ? "📁" : "📄";
          return `${indicator} ${name}`;
        } catch {
          return `❓ ${name}`;
        }
      })
      .join("\n");

    await ctx.reply(
      `📁 <code>${targetPath}</code>\n\n` +
      `${formatted}`,
      { parse_mode: "HTML" }
    );
  } catch (error: any) {
    await ctx.reply(
      `❌ Error listing directory:\n\n` +
      `<code>${error.message}</code>`,
      { parse_mode: "HTML" }
    );
  }
}

/**
 * /cd - Change working directory.
 */
export async function handleCd(ctx: Context): Promise<void> {
  const userId = ctx.from?.id;
  if (!userId) {
    await ctx.reply("❌ Cannot identify user");
    return;
  }

  if (!isAuthorized(userId, ALLOWED_USERS)) {
    await ctx.reply("Unauthorized.");
    return;
  }

  // Parse path argument
  const text = ctx.message?.text || "";
  const parts = text.split(" ");

  if (parts.length < 2) {
    await ctx.reply(
      `Usage: /cd &lt;path&gt;\n\n` +
      `Examples:\n` +
      `• /cd Documents\n` +
      `• /cd /Users/vincewang/projects\n` +
      `• /cd ..`,
      { parse_mode: "HTML" }
    );
    return;
  }

  const pathArg = parts.slice(1).join(" ");

  // Resolve path (relative to current working directory)
  const targetPath = resolve(WORKING_DIR, pathArg);

  // Security check
  if (!isPathAllowed(targetPath)) {
    await ctx.reply(
      `❌ Access denied\n\n` +
      `Path not in allowed directories:\n` +
      `<code>${targetPath}</code>\n\n` +
      `Allowed paths are defined in ALLOWED_PATHS config.`,
      { parse_mode: "HTML" }
    );
    return;
  }

  // Check if directory exists
  if (!existsSync(targetPath)) {
    await ctx.reply(
      `❌ Directory not found:\n\n` +
      `<code>${targetPath}</code>`,
      { parse_mode: "HTML" }
    );
    return;
  }

  // Check if it's a directory
  try {
    const stats = statSync(targetPath);
    if (!stats.isDirectory()) {
      await ctx.reply(
        `❌ Not a directory:\n\n` +
        `<code>${targetPath}</code>`,
        { parse_mode: "HTML" }
      );
      return;
    }
  } catch (error: any) {
    await ctx.reply(
      `❌ Error accessing path:\n\n` +
      `<code>${error.message}</code>`,
      { parse_mode: "HTML" }
    );
    return;
  }

  // TODO: Update session working directory
  // This will be implemented when we add session state management

  await ctx.reply(
    `✅ Changed working directory to:\n\n` +
    `<code>${targetPath}</code>\n\n` +
    `Note: This will be persisted in the next update.`,
    { parse_mode: "HTML" }
  );
}

/**
 * /stats - Show user statistics.
 */
export async function handleStats(ctx: Context): Promise<void> {
  const userId = ctx.from?.id;
  if (!userId) {
    await ctx.reply("❌ Cannot identify user");
    return;
  }

  if (!isAuthorized(userId, ALLOWED_USERS)) {
    await ctx.reply("Unauthorized.");
    return;
  }

  const stats = userManager.getStats(userId);

  const message = [
    `📊 使用統計`,
    ``,
    `👤 User ID: ${stats.userId}`,
    `📝 總請求數: ${stats.totalRequests}`,
    `🔢 總 Token 數: ${stats.totalTokens.toLocaleString()}`,
    `⏰ 最後活動: ${formatDate(stats.lastActive)}`,
    `📅 建立時間: ${formatDate(stats.createdAt)}`
  ].join("\n");

  await ctx.reply(message);
}

/**
 * Format date for display.
 */
function formatDate(date: Date): string {
  return date.toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

// Export userManager for use in other modules
export { userManager };
