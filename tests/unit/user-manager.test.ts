import { describe, test, expect, beforeEach } from "bun:test";
import { UserManager } from "../../src/user-manager";

describe("UserManager", () => {
  let manager: UserManager;

  beforeEach(() => {
    manager = new UserManager();
  });

  test("should track user request", () => {
    manager.trackRequest(123456789, 1000);
    const stats = manager.getStats(123456789);

    expect(stats.totalRequests).toBe(1);
    expect(stats.totalTokens).toBe(1000);
  });

  test("should create new user if not exists", () => {
    const stats = manager.getStats(999999999);

    expect(stats.userId).toBe(999999999);
    expect(stats.totalRequests).toBe(0);
  });

  test("should accumulate multiple requests", () => {
    manager.trackRequest(123456789, 500);
    manager.trackRequest(123456789, 800);
    const stats = manager.getStats(123456789);

    expect(stats.totalRequests).toBe(2);
    expect(stats.totalTokens).toBe(1300);
  });

  test("should track lastActive timestamp", () => {
    const beforeTime = new Date();
    manager.trackRequest(123456789, 100);
    const stats = manager.getStats(123456789);
    const afterTime = new Date();

    expect(stats.lastActive.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
    expect(stats.lastActive.getTime()).toBeLessThanOrEqual(afterTime.getTime());
  });
});
