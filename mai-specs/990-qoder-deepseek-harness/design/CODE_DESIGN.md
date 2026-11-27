# 供评审的代码设计

[返回技术方案](TECH_DESIGN.md)

以下为沿用 JavaScript ESM 的设计代码与伪代码，用于说明关键分支。2026-11-23 对应功能已实现；生产代码复用现有冲突执行器，未逐字采用本页 classifyMirror 等示意函数。实际文件、测试与差异见 [实施记录](../dev/IMPLEMENTATION.md)。省略既有文件遍历、schema 校验、备份 journal 和 UI DOM 模板；关键目标去重、镜像冲突和共享配置分组在本文展开。现有事务入口保持不变。

## 1. 静态描述与能力门控

拟新增 `src/tool-adapters.mjs`。本例只展示新增记录；既有五工具按主文表格迁入，原导出常量继续可用。

```js
export const NEW_ADAPTERS = {
  qoder: {
    label: 'Qoder CLI', aliases: [], family: 'qoder',
    skills: { project: '.qoder/skills', global: '.qoder/skills', mode: 'directory' },
    agents: { project: '.qoder/agents', global: '.qoder/agents', mode: 'mirror' },
    cleanup: [],
  },
  qodercn: {
    label: 'Qoder CLI CN', aliases: ['qoder-cn'], family: 'qoder',
    skills: { project: '.qoder/skills', global: '.qoder-cn/skills', mode: 'directory' },
    agents: { project: '.qoder/agents', global: '.qoder-cn/agents', mode: 'mirror' },
    cleanup: [],
  },
  dsh: {
    label: 'DeepSeek Harness', aliases: ['deepseek-harness'], family: 'dsh',
    skills: { project: '.agents/skills', global: '.agents/skills', mode: 'source' },
    agents: { project: null, global: null, mode: 'unsupported' },
    cleanup: [],
  },
};

// 调用方已通过 config 校验；无目录的能力必须跳过。
function agentTargets(adapters, tools, scope) {
  return tools.flatMap(tool => {
    const adapter = adapters[tool];
    const directory = adapter.agents[scope];
    return directory ? [{ tool, directory, family: adapter.family,
      mode: adapter.agents.mode }] : [];
  });
}
```

`mode` 决定入口形态，`family` 决定 renderer 与派生目录，二者职责独立。Hook 规格继续由 format-hook.mjs 管理，通过同物理路径分组收敛，避免描述表依赖业务实现。调用提示保留在 discovery 层，Web 使用从同表派生的标签和能力信息。

Review：MiniMax 的项目空目录仍使用用户级 setup 提示；DeepSeek 的空目录使用 Preset 暂未接入提示。不能由空目录统一推导两者相同的补救动作。

## 2. 期望目标去重与共享源

拟修改 `project.plan` / `store.setup` 的产物收集阶段。目标路径及资源内容经过现有安全和 schema 校验后再调用；kind、来源及依赖均参与一致性比较。

```js
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';

function collectTarget(desired, relative, output) {
  if (!desired.has(relative)) {
    desired.set(relative, output);
    return;
  }
  if (!isDeepStrictEqual(desired.get(relative), output)) {
    throw Error(`Conflicting asset outputs: ${relative}`);
  }
}

function skillAliases(adapter, scope, name, relativeFiles) {
  const source = `.agents/skills/${name}`;
  const target = `${adapter.skills[scope]}/${name}`;
  if (adapter.skills.mode === 'source') {
    if (source !== target) throw Error('Invalid shared Skill root');
    return []; // 源已由调用方写入一次。
  }
  const link = (destination, origin, requires) => [destination, {
    kind: 'symlink', source: origin,
    target: path.posix.relative(path.posix.dirname(destination), origin),
    ...(requires ? { requires } : {}),
  }];
  if (adapter.skills.mode === 'directory') {
    return [link(target, source, `${source}/SKILL.md`)];
  }
  if (adapter.skills.mode === 'files') {
    return relativeFiles.map(file => link(`${target}/${file}`, `${source}/${file}`));
  }
  throw Error(`Unsupported Skill entry mode: ${adapter.skills.mode}`);
}
```

`collectTarget` 仅在受控装配收集路径使用，既有 `addFile/addLink` 不必全面放宽重复语义。源文件、目录入口、派生角色、镜像都进入同一个 Map，类型冲突在写入前失败。Qoder 双端的项目输出完全一致时收敛，用户级目录不同则各自保留。输出不附加不同 tool ID，以免相同物理产物被误判不一致；tool→target 对应关系单独用于 discovery。

## 3. 普通镜像状态分类

拟用于项目角色镜像与派生文件的分类，复用当前冲突恢复执行器。调用方先计算有效中立源和渲染文本。`blocked` 来自现有路径检查；previous 为旧受管记录；hash 使用现有 fs.mjs 函数。返回 decision 只是分支说明，实际 action 名称按现有执行器转换。

