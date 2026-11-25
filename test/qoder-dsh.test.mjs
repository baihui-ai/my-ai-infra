import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { apply, plan, publicPlan, doctor } from '../src/project.mjs';
import { setup, TOOLS } from '../src/store.mjs';
import { collectTarget, parseExtension } from '../src/assets.mjs';
import { write, readJSON, json } from '../src/fs.mjs';

const exec = promisify(execFile);
const cli = fileURLToPath(new URL('../bin/my-ai-infra.mjs', import.meta.url));
const selected = tools => ({ version: 1, tools, skills: ['my-review-code'] });
const source = '.agents/agents/code-review.md';
const generated = '.agents/.generated/qoder/agents/code-review.md';
const mirror = '.qoder/agents/code-review.md';
const settings = '.qoder/settings.json';
const merge = { conflict: 'merge' };
async function fixture(t) {
  const root = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'mai-qoder-dsh-')));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const project = path.join(root, '项目 with spaces'), home = path.join(root, 'library'), toolHome = path.join(root, 'user');
  await fs.mkdir(project); await fs.mkdir(toolHome);
  return { root, project, home, toolHome };
}
const text = (root, relative) => fs.readFile(path.join(root, relative), 'utf8');
const absent = file => assert.rejects(fs.lstat(file), { code: 'ENOENT' });
const role = (result, tool = 'qoder') => result.discovery.find(entry => entry.tool === tool && entry.type === 'agents');
const ownedHooks = doc => (doc.hooks?.Stop || []).flatMap(group => group.hooks).filter(hook => hook.command?.endsWith(' --my-ai-infra-format'));
async function formatting(project) {
  await write(project, '.prettierrc', '{}\n');
  await write(project, 'package.json', json({ scripts: { format: 'node scripts/format.mjs' } }));
  await write(project, 'scripts/format.mjs', 'process.exit(0);\n');
}

test('Qoder international/CN and DeepSeek share canonical assets and repeat without changes', async t => {
  const { home, project } = await fixture(t);
  const config = selected(['codex', 'qoder', 'qodercn', 'dsh']);
  const preview = await plan(home, project, config);
  assert.equal(new Set(preview.actions.map(a => a.path)).size, preview.actions.length);
  assert.deepEqual(await fs.readdir(project), []);
  await absent(home);
  const result = await apply(home, project, config, preview.revision);
  assert.equal(result.complete, true);
  assert.equal(await fs.readlink(path.join(project, 'AGENTS.md')), '.agents/rules/AGENTS.md');
  const skill = path.join(project, '.agents/skills/my-review-code');
  assert.ok((await fs.lstat(path.join(skill, 'SKILL.md'))).isFile());
  assert.ok((await fs.lstat(path.join(project, '.qoder/skills/my-review-code'))).isSymbolicLink());
  assert.equal(await fs.realpath(path.join(project, '.qoder/skills/my-review-code')), skill);
  assert.ok((await fs.lstat(path.join(project, mirror))).isFile());
  assert.equal(await text(project, mirror), await text(project, generated));
  assert.match(await text(project, mirror), /^model: inherit$/m);
  await absent(path.join(project, '.agents/.generated/qodercn'));
  await absent(path.join(project, '.dsh'));
  assert.ok(result.discovery.filter(entry => entry.type === 'skills').every(entry => entry.status === 'ready'));
  assert.equal(role(result).status, 'ready');
  assert.equal(role(result, 'qodercn').status, 'ready');
  assert.equal(role(result, 'dsh').status, 'unsupported');
  assert.ok(result.discovery.every(entry => entry.hostVerified === false));
  assert.equal((await apply(home, project)).recovery, null);
  assert.equal((await doctor(home, project)).healthy, true);
});

