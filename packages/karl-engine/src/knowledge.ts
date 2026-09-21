import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { TrickCategory, MechanismRecord } from "./types.js";

export interface KnowledgeIndex {
  totalCases: number;
  byShow: Record<string, number>;
  trickUsage: Record<string, number>;
  mechanisms: MechanismRecord[];
  shows: string[];
}

export class KarlKnowledgeBase {
  private kbPath: string;
  private index: KnowledgeIndex | null = null;

  constructor(kbPath: string) {
    this.kbPath = kbPath;
  }

  async load(): Promise<KnowledgeIndex> {
    if (this.index) return this.index;

    const index: KnowledgeIndex = {
      totalCases: 0,
      byShow: {},
      trickUsage: {},
      mechanisms: [],
      shows: [],
    };

    try {
      const episodeDir = join(this.kbPath, "02_episode_analysis");
      const shows = await readdir(episodeDir, { withFileTypes: true });

      for (const show of shows) {
        if (!show.isDirectory()) continue;
        const showName = show.name;
        const showDir = join(episodeDir, showName);
        const files = await readdir(showDir);
        const mdFiles = files.filter((f) => f.endsWith(".md"));

        index.byShow[showName] = mdFiles.length;
        index.totalCases += mdFiles.length;
        index.shows.push(showName);

        for (const file of mdFiles.slice(0, 5)) {
          try {
            const content = await readFile(join(showDir, file), "utf-8");
            const mechanism = this.extractMechanism(file, showName, content);
            if (mechanism) {
              index.mechanisms.push(mechanism);
              for (const t of mechanism.category) {
                index.trickUsage[t] = (index.trickUsage[t] || 0) + 1;
              }
            }
          } catch {
            // skip unreadable files
          }
        }
      }
    } catch {
      // KB path not available, return empty index
    }

    this.index = index;
    return index;
  }

  private extractMechanism(
    filename: string,
    show: string,
    content: string
  ): MechanismRecord | null {
    const lower = content.toLowerCase();
    const categories: string[] = [];

    if (lower.includes("密室") || lower.includes("locked room")) {
      categories.push("locked_room");
    }
    if (lower.includes("不在场证明") || lower.includes("alibi")) {
      categories.push("alibi");
    }
    if (lower.includes("身份") || lower.includes("identity") || lower.includes("假身份")) {
      categories.push("identity");
    }
    if (lower.includes("时间") || lower.includes("time") || lower.includes("时间线")) {
      categories.push("time");
    }
    if (lower.includes("毒") || lower.includes("poison")) {
      categories.push("poison");
    }
    if (lower.includes("自杀") || lower.includes("suicide") || lower.includes("伪装自杀")) {
      categories.push("staged_suicide");
    }
    if (lower.includes("镜子") || lower.includes("mirror")) {
      categories.push("mirror");
    }
    if (lower.includes("机械") || lower.includes("device") || lower.includes("机关")) {
      categories.push("mechanical_device");
    }

    if (categories.length === 0) return null;

    return {
      mechanismId: `${show}/${filename.replace(".md", "")}`,
      caseId: filename.replace(".md", ""),
      category: categories[0] as TrickCategory,
      description: filename.replace(".md", "").replace(/-/g, " "),
      corePrinciple: categories.join(", "),
      firstUsed: show,
    };
  }

  async getUsedTricks(): Promise<Record<string, number>> {
    const index = await this.load();
    return index.trickUsage;
  }

  async getShows(): Promise<string[]> {
    const index = await this.load();
    return index.shows;
  }

  async getMechanisms(): Promise<MechanismRecord[]> {
    const index = await this.load();
    return index.mechanisms;
  }

  async suggestFreshTrick(usedTricks: Set<string>): Promise<string[]> {
    const allTricks = [
      "locked_room", "alibi", "identity", "time", "body",
      "poison", "staged_suicide", "false_identity", "time_swap",
      "mirror", "mechanical_device", "impossible_disappearance",
      "red_herring", "clue", "locked_container",
    ];
    return allTricks.filter((t) => !usedTricks.has(t));
  }
}
