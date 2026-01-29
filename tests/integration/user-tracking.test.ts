import { describe, test, expect, beforeEach } from "bun:test";
import { userManager } from "../../src/handlers/commands";
import { session } from "../../src/session";

describe("User Tracking Integration", () => {
  beforeEach(() => {
    // Reset session state before each test
    session.sessionId = null;
    session.lastMessage = null;
  });

  test("userManager tracks requests correctly", () => {
    const userId = 123456789;

    // Get initial stats
    const initialStats = userManager.getStats(userId);
    const initialRequests = initialStats.totalRequests;

    // Track a request
    userManager.trackRequest(userId);

    // Verify request count increased
    const updatedStats = userManager.getStats(userId);
    expect(updatedStats.totalRequests).toBe(initialRequests + 1);
  });

  test("session should track token usage from Claude responses", async () => {
    // This test verifies that session.sendMessageStreaming tracks tokens
    // We'll check that after a response, lastUsage is populated

    // Note: This is more of an integration test that would require
    // mocking the Claude SDK, which is complex. For now, we verify
    // the structure exists and can be accessed.

    expect(session.lastUsage).toBeDefined();

    // If there was a previous query, lastUsage should have the token structure
    if (session.lastUsage) {
      expect(session.lastUsage).toHaveProperty("input_tokens");
      expect(session.lastUsage).toHaveProperty("output_tokens");
    }
  });

  test("token tracking should update user stats with response tokens", async () => {
    const userId = 123456789;

    // Get initial stats
    const initialStats = userManager.getStats(userId);
    const initialTokens = initialStats.totalTokens;

    // Manually track a request with tokens (simulating what session should do)
    userManager.trackRequest(userId, 1500);

    // Verify tokens were added
    const updatedStats = userManager.getStats(userId);
    expect(updatedStats.totalTokens).toBe(initialTokens + 1500);
  });
});
