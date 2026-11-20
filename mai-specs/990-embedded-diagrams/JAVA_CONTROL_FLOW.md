# Java控制流规范补充

用户明确要求：if/else及普通/增强for语句体始终加花括号；所有代码块（包括try/catch/finally、方法体）多行书写；if条件3项及以上提取业务谓词，1～2项可保留。提取须保留空值保护、分组、短路顺序、异常及副作用时机。只更新规范，不批量改写业务代码或原始第三方归档。

唯一源为assets/skills/my-create-feature/references/java-dev.md，java-dev与DDD适配入口引用该规则。新增行为场景登记于test/workflow-evals.md，尚未执行宿主模型行为评测。

release:check当前通过，284项测试、0失败；19个Skill元信息/资源和实际安装包检查通过。包SHA-256：7e111f7988af5e11e6aed28c070246d49b9c649fb575dd9a0ea8c484f1d9965e。

当前安装包已全局安装；Codex三份规则文件已更新并备份到/Users/sondge/.my-ai-infra/backups/java-control-flow-1794904093756。9个登记项目已通过预览/merge同步，规范同步均complete，逐文件与安装包一致；恢复原目录后7个项目doctor healthy，另2个项目仅保留未选工具目录与配置不一致的原有提示，原工具及Skill选择保持不变。两个项目同步产生的无关工具目录归档已恢复，详见dist/control-flow-rollout.json。空规则正文仍保留原样，未执行宿主发现或模型行为补验。
