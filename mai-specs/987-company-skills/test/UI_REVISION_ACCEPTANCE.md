# 触发策略、绘图移除与主站UI验收

2026-11-24。此前完整19项交付记录为历史；当前仍19项，但内容已变：移除lily-sdd-tech-diagram，保留DDD，新增lily-main-site-ui-skill。仅auto-design开发功能时隐式，其余显式；个人版其他Skill不改。

## 当前实际证据

- 公司npm run verify：287/287通过，0失败/跳过，[日志](evidence/ui-revision/verify.log)。新增检查唯一隐式入口、移除模块、UI小入口/阶段/主题资源、独立装配与迁移。
- 实际tgz 17组检查通过，[分发记录](evidence/ui-revision/package.log)。包文件数205，SHA-256 `356c117a4754c9fe9e8f755c953f976c5b7efe3ba113b25635ccf90f53240cc8`。包中绘图模块不存在；DDD及UI资源实际随包安装。
- 公司资源校验19项、个人资源校验20项通过。公司/个人/本地安装UI共24文件逐字节一致。
- UI本地安装于/Users/sondge/.agents/skills/lily-main-site-ui-skill；真实Codex app-server skills/list发现user作用域、enabled=true、无错误，[结果](evidence/ui-revision/host-discovery.json)。第一次误用仅筛项目入口的旧探针失败，改为检查实际用户入口后通过，未把探针范围错误当安装成功。
- 六组独立实际桌面决定符合：主站询盘按钮、详情页排版、后台页面、纯API、未知范围、已有前序的阶段3。原两项按需冲突（阶段3全量token与默认提示强推七阶段）已修复并复评关闭，见[独立复评](../../../dist/lily-sdd-eval/ui-routing/results-review2.md)。

## 范围与按需加载

样式入口分别指向颜色/按钮/排版/布局素材四主题。阶段0～6各有独立参考；视觉验收/研发交接/AB独立分片。入口不预读全档，局部样式不强制完整流程；后台、ops域名及纯后端不加载主站UI，未知先查事实。完整手册只作按需总览档案。

UI只在明确调用或已授权流程明确调度时使用。真实宿主发现是已验证的，自动路由/模型端到端及多宿主盲测未执行；桌面决定不替代真实业务或页面浏览器验收。Windows仍未实机。当前不发布、推送或改生产，没有同步其他真实业务项目。


2026-11-24后续真实宿主验收：Codex CLI三场景均通过，主站按需读取4份UI资料、后台/纯后端0读取；13项功能测试及两页面各7视口通过，详见[HOST_E2E](HOST_E2E.md)。其他宿主/Windows仍未验证，原记录的未验语态是当时状态。
