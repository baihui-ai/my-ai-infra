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

## 发布流程

当前为发布前快照。通过 PR 合入后核对安装包文件与合入提交一致，再创建固定标签、GitHub Release 草稿并发布同一 tarball；发布后核对 registry、beta/latest、下载包及固定版本安装，再发布 GitHub prerelease。最终结果另行补记。

## 保留项

[实施自检](IMPLEMENTATION.md) 中的独立代码评审与 Qoder/DeepSeek 认证会话验收仍待完成。DeepSeek 命名角色与自动 Hook 插件不属于当前版本能力。保留原始资产来源与授权登记。本次 beta 不改变 Feature 的 dev 阶段。
