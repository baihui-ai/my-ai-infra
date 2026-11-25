# Qoder / DeepSeek Harness 工程规范差异研究

[返回需求](../BRIEF.md)

研究日期：2026-11-22（Asia/Shanghai）。范围：当前仓库、官方文档、官方 npm 发布包，以及 DeepSeek 对应发行标签的源码。研究先于 PRD 和技术方案完成。本报告中的兼容策略是设计建议；宿主真实会话尚待执行。

## 1. 结论与建议

保留 `.agents` 作为项目资产唯一源，在现有装配层增加 Qoder 与 DeepSeek Harness 的入口策略即可。适配的实际工作集中在入口形态、宿主能力、共享路径去重和撤回边界。

- Qoder CLI 1.1.95 的普通 CLI 会话默认读取项目与用户级 `.agents/skills`，`skills.loadFromAgentsDirectory` 可关闭；SDK 入口默认关闭。CLI 文档仍主要介绍 `.qoder/skills`。项目适配采用 `.qoder/skills/<name>` 目录软链，兼顾文档约定与共享源；双路径的同名发现需要宿主验收。
- Qoder 的角色扫描使用 `Dirent.isFile()`，跳过软链接的角色文件。角色入口需要受管普通文件；中立源继续保存在 `.agents/agents`，派生版本保存在 `.agents/.generated/qoder/agents`。
- Qoder CN 1.1.95 与国际版使用相同的项目 `.qoder` 目录，用户级目录分别是 `~/.qoder-cn` 与 `~/.qoder`。选择两个版本时，项目入口及 Hook 必须去重，全局入口分别装配。
- DeepSeek 默认发布通道和最新 alpha 都原生读取 `.agents/skills`，基础接入不必生成 `.dsh/skills` 副本。规则入口沿用根目录 `AGENTS.md`。
- DeepSeek 命名角色采用 Cordis Agent Preset，Hook 需要显式挂载插件。首批交付规则与 Skill；命名角色、自动格式化和 MCP 自动注册独立规划，界面明确展示能力范围。

## 2. 固定版本基线

| 对象 | 本次核对版本 | 渠道与时间 | 研究范围 |
|---|---|---|---|
| my-ai-infra | `0.0.15`，`151cb1f0debf81eaa37df19268c30d2578e428c2` | 本地 `main`，2026-11-22 | `src`、Web、资产、测试、分发检查；保留已有未跟踪文件 |
| Qoder CLI 国际版 | `@qoder-ai/qodercli@1.1.95` | npm `latest`，2026-11-21 发布 | 官方包 `bundle/qodercli.js`、当前 CLI 文档；原生独立安装渠道未运行 |
| Qoder CLI CN | `@qodercn-ai/qoderclicn@1.1.95` | npm `latest` | 官方包 `bundle/qoderclicn.js`、CN 配置文档 |
| Qoder IDE | `1.41.1` | 官方更新日志，2026-11-20 | 官方文档与发布记录；没有把 CLI 包的实现结论直接扩展到 IDE |
| Qoder 桌面应用 | `0.5.17` | 官方更新日志，2026-11-20 | 共享 Skill、Agent UI 与 Hook 文档；首批不承诺其完整角色装配 |
| DeepSeek 默认通道 | `@deepseek-ai/dsh@0.2.2-rc.5` | npm `latest` / `next`，2026-11-18 | 标签 `dsh-v0.2.2-rc.5`，commit `9c2670d3bce5275e0d1610272958121af87787bb` |
| DeepSeek 最新 alpha | `@deepseek-ai/dsh@0.2.3-alpha.2` | npm `alpha`，2026-11-22 17:57:12（北京时间） | 官方 npm 包及同版本 skills、instructions、subagent、preset、hooks、home-paths 子包源码 |

Qoder CLI 更新日志最新条目为 1.1.94，npm 已发布 1.1.95，因此 CLI 实现判断以 1.1.95 发布包为准。DeepSeek GitHub releases 最新条目为 `0.2.3-alpha.1`，npm alpha 已到 `.2`；alpha.2 的 Git 标签接口返回 404，本次使用实际 npm 发布包，不把 master 当作该版本。

DeepSeek rc.5 的 Node 要求为 `>=24.9.0`，alpha.2 要求为 `^24.22.3 || >=26.13.1`。当前研究环境 Node 为 `24.12.0`，alpha.2 仅进行了发布包与源码核对。my-ai-infra 的 Node 22+ 要求保持独立。精确包校验值见 [版本快照](UPSTREAM_BASELINE.json)。

## 3. 当前框架的装配契约

