import { describe, test, expect, mock } from "bun:test";

describe("handleStats", () => {
  test("should display user statistics", async () => {
    // Set env before importing to ensure config picks it up
    process.env.TELEGRAM_ALLOWED_USERS = "123456789";

    // Dynamic import after setting env
    const { handleStats } = await import("../../src/handlers/commands");

    const mockCtx = {
      from: { id: 123456789 },
      reply: mock(() => Promise.resolve())
    };

    await handleStats(mockCtx as any);

    expect(mockCtx.reply).toHaveBeenCalled();
    const callArgs = mockCtx.reply.mock.calls[0][0];
    expect(callArgs).toContain("使用統計");
  });

  test("should handle missing user ID", async () => {
    process.env.TELEGRAM_ALLOWED_USERS = "123456789";
    const { handleStats } = await import("../../src/handlers/commands");

    const mockCtx = {
      from: undefined,
      reply: mock(() => Promise.resolve())
    };

    await handleStats(mockCtx as any);

    expect(mockCtx.reply).toHaveBeenCalledWith(
      expect.stringContaining("Cannot identify user")
    );
  });

  test("should display all required statistics", async () => {
    process.env.TELEGRAM_ALLOWED_USERS = "123456789";
    const { handleStats } = await import("../../src/handlers/commands");

    const mockCtx = {
      from: { id: 123456789 },
      reply: mock(() => Promise.resolve())
    };

    await handleStats(mockCtx as any);

    const callArgs = mockCtx.reply.mock.calls[0][0];
    expect(callArgs).toContain("User ID");
    expect(callArgs).toContain("總請求數");
    expect(callArgs).toContain("總 Token 數");
    expect(callArgs).toContain("最後活動");
    expect(callArgs).toContain("建立時間");
  });
});
