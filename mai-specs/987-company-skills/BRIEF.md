# 987: lily-sdd完整公司版

| 项 | 值 |
|---|---|
| Phase | done |
| Profile | standard |
| 优先级 | P1 |
| 负责人 | sondge |
| 涉及子系统 | 独立lily-sdd源码、文档与分发 |

直接复制个人版完整源码到同级lily-sdd后统一命名，保留19项完整能力；删除旧4入口精简版。公司源码在/Users/sondge/git/workspace/lily-sdd，个人版保留。

有效来源为[PRD](spec/PRD.md) AC-01～08；设计、评审、测试和验收在当前Feature记录。完整287项回归、8组浏览器、实际包和独立复评已通过，见test/ACCEPTANCE_REPORT.md；Windows/真实宿主端到端待验，不自动提交、发布或安装到真实项目。

当前修订：仅auto-design隐式；移除绘图、保留DDD，加入分阶段加载的lily-main-site-ui-skill并继承个人源/本地安装；287项回归、实际包、六例独立决定及Codex发现通过，详见test/UI_REVISION_ACCEPTANCE.md。


2026-11-24后续真实宿主验收：Codex CLI三场景均通过，主站按需读取4份UI资料、后台/纯后端0读取；13项功能测试及两页面各7视口通过，详见[HOST_E2E](test/HOST_E2E.md)。其他宿主/Windows仍未验证，原记录的未验语态是当时状态。
