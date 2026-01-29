import { describe, test, expect, mock } from "bun:test";

describe("handleLs", () => {
  test("should list directory contents", async () => {
    process.env.TELEGRAM_ALLOWED_USERS = "123456789";

    const { handleLs } = await import("../../src/handlers/commands");

    const mockCtx = {
      from: { id: 123456789 },
      message: { text: "/ls" },
      reply: mock(() => Promise.resolve())
    };

    await handleLs(mockCtx as any);

    expect(mockCtx.reply).toHaveBeenCalled();
  });

  test("should handle path argument", async () => {
    process.env.TELEGRAM_ALLOWED_USERS = "123456789";

    const { handleLs } = await import("../../src/handlers/commands");

    const mockCtx = {
      from: { id: 123456789 },
      message: { text: "/ls Documents" },
      reply: mock(() => Promise.resolve())
    };

    await handleLs(mockCtx as any);

    expect(mockCtx.reply).toHaveBeenCalled();
  });
});
