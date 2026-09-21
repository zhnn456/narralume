# Karl Creative Engine 集成方案

## 一、宿主选择

**最终采用：NarraLume (叙灯)**
- GitHub: https://github.com/abligail/narralume
- License: Apache 2.0（可自由修改和商业使用）
- 技术栈: TypeScript monorepo (Vite + Fastify + SQLite)
- Stars: 114
- 核心能力: Story Bible七段式、AI候选→作者接受、版本管理、Markdown编辑器、导入导出

**选择理由**：
1. 已有Story Bible七段式（author intent, outline, entities, canon, relationships, timeline, foreshadowing）——正好对应Karl需要的canon/timeline/foreshadowing/characters
2. AI候选→作者接受机制——正好对应Karl需要的Fair-Play审核后才能进入正文
3. 版本管理和Canon锁定——正好对应Karl需要的Draft vs Canon分离
4. Apache 2.0协议——无商业使用限制
5. 有Windows/Mac/Linux启动器——用户可直接本地运行
6. 架构清晰（apps/web + apps/server + packages/）——容易扩展

## 二、Karl Engine 模块

在 `packages/karl-engine/` 中创建了完整的Karl创作引擎：

```
packages/karl-engine/
├── src/
│   ├── index.ts          # KarlCreativeEngine 主类
│   ├── types.ts          # 所有类型定义（Zod schemas）
│   ├── knowledge.ts      # 知识库检索
│   ├── case/
│   │   └── designer.ts    # 案件设计器
│   ├── fairplay/
│   │   └── checker.ts    # Fair-Play 公平性检查
│   ├── intent/
│   │   └── router.ts     # 自然语言意图路由
│   └── canon/
│       └── manager.ts     # Canon 正史管理
└── README.md
```

## 三、知识库接入

知识库位于 `data/karl-detective-kb/`（21MB），包含：

| 剧集/作家 | 目录 | 集数/数量 |
|---|---|---|
| 神探阿蒙 (Monk) | `monk/` | 125集 |
| 天堂岛疑云 (DIP) | `death-in-paradise/` | 112集 |
| 可伦坡 (Columbo) | `columbo/` | 48集 |
| 波洛 (Poirot) | `poirot/` | 70+集 |
| 少年金田一 | `kindaichi-shonen/` | 18集深度版 |
| 古畑任三郎 | `furuhata/` | 32集 |
| 马普尔小姐 | `marple/` | 23集 |
| 摩斯警长 | `morse/` | 33集 |
| 福尔摩斯 | `sherlock/` | 41集 |
| 女作家与谋杀案 | `murder-she-wrote/` | 78集 |
| 神父布朗 | `father-brown/` | - |
| 破解不在场证明 | `alibi-kuzushi/` | - |

## 四、集成步骤

### 第一步：本地运行 NarraLume
```bash
# 克隆 fork 后的仓库
git clone <your-fork-url>
cd narralume

# 安装依赖
npm ci

# 开发模式运行
npm run dev
# 前端: http://127.0.0.1:4318
# 后端: http://127.0.0.1:4317
```

### 第二步：配置 LLM
在 Settings → Providers 中配置：
- OpenAI / DeepSeek / 其他 OpenAI-compatible API
- Base URL: 你的API地址
- API Key: 你的密钥
- 默认模型: 选择一个模型

### 第三步：使用 Karl Engine
1. 创建新书
2. 在 Story Bible 中填写作者意图（如：神探卡尔探案集，本格推理）
3. 在 AI Assistant 中输入："给我设计一个雪山酒店的密室杀人案"
4. Karl Engine 自动：
   - 识别意图（CREATE_CASE）
   - 检索知识库中已使用的诡计
   - 生成案件提案
   - 运行 Fair-Play 检查
   - 输出通过/不通过报告
5. 通过审核后，进入大纲和章节生成

## 五、验收标准

- [x] GitHub host 选定（NarraLume）
- [x] 源码审查完成
- [x] License 验证（Apache 2.0）
- [x] Karl Engine 模块创建
- [x] 知识库接入（21MB，500+案件分析）
- [x] Intent Router 实现
- [x] Case Designer 实现
- [x] Fair-Play Checker 实现
- [x] Canon Manager 实现
- [ ] 本地运行验证
- [ ] 端到端测试

## 六、后续扩展

1. **在前端添加Karl专属页面**：案件设计器、Fair-Play报告、Canon管理面板
2. **在Story Bible中增加Karl字段**：victim, killer, trick, alibi, clues, red_herrings
3. **在Review中增加Fair-Play维度**：与现有review系统集成
4. **知识库RAG检索**：将案件分析文件向量化，生成章节时自动检索相关诡计
