import path from 'node:path';
import { ASSET_ROOT, assetRelative } from './assets.mjs';
import { AGENT_TOOLS, agentFilename } from './agents.mjs';
import { RULES } from './rules.mjs';
import { FORMAT_ASSET } from './format-hook.mjs';
import { ADAPTERS, toolPaths } from './tool-adapters.mjs';

const skillRoots = toolPaths('skills');
const skillEntry = (tool,name) => ADAPTERS[tool].skills.mode === 'directory' ? `${skillRoots[tool]}/${name}` : `${skillRoots[tool]}/${name}/SKILL.md`;
const combinedState = states => states.includes('needs-sync') ? 'needs-sync' : states.includes('planned') ? 'planned' : 'ready';
const invocation = (tool,name) => tool === 'codex' ? `ChatGPT: @${name}；Codex CLI/IDE: $${name} 或 /skills` : tool === 'mcode' ? `会话中用 skill 工具按名称调用 ${name}` : tool === 'dsh' ? `会话中显式请求使用 Skill ${name}` : `/${name}`;

// This is a filesystem plan/diagnostic, never a claim that a host loaded the asset.
export function discoveryEntries(p, phase = 'plan') {
  const actions = new Map(p.actions.map(action => [action.path,action]));
  const entries = [];
  function state(target, seen = new Set()) {
    if (seen.has(target)) return 'needs-sync';
    seen.add(target);
    const a = actions.get(target);
    if (!a || a.resolution === 'skip' || a.action === 'conflict' || !a.after) return 'needs-sync';
    if (a.expectedText !== undefined && a.after.text !== a.expectedText) return 'needs-sync';
    const own = phase !== 'applied' && !['noop','preserve'].includes(a.action) ? phase === 'plan' ? 'planned' : 'needs-sync' : 'ready';
    const dependency = a.requires || (a.after.kind === 'symlink' ? path.posix.normalize(path.posix.join(path.posix.dirname(target),a.after.target)) : null);
    return combinedState([own, ...(dependency ? [state(dependency,seen)] : [])]);
  }
  const add = (tool,type,name,target,call,limitation) => {
    const status = target ? state(target) : 'unsupported';
    entries.push({tool,type,name,path:target || null,invocation:call,status:status === 'ready' && limitation ? 'configuration-required' : status,hostVerified:false,...(limitation ? {limitation} : {})});
  };
  for (const tool of p.config.tools) {
    for (const name of p.config.skills) add(tool,'skills',name,skillEntry(tool,name),invocation(tool,name));
    for (const name of p.agents) {
      const directory = AGENT_TOOLS[tool];
      // MiniMax Code registers a custom Agent in the user data directory only.
      if (!directory) {
        const dsh = tool === 'dsh';
        add(tool,'agents',name,null,dsh ? '在主会话显式调用对应评审 Skill' : `由主 Agent 直接委派给 ${name}`,dsh ? '当前适配器暂未接入 DeepSeek Agent Preset 注册与允许委派列表。' : 'MiniMax Code 只在用户级目录注册自定义 Agent，项目内不装配角色入口；请执行 mai setup 安装用户级角色。');
        continue;
      }
      add(tool,'agents',name,`${directory}/${agentFilename(tool,name)}`,tool === 'claudecode' ? `/agents 查看；请求委派给 ${name}` : tool === 'copilot' ? `在 Agent 选择器选择 ${name}` : `请求主 Agent 委派给 ${name}`);
      const entry = entries.at(-1);
      entry.status = combinedState([entry.status, ...(p.agentDependencies?.[name] || []).map(skill => state(skillEntry(tool,skill)))]);
    }
    for (const rule of RULES.filter(rule => rule.tools.includes(tool))) {
      add(tool,'rules',rule.entry,rule.entry,'会话中自动加载项目规则');
      const source = actions.get(rule.entry)?.after;
      const body = source?.kind === 'symlink' ? actions.get(path.posix.normalize(path.posix.join(path.posix.dirname(rule.entry),source.target)))?.after?.text : source?.text;
      const entry = entries.at(-1);
      if (entry.status === 'ready' && !body?.trim()) { entry.status = 'configuration-required'; entry.limitation = '规则正文为空，请依据当前仓库补全。'; }
    }
    for (const asset of p.extensions) {
      const supported = Boolean(asset.targets[tool]);
      const target = supported ? asset.targets[tool] : null;
      const source = `${ASSET_ROOT}/${assetRelative(asset)}`;
      add(tool,asset.type,asset.name,target,asset.type === 'hooks' ? '由宿主事件触发' : asset.type === 'mcp' ? '配置并授权服务器后，由宿主工具调用' : '显式引用资产文件',supported ? '当前仅装配资产文件；请在宿主完成注册或配置并验证生效。' : undefined);
      entries.at(-1).source = source;
      if (!supported) entries.at(-1).limitation = tool === 'dsh' && asset.type === 'hooks' && asset.name === FORMAT_ASSET ? '当前适配器暂未接入 DeepSeek 自动格式化 Hook 插件。' : '此资产未声明该工具的适配入口。';
      if (asset.type === 'hooks' && asset.name === FORMAT_ASSET && supported) {
        const entry = entries.at(-1), registration = p.formatRegistrations?.[tool];
        const scriptState = state(target), registrationState = registration ? state(registration) : 'needs-sync';
        entry.status = [scriptState, registrationState].includes('needs-sync') ? 'needs-sync' : [scriptState, registrationState].includes('planned') ? 'planned' : 'ready';
        entry.registration = registration;
        entry.invocation = '主 Agent 一轮结束时尝试执行项目已有格式化脚本';
        entry.limitation = p.formatting.status === 'no-script' ? '未找到项目 format / fmt 脚本，执行时直接跳过。' : '实际运行遵循宿主的 Hook 开关、信任与权限设置；尚未验证宿主调用。';
      }
    }
  }
  return entries;
}
