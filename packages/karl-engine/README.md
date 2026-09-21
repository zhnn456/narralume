# Karl Creative Engine

神探卡尔探案集创作引擎 - 集成在 NarraLume 工作台中的推理小说创作大脑。

## 模块结构

```
packages/karl-engine/
├── src/
│   ├── index.ts          # 主入口，KarlCreativeEngine 类
│   ├── types.ts          # 所有类型定义（Zod schemas）
│   ├── knowledge.ts      # 知识库检索（读取 karl-detective-kb）
│   ├── case/
│   │   └── designer.ts   # 案件设计器
│   ├── fairplay/
│   │   └── checker.ts    # Fair-Play 公平性检查
│   ├── intent/
│   │   └── router.ts     # 自然语言意图路由
│   └── canon/
│       └── manager.ts    # Canon 正史管理
└── package.json
```

## 核心功能

### 1. Intent Router（意图路由）
用户输入自然语言，自动识别意图：
- `CREATE_CASE` - 生成新案件
- `CREATE_OUTLINE` - 生成大纲
- `WRITE_CHAPTER` - 写章节
- `CONTINUE` - 继续写下一章
- `CHANGE_TRICK` / `CHANGE_KILLER` / `CHANGE_MOTIVE` - 修改案件元素
- `CHECK_FAIR_PLAY` - 公平性检查
- `CHECK_CONTINUITY` - 连续性检查
- `SAVE_CANON` - 保存为正史

### 2. Case Designer（案件设计器）
- 检索知识库中已使用的诡计
- 自动选择新鲜诡计
- 生成完整案件提案（受害者、凶手、嫌疑人、动机、手法、不在场证明、线索、红鲱鱼、时间线）

### 3. Fair-Play Checker（公平性检查）
- 检查关键线索是否提前揭示
- 检查不在场证明是否有逻辑漏洞
- 检查时间线是否一致
- 检查是否存在最后一分钟新增信息
- 输出 PASS/FAIL + 具体问题 + 修复建议

### 4. Canon Manager（正史管理）
- 保存已完成案件为 Canon
- 记录已使用的诡计（防止重复）
- 维护世界状态（人物、地点、死亡记录）
- 下一个案件自动继承历史 Canon

## 使用方式

```typescript
import { KarlCreativeEngine } from "@narralume/karl-engine";

const engine = new KarlCreativeEngine({
  kbPath: "./data/karl-detective-kb",
});

await engine.init();

// 用户输入一句话
const result = await engine.processUserInput("给我设计一个雪山酒店的密室杀人案");

console.log(result.intent);      // CREATE_CASE
console.log(result.result.proposal);  // 完整案件提案
console.log(result.result.fairPlay);  // 公平性检查报告
```

## 知识库接入

知识库位于 `data/karl-detective-kb/`，包含：
- `02_episode_analysis/` - 各剧集逐集分析
  - `monk/` - 神探阿蒙 125集
  - `death-in-paradise/` - 天堂岛疑云 112集
  - `columbo/` - 可伦坡 48集
  - `poirot/` - 波洛 70+集
  - `kindaichi-shonen/` - 少年金田一 18集深度版
  - `furuhata/` - 古畑任三郎 32集
  - `marple/` - 马普尔小姐 23集
  - `morse/` - 摩斯警长 33集
  - `granada-holmes/` - 福尔摩斯 41集
- `02_novel_analysis/` - 小说分析
  - `yokomizo/` - 横沟正史金田一耕助系列

## 与 NarraLume 的集成

Karl Engine 作为 NarraLume 的一个能力层：
- **NarraLume 负责**：编辑器、项目管理、章节管理、AI Chat、持久化、导出
- **Karl Engine 负责**：案件设计、诡计检索、Fair-Play 检查、连续性检查、Canon 管理

集成点：
1. 在 Story Bible 中增加 Karl 案件结构（受害者、凶手、线索、时间线）
2. 在 AI Assistant 中接入 Intent Router
3. 在 Review 中增加 Fair-Play 检查维度
4. 在 Delivery 中增加 Canon Snapshot 导出