```js
function classifyMirror({ before, previous, text, policy, blocked, hash }) {
  if (!['merge', 'replace', 'abort'].includes(policy)) throw Error('Invalid policy');
  const candidate = { kind: 'file', text };
  if (blocked || (before !== null && before.kind !== 'file')) {
    return { decision: 'conflict', after: before, candidate,
      writable: false, needsSync: true };
  }
  if (before === null) {
    return { decision: 'create', after: candidate, needsSync: false };
  }
  if (before.text === text) {
    return { decision: 'noop', after: before, needsSync: false };
  }
  const unchanged = previous?.kind === 'file' && !previous.preserve
    && hash(before.text) === previous.hash;
  if (unchanged) {
    return { decision: 'update', after: candidate, needsSync: false };
  }
  if (policy === 'replace') {
    return { decision: 'replace', after: candidate,
      backup: true, needsSync: false };
  }
  if (policy === 'abort') {
    return { decision: 'conflict', after: before, candidate, needsSync: true };
  }
  return { decision: 'preserve', after: before, candidate,
    saveCandidate: true, preserve: true, needsSync: true };
}
```

所有 replace/update/create 均经原有锁、revision、before 复核和备份执行；本函数不得直接写文件。merge 的 preserve 继续保存候选，未解决保留记录不能因 hash 更新自动成为下次无冲突覆盖的依据。

计划内依赖与期望值示意：

```js
const generatedOutput = {
  kind: 'file', text: renderedText,
  expectedText: renderedText, requires: neutralSourcePath,
};
const nativeOutput = {
  kind: 'file', text: renderedText,
  expectedText: renderedText, requires: generatedPath,
};
```

两者 byte 一致，但链接解释以最终原生路径为准。`requires` 与 `expectedText` 必须在分类后继续传入 action，供 discovery 检查。派生文件被编辑而保留、镜像不一致、中立源待处理、依赖 Skill 待同步时，角色不能报 ready；角色所列 Skill 的就绪状态需要在 discovery 的角色汇总中一并检查。state 不持久化期望文本，每次 plan 从当前有效源重新计算。

Review：防止“先写新源、仍从旧源渲染”“保留镜像后清除 preserve 标记”“只校验镜像，漏掉引用 Skill”三类不同步。

## 4. 受管撤回与共享 Hook 分组

下面为决策伪代码，实际删除、冲突策略及恢复仍用既有 project.mjs 分支。

```js
const cleanupTools = hasValidOldState
  ? Object.keys(adapters).filter(tool => !selectedTools.includes(tool)
      && adapters[tool].cleanup.length > 0)
  : [];
const cleanupDirectories = cleanupTools.flatMap(tool => TOOL_DIRECTORIES[tool]);

// 同一组目录用于整体归档和 retiredPrompts 根扫描。
// 新工具已记录且不再需要的普通文件，走现有逐条撤回逻辑。
const withdrawalPaths = Object.keys(old.files).filter(relative =>
  !desired.has(relative) && !isSharedHostConfig(relative));
```

逐条撤回必须保留现有 source/迁移规则：仅对 validated managed path 判定；文件已修改走冲突策略；未登记路径不加入。通用撤回不处理共享宿主设置，设置的候选移除由格式化语义合并器单独提供。

```js
function groupFormatSpecs(specs) {
  const groups = new Map();
  for (const [tool, spec] of Object.entries(specs)) {
    const old = groups.get(spec.path);
    if (old && !isDeepStrictEqual(old.spec, spec)) {
      throw Error(`Conflicting Hook schemas: ${spec.path}`);
    }
    if (old) old.tools.push(tool);
    else groups.set(spec.path, { spec, tools: [tool] });
  }
  return [...groups.values()];
}

const work = groupFormatSpecs(FORMAT_CONFIGS).map(({ spec, tools }) => {
  const activeTools = tools.filter(tool => selectedTools.includes(tool));
  return { spec, activeTools, active: enabled && activeTools.length > 0,
    previous: previous[spec.path] };
}).filter(item => item.active || item.previous?.formatHook);
```

`formatHookActions` 按 work 每组执行一次现有结构化合并主体；active 时给 activeTools 各记同一 registration path，无 active 时按旧记录撤回自有条目。解析失败继续返回保留 before 的 conflict，不创建替代 settings 文件。现有分支见 [formatHookActions](../../../src/format-hook.mjs)。Qoder 两条规格值必须完全一致，避免 event、grouped 或 timeout 不同却指向同一个文件。其他宿主规格各自独立，不受此次分组改变。

## 5. 评审与验证重点

- 同源重复可收敛，不同内容/来源/依赖的碰撞在 mutation 前失败。
- Qoder 镜像始终为普通文件；源码保存、派生、原生入口及依赖 Skill 的最终状态一致。
- 首次升级、取消单端、取消双端三个场景中，未受管文件和共享 settings 都保留。
- 全局 setup 检查 capability 后再组路径，DeepSeek 不出现 `undefined/` 目标；全局冲突预检先于写入。
- JSONC 配置冲突及宿主功能未接入都能从 CLI/Web 识别，不能被文件写入成功掩盖。
