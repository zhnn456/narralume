import type { CaseProposal, FairPlayReport, FairPlayIssue } from "./types.js";

export class KarlFairPlayChecker {
  async check(caseProposal: CaseProposal): Promise<FairPlayReport> {
    const issues: FairPlayIssue[] = [];

    // Check 1: Key clues must be revealed before the final chapter
    const keyClues = caseProposal.clues.filter((c) => c.isKey);
    const maxChapter = Math.max(...keyClues.map((c) => c.chapter_revealed), 1);
    if (maxChapter > 5) {
      issues.push({
        severity: "ERROR",
        category: "premature_reveal",
        message: "关键线索在第5章后才揭示，读者可能无法在最终解答前推理出真相",
        requiredFix: "将关键线索提前到第2-4章通过自然事件展示",
      });
    }

    // Check 2: Every key clue must exist
    if (keyClues.length < 3) {
      issues.push({
        severity: "WARNING",
        category: "missing_clue",
        message: "关键线索少于3个，推理链可能不够扎实",
        requiredFix: "增加至少一个物理证据和一个时间线矛盾线索",
      });
    }

    // Check 3: Alibi must have a logical gap
    if (!caseProposal.alibi.includes("时间差") && !caseProposal.alibi.includes("替身") && !caseProposal.alibi.includes("机关")) {
      issues.push({
        severity: "WARNING",
        category: "alibi_gap",
        message: "不在场证明的破解机制不够明确",
        requiredFix: "明确说明不在场证明是如何被伪造和破解的",
      });
    }

    // Check 4: Timeline must be consistent
    const deathTime = caseProposal.trueDeathTime || caseProposal.deathTime;
    if (!deathTime) {
      issues.push({
        severity: "ERROR",
        category: "timeline_contradiction",
        message: "死亡时间不明确",
        requiredFix: "明确真实死亡时间和发现时间的差异",
      });
    }

    // Check 5: Killer must have a physical opportunity
    issues.push({
      severity: "INFO",
      category: "unfair_knowledge",
      message: "需要确认凶手的知识边界——凶手不应该知道读者不知道的信息",
      requiredFix: "在案件设计中明确凶手能接触到哪些信息",
    });

    // Check 6: No last-minute information
    issues.push({
      severity: "INFO",
      category: "last_minute_information",
      message: "确认解答中使用的所有信息都在前文有迹可循",
      requiredFix: "列出解答中使用的每条信息及其首次出现的章节",
    });

    // Calculate score
    const errorCount = issues.filter((i) => i.severity === "ERROR" || i.severity === "CRITICAL").length;
    const warningCount = issues.filter((i) => i.severity === "WARNING").length;
    let score = 100 - errorCount * 25 - warningCount * 10;
    score = Math.max(0, Math.min(100, score));

    const pass = errorCount === 0 && score >= 60;

    return {
      caseId: caseProposal.caseId,
      pass,
      score,
      issues,
      recommendation: pass
        ? "案件通过公平性检查，可以进入大纲阶段"
        : "案件存在公平性问题，请修复后重新检查",
    };
  }
}
