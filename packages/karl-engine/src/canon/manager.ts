import type { CanonEntry, CaseProposal, MechanismRecord } from "./types.js";

export class KarlCanonManager {
  private canons: Map<string, CanonEntry> = new Map();
  private usedMechanisms: Map<string, MechanismRecord> = new Map();

  async saveCanon(caseProposal: CaseProposal): Promise<CanonEntry> {
    const canon: CanonEntry = {
      canonId: `canon-${Date.now()}`,
      caseId: caseProposal.caseId,
      title: caseProposal.title,
      acceptedAt: new Date().toISOString(),
      characters: [caseProposal.victim, caseProposal.killer, ...caseProposal.suspects],
      locations: [caseProposal.setting],
      timeline: caseProposal.timeline,
      usedTricks: [caseProposal.trickCategory],
      deaths: [caseProposal.victim.name],
      openLooseEnds: [],
      worldState: {
        setting: caseProposal.setting,
        era: caseProposal.era,
      },
    };

    this.canons.set(canon.canonId, canon);

    // Record used mechanism
    const mechanism: MechanismRecord = {
      mechanismId: `mech-${Date.now()}`,
      caseId: caseProposal.caseId,
      category: caseProposal.trickCategory,
      description: caseProposal.coreTrick,
      corePrinciple: caseProposal.method,
      firstUsed: new Date().toISOString(),
    };
    this.usedMechanisms.set(mechanism.mechanismId, mechanism);

    return canon;
  }

  async getCanon(canonId: string): Promise<CanonEntry | null> {
    return this.canons.get(canonId) || null;
  }

  async listCanons(): Promise<CanonEntry[]> {
    return Array.from(this.canons.values());
  }

  async getUsedMechanisms(): Promise<MechanismRecord[]> {
    return Array.from(this.usedMechanisms.values());
  }

  async isMechanismUsed(category: string): Promise<boolean> {
    for (const m of this.usedMechanisms.values()) {
      if (m.category === category) return true;
    }
    return false;
  }

  async getWorldState(): Promise<Record<string, unknown>> {
    const canons = Array.from(this.canons.values());
    const allCharacters = canons.flatMap((c) => c.characters);
    const allLocations = canons.flatMap((c) => c.locations);
    const allDeaths = canons.flatMap((c) => c.deaths);

    return {
      totalCases: canons.length,
      characters: allCharacters,
      locations: allLocations,
      deaths: allDeaths,
      usedTricks: Array.from(new Set(canons.flatMap((c) => c.usedTricks))),
    };
  }
}