| 层 | 当前实现 | 对本需求的影响 |
|---|---|---|
| 分发源 | `assets/skills`、`assets/agents`、扩展 `asset.json` | 新工具复用现有内容，无需复制一套工作流 |
| 项目源 | `.agents/skills` 普通文件；`.agents/agents` 中立角色 | 两款宿主可直接或经入口读取共享资产 |
| 运行规则 | `.agents/rules/AGENTS.md` → 根目录 `AGENTS.md` 软链 | 两款宿主均以根目录入口读取；`.agents/rules` 本身是本框架组织约定 |
| Skill 入口 | Codex 直接读源；MiniMax 目录软链；其他逐文件软链 | 新增 `source / directory / files` 策略可复用三种既有行为 |
| Agent 入口 | `.generated` 派生与原生入口软链；MiniMax 用户级为普通文件 | Qoder 需要项目级及用户级普通文件镜像，补齐冲突处理 |
| 格式化 | 已有配置检测 → 安装 `my-format` → 结构化合并宿主 JSON | Qoder 可复用 `Stop`；含注释 JSON 需要明确保护策略 |
| 扩展资产 | 只装配文件；目标路径受工具根目录限制 | MCP 文件落盘后仍需宿主注册与授权 |
| 诊断 | `discovery` 按文件计划生成，`hostVerified: false` | 需提供每种宿主真实能力及调用方式，避免沿用 MiniMax 专属提示 |
| 事务 | preview revision、锁、备份、merge/replace/abort、回滚 | 新入口都进入同一事务，不能旁路写配置 |

相关实现：[装配](../../../src/project.mjs)、[全局安装](../../../src/store.mjs)、[角色](../../../src/agents.mjs)、[规则](../../../src/rules.mjs)、[发现](../../../src/discovery.mjs)、[扩展边界](../../../src/assets.mjs)、[格式化](../../../src/format-hook.mjs)。

## 4. 宿主能力对照

| 维度 | Qoder CLI 国际版 / CN | DeepSeek rc.5 / alpha.2 | 兼容判断 |
|---|---|---|---|
| 项目总规则 | `AGENTS.md`、`AGENTS.local.md`；按目录追加规则 | `AGENTS.md`、`CLAUDE.md` 及两种 `.local.md`；按目录加载，重复正文去重 | 复用现有根入口；保留用户独立规则 |
| 规则专属目录 | 项目 `.qoder/rules/**/*.md`；可用 globs、触发条件 | instructions 插件按候选文件名加载 | 不把任意 `.agents/rules/*.md` 宣称为自动生效 |
| 项目 Skill | `.qoder/skills`；普通 CLI 默认兼容 `.agents/skills` | `.dsh/skills` 优先于 `.agents/skills` | Qoder 增加目录入口；DeepSeek 使用源目录 |
| 用户 Skill | 国际 `~/.qoder/skills`，CN `~/.qoder-cn/skills`；共享 `~/.agents/skills` 受开关控制 | 默认 `~/.dsh/skills`、`~/.agents/skills`；可改 `DSH_HOME`、`DSH_AGENTS_HOME` | 全局共享源只写一次，入口按各版本装配 |
| Skill 格式 | `SKILL.md` + frontmatter + 附属目录；目录名参与调用身份 | bundle `name/SKILL.md` 或平铺 `name.md`；非递归 bundle 发现 | 本仓库的直接子目录与 kebab-case 命名符合两者 |
| 显式调用策略 | 1.1.95 解析 `disable-model-invocation`、`user-invocable` | 同样解析两字段；禁隐式 Skill 保留用户调用 | 当前四个工作流已有 `disable-model-invocation: true`，可复用；`agents/openai.yaml` 只作为其他宿主资源保留 |
| Skill 软链 | 发布包扫描目录软链，`stat(SKILL.md)` 与 `readFile` 能读文件软链 | Node provider 支持目录/文件软链，FS provider 按 provider 边界解析 | Qoder 采用目录软链；DeepSeek 直接读普通源文件 |
| 自定义角色 | `.qoder/agents/*.md`；CN 用户目录不同；frontmatter + 系统提示正文 | Cordis YAML 声明 Agent Preset；子代理通过 `agentPreset / allowedAgentPresets` 选择 | Qoder 增加 renderer 与普通镜像；DeepSeek 另做插件接入 |
| 角色软链 | `readdir(...withFileTypes)` 后仅收集普通文件和普通子目录 | 没有与 `.agents/agents/*.md` 对应的原生角色扫描入口 | Qoder 现有逐角色软链方案不可用；DeepSeek 不生成假角色目录 |
| Hook | `.qoder/settings.json` 的分组 Hook；`Stop`；CLI timeout 单位秒 | Claude/Codex Hook bridge 为可选插件，需 `configPath`，部分语义受限 | Qoder 接入 30 秒 `Stop`；DeepSeek 首批仅显示限制 |
| 配置语法 | `settings.json` 支持注释 | Cordis YAML / patch / plugin settings | 现有 `JSON.parse` 仅覆盖严格 JSON；首批遇注释文件保持原样并报告冲突 |
| MCP | `settings.json.mcpServers`、项目 `.mcp.json`、插件及 CLI 参数；有信任/授权 | `mcp-manager.config.servers` 或独立 client 插件；可运行时管理 | 保持文件装配边界，不自动启服务、写凭据或改整份配置 |
| 项目根 | 根发现和信任配置影响上下文 | 最近含 `.git` 的祖先，无 `.git` 时使用 cwd | 验收覆盖 Git 子模块、worktree 与无 Git 的启动目录 |
| 刷新 | `/skills reload`、`/agents reload`；设置部分需重启 | Skill watcher；规则在文件操作或会话恢复时刷新 | 文档给出各自刷新步骤 |

