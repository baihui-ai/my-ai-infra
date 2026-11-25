# 0.0.16-beta.1 预发布记录

日期：2026-11-25。用户授权“提交并发布一个 patch 版本，作为 beta 发布”。目标 npm dist-tag 为 `beta`，稳定版 `latest` 保持 `0.0.15`；GitHub Release 标记 prerelease。

## 发布前检查

- `npm ci --no-audit --no-fund` 通过。
- `MAI_CODEX_BIN=… MAI_CLAUDE_BIN=… npm run release:check` 通过：291 项测试、17 组实际安装包检查，包含 Codex/Claude 对全部 16 个 Skill 的发现与 Codex 重复同步后发现。
- `npm run test:web` 使用已有 Chrome，9 组通过，包含新工具配置与 1440/1280/390/375 布局。
- npm tarball `--dry-run --tag beta --access public` 通过；npm 发布身份 `guomeiqing`，GitHub 身份 `shanggqm`。
- 安装包：`easyuseai-my-ai-infra-0.0.16-beta.1.tgz`，118 个文件。
- SHA-256：`735ede4a6486863216b9716d221cd3f876ab5bf09e0561b9918dffb80defa024`。
- npm integrity：`sha512-jadBbVC49ApzwFcZ/Zah0PT8EDqTzBwQ4PTKBl0L63nysd8f31LuUQ9fBSoT1f+kes750gx8D8U1t8Q9vmVVPw==`。

## 发布结果

- 实现提交：`95632ac3611c48480e4d0c59457edaea599b0b05`；[PR #18](https://github.com/shanggqm/my-ai-infra/pull/18) 已合入 main，发布提交为 `37b701abbe8391fb68d6c7b8a79e9eab206b5ee3`。
- 带注释的 `v0.0.16-beta.1` 标签固定指向该发布提交；118 个包内文件与提交逐字节一致。
- npm `beta` 已指向 `0.0.16-beta.1`，`latest` 仍为 `0.0.15`。npm 接受后有约三分钟公开 registry 处理延迟，待版本可见后完成固定版本验证。
- [GitHub prerelease](https://github.com/shanggqm/my-ai-infra/releases/tag/v0.0.16-beta.1) 已公开，附带验收 tarball 和 `SHA256SUMS`；下载附件与 npm 下载包校验一致。
- 发布后 7 组检查通过：标签/integrity/下载包、固定版本隔离全局安装和 npx、118 文件一致性、八工具 init/sync/doctor 与链接/镜像、个人 Skill 导入复用、Qoder/CN Stop 单条注册及打包脚本执行、Web 资源与鉴权。
- 本地报告：`dist/release-report.json`、`dist/beta-0.0.16/web/report.json`、`dist/beta-0.0.16/postpublish-report.json`，均处于忽略目录。
- 发布状态通过后续文档提交登记；保持发布标签与 tarball 不变。

## 保留项

[实施自检](IMPLEMENTATION.md) 中的独立代码评审与 Qoder/DeepSeek 认证会话验收仍待完成。DeepSeek 命名角色与自动 Hook 插件不属于当前版本能力。保留原始资产来源与授权登记。本次 beta 不改变 Feature 的 dev 阶段。
