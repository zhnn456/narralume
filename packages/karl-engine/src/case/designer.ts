import type { CaseProposal, Character, Clue, TimelineEvent, TrickCategory } from "./types.js";
import type { KarlKnowledgeBase } from "./knowledge.js";

export interface CaseDesignInput {
  userRequest: string;
  setting?: string;
  trickCategory?: TrickCategory;
  excludeTricks?: string[];
  characterCount?: number;
}

export class KarlCaseDesigner {
  private kb: KarlKnowledgeBase;

  constructor(kb: KarlKnowledgeBase) {
    this.kb = kb;
  }

  async designCase(input: CaseDesignInput): Promise<CaseProposal> {
    const usedTricks = new Set(input.excludeTricks || []);
    const freshTricks = await this.kb.suggestFreshTrick(usedTricks);

    const trick = input.trickCategory || (freshTricks[0] as TrickCategory);

    const proposal: CaseProposal = {
      caseId: `karl-${Date.now()}`,
      title: this.generateTitle(input.userRequest, trick),
      genre: "honkaku",
      setting: input.setting || "豪华酒店",
      coreTrick: this.describeTrick(trick),
      trickCategory: trick,
      victim: this.generateVictim(input),
      killer: this.generateKiller(input),
      suspects: this.generateSuspects(input, (input.characterCount || 5) - 2),
      motive: this.generateMotive(trick),
      method: this.generateMethod(trick),
      alibi: this.generateAlibi(trick),
      deathTime: "周三 凌晨 2:15",
      discoveredTime: "周三 上午 8:30",
      trueDeathTime: "周三 凌晨 1:45",
      clues: this.generateClues(trick),
      redHerrings: this.generateRedHerrings(trick),
      timeline: this.generateTimeline(trick),
      breakthrough: this.generateBreakthrough(trick),
      fairPlayScore: 72,
      originalityScore: 68,
      usedMechanisms: [trick],
    };

    return proposal;
  }

  private generateTitle(request: string, trick: TrickCategory): string {
    const settings = ["雪山酒店", "游轮", "古堡", "美术馆", "列车", "海滨庄园", "歌剧院", "大学", "医院", "赌场"];
    const selected = settings[Math.floor(Math.random() * settings.length)];
    const trickNames: Record<string, string> = {
      locked_room: "密室",
      alibi: "不在场证明",
      identity: "身份",
      poison: "毒杀",
      staged_suicide: "伪装自杀",
      mirror: "镜像",
      mechanical_device: "机关",
    };
    return `${selected}的${trickNames[trick] || "谜团"}杀人事件`;
  }

  private describeTrick(trick: TrickCategory): string {
    const descriptions: Record<string, string> = {
      locked_room: "密室杀人——死者在完全封闭的房间内被杀，门窗反锁，无凶手出入痕迹",
      alibi: "不在场证明——凶手拥有完美不在场证明，但实际上通过时间差或空间转换伪造",
      identity: "身份诡计——某人冒充另一人，利用身份错位制造不在场或嫁祸",
      poison: "毒杀——通过延时释放、间接接触或载体转移投毒",
      staged_suicide: "伪装自杀——他杀伪装成自杀，遗书、现场布置均为伪造",
      mirror: "镜像诡计——利用镜子制造视觉错觉，隐藏人物或物体的真实位置",
      mechanical_device: "机械机关——利用物理装置远程杀人或延迟触发",
      time: "时间诡计——通过时间感知偏差或事件顺序颠倒制造不在场证明",
      body: "尸体处理——通过尸体移动、调换或伪装死亡时间误导调查",
      clue: "线索误导——关键线索被伪装成无关物品，或线索本身有双重含义",
      red_herring: "红鲱鱼——故意设置误导性线索，引导调查方向偏离真相",
    };
    return descriptions[trick] || "经典本格推理诡计";
  }

  private generateVictim(input: CaseDesignInput): Character {
    const names = ["贺铭远", "陆峥", "沈从舟", "方静怡", "陈伯安", "林子昂"];
    return {
      id: "victim",
      name: names[Math.floor(Math.random() * names.length)],
      role: "victim",
      age: 50 + Math.floor(Math.random() * 20),
      occupation: "企业家/收藏家",
      secret: "28年前的罪行",
    };
  }