Qoder CLI 与 IDE 文档对同名用户/项目 Skill 的优先级描述不同，CLI 文档写用户级优先、IDE 文档写项目级优先。my-ai-infra 不覆盖宿主优先级；冲突场景分别验证来源。桌面应用通过 UI 管理 Agent，其本地文件导入不在 CLI 结论的保证范围内。

DeepSeek 默认 instructions 插件预算为每条指令链 65,536 字节，超限可能丢弃较宽范围内容。它的 Hook bridge 按进程读取一个配置，缺少自动逐项目重载；为多项目桌面会话写入固定项目绝对路径会产生跨项目执行风险。

## 5. 具体 gap 与处理顺序

| ID | 当前差异 | 触发与结果 | 处理建议 |
|---|---|---|---|
| G-01 | 工具清单散落在 store、CLI、Web、assets、agents、rules、discovery、manifest、检查脚本 | 新增名称后容易出现入口、清理、诊断各自不一致 | 用小型静态适配描述统一路径与入口形态；保持现有 API |
| G-02 | `setup()` 跳过共享源的条件写死 `codex` | DeepSeek 同样指向 `.agents/skills` 时触发 Duplicate asset target 或自链接 | 按目标路径是否等于源路径判断；同目标同内容去重，异内容冲突 |
| G-03 | Qoder Agent 文件软链被忽略 | 安装文件存在，角色列表为空 | `.generated` 与宿主普通文件镜像联动生成；镜像修改进入冲突流程 |
| G-04 | `setup()` 遍历全部工具并假定有 `GLOBAL_AGENT_TOOLS[tool]` | DeepSeek 没有原生文件角色目录，可能生成 `undefined/<name>` | 先检查 capability，再生成角色；诊断给出准确限制 |
| G-05 | Qoder / CN 项目入口共用 `.qoder` | 两版本同时选择可能重复 addFile/addLink、重复注册 Hook | 按共享物理路径与 family 去重；取消一端保留另一端入口 |
| G-06 | `cleanupTools` 遍历全部未选工具并整体归档目录 | 添加枚举后，旧项目可能归档从未由 mai 管理的 `.qoder/.dsh` | 新适配器按受管文件撤回，保留用户宿主根；保持旧五工具的既定行为 |
| G-07 | 规则绑定尚无新工具 | 仅选择新工具时根规则入口不会按所选工具初始化 | 三个新 ID 都绑定现有 `AGENTS.md`，共用正文 |
| G-08 | 格式化合并器只支持严格 JSON | Qoder 接受的注释配置在 mai 中解析失败 | 报可恢复配置冲突，保留全文；首批不新增 JSONC 依赖或剥注释重写 |
| G-09 | 扩展路径白名单无 Qoder/DeepSeek | 合法扩展 manifest 被拒绝；注册仍缺宿主步骤 | 增补独立子目录边界，持续拒绝整份 settings/cordis 配置 |
| G-10 | discovery 对缺少项目角色目录写死 MiniMax 文案 | DeepSeek 获得错误的 setup 指引 | 描述按工具能力生成；Hook 未适配须显式出现 |
| G-11 | Web 主要显示文件动作；能力不足易被“应用完成”遮住 | 用户难以判断能否调用命名角色或自动格式化 | 同页增加简短能力摘要，区分装配完成和宿主待验证 |
| G-12 | DeepSeek Preset 和进程级 Hook 与文件装配模型不同 | 仅复制角色/Hook 文件无注册效果，多项目 Hook 路径不稳定 | 独立插件阶段：版本化 bundle、原生注册、cwd 与生命周期验证 |
| G-13 | 共享 Skill 可能被 `.dsh`、宿主用户目录或设置遮蔽 | 发现内容与 mai 安装内容不同 | 诊断说明优先级与开关，宿主验收记录实际来源；不改用户开关 |
| G-14 | 两宿主私有记忆与 mai approved 记忆语义不同 | 自动导入可能丢失场景、revision 与确认状态 | 首批保留 mai 记忆存储与 Skill 调用，宿主自动记忆独立管理 |

