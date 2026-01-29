import { describe, test, expect, mock } from "bun:test";

describe("handlePwd", () => {
  test("should return current working directory", async () => {
    // Set env before importing to ensure config picks it up
    process.env.TELEGRAM_ALLOWED_USERS = "123456789";

    // Dynamic import after setting env
    const { handlePwd } = await import("../../src/handlers/commands");

    const mockCtx = {
      from: { id: 123456789 },
      reply: mock(() => Promise.resolve()),
      session: { workingDir: "/Users/vincewang/project" }
    };

    await handlePwd(mockCtx as any);

    expect(mockCtx.reply).toHaveBeenCalled();
    const callArgs = mockCtx.reply.mock.calls[0];
    expect(callArgs[0]).toContain("📁 Current working directory");
  });
});
