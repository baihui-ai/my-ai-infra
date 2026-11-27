# 需求路线图

## 规划中

| 需求 | 标题 | 优先级 | 说明 |
|---|---|---|---|

## 进行中

| 需求 | 标题 | 优先级 | 说明 |
|---|---|---|---|
| 991 | [接入 MiniMax Code 工具](991-minimax-code-adapter/BRIEF.md) | P1 | 规格：standard；按原生目录接入 Skill、规则、格式化 Hook 与用户级角色；实现与自动化验证完成，278 项测试及安装包验收通过；宿主真实发现待验。 |
| 992 | [统一快捷指令为 Skill](992-prompt-skills/BRIEF.md) | P1 | 规格：simple；review，四个工作流已统一为 Skill；276 项自动化、8 组浏览器、安装包及 Codex/Claude 发现通过，模型行为回归待验。 |
| 993 | [复用项目既有格式化规范的 Hook](993-project-format-hook/BRIEF.md) | P1 | 规格：standard；实现与自检完成，review；277 项自动化、7 组浏览器回归及安装包验收通过；真实宿主触发与独立代码评审待验。 |
| 994 | [技术债治理贯穿 SDD 与独立债务分析 Skill](994-technical-debt-governance/BRIEF.md) | P1 | 规格：standard；my-analyze-debt 与阶段短约束已实现，追加全局最优/MVP比较及用户选择；review，保留前次宿主限制与报告质量问题。 |
| 998 | [原子 Skill 与场景 Prompt 的自适应 SDD 流程](998-adaptive-sdd-workflows/BRIEF.md) | P1 | 规格：standard；按需求组合原子能力与模板，新增 simple Prompt，支持分阶段交付；实现与代码评审完成；242 项回归及安装包检查通过；30 个 Codex 场景与 W-01 复查通过，其余宿主待验。 |
| 999 | [初始化后四工具全部资产的斜杠入口发现与调用](999-cross-agent-slash-discovery/BRIEF.md) | P1 | 按四工具原生入口发现与调用；实现及自动化验证完成，Claude 调用与 Copilot 宿主验收待补。 |

## 已完成

| 需求 | 标题 | 优先级 | 说明 |
|---|---|---|---|
| 987 | [lily-sdd完整公司版](987-company-skills/BRIEF.md) | P1 | 规格：standard；仅auto-design隐式；绘图移除/DDD保留、主站UI按需加载并装本地；287项回归/实际包、六例决定与Codex CLI三场景端到端通过；其他宿主/Windows未验。 |
| 990 | [内置图示源码、动画与评测](990-embedded-diagrams/BRIEF.md) | P1 | 规格：standard；本项目模板，283项回归、动画/工作台与分发通过；Java两组编译及MySQL各9/9；Windows保留未实机项，图示历史样本缺口如实记录。 |
| 997 | [内置 Skill 只读与个人 Skill 独立存储](997-personal-skill-library/BRIEF.md) | P1 | 实现完成；226 项测试、浏览器及实际 npm 卸载重装验收通过。 |
| 996 | [取消 Coding 工具时清理专属目录](996-tool-directory-cleanup/BRIEF.md) | P1 | 实现完成；231 项测试与浏览器回归通过，目录整体归档清理，保留 .agents 真源。 |
| 995 | [统一内置资产初始化来源](995-unified-builtin-assets/BRIEF.md) | P1 | 实现与验证完成；全部内置资产使用当前包来源，个人定制保留，发布验收见发行记录。 |
| 988 | [一周对话经验沉淀与去重](988-weekly-conversation-lessons/BRIEF.md) | P1 | 规格：standard；11月26日细化远端评测环境/独立基准，4例桌面决定、284项回归及实际包通过；Codex与10项目覆盖，9项目装配健康，deepseek与真实业务未验边界保留。 |

## 已取消

| 需求 | 标题 | 优先级 | 说明 |
|---|---|---|---|
| 989 | [项目级文档同步](989-project-feishu-sync/BRIEF.md) | P1 | 用户取消飞书文档能力；本地文档改用项目自身模板。 |
