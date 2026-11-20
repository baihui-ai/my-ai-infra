# 内置图示、本地模板与 Java 规范评测

日期：2026-11-13。当前范围按用户最新要求：保留自动SDD、my-tech-diagram与java-dev，文档使用本项目自己的标准/简版模板；取消飞书文档能力与lily-doc内置选项。

## 当前结果

| 范围 | 证据与结果 | 边界 |
|---|---|---|
| 源码与资源 | build:skill、lint、validate通过；18个内置Skill | 资源及本地链接检查不替代模型行为 |
| 自动化回归 | 283项通过、0失败 | 已移除取消功能的20项测试，新增2项本地模板/移除入口回归；未把减少测试数称作质量下降 |
| 本项目模板 | PRD/TECH_DESIGN/TEST_PLAN标准模板及简版模板实际安装字节匹配；定制模板重复同步后保留 | 模板源在templates/mai-specs及对应阶段Skill中 |
| 清理结果 | 旧lily-doc选择被过滤、旧个人文件保留；旧云端API/回调返回404；未读取或改写留存私有配置 | 取消记录保留在989，运行入口已移除 |
| 分发 | npm run release:check通过 | 安装包无已取消的运行时和外部模板Skill，项目模板仍完整 |
| 图示动画 | 真实Chrome浏览器9项通过 | SVG完整、前后步、播放/暂停、末步停止、重置、减少动态、480px局部滚动及离屏暂停 |
| 工作台 | 原有用户旅程与1440/1280/390/375检查通过，已实际打开新版页面核对无取消入口 | Chrome/macOS证据不表示Windows实机通过 |
| Java源码 | 双组样例各6/6静态规范断言；原始源码Java17编译通过 | 单组合成场景，无普遍优势结论 |
| Java真实运行 | 真实Spring Data/Hibernate与MySQL8.4.9每组9/9通过 | 覆盖默认值、派生查询/软删除、分页/尾批/空结果、Sink失败、实际SQL和EXPLAIN；未验证完整Boot应用装配或生产并发/规模 |

## 代码与规范覆盖

- my-tech-diagram的源码、规范、参考图、showcase及动画脚本统一在assets/skills管理，目录、头部、调用和登记名称一致。
- 图示接入PRD、设计、方案评审和HTML审阅；动画为已有SVG提供可控焦点步骤，保留原字节和静态阅读，不改变领域关系。
- Java设计、实现、方案/代码审查加载内置java-dev及本项目适配：正常import、具名业务参数、职责拆分、复用框架/旧方法/成熟工具、单表索引和稳定分页。
- 六基础字段为id/create_time/update_time/create_by/update_by/is_deleted，类型与默认值沿项目；默认值的业务语义与索引访问路径分开核验。真实测试中，捕获的Hibernate语句和等价SQL的EXPLAIN均选择idx_status_deleted_id，没有强制索引提示。
- 文档使用本项目templates/mai-specs/_templates中的标准模板及阶段Skill简版模板；技术内容规则保存在本项目阶段规范。云端文档、授权和同步均已按用户要求取消。

## 模型语义评测记录

此前已实际运行14个图示任务的两组对照，共28组产物：案例11两组各6/6；其余13例独立评分为Skill组51/54、基线47/54。3项Skill组断言因原生过程轨迹不足未算通过，没有补造读取记录。案例12首版焦点跨域的失败已归档，修正后独立复验3/3。

这组为已保存的历史样本；本轮没有重写绘图生成逻辑，额外验证了当前模板安装与入口清理。不可将历史样本扩大为本轮全部工作流的模型稳定性结论；每配置每任务只运行一次，任务间差异不是重复运行稳定性。未提供独立token/时长指标，不计算成本收益或推断普遍优于基线。

Java两组均复用了JPA查询与摘要转换、具名record、Commons Lang空白校验、ID游标和六字段。带规范组额外拆分主方法并限制启动扫描上界；两组均6/6静态断言，不事后追加有利分数。首轮离线构建缺依赖的记录保留，后续在独立配置/缓存中补齐依赖并实际编译运行；原始Java/POM/DDL指纹前后相同。

## 产物与复现

- [当前分发报告](../../dist/release-report.json)
- [动画样例](../../dist/diagram-evaluation/sequence.html)、[动画结果](../../dist/diagram-evaluation/results.json)
- [图示模型对照查看器](../../dist/diagram-complete-evaluation/review.html)
- [Java对照与源码查看器](../../dist/java-norms-evaluation/review.html)
- [Java真实运行报告](../../dist/java-norms-evaluation/runtime-verification/run-nRUcoJ/results.json)
- [工作台报告](../../dist/local-documents-web-evaluation/report.json)
- [本项目标准模板](../../templates/mai-specs/_templates/TECH_DESIGN.tmpl.md)
- [本地交付回归](../../test/local-document-delivery.test.mjs)

```bash
npm run release:check
npm run test:web
npm run test:diagrams
npm run eval:java -- --offline
```

浏览器需要Playwright Chromium或PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH；Java运行检查另需先生成模型产物、Java17、Maven、Docker及齐备的离线缓存/镜像，首次可按Java评测说明联网获取公开依赖。生成物在忽略的dist目录，需保留或按入口重跑。测试使用隔离项目和临时数据库，未发布npm包。

当前安装包：easyuseai-my-ai-infra-0.0.15.tgz，SHA-256 `03377a7548adc3b105b17f2769adc9ff06fe21beafd1c1ee75e092df3b2aff37`。

## 保留限制

用户确认暂无Windows环境，按要求保留未实机项。浏览器辅助技术、真实打印、完整Boot装配、原调度器并发与生产规模性能未验证。取消的云端文档功能不属于当前验收范围，也不再作为阻塞条件。
