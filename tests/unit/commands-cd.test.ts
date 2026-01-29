import { describe, test, expect, mock } from "bun:test";

describe("handleCd", () => {
  test("should change working directory", async () => {
    process.env.TELEGRAM_ALLOWED_USERS = "123456789";

    const { handleCd } = await import("../../src/handlers/commands");

    const mockSession = {
      workingDir: "/Users/vincewang",
      setWorkingDir: mock(() => {})
    };

    const mockCtx = {
      from: { id: 123456789 },
      message: { text: "/cd Documents" },
      reply: mock(() => Promise.resolve()),
      session: mockSession
    };

    await handleCd(mockCtx as any);

    expect(mockCtx.reply).toHaveBeenCalled();
    const callArgs = mockCtx.reply.mock.calls[0];
    expect(callArgs[0]).toContain("Documents");
    expect(callArgs[0]).toContain("Changed working directory");
  });

  test("should reject paths outside allowed directories", async () => {
    process.env.TELEGRAM_ALLOWED_USERS = "123456789";

    const { handleCd } = await import("../../src/handlers/commands");

    const mockCtx = {
      from: { id: 123456789 },
      message: { text: "/cd /etc" },
      reply: mock(() => Promise.resolve())
    };

    await handleCd(mockCtx as any);

    expect(mockCtx.reply).toHaveBeenCalled();
    const callArgs = mockCtx.reply.mock.calls[0];
    expect(callArgs[0]).toContain("Access denied");
  });
});