## 6. 可选方案比较

| 方案 | 能力与代价 | 结论 |
|---|---|---|
| 只增加两个工具名称 | 无法处理角色文件类型、全局重复目标、清理边界与能力提示 | 缺少当前接入所需处理 |
| 保留 `.agents`，增加静态适配描述与两类受管入口 | CLI/Web 共用事务，Qoder 较完整、DeepSeek 基础接入；无需运行时依赖 | 首批推荐 |
| 同时开发 DeepSeek 原生插件与完整角色/Hook 注册 | 可形成命名评审角色与自动格式化闭环；需追随 Preset、Cordis、权限与工作区 API | 后续独立切片，先完成真实宿主验证 |

首批推荐三个工具 ID：`qoder`、`qodercn`、`dsh`，对应两个产品家族。Qoder 国际/CN 可以同时选择。首批承诺 Qoder CLI 的规则、Skill、命名角色、严格 JSON 下的格式化 Hook，以及 DeepSeek 规则/Skill；IDE 做独立验收后才能加入同等支持说明。Qoder 桌面应用、SDK、云端、JetBrains 与 DeepSeek 完整插件接入记录为后续范围。

## 7. 已执行与待执行验证

| 项目 | 本次结果 | 范围 |
|---|---|---|
| 官方版本核对 | 完成 | npm dist-tags、完整版本、GitHub rc.5 标签、官方日志 |
| Qoder 发布包枚举函数隔离检查 | 通过 | 从发布包提取 `_De`，以解析器桩仅验证目录枚举：普通角色被发现，软链角色被跳过 |
| Qoder 共享 Skill 开关函数隔离检查 | 通过 | 提取 `D2l`：普通 CLI 默认 true、SDK 默认 false、显式 false 生效 |
| 国际/CN 发布包关键函数比较 | 一致 | `_De`、`D2l`、`nli` 三个函数体逐字相同 |
| DeepSeek rc.5 / alpha.2 Skill 源码比较 | 完成 | 根路径与调用策略相同；alpha.2 增加结构化读取错误包装 |
| 真实 Qoder CLI / IDE / CN 对话 | 未执行 | 需认证宿主、真实列表、Skill 调用与 Hook 执行 |
| DeepSeek 真实会话 / alpha 运行 | 未执行 | 含规则软链、全局源、显式调用、嵌套 cwd、委派与环境要求 |

后续应在隔离项目与测试用户目录验证：根规则软链；Skill 附属资源；两个入口同名去重；用户级遮蔽；Qoder 普通角色；CN/国际共存；工作流显式调用；Qoder Stop 不对子代理重复触发；DeepSeek 缺少命名角色时的基础工作流能力。预览、冲突、revision、失败回滚与旧五工具回归同步覆盖。

## 8. 官方资料索引

- Qoder：[CLI Skill](https://docs.qoder.com/cli/Skills)、[IDE Skill](https://docs.qoder.com/extensions/skills)、[Memory](https://docs.qoder.com/cli/memory)、[Subagent](https://docs.qoder.com/cli/subagent)、[Hooks](https://docs.qoder.com/cli/hooks)、[配置](https://docs.qoder.com/cli/settings)、[MCP](https://docs.qoder.com/cli/mcp-reference)。
- Qoder 版本：[CLI](https://changelog.qoder.com/cli)、[IDE](https://changelog.qoder.com/ide)、[桌面应用](https://changelog.qoder.com/app)；[CN 安装](https://docs.qoder.cn/cli/installation)、[CN 配置目录](https://docs.qoder.cn/cli/settings)。
- DeepSeek：[rc.5 发行](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.2.2-rc.5)、[Skill provider](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.2-rc.5/packages/skill/skill-filesystem/src/index.ts)、[规则](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.2-rc.5/packages/context/agent-instructions/README.md)、[Preset](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.2-rc.5/packages/preset/agent-preset/README.md)、[子代理](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.2-rc.5/packages/subagent/tool-subagent/README.md)、[Hook bridge](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.2-rc.5/packages/experimental/hooks-claude-code/README.md)、[MCP manager](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.2-rc.5/packages/mcp/mcp-manager/README.md)。
- npm 的具体版本、完整性标记、发布包及隔离检查结果集中在 [UPSTREAM_BASELINE.json](UPSTREAM_BASELINE.json)，下次研究需重新核对通道版本。
