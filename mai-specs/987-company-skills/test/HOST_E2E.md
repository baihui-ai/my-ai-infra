# 真实宿主端到端：主站UI路由与按需读取

2026-11-24，Codex CLI 0.170.0。执行真实codex exec模型会话；不显式点名Skill，让宿主从自然开发请求自行选择。使用三个隔离合成项目，分别通过README/域名/Feature标明主站、后台及纯后端；安装当前公司版19项资产。没有生产、业务账号、发布或真实业务代码改动。

## 实际结果

| 场景 | auto-design实际读取 | 主站UI实际读取 | 最终功能测试 | 真实浏览器 |
|---|---|---|---|---|
| www.lily-bearing.com产品列表过滤/清空 | 是 | 4份必要资源 | 5/5 | 7视口通过 |
| ops.lilybearing.com后台列表同类功能 | 是 | 0 | 4/4 | 7视口通过，保留紫色按钮 |
| 纯后端产品过滤函数 | 是 | 0 | 4/4 | 无页面，不适用 |

主站实际读取SKILL.md、references/style-guide.md、references/stage-4.md、references/styles/buttons.md。没有读取full-workflow、design-tokens全档、对标、业务诊断、灰度或复盘。列表枚举不算文件正文加载。主站4份正文共8055 UTF-8字节/3944字符，这是文件读取规模，不等于模型token计数；未编造token节省比例。

## 行为与轨迹证据

三条原始请求没有写Skill名称。后台与主站的开发请求完全相同，范围由各自README及PRD明确；不能仅凭“按钮/页面/前端”识别为主站。三个会话真实读取了auto-design，只有主站继续读取UI入口与相关资料，随后实际修改代码、记录方案/评审并执行测试。对照命令轨迹检查后台/后端UI读取为零，不使用助手自述代替证据。

[结构化结果及源指纹](../../../dist/lily-sdd-eval/host-e2e/2026-11-24T10-35-51-317Z/REPORT.json)。[主站轨迹](../../../dist/lily-sdd-eval/host-e2e/2026-11-24T10-35-51-317Z/main-site.events.jsonl)、[后台轨迹](../../../dist/lily-sdd-eval/host-e2e/2026-11-24T10-35-51-317Z/ops-admin.events.jsonl)、[后端轨迹](../../../dist/lily-sdd-eval/host-e2e/2026-11-24T10-35-51-317Z/backend.events.jsonl)。原始轨迹只保存在忽略的本地评测目录，不进入公司分发资产。

测试初始存在2个真实失败，宿主修复后最终13项全部通过，外层重新执行并独立复核匹配/清空/无匹配断言。主站宿主第一次页面事件测试出现Node mock错误后已修正，未通过修改期望绕过缺陷。

## 页面交互补验

主站在原生宿主沙箱中启动Chrome失败并如实保留review/视觉待验；未冒充原生浏览器通过。外层使用已有Chrome+Playwright对两份实际生成页面补验，在2560×1320、1920×1080、1920×920、1440×900、1366×768、390×660、360×800逐一验证大小写/空白过滤、Clear、无结果及无横向溢出，均通过，0页面异常/0外部请求。后台颜色保持rgb(111,66,193)，未套入主站样式。

[主站浏览器结果](../../../dist/lily-sdd-eval/host-e2e/2026-11-24T10-35-51-317Z/main-site.browser.json)、[后台浏览器结果](../../../dist/lily-sdd-eval/host-e2e/2026-11-24T10-35-51-317Z/ops-admin.browser.json)。[主站390截图](../../../dist/lily-sdd-eval/host-e2e/2026-11-24T10-35-51-317Z/main-site-390.png)、[后台390截图](../../../dist/lily-sdd-eval/host-e2e/2026-11-24T10-35-51-317Z/ops-admin-390.png)。外层补验没有重写宿主原始记录或虚构其独立验收。

## 限制

本轮三个真实Codex CLI场景验证通过，覆盖本次主站/后台/纯后端目标。每类一次真实运行，不能推广成所有提示词、所有仓库或所有宿主的保证；桌面App其他通道、Claude/Cursor/Copilot/MiniMax及Windows未运行。非生产合成项目不证明真实主站业务已上线；源规则无需修复，本轮未修改Skill源码或本地安装。
