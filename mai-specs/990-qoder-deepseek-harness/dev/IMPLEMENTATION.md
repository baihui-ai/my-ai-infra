# Feature 990 实施与自检记录

[返回需求](../BRIEF.md) · [需求与 AC](../spec/PRD.md) · [技术方案](../design/TECH_DESIGN.md)

日期：2026-11-23。以下为当日实现自检快照；2026-11-25 用户另行授权 `0.0.16-beta.1` 预发布。用户确认按第二方案实施。分支：`codex/feature-990-qoder-dsh`；实现基于 0.0.15 / `151cb1f0debf81eaa37df19268c30d2578e428c2`。Phase 保持 dev，尚未执行独立代码评审和认证宿主验收；未提交、推送或发布。

## 实现内容

| 单元 | 实际文件 | 行为 |
|---|---|---|
| 工具描述 | [tool-adapters.mjs](../../../src/tool-adapters.mjs) | 八工具的路径、形态、标签、别名、清理边界；增加 qoder / qodercn / dsh |
| 共享装配 | [assets.mjs](../../../src/assets.mjs)、[store.mjs](../../../src/store.mjs) | 项目/全局共享 Skill 源单次写入；source / directory / files 入口；扩展路径边界与同族去重 |
| 角色与事务 | [agents.mjs](../../../src/agents.mjs)、[project.mjs](../../../src/project.mjs)、[conflicts.mjs](../../../src/conflicts.mjs) | Qoder 普通镜像、同族派生、有效中立源渲染、冲突候选、只撤回受管条目，复用 revision / journal / 回滚 |
| 规则与 Hook | [rules.mjs](../../../src/rules.mjs)、[format-hook.mjs](../../../src/format-hook.mjs)、[format 清单](../../../assets/hooks/my-format/asset.json) | 共用根规则；Qoder Stop 30 秒，双端只注册一条；JSONC 与用户配置保留 |
| 诊断与界面 | [discovery.mjs](../../../src/discovery.mjs)、[cli.mjs](../../../src/cli.mjs)、[terminal.mjs](../../../src/terminal.mjs)、[web.mjs](../../../src/web.mjs)、[app.js](../../../web/app.js) | 新工具选择、别名、默认路径说明与能力摘要；DeepSeek 部分能力明确展示；镜像及依赖不一致时不报完成 |
| 文档与分发 | [接入指南](../../../docs/qoder-deepseek.md)、README、资产/角色/格式化/故障排查指南、manifest 与检查脚本 | 新能力标记未发布；默认目录、宿主限制、后续插件范围及验证步骤 |

DeepSeek 原生读取 `.agents/skills` 和根规则；本期没有生成 Preset、允许委派列表或自动 Hook 注册，也没有改动宿主凭据、私有记忆或用户共享配置。

## 实施收敛

- 静态表 cleanup 使用原有整体清理目录数组，新工具为 `[]`；逐文件撤回复用已有状态逻辑。roots 为扩展资产提供统一边界。
- `addSkillEntries` 与 `addAgentEntries` 复用于项目和全局装配，同物理目标的 kind、内容、来源、依赖必须一致。
- 镜像分支复用现有冲突执行器，通过计划内 mirror / expectedText / requires 属性补齐依赖校验。state 继续为 v4，配置继续为 version 1。
- Qoder 被保留的派生/原生镜像偏离中立源时，`complete:false`、`needs-sync`；doctor 不报健康。角色依赖 Skill 同时参与状态汇总。
- 全局 setup 保留原增量安装和冲突预检策略，并返回全局范围的能力说明。
- 无运行时依赖、版本号、项目实际安装副本或个人 runtime 变更。

## 已执行检查

工作目录均为本仓库根目录。测试、浏览器和安装包使用隔离项目、个人库或测试用户目录。

