# 项目规范接入评测

`evals.json` 保存任务与静态断言，`input/` 为独立合成订单项目。固定依赖版本只是夹具输入，不表示生产选型建议；模型执行阶段不下载依赖，不访问真实业务数据库或服务。

将 input 分别复制到隔离输出目录，由带 java-dev 及项目适配的执行者和不带规范的执行者完成同一任务。不得修改输入或其他组产物。主评测者核对实际 Java/DDL/方案并给出证据，缺少编译/运行/EXPLAIN 证据时明确未验证，不将文本模式检查当作业务行为通过。

六项断言仅核对交付源码规范：具名类型/import、已有 JPA/转换复用、单表索引/游标分页、成熟空白工具、职责划分、六基础字段及默认值语义。需在依赖可用时补编译、失败 Sink、多批次/并发变更和实际数据库计划，才能推断运行正确性。单次样例不能推断统计优势、速度或生产稳定性。

## Java 与 MySQL 运行验证

`JavaRuntimeProbe.java` 使用真实 Spring Data JPA、Hibernate 和仅本机可访问的临时 MySQL，核对六基础字段默认值、派生查询映射/软删除、分页/尾批/空结果、Sink失败传播，以及捕获的实际Hibernate SQL及其EXPLAIN。Spring仓库工厂是真实实现；未测试完整Boot应用装配、调度互斥或生产规模性能。

在源码仓库执行 `npm run eval:java`，默认读取 `dist/java-norms-evaluation/{with_skill,without_skill}/outputs/` 中已执行的模型产物，原始Java/POM/DDL保持不变。需要Java17、Maven和可运行MySQL8.4镜像的Docker；Windows可设置 `MAI_MAVEN_HOME` 指向Maven安装目录，以原生Java启动Maven，避免命令行脚本转义。该工具仅用于开发评测，普通用户使用工作台无需这些测试环境。

运行验证在隔离缓存获取固定公开依赖，忽略个人Maven配置；首次网络下载可能失败，保留日志并对中断的Central传输按仓库校验值修复。缓存和镜像齐备后可用 `npm run eval:java -- --offline`，不下载依赖或镜像。JDBC驱动固定SHA-256；不修改原始POM，明确调用compiler插件3.13.0，以release17编译。

脚本创建仅127.0.0.1可访问的无真实数据容器，数据库数据放临时内存挂载，结束自动删除。报告在 `dist/java-norms-evaluation/runtime-verification/run-*/results.json`，latest.json指向最后一次运行；包含源码指纹、Java/MySQL版本、镜像ID、逐组结果和清理状态。首次模型执行的离线失败记录应保留，补验通过不改写为首轮通过。
