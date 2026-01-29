import { readFileSync } from "fs";
import { resolve } from "path";

interface PermissionRules {
  autoApprove: string[];
  requireConfirmation: string[];
  bashCommandRules: {
    autoApprove: string[];
    requireConfirmation: string[];
  };
}

let cachedRules: PermissionRules | null = null;

/**
 * Load permission rules from config file
 */
export function loadPermissionRules(): PermissionRules {
  if (cachedRules) {
    return cachedRules;
  }

  const configPath = resolve(import.meta.dir, "../config/permissions.json");
  const content = readFileSync(configPath, "utf-8");
  cachedRules = JSON.parse(content);
  return cachedRules!;
}

/**
 * Check if a tool/command requires user confirmation
 */
export function requiresConfirmation(tool: string, params: any): boolean {
  const rules = loadPermissionRules();

  // Check auto-approve list first
  if (rules.autoApprove.includes(tool)) {
    return false;
  }

  // Check if tool requires confirmation
  if (rules.requireConfirmation.includes(tool)) {
    // Special handling for Bash commands
    if (tool === "Bash" && params.command) {
      return requiresBashConfirmation(params.command);
    }
    return true;
  }

  // Default: require confirmation for unknown tools
  return true;
}

/**
 * Check if a Bash command requires confirmation
 */
export function requiresBashConfirmation(command: string): boolean {
  const rules = loadPermissionRules();

  // Check if command matches auto-approve patterns
  for (const pattern of rules.bashCommandRules.autoApprove) {
    if (command.trim().startsWith(pattern)) {
      return false;
    }
  }

  // Check if command matches require-confirmation patterns
  for (const pattern of rules.bashCommandRules.requireConfirmation) {
    if (command.includes(pattern)) {
      return true;
    }
  }

  // Default: require confirmation for unrecognized commands
  return true;
}

/**
 * Create a confirmation message for pending operation
 */
export function createConfirmationMessage(
  tool: string,
  params: any
): string {
  let message = `🔒 需要確認操作\n\n`;

  if (tool === "Bash") {
    message += `即將執行指令：\n\`\`\`bash\n${params.command}\n\`\`\`\n`;
  } else if (tool === "Edit") {
    message += `即將編輯檔案：\n\`${params.file_path}\`\n`;
  } else if (tool === "Write") {
    message += `即將寫入檔案：\n\`${params.file_path}\`\n`;
  } else {
    message += `工具：${tool}\n`;
  }

  return message;
}