| 检查 | 结果 | 范围 |
|---|---|---|
| `node --test test/qoder-dsh.test.mjs` | 13 / 13 通过 | 新工具组合、全局共享、镜像冲突、撤回、JSONC、外部链接、revision 与回滚、别名 |
| `npm run release:check` 内的 `npm run verify` | 通过，291 / 291 测试 | build:skill、78 个 JS/JSON 文件检查、validate 与完整集成回归 |
| `npm run release:check` 安装包阶段 | 14 组通过 | 实际 tarball、离线安装、八工具 init/doctor、角色依赖、格式化脚本、Web 鉴权、记忆与个人资产保留 |
| `npm run test:web` | 9 组通过 | 真实工具选择与应用、能力摘要、冲突、预览失效、1440/1280/390/375、无页面错误或外部请求 |
| `git diff --check` | 通过 | 源码 diff 空白检查 |

浏览器通过 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` 使用已有 Chrome，创建隔离 headless 上下文。截图和报告保存在忽略目录 `dist/feature-990/web/`；完整安装包报告为 `dist/release-report.json`。

本次验证 tarball 为 `dist/easyuseai-my-ai-infra-0.0.15.tgz`，118 个文件，SHA-256 `9216b96263f90b51a5881f11d05a237781d27a59c965b33a659c574f957c4cdd`。这是本次未发布源码的验证产物，尚未确定新发行版本。Qoder / DeepSeek 认证宿主发现没有计入上述通过数量。

## AC 覆盖

| AC | 当前结果 | 自动化覆盖 / 待办 |
|---|---|---|
| AC-01 | 自动化通过 | 配置与 CLI 别名；既有工具回归；Web 保存三个新 ID |
| AC-02 | 自动化通过 | Codex + DeepSeek 项目/全局共享、无自链接、重复安装幂等 |
| AC-03 | 装配通过，宿主待验 | 国际/CN 共享目标、单端保留、双端撤回、用户级双目录；真实发现待验 |
| AC-04 | 文件与依赖通过，宿主待验 | 普通镜像、渲染字段、依赖路径和移动项目；宿主角色列表/调用待验 |
| AC-05 | 自动化通过 | 中立源修改、镜像/派生修改、merge/replace/abort、候选及注入失败回滚 |
| AC-06 | 自动化通过 | 旧有效 state 下未选新工具的用户目录保护；安装后逐条撤回并保留共享源 |
| AC-07 | 注册与脚本通过，事件待验 | 单条 Stop、30 秒、其他 Hook/开关保留、重复同步、执行已有脚本；真实 Stop/SubagentStop 调度待验 |
| AC-08 | 自动化通过 | JSONC/无效结构/修改过的 handler/外部链接保护与未完成状态；沿用格式化回归 |
| AC-09 | 自动化通过 | DeepSeek 独立选择，无角色假目录；无格式化资产时也显示能力限制；CLI/Web 展示 |
| AC-10 | 安装迁移通过，宿主根发现待验 | 根规则链接与既有规则/旧布局回归；宿主 Git 子模块/worktree/无 Git cwd 链路待验 |
| AC-11 | 宿主待验 | 默认 roots、私有同名覆盖、来源去重、显式调用策略及附属资源实际读取需在认证宿主运行 |
| AC-12 | 自动化通过 | 原五工具与旧 state、记忆、扩展、浏览器、实际安装包和安全边界 |

新增行为覆盖见 [qoder-dsh.test.mjs](../../../test/qoder-dsh.test.mjs)。既有 Agent / format / removed-skill / workflow / debt 测试根据多工具同路径和入口形态调整，原有回归场景保留。

## 未完成项与限制

1. 在 Qoder 国际/CN CLI 1.1.95 中验证双入口同名 Skill 去重、真实来源、普通角色、Skill 依赖与主会话 Stop 调度。
2. 在 DeepSeek 0.2.2-rc.5 和 0.2.3-alpha.2 中验证规则软链、根发现、用户级来源、显式工作流调用。当前 Node v24.12.0 不满足 alpha.2 engines。
3. Qoder IDE、桌面、SDK、自定义宿主目录与 DeepSeek 原生插件保持方案声明的范围边界。
4. 独立代码评审尚未执行；本记录是实现者自检。发布需另行确定版本、完成适用门槛并取得明确授权。

可继续执行：用 my-review-code 审查 Feature 990 的实现和测试，并核对上述宿主待验项。

2026-11-25 后续发布见 [beta 发布记录](BETA_RELEASE.md)；上文保留 2026-11-23 自检时的版本和结果。
