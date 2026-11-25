# Qoder CLI 与 DeepSeek Harness 接入

本接入包含在 `0.0.16-beta.1` 预发布版，使用 npm `beta` 标签。稳定版 `0.0.15` 保持在 `latest`，新工具需显式安装 beta：

```bash
npm install --global @easyuseai/my-ai-infra@beta
# 固定本次版本
npm install --global @easyuseai/my-ai-infra@0.0.16-beta.1
```

开发者也可在本仓库使用 `node bin/my-ai-infra.mjs` 代替 `mai`，显式指定目标项目。

项目统一维护 `.agents/<类型>/`。支持共享目录的宿主直接读取，其他入口优先使用相对软链接；需要原生格式的角色从中立源生成。个人库、分发源分别维持 `<home>/assets/` 与包内 `assets/`，安装器不复制宿主私有记忆。

## 工具选择与能力

```bash
mai init --tools qoder,dsh --project /path/to/project
mai sync --tools qoder,qodercn,dsh --project /path/to/project
mai setup --tools qoder,qodercn,dsh
mai doctor --project /path/to/project
```

`qodercn` 的 CLI 别名为 `qoder-cn`，`dsh` 的别名为 `deepseek-harness`。新项目仍默认选择 Codex；已有选择保持。

| 能力 | Qoder CLI / CN | DeepSeek Harness |
|---|---|---|
| 工程规则 | 根 `AGENTS.md` → `.agents/rules/AGENTS.md` | 相同共享入口 |
| 项目 Skill | `.qoder/skills/<名称>` 目录软链 | 直接读取 `.agents/skills/<名称>` |
| 用户 Skill | 国际 `~/.qoder/skills`；CN `~/.qoder-cn/skills`，链接用户 `.agents/skills` | 直接读取 `~/.agents/skills` |
| 项目角色 | `.qoder/agents/<名称>.md` 受管普通文件 | Agent Preset 注册暂未接入 |
| 用户角色 | 国际 `~/.qoder/agents`；CN `~/.qoder-cn/agents`，受管普通文件 | 暂未接入 |
| 自动格式化 | 严格 JSON 配置下合并项目 Stop Hook | Hook 插件暂未接入 |
| MCP / 扩展 | 清单明确声明的独立文件装配，注册与授权在宿主完成 | 相同边界，保留 Cordis / MCP 用户配置 |

国际版与 CN 共用项目 `.qoder` 和 `.agents/.generated/qoder/agents`，组合选择只生成一份项目入口和一条 Stop 注册。用户级入口分别装配；全局共享源只写一次。全局 setup 保持既有选择范围：入口 Skill、选中的记忆/工作流 Skill 和角色依赖，不自动安装每个可选 Skill，也不注册项目 Hook。

## 中立角色与普通镜像

Qoder CLI 1.1.95 的角色枚举会跳过角色文件软链接，因此使用以下同步链：

```text
.agents/agents/<名称>.md                   项目中立角色源
  → .agents/.generated/qoder/agents/*.md   原生格式派生文件
  → .qoder/agents/*.md                     普通文件镜像
```

角色声明 `model: inherit`，通过 `skills` 预载依赖并保留正文中的相对 Skill 引用。只维护中立源，运行 sync 更新派生与镜像。项目源有定制时默认 merge 保留并据此渲染；派生或原生镜像有本地修改时，merge 保留并保存候选，`complete:false`、discovery 为 `needs-sync`。核对候选并合并源后，再同步或显式 replace 重建。

镜像与共享设置的外部文件链接保持原样，不写其目标。全局 setup 遇到已修改的受管角色时先报告冲突，保留安装现场。

DeepSeek 使用 Agent Preset、父代理允许委派列表和插件生命周期。当前可在主会话显式调用评审 Skill；命名角色、独立角色上下文及自动 Hook 留待后续原生插件接入。

## 格式化与撤回

项目有既有格式化配置时，Qoder 在 `.qoder/settings.json` 的 `hooks.Stop` 注册命令，timeout 为 30 秒。其他设置、Hook、信任与禁用开关保留；`SubagentStop` 不注册框架格式化命令。共享配置含注释或结构异常时保留全文并提示处理，replace 同样不会替换整份配置。完整行为见 [格式化 Hook](format-hooks.md)。

取消 Qoder / CN / DeepSeek 时仅撤回有受管记录且可安全处理的条目，保留 `.qoder`、`.qoder-cn`、`.dsh` 根目录和用户文件。国际/CN 其中一端仍被选择时共享项目入口保留；两端都取消才撤回自身注册。旧五工具原有的目录归档策略保持。

## 发现、刷新与版本范围

研究基线核对于 2026-11-22，兼容实现固定使用以下文件契约：

| 宿主 | 基线 | 环境与范围 |
|---|---|---|
| Qoder 国际/CN CLI | npm `1.1.95` | Node ≥20；默认项目和用户目录 |
| DeepSeek 默认通道 | `0.2.2-rc.5` | Node ≥24.9.0；默认 instructions / filesystem Skill provider |
| DeepSeek alpha | `0.2.3-alpha.2` | Node `^24.22.3 || >=26.13.1`；共享规则/Skill 契约源码相同，运行验收单列 |

my-ai-infra 自身继续要求 Node 22+。Qoder IDE、桌面应用、SDK、云端与 JetBrains 不纳入本次 CLI 支持承诺。

- Qoder 普通 CLI 默认还读取 `.agents/skills`；`skills.loadFromAgentsDirectory` 可关闭，SDK 默认值不同。当前原生目录入口兼顾其独立发现路径。使用 `/skills reload`、`/agents reload` 或重启会话后核对实际来源。
- Qoder CLI 与 IDE 文档对用户/项目同名 Skill 的优先级不同，应按实际运行表面确认来源；安装器不修改用户发现开关。
- DeepSeek 的项目 `.dsh/skills` 优先于 `.agents/skills`，全局私有目录与自定义 roots 也影响来源。默认项目根取最近含 `.git` 的祖先，无 Git 时取 cwd；在子模块、worktree 或无 Git 子目录中使用时核对根目录。
- DeepSeek Skill 使用 watcher 刷新；规则在文件操作或恢复会话时刷新。配置了自定义 provider 或关闭默认 roots 时，以该配置为准。
- `QODER_CONFIG_DIR`、`QODERCN_CONFIG_DIR`、`DSH_HOME`、`DSH_AGENTS_HOME` 等可改变宿主实际目录。本适配按默认目录装配，保留这些宿主配置。
- 工作流 Skill 保持 `disable-model-invocation: true`，通过用户显式请求调用。`agents/openai.yaml` 作为 Codex 资源保留，其他宿主使用 SKILL.md 的策略字段。

CLI/Web 的能力摘要与 `discovery` 区分文件装配、需配置和暂未接入，`hostVerified` 保持 false。当前自动化验证覆盖装配、冲突、撤回、回滚、浏览器及安装包；认证宿主中的真实列表、同名来源去重、Skill 调用和 Stop 调度仍待验证。可以按“查看角色/Skill 来源 → 调用单个 Skill 与附属资源 → 触发主会话 Stop → 检查子任务未重复触发”逐项核验。

官方入口：[Qoder CLI 记忆与规则](https://docs.qoder.com/cli/memory)、[Qoder Subagent](https://docs.qoder.com/cli/subagent)、[Qoder Hook](https://docs.qoder.com/cli/hooks)、[Qoder CN 配置](https://docs.qoder.cn/cli/settings)、[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)。
