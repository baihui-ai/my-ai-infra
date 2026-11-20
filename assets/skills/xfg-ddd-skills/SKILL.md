---
name: "xfg-ddd-skills"
description: "Java 项目架构与代码规范：新项目默认采用 DDD 六边形架构；存量项目按既有结构学习职责、类型、命名、编排及仓储规范。用于 Java 技术方案、实现与评审。"
compatibility: "需要目标项目上下文；源码与参考随包提供。仅显式建项时才需要 JDK、Maven 和 Bash。"
metadata:
  author: "andy"
  source: "assets/skills/xfg-ddd-skills/SKILL.md"
---

# Java 架构与代码规范

先读取[本项目适配](references/project-adaptation.md)，按本次任务学习并采用下列实际相关规范。原始完整入口保存在 [UPSTREAM_SKILL.md](UPSTREAM_SKILL.md)，原始版本与资源指纹见 [UPSTREAM.json](UPSTREAM.json)。参考中的目录、框架和阈值示例须服从本项目适配及目标项目契约。

## 按任务读取

- **新建 Java 项目、技术方案**：读取[架构](references/architecture.md)、[工程结构](references/project-structure.md)、[领域设计](references/domain-design-guide.md)，设计模块依赖、职责与落地路径。
- **日常 Java 编码和评审，包括非 DDD 存量项目**：读取[命名](references/naming.md)及本次涉及的[实体](references/entity.md)、[值对象](references/value-object.md)、[业务服务](references/domain-service.md)、[仓储](references/repository.md)规范；采用适合项目的类型、命名、职责与持久化边界。
- **领域建模、跨域流程**：按需读取[聚合](references/aggregate.md)、[端口与适配器](references/port-adapter.md)、[Case 编排](references/case-layer.md)、[入口层](references/trigger-layer.md)。
- **持久化、外部系统或复杂业务**：按需读取[基础设施](references/infrastructure-layer.md)、[领域模式](references/domain-patterns.md)、[基础设施模式](references/infrastructure-patterns.md)。模式须有实际变化点，不按方法行数或分支数量机械生成工厂、策略或责任链。
- **明确要求创建工程或部署**：先检查已有实现与授权，再读取原始入口的脚本说明及[部署](references/devops-deployment.md)、[镜像](references/docker-images.md)。仅学习规范、设计或评审时不执行这些操作。

## 阶段交付

- 设计给出可审查的模块职责/依赖、核心类型和关键业务规则；按[本项目适配](references/project-adaptation.md)在编码前设计好架构及代码组织。
- 实现优先复用项目代码、框架、公共类型和工具，保持需求上线生效；评审检查实际调用链、业务不变量、事务、查询和类型边界。
- 验证按目标项目工具链执行；规范加载、资源安装与方案完成分别记录，不等同于 Java 代码运行通过。
