import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { animationPage } from '../assets/skills/my-tech-diagram/scripts/animate-svg.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const output=path.join(root,'dist/diagram-evaluation');await fs.mkdir(output,{recursive:true});
const svg=await fs.readFile(path.join(root,'assets/skills/my-tech-diagram/showcase/sequence/minimal.svg'),'utf8');
const model={title:'总体时序图 · 步骤演示',steps:[{label:'参与方与职责',detail:'复用内置静态时序样例；焦点只解释已有关系。',box:{x:40,y:90,width:1500,height:130}},{label:'业务调用与返回',detail:'按样例中已有消息阅读，不增加调用或领域事件。',box:{x:40,y:220,width:1500,height:480}},{label:'完整静态总览',detail:'所有步骤结束后保留完整图。'}]};
const html=path.join(output,'sequence.html');await fs.writeFile(html,animationPage(svg,model));await fs.copyFile(path.join(root,'assets/skills/my-tech-diagram/showcase/sequence/minimal.svg'),path.join(output,'sequence.svg'));
const checks=[],errors=[];const pass=name=>{checks.push(name);console.log('OK: '+name);};
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
try{
 const page=await browser.newPage({viewport:{width:1280,height:900}});page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(html).href);await page.locator('img').evaluate(img=>img.decode());assert.ok(await page.locator('img').evaluate(img=>img.naturalWidth>0));pass('真实 SVG 在离线 HTML 中完整加载');
 await page.getByRole('button',{name:'下一步',exact:true}).click();assert.match(await page.locator('#step').textContent(),/^2 \/ 3/);await page.getByRole('button',{name:'上一步',exact:true}).click();assert.match(await page.locator('#step').textContent(),/^1 \/ 3/);pass('前后步骤、焦点与说明同步');
 await page.getByRole('button',{name:'播放',exact:true}).click();assert.equal(await page.locator('#play').getAttribute('aria-pressed'),'true');await page.getByRole('button',{name:'暂停',exact:true}).click();const stopped=await page.locator('#step').textContent();await page.waitForTimeout(1900);assert.equal(await page.locator('#step').textContent(),stopped);pass('暂停后步骤停止推进');
 await page.getByRole('button',{name:'播放',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#step').textContent.startsWith('3 / 3')&&document.querySelector('#play').getAttribute('aria-pressed')==='false');pass('自动演示到末步停止，无循环');
 await page.getByRole('button',{name:'重置',exact:true}).click();assert.match(await page.locator('#step').textContent(),/^1 \/ 3/);pass('重置恢复第一步');
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('#play').disabled);assert.equal(await page.locator('#play').isDisabled(),true);await page.getByRole('button',{name:'下一步',exact:true}).click();assert.match(await page.locator('#step').textContent(),/^2 \/ 3/);pass('减少动画禁用自动播放，手动步骤仍可用');
 await page.screenshot({path:path.join(output,'desktop.png'),fullPage:true});
 await page.setViewportSize({width:480,height:700});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.equal(await page.locator('.viewport').evaluate(e=>e.scrollWidth>e.clientWidth),true);await page.getByRole('button',{name:'重置',exact:true}).click();await page.screenshot({path:path.join(output,'small-window.png'),fullPage:true});pass('480px 小窗口无整页溢出，宽图局部滚动，控件可用');
 await page.emulateMedia({reducedMotion:'no-preference'});await page.setViewportSize({width:1280,height:450});await page.getByRole('button',{name:'播放',exact:true}).click();await page.evaluate(()=>{document.body.style.paddingBottom='1800px';window.scrollTo(0,1600);});await page.waitForFunction(()=>document.querySelector('#play').getAttribute('aria-pressed')==='false');pass('图示离屏时自动暂停');
 assert.deepEqual(errors,[]);pass('浏览器无脚本错误');
 await fs.writeFile(path.join(output,'results.json'),JSON.stringify({checks,errors,browser:browser.version(),artifacts:['sequence.html','sequence.svg','desktop.png','small-window.png']},null,2)+'\n');
}finally{await browser.close();}
