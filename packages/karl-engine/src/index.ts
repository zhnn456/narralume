// Karl Creative Engine - Main Entry Point

export * from "./types.js";
export { KarlKnowledgeBase } from "./knowledge.js";
export { KarlCaseDesigner, type CaseDesignInput } from "./case/designer.js";
export { KarlFairPlayChecker } from "./fairplay/checker.js";
export { KarlIntentRouter } from "./intent/router.js";
export { KarlCanonManager } from "./canon/manager.js";

import { KarlKnowledgeBase } from "./knowledge.js";
import { KarlCaseDesigner, type CaseDesignInput } from "./case/designer.js";
import { KarlFairPlayChecker } from "./fairplay/checker.js";
import { KarlIntentRouter } from "./intent/router.js";
import { KarlCanonManager } from "./canon/manager.js";
import type { CaseProposal, FairPlayReport, CanonEntry } from "./types.js";

export interface KarlEngineConfig {
  kbPath: string;
}

export class KarlCreativeEngine {
  private kb: KarlKnowledgeBase;
  private designer: KarlCaseDesigner;
  private fairplay: KarlFairPlayChecker;
  private intentRouter: KarlIntentRouter;
  private canonManager: KarlCanonManager;

  constructor(config: KarlEngineConfig) {
    this.kb = new KarlKnowledgeBase(config.kbPath);
    this.designer = new KarlCaseDesigner(this.kb);
    this.fairplay = new KarlFairPlayChecker();
    this.intentRouter = new KarlIntentRouter();
    this.canonManager = new KarlCanonManager();
  }

  async init(): Promise<void> {
    await this.kb.load();
  }

  async processUserInput(input: string): Promise<{
    intent: string;
    confidence: number;
    result: unknown;
  }> {
    const { intent, confidence } = this.intentRouter.route(input);

    switch (intent) {
      case "CREATE_CASE": {
        const designInput: CaseDesignInput = { userRequest: input };
        const proposal = await this.designer.designCase(designInput);
        const report = await this.fairplay.check(proposal);
        return {
          intent,
          confidence,
          result: { proposal, fairPlay: report },
        };
      }
      case "CHECK_FAIR_PLAY": {
        // Would need current case proposal
        return { intent, confidence, result: { message: "请先创建案件" } };
      }
      case "SAVE_CANON": {
        // Would need current case proposal
        return { intent, confidence, result: { message: "请先完成案件并通过审核" } };
      }
      case "SHOW_TIMELINE":
      case "SHOW_CLUES":
      case "SHOW_CHARACTER":
      case "SHOW_CASE": {
        const canons = await this.canonManager.listCanons();
        return { intent, confidence, result: { canons } };
      }
      default: {
        return {
          intent,
          confidence,
          result: { message: `已识别意图: ${intent}，正在处理...` },
        };
      }
    }
  }

  getCanonManager(): KarlCanonManager {
    return this.canonManager;
  }

  getKnowledgeBase(): KarlKnowledgeBase {
    return this.kb;
  }
}
