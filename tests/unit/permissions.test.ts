import { describe, test, expect } from "bun:test";
import { loadPermissionRules, requiresConfirmation, requiresBashConfirmation, createConfirmationMessage } from "../../src/permissions";

describe("Permission System", () => {
  test("should load permission rules from config", () => {
    const rules = loadPermissionRules();

    expect(rules.autoApprove).toContain("Read");
    expect(rules.requireConfirmation).toContain("Edit");
  });

  test("should auto-approve Read tool", () => {
    const result = requiresConfirmation("Read", {});
    expect(result).toBe(false);
  });

  test("should require confirmation for Edit tool", () => {
    const result = requiresConfirmation("Edit", {});
    expect(result).toBe(true);
  });

  test("should check Bash command patterns - auto-approve", () => {
    const result1 = requiresConfirmation("Bash", { command: "ls -la" });
    expect(result1).toBe(false);  // Auto-approve

    const result2 = requiresConfirmation("Bash", { command: "pwd" });
    expect(result2).toBe(false);  // Auto-approve
  });

  test("should check Bash command patterns - require confirmation", () => {
    const result1 = requiresConfirmation("Bash", { command: "rm -rf file.txt" });
    expect(result1).toBe(true);  // Require confirmation

    const result2 = requiresConfirmation("Bash", { command: "git push origin main" });
    expect(result2).toBe(true);  // Require confirmation
  });

  test("should require confirmation for unknown tools", () => {
    const result = requiresConfirmation("UnknownTool", {});
    expect(result).toBe(true);
  });

  test("should create confirmation message for Bash command", () => {
    const message = createConfirmationMessage("Bash", { command: "rm -rf file.txt" });
    expect(message).toContain("即將執行指令");
    expect(message).toContain("rm -rf file.txt");
  });

  test("should create confirmation message for Edit tool", () => {
    const message = createConfirmationMessage("Edit", { file_path: "/test/file.txt" });
    expect(message).toContain("即將編輯檔案");
    expect(message).toContain("/test/file.txt");
  });

  test("should create confirmation message for Write tool", () => {
    const message = createConfirmationMessage("Write", { file_path: "/test/file.txt" });
    expect(message).toContain("即將寫入檔案");
    expect(message).toContain("/test/file.txt");
  });
});
