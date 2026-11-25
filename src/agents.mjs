import path from 'node:path';
import { typedSources, ASSET_ROOT, SKILL_SOURCE, derivedAgent, linkTarget, collectTarget } from './assets.mjs';
import { ADAPTERS, toolPaths } from './tool-adapters.mjs';
import { read } from './fs.mjs';

const validName = value => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 64;
export const AGENT_TOOLS = toolPaths('agents');
export const GLOBAL_AGENT_TOOLS = toolPaths('agents', 'global');
export const AGENT_FORMATS = Object.keys(GLOBAL_AGENT_TOOLS);
// MiniMax Code registers a custom Agent as a directory with its own agent.md.
export const agentFilename = (tool, name) => tool === 'codex' ? `${name}.toml` : tool === 'copilot' ? `${name}.agent.md` : tool === 'mcode' ? `${name}/agent.md` : `${name}.md`;

export function parseAgent(content, expectedName) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]+)$/);
  if (!match) throw Error(`Invalid Agent asset: ${expectedName}`);
  const header = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^(name|description|skills):\s*(.+)$/);
    if (!field || Object.hasOwn(header, field[1])) throw Error(`Invalid Agent metadata: ${expectedName}`);
    header[field[1]] = JSON.parse(field[2]);
  }
  if (!validName(header.name) || header.name !== expectedName || typeof header.description !== 'string' || !header.description.trim() || !Array.isArray(header.skills) || !header.skills.every(validName) || new Set(header.skills).size !== header.skills.length) throw Error(`Invalid Agent metadata: ${expectedName}`);
  const body = match[2].trim();
  for (const skill of header.skills) if (!body.includes(`{{SKILL:${skill}}}`)) throw Error(`Agent ${expectedName} must reference Skill ${skill}`);
  for (const [, skill] of body.matchAll(/\{\{SKILL:([^}]+)\}\}/g)) if (!header.skills.includes(skill)) throw Error(`Undeclared Agent Skill: ${skill}`);
  return { ...header, body, content };
}

export async function agentCatalog(home) {
  const result = [];
  for (const source of await typedSources(home,'agents')) result.push({...parseAgent(await read(source.sourceRoot,source.sourceName),source.name),...source});
  return result.sort((a, b) => a.name.localeCompare(b.name));
}

export function renderAgent(agent, tool, skillPath) {
  if (!AGENT_FORMATS.includes(tool)) throw Error(`Unsupported Agent tool: ${tool}`);
  tool = ADAPTERS[tool].family;
  const body = agent.body.replace(/\{\{SKILL:([^}]+)\}\}/g, (_, skill) => {
    // Markdown destinations are URI-escaped; the path resolves from the agent file.
    return skillPath(skill).split(path.sep).join('/').split('/').map(encodeURIComponent).join('/');
  });
  const quote = JSON.stringify;
  if (tool === 'codex') return `name = ${quote(agent.name)}\ndescription = ${quote(agent.description)}\ndeveloper_instructions = ${quote(body + '\n')}\n`;
  const extra = tool === 'qoder' ? `model: inherit\nskills: ${quote(agent.skills)}\n` : tool === 'claudecode' || tool === 'mcode' ? `skills: ${quote(agent.skills)}\n` : tool === 'copilot' ? 'include-custom-instructions: true\n' : '';
  return `---\nname: ${quote(agent.name)}\ndescription: ${quote(agent.description)}\n${extra}---\n\n${body}\n`;
}

export function isManagedAgentPath(relative) {
  for (const prefix of ['.agents/agents', ...Object.values(AGENT_TOOLS)]) {
    if (!relative.startsWith(prefix + '/')) continue;
    const suffix = prefix === AGENT_TOOLS.codex ? '.toml' : prefix === AGENT_TOOLS.copilot ? '.agent.md' : '.md';
    const filename = relative.slice(prefix.length + 1);
    return filename.endsWith(suffix) && validName(filename.slice(0, -suffix.length));
  }
  return false;
}

// Native mirrors are generated alongside their .agents counterpart in one transaction.
export function addAgentEntries(desired, agent, tools, global = false) {
  const paths = [], scope = global ? 'global' : 'project';
  const source = `${ASSET_ROOT}/agents/${agent.name}.md`;
  for (const tool of tools) {
    const adapter = ADAPTERS[tool], directory = adapter.agents[scope];
    if (!directory) continue;
    const target = `${directory}/${agentFilename(tool, agent.name)}`;
    const skillRoot = adapter.agents.mode === 'file' ? adapter.skills[scope] : SKILL_SOURCE;
    const text = renderAgent(agent, tool, skill => linkTarget(target, `${skillRoot}/${skill}/SKILL.md`));
    if (adapter.agents.mode === 'file') {
      collectTarget(desired, target, { kind: 'file', text }); paths.push(target); continue;
    }
    const generated = derivedAgent(tool, agent.name, agentFilename(tool, agent.name));
    const mirror = adapter.agents.mode === 'mirror';
    collectTarget(desired, generated, { kind: 'file', text, ...(mirror ? { requires: source, expectedText: text, mirror: true } : {}) });
    collectTarget(desired, target, mirror
      ? { kind: 'file', text, requires: generated, expectedText: text, mirror: true }
      : { kind: 'symlink', source: generated, target: linkTarget(target, generated) });
    paths.push(generated, target);
  }
  return [...new Set(paths)];
}
