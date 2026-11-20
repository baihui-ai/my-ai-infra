import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {apply,plan,doctor} from '../src/project.mjs';

test('DDD source checksums, complete installation, adapter relocation and merge preserve local code conventions',async t=>{
 const root=await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(),'mai-ddd-')));t.after(()=>fs.rm(root,{recursive:true,force:true}));
 const home=path.join(root,'home'),project=path.join(root,'project');await fs.mkdir(project);
 const source=new URL('../assets/skills/xfg-ddd-skills/',import.meta.url);
 const manifest=JSON.parse(await fs.readFile(new URL('UPSTREAM.json',source),'utf8'));
 const config={version:1,tools:['codex','claudecode','cursor','copilot','mcode'],skills:['xfg-ddd-skills']};
 assert.ok((await apply(home,project,config)).complete);
 for(const [relative,record] of Object.entries(manifest.files)){
  const bytes=await fs.readFile(new URL(relative,source));assert.equal(createHash('sha256').update(bytes).digest('hex'),record.sha256);
  const canonical=path.join(project,'.agents/skills/xfg-ddd-skills',relative);assert.deepEqual(await fs.readFile(canonical),bytes);
  for(const adapter of ['.claude','.cursor','.github'])assert.equal(await fs.realpath(path.join(project,adapter,'skills/xfg-ddd-skills',relative)),await fs.realpath(canonical));
 }
 assert.ok((await doctor(home,project)).healthy);
 const moved=path.join(root,'moved');await fs.rename(project,moved);
 assert.deepEqual(await fs.readFile(path.join(moved,'.claude/skills/xfg-ddd-skills/references/domain-service.md')),await fs.readFile(new URL('references/domain-service.md',source)));
 const local=path.join(moved,'.agents/skills/xfg-ddd-skills/references/project-adaptation.md');await fs.appendFile(local,'\n本项目沿用现有 JPA 三层结构。\n');const before=await fs.readFile(local);
 const preview=await plan(home,moved,undefined,{conflict:'merge'});await apply(home,moved,undefined,preview.revision,{conflict:'merge'});assert.deepEqual(await fs.readFile(local),before);
});
