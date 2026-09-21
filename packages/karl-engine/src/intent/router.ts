import type { Intent } from "./types.js";

const INTENT_KEYWORDS: Record<Intent, string[]> = {
  CREATE_CASE: ["新案件", "设计案件", "生成案件", "新的卡尔案件", "写一个案件", "设计一个", "来个案件", "create case"],
  CREATE_OUTLINE: ["大纲", "outline", "章节规划", "章节大纲"],
  WRITE_CHAPTER: ["写第一章", "写第二章", "生成章节", "写这一章"],
  CONTINUE: ["继续", "下一章", "继续写", "接着写", "continue"],
  REWRITE: ["重写", "改写", "rewrite", "重写这一章"],
  EXPAND: ["展开", "扩充", "加细节", "expand"],
  CONDENSE: ["精简", "压缩", "condense"],
  CHANGE_TRICK: ["换诡计", "改手法", "换个诡计", "change trick"],
  CHANGE_ALIBI: ["换不在场证明", "改不在场"],
  CHANGE_KILLER: ["换凶手", "改凶手", "change killer"],
  CHANGE_MOTIVE: ["换动机", "改动机"],
  CHANGE_LOCATION: ["换地点", "改地点", "换场景"],
  CHANGE_TIME: ["换时间", "改时间线"],
  CHANGE_BODY: ["换死法", "换尸体", "改死法"],
  CHANGE_CLUE: ["换线索", "改线索"],
  CHANGE_ENDING: ["换结局", "改结局"],
  CHECK_LOGIC: ["检查逻辑", "逻辑漏洞", "check logic"],
  CHECK_FAIR_PLAY: ["公平性", "fair play", "检查公平", "公平性检查"],
  CHECK_CONTINUITY: ["连续性", "continuity", "检查连贯", "前后矛盾"],
  SHOW_CASE: ["查看案件", "案件详情", "show case"],
  SHOW_TIMELINE: ["时间线", "查看时间线"],
  SHOW_CLUES: ["线索", "查看线索"],
  SHOW_CHARACTER: ["人物", "角色", "查看人物"],
  SAVE_CANON: ["保存正史", "接受为正史", "canon", "保存canon"],
};

export class KarlIntentRouter {
  route(input: string): { intent: Intent; confidence: number; context: Record<string, unknown> } {
    const lower = input.toLowerCase();
    let bestIntent: Intent = "CREATE_CASE";
    let bestScore = 0;

    for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
      let score = 0;
      for (const kw of keywords) {
        if (lower.includes(kw.toLowerCase())) {
          score += kw.length;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestIntent = intent as Intent;
      }
    }

    // Default to CREATE_CASE if no match
    const confidence = bestScore > 0 ? Math.min(1, bestScore / 10) : 0.3;

    return {
      intent: bestIntent,
      confidence,
      context: { originalInput: input },
    };
  }
}
