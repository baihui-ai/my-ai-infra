import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { apply, plan, doctor } from '../src/project.mjs';
import { animationPage, generate } from '../assets/skills/my-tech-diagram/scripts/animate-svg.mjs';
const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400"><rect x="20" y="40" width="200" height="80"/><text x="40" y="80">请求</text></svg>';
const steps={title:'订单机制',steps:[{label:'校验请求',box:{x:20,y:40,width:200,height:80}},{label:'提交事务',detail:'失败时回滚'}]};
async function fixture(t){const root=await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(),'mai-diagram-')));t.after(()=>fs.rm(root,{recursive:true,force:true}));return root;}
test('diagram animation escapes untrusted content, bounds focus and rejects active SVG',()=>{
  const page=animationPage(svg,{title:'<script>alert(1)</script>',steps:[{label:'</script><img onerror=alert(1)>'}]});
  assert.ok(!page.includes('<title><script>'));assert.ok(page.includes('\\u003c/script>'));
  for(const attack of ['<script>alert(1)</script>','<foreignObject/>','<image href="https://example.com/a.png"/>','<rect onload="alert(1)"/>','<!DOCTYPE svg>','<animate attributeName="x"/>'])assert.throws(()=>animationPage(svg.replace('</svg>',attack+'</svg>'),steps));
  assert.throws(()=>animationPage(svg,{steps:[{label:'越界',box:{x:799,y:0,width:2,height:20}}]}));
  assert.throws(()=>animationPage(svg,{steps:[]}));
  assert.throws(()=>animationPage(svg.replace('<rect ', '<rect fill="red" fill="blue" '),steps),/XML 属性重复/);
});
test('animation generation preserves handwritten output and rejects symlink parents',async t=>{
 const root=await fixture(t),input=path.join(root,'图.svg'),model=path.join(root,'步骤.json'),out=path.join(root,'图.html');await fs.writeFile(input,svg);await fs.writeFile(model,JSON.stringify(steps));
 await generate(input,model,out);assert.ok((await fs.readFile(out,'utf8')).includes('mai-diagram-animation:v1'));await generate(input,model,out);
 await fs.writeFile(out,'user content');await assert.rejects(generate(input,model,out),/不是受管/);assert.equal(await fs.readFile(out,'utf8'),'user content');
 await fs.mkdir(path.join(root,'outside'));await fs.symlink(path.join(root,'outside'),path.join(root,'linked'),'dir');await assert.rejects(generate(input,model,path.join(root,'linked','x.html')),/软链接/);
});
test('copied diagram source, binary references and animation install intact; repeat sync and conflict protection',async t=>{
 const root=await fixture(t),home=path.join(root,'home'),project=path.join(root,'project');await fs.mkdir(project);
 const selected={version:1,tools:['codex','claudecode','cursor','copilot','mcode'],skills:['my-create-feature','my-tech-diagram','java-dev']};
 await apply(home,project,selected);
 const relative='.agents/skills/my-tech-diagram/assets/domain-model-cn-er.jpg',target=path.join(project,relative);
 const bytes=await fs.readFile(new URL('../assets/skills/my-tech-diagram/assets/domain-model-cn-er.jpg',import.meta.url));assert.deepEqual(await fs.readFile(target),bytes);
 assert.ok((await doctor(home,project)).healthy);assert.equal((await plan(home,project)).actions.find(a=>a.path===relative).action,'noop');
 for(const dir of ['.claude','.cursor','.github'])assert.deepEqual(await fs.readFile(path.join(project,dir,'skills/my-tech-diagram/assets/domain-model-cn-er.jpg')),bytes);
 const custom=Buffer.from([255,0,1,2]);await fs.writeFile(target,custom);await apply(home,project,selected,undefined,{conflict:'merge'});assert.deepEqual(await fs.readFile(target),custom);
 await apply(home,project,selected,undefined,{conflict:'replace'});assert.deepEqual(await fs.readFile(target),bytes);
});