  private generateKiller(input: CaseDesignInput): Character {
    const names = ["陆鸣", "方静", "黄介", "杨兰", "柯文", "苏雨"];
    return {
      id: "killer",
      name: names[Math.floor(Math.random() * names.length)],
      role: "killer",
      age: 30 + Math.floor(Math.random() * 15),
      occupation: "表面身份：与受害者关系密切的人",
      motive: "为28年前的杀人案复仇",
      secret: "真实身份是当年受害者的后代",
    };
  }

  private generateSuspects(input: CaseDesignInput, count: number): Character[] {
    const suspects: Character[] = [];
    for (let i = 0; i < count; i++) {
      suspects.push({
        id: `suspect-${i}`,
        name: `嫌疑人${String.fromCharCode(65 + i)}`,
        role: "suspect",
        alibi: "各有不在场证明但均有漏洞",
        motive: "看似有动机但实际不成立",
      });
    }
    return suspects;
  }

  private generateMotive(trick: TrickCategory): string {
    const motives = [
      "为28年前被杀害的亲人复仇",
      "争夺被侵占的遗产",
      "揭露被掩盖的罪行",
      "保护自己不被灭口",
    ];
    return motives[Math.floor(Math.random() * motives.length)];
  }

  private generateMethod(trick: TrickCategory): string {
    const methods: Record<string, string> = {
      locked_room: "凶手通过预置机关在门外远程触发，制造密室后用机关回收钥匙",
      alibi: "凶手利用两地时差或交通方式的时间差，制造不可能同时出现在两地的假象",
      identity: "凶手冒充另一人，在A地扮演甲的同时，真正的自己在B地作案",
      poison: "凶手将毒药涂在日常接触物上，延时释放，死亡时间与作案时间分离",
      staged_suicide: "凶手先杀人，再布置成自杀现场，伪造遗书和反锁房间",
    };
    return methods[trick] || "精心设计的杀人手法";
  }

  private generateAlibi(trick: TrickCategory): string {
    const alibis: Record<string, string> = {
      locked_room: "凶手在房间外有多人证明，但实际上是通过机关杀人",
      alibi: "凶手在案发时在另一地点有监控证明，但时间记录被篡改",
      identity: "凶手的替身扮演了他，真正的他在作案",
    };
    return alibis[trick] || "看似完美的不在场证明，实际有时间差漏洞";
  }

  private generateClues(trick: TrickCategory): Clue[] {
    const clues: Clue[] = [
      { id: "clue-1", description: "现场有一个不合常理的细节（如排风扇开着但没有蒸汽）", chapter_revealed: 2, isKey: true },
      { id: "clue-2", description: "证人描述与监控时间有5分钟偏差", chapter_revealed: 4, isKey: true },
      { id: "clue-3", description: "一件物品的位置被微调了15度", chapter_revealed: 3, isKey: false },
      { id: "clue-4", description: "死者口袋里有一张半烧的纸片", chapter_revealed: 5, isKey: true },
      { id: "clue-5", description: "所有人都在说同一个谎言", chapter_revealed: 6, isKey: false },
    ];
    return clues;
  }

  private generateRedHerrings(trick: TrickCategory): string[] {
    return [
      "最像凶手的人反而不是凶手",
      "看似关键的线索实际是误导",
      "死者留下的死亡留言指向错误方向",
      "某个角色的神秘行为与案件无关",
    ];
  }

  private generateTimeline(trick: TrickCategory): TimelineEvent[] {
    return [
      { id: "t1", time: "案发前3小时", description: "凶手布置了关键机关", isTruth: true, publicKnowledge: false },
      { id: "t2", time: "案发前1小时", description: "凶手制造了不在场证明的假象", isTruth: true, publicKnowledge: false },
      { id: "t3", time: "案发时", description: "机关触发，死者死亡", isTruth: true, publicKnowledge: false },
      { id: "t4", time: "案发后30分钟", description: "凶手回收机关，伪装现场", isTruth: true, publicKnowledge: false },
      { id: "t5", time: "尸体发现时", description: "警方到场，初步判断为自杀/意外", isTruth: false, publicKnowledge: true },
    ];
  }

  private generateBreakthrough(trick: TrickCategory): string {
    return "卡尔通过一个看似无关的小细节（如物品位置偏差、时间记录不一致、或证人描述的矛盾），串联起三个独立线索，最终发现凶手的真实身份和手法。";
  }
}