test('DeepSeek alone reports its limits with and without a format asset', async t => {
  const { home, project } = await fixture(t);
  for (const withFormat of [false, true]) {
    if (withFormat) await formatting(project);
    const result = await apply(home, project, selected(['dsh']));
    assert.equal(result.complete, true);
    assert.match(result.capabilities[0].description, /命名角色、自动格式化暂未接入/);
    assert.match(role(result, 'dsh').limitation, /Preset/);
    assert.doesNotMatch(role(result, 'dsh').limitation, /setup|MiniMax/);
    if (withFormat) assert.equal(result.discovery.find(e => e.type === 'hooks').status, 'unsupported');
    await absent(path.join(project, '.dsh'));
    await absent(path.join(project, 'undefined'));
    assert.equal((await doctor(home, project)).capabilities[0].tool, 'dsh');
  }
});

test('global setup writes the shared source once, installs both Qoder homes and rejects divergent mirrors atomically', async t => {
  const { home, toolHome } = await fixture(t);
  const tools = ['codex', 'qoder', 'qodercn', 'dsh'];
  await setup(home, tools, toolHome, ['my-review-code']);
  for (const directory of ['.qoder', '.qoder-cn']) {
    assert.equal(await fs.realpath(path.join(toolHome, directory, 'skills/my-review-code')), path.join(toolHome, '.agents/skills/my-review-code'));
    assert.ok((await fs.lstat(path.join(toolHome, directory, 'agents/code-review.md'))).isFile());
    assert.equal(await text(toolHome, `${directory}/agents/code-review.md`), await text(toolHome, generated));
  }
  await absent(path.join(toolHome, '.dsh'));
  const before = await text(home, 'global-state.json');
  await setup(home, tools, toolHome, ['my-review-code']);
  assert.equal(await text(home, 'global-state.json'), before);
  await write(toolHome, mirror, 'user role\n');
  await assert.rejects(setup(home, tools, toolHome, ['my-review-code']), /Global Agent conflict/);
  assert.equal(await text(toolHome, mirror), 'user role\n');
  assert.equal(await text(home, 'global-state.json'), before);
});

test('only recorded Qoder entries are withdrawn and a single selected sibling keeps shared entries', async t => {
  const { home, project } = await fixture(t);
  await formatting(project);
  await write(project, settings, '{"custom":true,"hooks":{"Stop":[{"hooks":[{"type":"command","command":"echo mine"}]}]}}\n');
  await write(project, '.qoder/agents/mine.md', '# user role\n');
  await write(project, '.qoder/skills/mine/SKILL.md', '# user skill\n');
  await write(project, '.dsh/cordis.yml', '# user plugins\n');
  await apply(home, project, selected(['codex']));
  // Already initialized projects must not take ownership of unselected host roots.
  const unselected = await plan(home, project);
  assert.ok(!unselected.actions.some(a => ['.qoder', '.dsh'].includes(a.path)));
  await apply(home, project);
  assert.equal(await text(project, '.dsh/cordis.yml'), '# user plugins\n');
  await apply(home, project, selected(['qoder', 'qodercn']));
  for (const tools of [['qodercn'], ['qoder']]) {
    await apply(home, project, selected(tools));
    assert.ok((await fs.lstat(path.join(project, mirror))).isFile());
    assert.equal(ownedHooks(await readJSON(project, settings)).length, 1);
  }
  await apply(home, project, selected(['dsh']));
  await absent(path.join(project, mirror));
  await absent(path.join(project, '.qoder/skills/my-review-code'));
  assert.equal(await text(project, '.qoder/agents/mine.md'), '# user role\n');
  assert.equal(await text(project, '.qoder/skills/mine/SKILL.md'), '# user skill\n');
  assert.equal(await text(project, '.dsh/cordis.yml'), '# user plugins\n');
  const remaining = await readJSON(project, settings);
  assert.equal(remaining.custom, true);
  assert.equal(ownedHooks(remaining).length, 0);
  assert.equal(remaining.hooks.Stop[0].hooks[0].command, 'echo mine');
});

