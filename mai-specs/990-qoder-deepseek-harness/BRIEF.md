# 990: Qoder 与 DeepSeek Harness 工程规范兼容

| 项 | 值 |
|---|---|
| Phase | dev |
| Profile | standard |
| 优先级 | P1 |
| 负责人 | 待填 |
| 目标日期 | 待填 |
| 涉及子系统 | project、store、rules、agents、discovery、format-hook、CLI、Web、文档 |

## 一句话描述

研究当前 my-ai-infra 与最新版 Qoder、DeepSeek Harness 的工程规范差异，设计保留 .agents 唯一资产源的兼容方案

## 背景

用户要求先创建需求，再系统研究当前版本与两款工具最新版在规则、Skill、Agent、Hook、MCP、配置及宿主发现上的差异，研究完成后编写技术方案；2026-11-22 完成需求、研究和设计；2026-11-23 用户确认第二方案并授权实现。

## 关键决策

本次将用户口述的 qcoder / coder 按阿里 Qoder 研究。研究覆盖 CLI 国际/CN、IDE 和桌面应用的差异，实施建议以 CLI 为首批目标。

- 保留 `.agents` 唯一项目资产源，增加 `qoder`、`qodercn`、`dsh` 三个工具 ID。
- Qoder 首批建议接入规则、Skill、普通文件角色镜像和严格 JSON 下的格式化 Hook；国际/CN 共用项目目录，用户目录分别适配。
- DeepSeek 首批建议接入规则与 Skill；命名角色与自动 Hook 需要 Preset / 插件注册，独立规划后续切片。
- 新工具采用受管文件撤回，保护用户已有宿主目录；共享目标去重并保留现有冲突、revision 与回滚契约。
- 2026-11-23 用户确认按第二个方案实施，首批范围及唯一源、软链接优先、必要派生镜像策略已确认。

## 交付与状态

- 已完成当前 0.0.15 与 Qoder CLI 1.1.95、DeepSeek 默认 0.2.2-rc.5 / 最新 alpha 0.2.3-alpha.2 的版本研究，登记 14 项 gap。
- 已完成 PRD、12 项验收条件、技术方案、关键代码设计与 HTML 审阅版。
- 实现和自动化自检完成：291 项测试、9 组浏览器检查、14 组安装包检查通过；Qoder 发布包隔离检查保留为研究材料，认证宿主会话待验。
- Phase 保持 dev，等待独立代码评审及认证宿主验收；2026-11-25 已按用户授权提交并发布 `0.0.16-beta.1`，发布过程单独登记。

2026-11-22 文档检查：`npm run validate` 通过；PRD/设计路径校验通过；本 Feature 30 处本地链接有效。HTML 已用隔离 headless Chrome 检查 1440px 浅色、390px 深色、三张 Mermaid 图、代码高亮、页内导航和 CDN 离线回退，无页面脚本错误或整页横向溢出。该阶段未修改生产代码；后续实现验证见下文。

## 上下文索引

- [素材索引](context/_INDEX.md)
- [工程规范差异研究](context/ENGINEERING_GAP.md)
- [固定版本快照](context/UPSTREAM_BASELINE.json)
- [产品需求与验收条件](spec/PRD.md)
- [技术方案](design/TECH_DESIGN.md)
- [供评审的代码设计](design/CODE_DESIGN.md)
- [HTML 审阅版](design/TECH_DESIGN.html)

## 实施与自检（2026-11-23）

[实施记录与 AC 覆盖](dev/IMPLEMENTATION.md) 登记了实现文件、方案收敛、实际命令、结果与宿主待验项。实现分支为 `codex/feature-990-qoder-dsh`；2026-11-23 自检时版本为 0.0.15。2026-11-25 用户授权以 `0.0.16-beta.1` / `beta` 提交并发布，保留独立评审和宿主验收待办。

[0.0.16-beta.1 发布记录](dev/BETA_RELEASE.md) 记录本次用户授权、验收包与发布结果。
