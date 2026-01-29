import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

export interface UserStats {
  userId: number;
  totalRequests: number;
  totalTokens: number;
  lastActive: Date;
  createdAt: Date;
}

export class UserManager {
  private stats: Map<number, UserStats> = new Map();
  private dataPath: string;

  constructor(dataPath: string = "./data/users.json") {
    this.dataPath = resolve(dataPath);
    this.load();
  }

  /**
   * Track a user request
   */
  trackRequest(userId: number, tokens: number = 0): void {
    let stats = this.stats.get(userId);

    if (!stats) {
      stats = this.createNewUser(userId);
    }

    const updatedStats = {
      ...stats,
      totalRequests: stats.totalRequests + 1,
      totalTokens: stats.totalTokens + tokens,
      lastActive: new Date()
    };

    this.stats.set(userId, updatedStats);
    this.save();
  }

  /**
   * Get user statistics
   */
  getStats(userId: number): UserStats {
    let stats = this.stats.get(userId);

    if (!stats) {
      stats = this.createNewUser(userId);
      this.stats.set(userId, stats);
      this.save();
    }

    return stats;
  }

  /**
   * Create a new user
   */
  private createNewUser(userId: number): UserStats {
    return {
      userId,
      totalRequests: 0,
      totalTokens: 0,
      lastActive: new Date(),
      createdAt: new Date()
    };
  }

  /**
   * Load stats from file
   */
  private load(): void {
    if (!existsSync(this.dataPath)) {
      return;
    }

    try {
      const content = readFileSync(this.dataPath, "utf-8");
      const data = JSON.parse(content);

      for (const [userId, stats] of Object.entries(data)) {
        this.stats.set(Number(userId), {
          ...(stats as any),
          lastActive: new Date((stats as any).lastActive),
          createdAt: new Date((stats as any).createdAt)
        });
      }
    } catch (error) {
      console.error("Failed to load user stats:", error);
    }
  }

  /**
   * Save stats to file
   */
  private save(): void {
    try {
      const data: Record<number, UserStats> = {};
      for (const [userId, stats] of this.stats.entries()) {
        data[userId] = stats;
      }

      writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Failed to save user stats:", error);
    }
  }
}
