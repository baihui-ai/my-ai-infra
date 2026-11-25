// Static host contracts. Paths are relative to the project or test/user home.
export const ADAPTERS = {
  codex: {
    label: 'Codex', aliases: [], family: 'codex',
    roots: { project: '.codex', global: '.codex' },
    skills: { project: '.agents/skills', global: '.agents/skills', mode: 'source' },
    agents: { project: '.codex/agents', global: '.codex/agents', mode: 'link' },
    cleanup: ['.codex'],
  },
  claudecode: {
    label: 'Claude Code', aliases: ['claude', 'claude-code'], family: 'claudecode',
    roots: { project: '.claude', global: '.claude' },
    skills: { project: '.claude/skills', global: '.claude/skills', mode: 'files' },
    agents: { project: '.claude/agents', global: '.claude/agents', mode: 'link' },
    cleanup: ['.claude'],
  },
  cursor: {
    label: 'Cursor', aliases: [], family: 'cursor',
    roots: { project: '.cursor', global: '.cursor' },
    skills: { project: '.cursor/skills', global: '.cursor/skills', mode: 'files' },
    agents: { project: '.cursor/agents', global: '.cursor/agents', mode: 'link' },
    cleanup: ['.cursor'],
  },
  copilot: {
    label: 'GitHub Copilot', aliases: ['github-copilot'], family: 'copilot',
    roots: { project: '.github', global: '.copilot' },
    skills: { project: '.github/skills', global: '.copilot/skills', mode: 'files' },
    agents: { project: '.github/agents', global: '.copilot/agents', mode: 'link' },
    cleanup: ['.copilot', '.github/skills', '.github/agents', '.github/prompts', '.github/instructions'],
  },
  mcode: {
    label: 'MiniMax Code', aliases: ['minimax', 'minimax-code'], family: 'mcode',
    roots: { project: '.minimax', global: '.minimax' },
    skills: { project: '.minimax/skills', global: '.minimax/skills', mode: 'directory' },
    agents: { project: null, global: '.minimax/agents', mode: 'file' },
    cleanup: ['.minimax'],
  },
  qoder: {
    label: 'Qoder CLI', aliases: [], family: 'qoder',
    roots: { project: '.qoder', global: '.qoder' },
    skills: { project: '.qoder/skills', global: '.qoder/skills', mode: 'directory' },
    agents: { project: '.qoder/agents', global: '.qoder/agents', mode: 'mirror' },
    cleanup: [],
    description: '支持规则、Skill、角色与自动格式化；角色入口为受管普通文件。',
  },
  qodercn: {
    label: 'Qoder CLI CN', aliases: ['qoder-cn'], family: 'qoder',
    roots: { project: '.qoder', global: '.qoder-cn' },
    skills: { project: '.qoder/skills', global: '.qoder-cn/skills', mode: 'directory' },
    agents: { project: '.qoder/agents', global: '.qoder-cn/agents', mode: 'mirror' },
    cleanup: [],
    description: '支持规则、Skill、角色与自动格式化；与国际版共用项目入口。',
  },
  dsh: {
    label: 'DeepSeek Harness', aliases: ['deepseek-harness'], family: 'dsh',
    roots: { project: '.dsh', global: '.dsh' },
    skills: { project: '.agents/skills', global: '.agents/skills', mode: 'source' },
    agents: { project: null, global: null, mode: 'unsupported' },
    cleanup: [],
    description: '支持规则与 Skill；命名角色、自动格式化暂未接入。',
  },
};

export const toolPaths = (type, scope = 'project') => Object.fromEntries(Object.entries(ADAPTERS).filter(([, a]) => a[type][scope]).map(([id, a]) => [id, a[type][scope]]));
export const TOOL_LABELS = Object.fromEntries(Object.entries(ADAPTERS).map(([id, a]) => [id, a.label]));
const aliases = Object.fromEntries(Object.entries(ADAPTERS).flatMap(([id, a]) => a.aliases.map(alias => [alias, id])));
export const canonicalTool = id => aliases[id] || id;
export const toolCapabilities = (tools, scope = 'project') => tools.filter(tool => ADAPTERS[tool].description).map(tool => ({
  tool, label: ADAPTERS[tool].label, description: scope === 'global'
    ? ADAPTERS[tool].family === 'qoder' ? '支持全局 Skill 与角色；项目规则和自动格式化通过 init / sync 接入。' : '支持全局 Skill；命名角色、自动格式化暂未接入，项目规则通过 init / sync 接入。'
    : ADAPTERS[tool].description, hostVerified: false,
  limitation: '当前按宿主默认目录装配；使用自定义目录或关闭默认发现时，请在宿主核对实际来源。',
}));
