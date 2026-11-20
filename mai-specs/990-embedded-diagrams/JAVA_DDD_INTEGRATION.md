# Java DDD 与代码规范补充交付

本次补充：新建 Java 项目默认采用 xfg-ddd-skills 的 DDD 六边形架构，技术方案先完成模块依赖、领域/聚合、核心类型与接口、编排/事务、仓储/端口和数据访问设计。存量非 DDD 项目学习适用代码规范，保持现有结构、JPA/MyBatis 与公共约定。

源码统一放在 assets/skills/xfg-ddd-skills；原始入口、README、17份参考及脚本按固定提交 aca0123726500026f508245b7e7b6cf6575d1246 保存，UPSTREAM.json 校验原始资源。任务入口和项目适配约束优先于示例中的固定目录、模式和行数阈值。源码学习与安装不执行建项/部署。

## 当前验证

- 19个内置Skill的元信息、资源链接和manifest检查通过。
- release:check通过：284项测试、0失败；实际包安装、逐资源字节/原始指纹核对、多工具入口和Bash语法检查通过。
- 工作台浏览器回归通过，包含1440/1280/390/375窗口及无页面错误。
- 新增真实装配回归验证DDD全部原始资源、搬迁后的工具链接及本地适配定制合并保留。
- 本次未执行实际Maven Archetype生成、Windows实机、生产部署或新增宿主模型业务评测；test/workflow-evals.md中的新场景为待执行。历史Java运行结果不代表本次DDD示例全部可编译。

## 实际安装范围

默认Skill清单追加java-dev/xfg-ddd-skills，保留已有工具与其他Skill。已登记项目如下：

- /Users/sondge/git/workspace/my-ai-infra：complete=true，doctor healthy=true，无待审/跳过；恢复目录 /Users/sondge/.my-ai-infra/projects/6a9936167bd9079f833e9f0e6cf618ebc7c8a97c2a4c9d19773f9d4ea89324d5/backups/1794559985036-6832e8e7-c8de-4edf-a391-95ca18bbac6e
- /Users/sondge/git/deploy：complete=true，doctor healthy=true，无待审/跳过；恢复目录 /Users/sondge/.my-ai-infra/projects/9d98bea4d3e63b7b86763bb7510e28a3a7a7f3577e6bb3b24b5fd6731856a9c1/backups/1794559989730-7a2b824b-89a6-459b-ba9f-a179baf581ff
- /Users/sondge/git/lily-okr-svc：complete=true，doctor healthy=true，无待审/跳过；恢复目录 /Users/sondge/.my-ai-infra/projects/5744fff3b0762fa1abf9e536b126ebc26278c013aa3515a94672a245d41eff66/backups/1794559992203-8958fbcd-cd40-4e7b-a565-662eb6339589

Codex全局：my-create-feature共享规范、java-dev、xfg-ddd-skills与安装包资源逐字节一致。原java-dev和旧Codex DDD目录备份到 /Users/sondge/.my-ai-infra/backups/codex-java-ddd-1794560019164；旧重复入口已归档。本次全局规范按用户明确范围直接装配，普通mai setup仍仅管理其原有支持的全局入口，不宣称setup新增任意Skill装配能力。后续更新这三份全局规范需重复核对并同步。

Codex宿主实际发现尚未重新验证，新会话/重启后再检查。deploy与lily-okr-svc的项目运行规则正文为空，保持用户原样，未代写规则。

安装包：easyuseai-my-ai-infra-0.0.15.tgz；SHA-256 `febdfd812db923d66776130fa60f6be89c3496a2834d0fdbb43f139042d2c4f8`。仅本地安装，未发布npm。

本地机器证据：dist/ddd-project-rollout.json、dist/ddd-codex-global-rollout.json、dist/ddd-web-evaluation/、dist/release-report.json。
