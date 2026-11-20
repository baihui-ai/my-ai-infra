import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {apply,plan} from '../src/project.mjs';
import {catalog} from '../src/store.mjs';
import {startWeb} from '../src/web.mjs';
async function fixture(t){const root=await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(),'mai-local-docs-')));t.after(()=>fs.rm(root,{recursive:true,force:true}));const home=path.join(root,'home'),project=path.join(root,'project');await fs.mkdir(project);return {root,home,project};}

test('local document stages install their own standard/simple templates and retire the old document Skill selection',async t=>{
 const {home,project}=await fixture(t),selected={version:1,tools:['codex'],skills:['my-create-feature','my-create-design','my-create-prd','my-create-test-plan','my-tech-diagram','java-dev','lily-doc']};
 const result=await apply(home,project,selected);assert.ok(!result.config.skills.includes('lily-doc'));assert.ok(!(await catalog(home)).some(item=>item.name==='lily-doc'));
 for(const name of ['PRD.tmpl.md','TECH_DESIGN.tmpl.md','TEST_PLAN.tmpl.md'])assert.equal(await fs.readFile(path.join(project,'mai-specs/_templates',name),'utf8'),await fs.readFile(new URL('../templates/mai-specs/_templates/'+name,import.meta.url),'utf8'));
 const simple='my-create-design/assets/templates/TECH_DESIGN.simple.tmpl.md';assert.equal(await fs.readFile(path.join(project,'.agents/skills',simple),'utf8'),await fs.readFile(new URL('../assets/skills/'+simple,import.meta.url),'utf8'));
 const instructions=await fs.readFile(path.join(project,'.agents/skills/my-create-design/SKILL.md'),'utf8');assert.ok(instructions.includes('mai-specs/_templates/TECH_DESIGN.tmpl.md'));assert.ok(!instructions.includes('lily-doc'));assert.ok(instructions.includes('my-tech-diagram'));
 await assert.rejects(fs.access(path.join(project,'.agents/skills/lily-doc')),error=>error.code==='ENOENT');
 const target=path.join(project,'mai-specs/_templates/TECH_DESIGN.tmpl.md');await fs.appendFile(target,'\n用户模板定制\n');await plan(home,project);await apply(home,project,selected);assert.match(await fs.readFile(target,'utf8'),/用户模板定制/);
});

test('Web has no document-cloud routes and ignores retained private configuration without modifying it',async t=>{
 const {home,project}=await fixture(t);const old=path.join(project,'.my-ai-infra/doc-sync/config.json'),credential=path.join(home,'auth/feishu/default.json');
 for(const file of [old,credential]){await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,'private-retained-invalid-json');}
 const legacy=path.join(home,'assets/skills/lily-doc/SKILL.md');await fs.mkdir(path.dirname(legacy),{recursive:true});await fs.writeFile(legacy,'retained personal source');
 const web=await startWeb({home,project,port:0});t.after(()=>new Promise(resolve=>web.server.close(resolve)));
 const state=await fetch(web.origin+'/api/state',{headers:{'X-My-Ai-Token':web.token}});assert.equal(state.status,200);const body=await state.json();assert.ok(!body.assets.some(asset=>asset.name==='lily-doc'));assert.ok(!JSON.stringify(body).includes('private-retained'));
 for(const route of ['/feishu/callback?code=private-code','/feishu.js','/feishu-callback.js'])assert.equal((await fetch(web.origin+route)).status,404);
 assert.equal((await fetch(web.origin+'/api/feishu/sync',{method:'POST',headers:{'X-My-Ai-Token':web.token,'Content-Type':'application/json'},body:JSON.stringify({project})})).status,404);
 const html=await (await fetch(web.origin)).text();assert.ok(!html.includes('feishu-panel'));assert.ok(!html.includes('应用 Secret'));
 for(const file of [old,credential])assert.equal(await fs.readFile(file,'utf8'),'private-retained-invalid-json');assert.equal(await fs.readFile(legacy,'utf8'),'retained personal source');
});
