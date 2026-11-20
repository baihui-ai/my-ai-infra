# 业务异常规范补充

本次用户要求：业务失败优先复用目标项目已有业务异常与准确错误码，避免通用JDK异常代替业务语义；优先复用已有体系，不为每个场景新增异常类。底层错误按已有边界处理，保留cause、事务回滚及重试分类，不全量伪装为业务拒绝。

规范源为assets/skills/my-create-feature/references/java-dev.md，java-dev主入口、java-style及DDD适配引用/遵循同一要求；原“优先使用标准异常”条款已修正。此前多行块示例改用示意业务异常，并明确真实项目类型、错误码和构造器为准。

验证：release:check通过，284项测试0失败，19个Skill及实际包检查通过；新增宿主行为案例记录于test/workflow-evals.md，模型行为尚未重新执行。实际包SHA-256：3c11e8a147b2af70a2bd9ea33f40005c9b724eda6faa930b06db99eaf0c01735，已本地全局安装，未发布。

Codex全局4份资源已更新，备份目录/Users/sondge/.my-ai-infra/backups/java-business-exceptions-1794905962020；9个登记项目规范逐文件与安装包一致，选择与本地定制保留。同步期间对既有未选工具目录先暂存、结束恢复，避免无关清理；1个项目仍保留该类既有doctor提示。详情见dist/business-exceptions-rollout.json。