test('Qoder renders effective neutral edits and preserves conflicting native mirrors until resolved', async t => {
  const { home, project } = await fixture(t);
  await apply(home, project, selected(['qoder']));
  await fs.appendFile(path.join(project, source), '\n用户角色定制。\n');
  const updated = await apply(home, project, undefined, undefined, merge);
  assert.match(await text(project, mirror), /用户角色定制/);
  assert.equal(role(updated).status, 'ready');
  await fs.appendFile(path.join(project, mirror), '\n原生镜像定制。\n');
  const edited = await text(project, mirror);
  await assert.rejects(apply(home, project), /Conflicting files/);
  const preserved = await apply(home, project, undefined, undefined, merge);
  assert.equal(await text(project, mirror), edited);
  assert.equal(preserved.complete, false);
  assert.equal(role(preserved).status, 'needs-sync');
  assert.ok(preserved.review.some(entry => entry.path === mirror));
  assert.ok(await text(preserved.recovery, `incoming/${mirror}`));
  assert.equal((await doctor(home, project)).healthy, false);
  const replaced = await apply(home, project, undefined, undefined, { conflict: 'replace' });
  assert.equal(replaced.complete, true);
  assert.equal(await text(project, mirror), await text(project, generated));
  assert.equal(await text(replaced.recovery, mirror), edited);
});

test('a preserved generated role or a blocked Skill prevents a mirror from reporting ready', async t => {
  const { home, project, root } = await fixture(t);
  await apply(home, project, selected(['qoder']));
  await fs.appendFile(path.join(project, generated), '\nGenerated edit\n');
  const result = await apply(home, project, undefined, undefined, merge);
  assert.equal(result.complete, false);
  assert.equal(role(result).status, 'needs-sync');
  assert.match(await text(project, generated), /Generated edit/);
  await apply(home, project, undefined, undefined, { conflict: 'replace' });
  const directory = path.join(project, '.agents/skills/my-review-code');
  const outside = path.join(root, 'outside');
  await fs.mkdir(outside); await fs.writeFile(path.join(outside, 'keep'), 'safe');
  await fs.rm(directory, { recursive: true }); await fs.symlink(outside, directory);
  const blocked = publicPlan(await plan(home, project, undefined, merge));
  assert.equal(blocked.complete, false);
  assert.equal(role(blocked).status, 'needs-sync');
  await apply(home, project, undefined, undefined, merge);
  assert.deepEqual(await fs.readdir(outside), ['keep']);
});

test('shared Qoder Stop registration is single, preserves settings and uses a 30 second timeout', async t => {
  const { home, project } = await fixture(t);
  await formatting(project);
  await write(project, settings, json({ permissions: { allow: ['Read'] }, disableAllHooks: true, hooks: { SubagentStop: [{ hooks: [{ type: 'command', command: 'echo sub' }] }] } }));
  const result = await apply(home, project, selected(['qoder', 'qodercn']));
  const doc = await readJSON(project, settings);
  assert.equal(doc.disableAllHooks, true);
  assert.deepEqual(doc.permissions, { allow: ['Read'] });
  assert.equal(doc.hooks.SubagentStop[0].hooks[0].command, 'echo sub');
  assert.equal(ownedHooks(doc).length, 1);
  assert.equal(ownedHooks(doc)[0].timeout, 30);
  assert.ok(result.discovery.filter(e => e.type === 'hooks').every(e => e.registration === settings && e.status === 'ready'));
  const before = await text(project, settings);
  await apply(home, project);
  assert.equal(await text(project, settings), before);
});

for (const original of ['{ // comment\n "theme": "dark"\n}\n', '{"hooks":{"Stop":{}}}\n']) {
  test('invalid or commented Qoder settings are preserved even under replace: ' + original.slice(0, 18), async t => {
    const { home, project } = await fixture(t);
    await formatting(project); await write(project, settings, original);
    const result = await apply(home, project, selected(['qoder']), undefined, { conflict: 'replace' });
    assert.equal(await text(project, settings), original);
    assert.equal(result.complete, false);
    assert.equal(result.discovery.find(e => e.type === 'hooks').status, 'needs-sync');
    assert.ok(result.skipped.some(entry => entry.path === settings));
  });
}

