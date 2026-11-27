# lily-sdd完整公司版本地验收

2026-11-24，当前有效需求为PRD AC-01～08，最终范围19项。公司源码：/Users/sondge/git/workspace/lily-sdd。

## 实际结果

| 验证 | 结果 | 证据 |
|---|---|---|
| npm run verify | 287/287通过，0失败/跳过 | [完整回归](evidence/verify.log) |
| npm run test:web（已有Chrome可执行文件） | 8组通过，1440/1280/390/375；无页面错误或外部请求 | [浏览器报告](evidence/web-report.json) |
| npm run check:package | 17组实际tgz安装验收通过 | [分发记录](evidence/package.log) |
| 公司19项身份、隔离和显式记忆门槛 | 新增3项回归通过，包含在287项内 | 同上完整回归 |
| 独立审查及修复复评 | R5～R7关闭，已审范围无剩余确定P1/P2 | [独立复评](../../../dist/lily-sdd-eval/full/review-2.md) |
| 独立桌面决定 | 4/4符合公司规范，非盲测 | 同上 |
| 独立隔离装配 | catalog/plan只读，19项/五宿主实际资源、doctor通过；hostVerified=false | 同上及review-2.json |
| 父项目资源文档校验 | npm run validate通过，个人catalog仍19项 | [父校验](evidence/parent-validate.log) |

实际包：/Users/sondge/git/workspace/lily-sdd/dist/lily-sdd-0.1.0.tgz，326个包内文件。SHA-256：`10cb04a9dd40a32cc9cf53fc0679a595ca3e0cb0a2cd787709a09c5033b0482b`。包private且未发布；运行库、项目配置及Web令牌命名使用公司版。旧精简源码/旧产物已删除，原个人项目仅维护本Feature记录及索引，没有将其命令或资产改为公司命名。

## AC核对

AC-01完整19映射及资源通过；AC-02活动公司Java/评审规则与4组决定通过；AC-03独立源码、MVP删除与无父依赖通过；AC-04当前macOS与Node验证通过，Windows未实机；AC-05/06隔离/预览/冲突/备份/回滚与个人数据边界通过；AC-07实际包通过；AC-08文档、独立审查及验证分类完成。

首轮继承测试暴露旧别名、迁移哈希和文案残留后修正；编辑过程中另触发2项revision敏感失败，冻结输入后24项定向及完整287项重跑均通过。未调整断言绕过真实并发保护。旧MVP的13项结果不用于本验收。

## 未验证与范围

Windows实机、真实宿主模型端到端和多宿主盲测未执行。独立桌面决定不证明Java/数据库/生产业务通过。没有真实全局或公司项目安装，没有Git初始化、提交、推送、远端建仓、npm发布或部署。后续真实宿主验收与推广由明确范围另行执行。
