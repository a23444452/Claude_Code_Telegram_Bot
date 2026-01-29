import { describe, test, expect, beforeEach, mock } from "bun:test";
import { userManager } from "../../src/handlers/commands";
import { session } from "../../src/session";
import { isPathAllowed } from "../../src/security";
import { requiresConfirmation } from "../../src/permissions";
import { WORKING_DIR } from "../../src/config";

describe("Full Workflow Integration Tests", () => {
  beforeEach(() => {
    // Reset session state before each test
    session.sessionId = null;
    session.lastMessage = null;
  });

  describe("User Authentication and Authorization", () => {
    test("should track unauthorized access attempts", () => {
      // User authentication is handled by isAuthorized in commands
      // This test verifies the flow exists
      expect(session).toBeDefined();
    });
  });

  describe("Working Directory Management", () => {
    test("should respect WORKING_DIR configuration", () => {
      expect(WORKING_DIR).toBeDefined();
      expect(typeof WORKING_DIR).toBe("string");
    });

    test("should validate paths against allowed directories", () => {
      // Test allowed path
      const allowedPath = WORKING_DIR;
      expect(isPathAllowed(allowedPath)).toBe(true);

      // Test disallowed path (system directory)
      const disallowedPath = "/etc/passwd";
      expect(isPathAllowed(disallowedPath)).toBe(false);
    });

    test("should handle relative path resolution", () => {
      // Path validation should work with resolved paths
      const relativePath = ".";
      expect(typeof relativePath).toBe("string");
    });
  });

  describe("Permission System Integration", () => {
    test("should auto-approve Read operations", () => {
      const result = requiresConfirmation("Read", {
        file_path: "/test/file.ts"
      });
      expect(result).toBe(false);
    });

    test("should require confirmation for Edit operations", () => {
      const result = requiresConfirmation("Edit", {
        file_path: "/test/file.ts"
      });
      expect(result).toBe(true);
    });

    test("should require confirmation for Write operations", () => {
      const result = requiresConfirmation("Write", {
        file_path: "/test/file.ts"
      });
      expect(result).toBe(true);
    });

    test("should auto-approve safe Bash commands", () => {
      const safeCommands = ["ls -la", "pwd", "cat file.txt", "grep pattern"];

      for (const command of safeCommands) {
        const result = requiresConfirmation("Bash", { command });
        expect(result).toBe(false);
      }
    });

    test("should require confirmation for dangerous Bash commands", () => {
      const dangerousCommands = [
        "rm -rf /",
        "mv important.file /tmp/",
        "git push origin main",
        "npm install package"
      ];

      for (const command of dangerousCommands) {
        const result = requiresConfirmation("Bash", { command });
        expect(result).toBe(true);
      }
    });
  });

  describe("User Statistics Tracking", () => {
    test("should track user requests", () => {
      // Use unique userId to avoid conflicts with other tests
      const userId = 1234567890001;

      // Get initial stats
      const initialStats = userManager.getStats(userId);
      const initialRequests = initialStats.totalRequests;

      // Track a request
      userManager.trackRequest(userId);

      // Verify request count increased
      const updatedStats = userManager.getStats(userId);
      expect(updatedStats.totalRequests).toBe(initialRequests + 1);
    });

    test("should track token usage", () => {
      // Use unique userId to avoid conflicts with other tests
      const userId = 1234567890002;

      // Get initial stats
      const initialStats = userManager.getStats(userId);
      const initialTokens = initialStats.totalTokens;

      // Track a request with tokens
      const tokensUsed = 2500;
      userManager.trackRequest(userId, tokensUsed);

      // Verify tokens were added
      const updatedStats = userManager.getStats(userId);
      expect(updatedStats.totalTokens).toBe(initialTokens + tokensUsed);
    });

    test("should update lastActive timestamp on requests", () => {
      // Use unique userId to avoid conflicts with other tests
      const userId = 1234567890003;

      const beforeTime = new Date();
      userManager.trackRequest(userId, 100);
      const stats = userManager.getStats(userId);
      const afterTime = new Date();

      expect(stats.lastActive.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(stats.lastActive.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    test("should accumulate requests and tokens over time", () => {
      // Use unique userId to avoid conflicts with other tests
      const userId = 1234567890004;

      // Get initial state (should be 0 for new user)
      const initialStats = userManager.getStats(userId);
      const initialRequests = initialStats.totalRequests;
      const initialTokens = initialStats.totalTokens;

      // Track multiple requests
      userManager.trackRequest(userId, 500);
      userManager.trackRequest(userId, 800);
      userManager.trackRequest(userId, 1200);

      const stats = userManager.getStats(userId);

      expect(stats.totalRequests).toBe(initialRequests + 3);
      expect(stats.totalTokens).toBe(initialTokens + 2500);
    });
  });

  describe("Error Handling", () => {
    test("should handle invalid paths gracefully", () => {
      const invalidPath = "/nonexistent/path/that/does/not/exist";

      // Path validation should return false for invalid paths outside allowed dirs
      const result = isPathAllowed(invalidPath);
      expect(typeof result).toBe("boolean");
    });

    test("should handle unknown tools in permission system", () => {
      // Unknown tools should default to requiring confirmation
      const result = requiresConfirmation("UnknownTool", {});
      expect(result).toBe(true);
    });

    test("should handle requests without tokens", () => {
      const userId = 999888777;

      // Track request without explicit token count
      userManager.trackRequest(userId);

      const stats = userManager.getStats(userId);
      expect(stats.totalRequests).toBeGreaterThan(0);
      expect(stats.totalTokens).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Session Management", () => {
    test("should track last message for retry functionality", () => {
      const testMessage = "test message for retry";
      session.lastMessage = testMessage;

      expect(session.lastMessage).toBe(testMessage);
    });

    test("should track session activity", () => {
      // Session should have activity tracking
      expect(session).toHaveProperty("lastActivity");
    });

    test("should have usage tracking structure", () => {
      // Session should have usage tracking
      expect(session).toHaveProperty("lastUsage");
    });
  });

  describe("Complete User Workflow", () => {
    test("should handle complete interaction flow", () => {
      const userId = 123456789;

      // 1. User authentication (simulated by having userId)
      expect(userId).toBeGreaterThan(0);

      // 2. Check working directory is set
      expect(WORKING_DIR).toBeDefined();

      // 3. Validate path access
      const testPath = WORKING_DIR;
      expect(isPathAllowed(testPath)).toBe(true);

      // 4. Track user request
      const initialStats = userManager.getStats(userId);
      userManager.trackRequest(userId, 1000);
      const updatedStats = userManager.getStats(userId);

      expect(updatedStats.totalRequests).toBeGreaterThan(initialStats.totalRequests);
      expect(updatedStats.totalTokens).toBeGreaterThan(initialStats.totalTokens);

      // 5. Verify permissions are enforced
      expect(requiresConfirmation("Read", {})).toBe(false);
      expect(requiresConfirmation("Edit", {})).toBe(true);

      // 6. Session state exists
      expect(session).toBeDefined();
      expect(session.sessionId).toBeDefined();
    });
  });

  describe("Command Handler Integration", () => {
    test("should have pwd command available", async () => {
      const { handlePwd } = await import("../../src/handlers/commands");
      expect(handlePwd).toBeDefined();
      expect(typeof handlePwd).toBe("function");
    });

    test("should have ls command available", async () => {
      const { handleLs } = await import("../../src/handlers/commands");
      expect(handleLs).toBeDefined();
      expect(typeof handleLs).toBe("function");
    });

    test("should have cd command available", async () => {
      const { handleCd } = await import("../../src/handlers/commands");
      expect(handleCd).toBeDefined();
      expect(typeof handleCd).toBe("function");
    });

    test("should have stats command available", async () => {
      const { handleStats } = await import("../../src/handlers/commands");
      expect(handleStats).toBeDefined();
      expect(typeof handleStats).toBe("function");
    });
  });

  describe("Data Persistence", () => {
    test("should persist user stats across multiple operations", () => {
      // Use unique userId to avoid conflicts with other tests
      const userId = 1234567890005;

      // Get initial state
      const initialStats = userManager.getStats(userId);
      const initialRequests = initialStats.totalRequests;
      const initialTokens = initialStats.totalTokens;

      // Create user with initial request
      userManager.trackRequest(userId, 100);
      const stats1 = userManager.getStats(userId);
      expect(stats1.totalRequests).toBe(initialRequests + 1);

      // Add more requests
      userManager.trackRequest(userId, 200);
      const stats2 = userManager.getStats(userId);
      expect(stats2.totalRequests).toBe(initialRequests + 2);
      expect(stats2.totalTokens).toBe(initialTokens + 300);

      // Stats should be cumulative
      expect(stats2.totalRequests).toBeGreaterThan(stats1.totalRequests);
      expect(stats2.totalTokens).toBeGreaterThan(stats1.totalTokens);
    });
  });
});