test('external role and settings links remain intact and never write to their targets', async t => {
  const { home, project, root } = await fixture(t);
  await formatting(project);
  const outside = path.join(root, 'outside.md'); await fs.writeFile(outside, 'external\n');
  await fs.mkdir(path.join(project, '.qoder/agents'), { recursive: true });
  await fs.symlink(outside, path.join(project, mirror));
  await fs.symlink(outside, path.join(project, settings));
  const result = await apply(home, project, selected(['qoder']), undefined, { conflict: 'replace' });
  assert.equal(result.complete, false);
  assert.equal(await fs.readlink(path.join(project, mirror)), outside);
  assert.equal(await fs.readlink(path.join(project, settings)), outside);
  assert.equal(await fs.readFile(outside, 'utf8'), 'external\n');
});

test('revision changes and write failures protect Qoder source, mirrors and shared settings', async t => {
  const { home, project } = await fixture(t);
  await formatting(project);
  const original = '{ "custom": "keep bytes" }\n'; await write(project, settings, original);
  const config = selected(['qoder', 'qodercn']);
  const preview = await plan(home, project, config);
  await write(project, settings, '{"changed":true}\n');
  await assert.rejects(apply(home, project, config, preview.revision), /changed since preview/);
  await absent(path.join(project, mirror));
  await write(project, settings, original);
  const rename = fs.rename; let injected = false;
  fs.rename = async (from, to) => {
    if (!injected && to === path.join(project, '.my-ai-infra.json')) { injected = true; throw Error('Qoder injected write failure'); }
    return rename(from, to);
  };
  try { await assert.rejects(apply(home, project, config), /Qoder injected write failure/); }
  finally { fs.rename = rename; }
  assert.equal(injected, true);
  assert.equal(await text(project, settings), original);
  await absent(path.join(project, source)); await absent(path.join(project, generated)); await absent(path.join(project, mirror));
  await absent(path.join(project, '.my-ai-infra/state.json'));
});

test('CLI aliases save canonical IDs and each new adapter initializes independently', async t => {
  const { home, project, root } = await fixture(t);
  const { stdout } = await exec(process.execPath, [cli, 'init', '--home', home, '--project', project, '--tools', 'qoder-cn,deepseek-harness', '--skills', 'my-review-code', '--yes']);
  assert.deepEqual(JSON.parse(stdout).config.tools, ['qodercn', 'dsh']);
  for (const tool of ['qoder', 'qodercn', 'dsh']) {
    const dir = path.join(root, tool); await fs.mkdir(dir);
    const result = await apply(home, dir, selected([tool]));
    assert.equal(result.complete, true);
    assert.equal(result.nextSteps[0].tool, tool);
    assert.doesNotMatch(result.nextSteps[0].message, /undefined/);
  }
  assert.equal(Object.keys(TOOLS).length, 8);
});

test('shared output collisions still fail and extension manifests reject shared configuration targets', () => {
  const map = new Map(), file = { kind: 'file', text: 'x', requires: '.agents/source' };
  collectTarget(map, 'a', file); collectTarget(map, 'a', { ...file });
  assert.equal(map.size, 1);
  assert.throws(() => collectTarget(map, 'a', { ...file, requires: '.agents/other' }), /Conflicting/);
  const manifest = target => json({ name: 'demo', description: '示例', entry: 'config.json', targets: target });
  assert.throws(() => parseExtension(manifest({ qoder: '.qoder/settings.json' }), 'mcp', 'demo'), /Invalid asset target/);
  assert.throws(() => parseExtension(manifest({ dsh: '.dsh/cordis.yml' }), 'mcp', 'demo'), /Invalid asset target/);
  assert.ok(parseExtension(manifest({ dsh: '.dsh/mcp/demo/config.json', qoder: '.qoder/mcp/demo/config.json' }), 'mcp', 'demo'));
});
