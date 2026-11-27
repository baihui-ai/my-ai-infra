# lily-sdd完整公司版技术设计

有效来源：PRD AC-01～08，Profile standard。独立源码/Users/sondge/git/workspace/lily-sdd。

## 实现边界

直接复制个人版当前bin/src/assets/catalog/templates/web/design-system/docs/scripts/test及打包配置；不复制.git、个人安装副本、会话、运行库或原始mai-specs。个人版不改。旧4入口MVP及旧产物删除，最终19项。目录不初始化Git。

保留原有CLI/Web业务实现，npm包与bin统一lily-sdd；资产管理Skill另名lily-sdd-ai-infra，避免CLI歧义。其余原19项均在docs/command-mapping.json显式映射，元信息、脚本路径、模板、Agent依赖、Hook、文档及公司别名同步改名。assets/skills为唯一Skill源。

## 隔离与契约

本地库由--home/LILY_SDD_HOME选择，默认~/.lily-sdd；项目配置.lily-sdd.json及状态/恢复路径独立命名。默认不访问原个人版库；显式setup/init/sync才写入。默认merge、revision复核、锁、备份、回滚及doctor语义沿完整引擎，未知链接不沿目标写入。Web仅本机与认证约束保留，令牌命名改公司版。

公司规范唯一源在create-feature共享references/company-policy.md，随Skill安装保证项目内引用闭合。Java/评审/DDD活动入口对齐其项目例外边界。个人记忆入口、阶段接入及eval明确用户显式请求门槛；不自动扫描或抽取员工对话。历史第三方许可与冻结资源保持完整，不把档案文件当活动触发入口。

包保持private，manifest标记local-unpublished，删除原个人版发布历史和虚构公司仓库链接。README用实际本地tgz安装方式，注明Git/Bash、软链与宿主条件。mai-specs格式兼容，不改业务仓库。

## 验证与交付

继承完整隔离回归并增加公司命名/19能力/显式记忆/运行库隔离检查；打包检查实际离线安装、五宿主入口、Feature/技术图脚本、冲突与恢复、Web/记忆及npm卸载重装保留。浏览器回归覆盖窄窗口。独立审查与4组规则行为决定另存结果，不能替代真实宿主模型端到端验证。

源码运行中编辑会使revision敏感测试按设计拒绝写入，最终验证冻结输入后重跑；失败和修复记录保留，不能把旧MVP或旧个人版报告作为公司版通过证据。Windows、真实宿主发现/模型行为按实际执行单列。

## 当前生效修订：触发策略与主站UI（2026-11-24）

用户最终保留DDD、移除独立tech-diagram源码及分发引用；加入完整主站UI源码，最终公司仍19项。新能力名称按用户指定为lily-main-site-ui-skill，不受其他lily-sdd-*前缀约束。源复制并按需拆为小入口/七阶段/四样式主题及独立视觉验收、交接、AB参考。

仅lily-sdd-auto-design允许开发/实现功能时隐式启动；其余Skill声明仅显式使用，编排可在已授权范围显式调用阶段能力。主站UI先核域名/路由/仓库，后台管理系统、ops域名和纯后端不加载其样式；未知先查事实再必要澄清。局部样式不扩为完整七阶段，不预读token全档。显式UI不授权生产、AB或对话扫描。

该UI也完整加入个人版assets/skills并登记catalog/manifest，个人其他触发策略及模块保留。按用户请求安装到~/.agents/skills/lily-main-site-ui-skill，实际Codex发现核验；两处源码与本地安装资源一致。验收增加主站/后台/后端/未知范围与按阶段加载六例独立决定、当前全量回归、实际包及个人资源校验，不将桌面决定冒充真实宿主模型自动路由。
