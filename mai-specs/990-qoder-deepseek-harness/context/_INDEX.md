# 素材索引 — 990

| 文件 | 类型 | 来源与原名 | 关键内容摘要 | 收集日期 | 派生自 |
|---|---|---|---|---|---|
| [ENGINEERING_GAP.md](ENGINEERING_GAP.md) | 研究报告 | 本地代码、官方文档与发布包 | 版本基线、能力矩阵、14 项 gap、首批及后续范围 | 2026-11-22 | 用户需求、官方资料 |
| [UPSTREAM_BASELINE.json](UPSTREAM_BASELINE.json) | 版本快照 | npm registry、发布包、隔离检查 | dist-tags、engines、integrity、包 hash、检查范围与结果 | 2026-11-22 | 官方发布包 |

## 关键发现

- 当前 0.0.15 尚未登记 Qoder / DeepSeek；现有文件装配和事务机制可复用。
- Qoder 普通 CLI 默认读取 `.agents/skills`，SDK 默认不同；角色扫描跳过文件软链，需要普通镜像。
- Qoder 国际/CN 项目目录共用 `.qoder`，用户目录分别为 `.qoder` 与 `.qoder-cn`。
- DeepSeek 两个研究版本均支持共享规则与 Skill；命名角色、Hook 通过插件注册，首批单列限制。
- 直接扩展工具映射会暴露全局重复目标、缺失角色路径和旧项目误清理风险，设计已分别覆盖。

## 开放问题

- 2026-11-23 用户已确认首批范围并实施；独立代码评审和认证宿主验证待完成。
- 实施前准备隔离的宿主认证及满足 alpha.2 engines 的环境；验证 Qoder 双入口去重、普通角色、Hook，DeepSeek 来源、规则软链与工作流调用。
- IDE、桌面、SDK 和自定义配置根保持单独支持说明，按实际需求补充验收。

## 下游产物

研究完成后形成 [PRD](../spec/PRD.md) 与 [技术方案](../design/TECH_DESIGN.md)。实现与自动化自检已完成，记录见 [实施记录](../dev/IMPLEMENTATION.md)；认证宿主验收仍待执行。
