# 开发辅助

- `build-skill.mjs`：兼容已有 `npm run build:skill` 入口，只读检查 `assets/skills/` 中的唯一源及附属资源，不从父仓库复制或覆盖内容。
- `validate.mjs`：检查内置 Skill 清单、中文头部格式、作者和来源、附属脚本、manifest 交付项、本地链接与 npm 分发配置，不访问全局工具配置。
- `check-skill-resources.mjs`：核对各 Skill 的必需入口及递归 Markdown 资源链接；命令示例及目标项目产物路径不视为包内资源。
- `validate.py`：兼容入口，委托同一 Node.js 检查器。

```bash
npm run build:skill
npm run validate
python3 scripts/validate.py
```

行为与集成回归通过本项目的 `npm test` 执行，全部使用隔离临时目录。

- `lint.mjs`：零依赖语法、JSON 与源码空白检查。
- `release-check.mjs`：对实际 tarball 运行隔离安装、资源、CLI/Web 和文档检查；`npm run release:check` 先执行完整 verify。

发行与维护者流程见 [发布指南](../docs/releasing.md)。预览产物位于忽略的 dist/，开发审视报告与源码 tests/scripts 不随 npm 分发。

## 浏览器交互回归

`check-web.mjs` 使用开发依赖 Playwright，在隔离项目与个人库中验证首页、动画、预览弹窗、搜索筛选、焦点回收、冲突、过期预览、真实应用与响应式布局。无需启动用户项目。首次安装 Chromium 后运行：

```bash
npx playwright install chromium
npm run test:web
```

`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` 可指定已有 Chromium；`MAI_WEB_ARTIFACT_DIR` 可指定忽略目录保存 1440/1280/390/375 截图、动画时间点和报告。浏览器测试单独执行，不影响无浏览器环境中的 `npm test`。浏览器及测试产物不随 npm 分发。

## 图示与动画评测

`npm run test:diagrams` 使用同一 Playwright 开发依赖，实际检查静态 SVG 加载、前后步骤、播放/暂停/重置、末步停止、减少动画、离屏暂停和 480px 小窗口。截图、演示页与 JSON 结果写入忽略目录 `dist/diagram-evaluation/`。首次同样需要 `npx playwright install chromium`，可用 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` 指定已有浏览器。

`test/diagram-integration.test.mjs` 检查输入安全、路径冲突、图片字节、重复同步、工具链接和冲突策略；release:check 另验证实际安装包中的全部图示资源及动画脚本。宿主语义评测见内置 my-tech-diagram 的 evals/evals.json；这些自动测试不替代业务建模的模型行为验收。

`npm run eval:diagrams -- <评测工作区> [with_skill|without_skill]` 对宿主已生成的图示产物执行独立 XML 解析、元素/关系计数、事件箭头、节点文字边界、离线 HTML 和窄窗口检查。对照基线可能包含真实失败，命令据此返回非零；机械报告不代替人工语义评分。完整宿主结果与分组动画修复记录见 Feature 990 的评测文档。


`npm run eval:java` 在独立Maven配置/缓存中编译已生成的Java对照产物，并创建仅本机可访问的临时MySQL容器执行实际Spring Data派生查询、分页导出、失败传播、DDL默认值与EXPLAIN。需Java17、Maven、Docker以及先完成的Java模型评测输出；`--offline`要求缓存/镜像齐备。源码与测试入口见 [Java评测说明](../assets/skills/java-dev/evals/project-adaptation/README.md)。原始模型输出不被修改，临时数据库自动清理，报告写入dist。
