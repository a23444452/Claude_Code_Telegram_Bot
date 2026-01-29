import { describe, test, expect } from "bun:test";
import type { SessionConfig } from "../../src/types";

describe("SessionConfig", () => {
  test("should include workingDir property", () => {
    const config: SessionConfig = {
      sessionId: "test-session",
      workingDir: "/Users/vincewang/test-project",
      lastWorkingDirs: ["/Users/vincewang/projects"]
    };

    expect(config.workingDir).toBe("/Users/vincewang/test-project");
    expect(config.lastWorkingDirs).toHaveLength(1);
  });
});
