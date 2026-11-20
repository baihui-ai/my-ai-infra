#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';

const stamp = '<!-- mai-diagram-animation:v1 -->';
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export function animationPage(svg, model) {
  if (typeof svg !== 'string' || svg.length > 8 * 1024 * 1024 || !/<svg\b/i.test(svg)) throw Error('需要有效 SVG，最大 8 MiB');
  if (/<!DOCTYPE|<!ENTITY|<\?(?!xml\s)|<\s*(?:script|foreignObject|iframe|object|embed|animate|animateMotion|animateTransform|set)\b|\bon[a-z]+\s*=|(?:javascript|file):|@import|url\(\s*["']?(?!#)/i.test(svg)) throw Error('SVG 包含脚本、动画或外部资源，请使用静态自包含 SVG');
  for (const match of svg.matchAll(/\b(?:href|src)\s*=\s*["']([^"']*)["']/gi)) {
    if (!/^#[-\w:.]+$/.test(match[1]) && !/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(match[1])) throw Error('SVG 不允许外部引用');
  }
  // HTML can silently repair duplicate XML attributes, while SVG images cannot.
  // Catch this common export failure before producing a broken image wrapper.
  for (const tag of svg.matchAll(/<([A-Za-z_][\w:.-]*)((?:[^<>"']|"[^"]*"|'[^']*')*)>/g)) {
    const names = new Set();
    for (const attribute of tag[2].matchAll(/\s+([A-Za-z_][\w:.-]*)\s*=\s*(?:"[^"]*"|'[^']*')/g)) {
      if (names.has(attribute[1])) throw Error(`SVG XML 属性重复：${attribute[1]}`);
      names.add(attribute[1]);
    }
  }
  const view = svg.match(/\bviewBox\s*=\s*["']([^"']+)["']/i)?.[1]?.trim().split(/[\s,]+/).map(Number);
  if (!view || view.length !== 4 || !view.every(Number.isFinite) || view[2] <= 0 || view[3] <= 0) throw Error('SVG 必须包含有效 viewBox');
  if (!model || !Array.isArray(model.steps) || !model.steps.length || model.steps.length > 100) throw Error('需要 1 至 100 个步骤');
  const steps = model.steps.map(step => {
    if (!step || typeof step.label !== 'string' || !step.label.trim() || step.label.length > 300 || (step.detail !== undefined && (typeof step.detail !== 'string' || step.detail.length > 3000))) throw Error('步骤必须有简短标题与文字说明');
    let box = null;
    if (step.box !== undefined) {
      const { x, y, width, height } = step.box || {};
      if (![x,y,width,height].every(Number.isFinite) || width <= 0 || height <= 0 || x < view[0] || y < view[1] || x + width > view[0] + view[2] || y + height > view[1] + view[3]) throw Error('焦点框必须位于 viewBox 内');
      box = { left: (x-view[0])/view[2]*100, top: (y-view[1])/view[3]*100, width: width/view[2]*100, height: height/view[3]*100 };
    }
    return { label: step.label, detail: step.detail || '', box };
  });
  const title = typeof model.title === 'string' ? model.title : '技术图演示';
  const payload = JSON.stringify(steps).replaceAll('<', '\\u003c');
  const image = Buffer.from(svg).toString('base64');
  return `${stamp}
<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)}</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#f5f6f8;color:#202936;font:16px/1.6 system-ui,sans-serif}main{max-width:1300px;margin:auto;padding:24px}h1{font-size:28px;margin:0 0 8px}.hint{color:#536277}nav{display:flex;flex-wrap:wrap;gap:8px;margin:18px 0}button{font:inherit;background:white;color:inherit;border:1px solid #8995a7;border-radius:8px;padding:8px 16px;cursor:pointer}button:focus-visible{outline:3px solid #3268c8;outline-offset:3px}button:disabled{opacity:.45;cursor:default}.viewport{overflow:auto;border:1px solid #d1d7df;border-radius:12px;background:white}.canvas{position:relative;width:100%;min-width:720px;line-height:0}.canvas img{display:block;width:100%;height:auto}.focus{position:absolute;border:3px solid #2266c8;background:#2266c80c;border-radius:10px;pointer-events:none;transition:opacity .18s;opacity:0}.focus[data-active=true]{opacity:1}.caption{min-height:110px;padding:16px 0;overflow-wrap:anywhere}.caption h2{font-size:19px;margin:0}.caption p{margin:6px 0}#motion{font-size:14px;color:#536277}@media(prefers-reduced-motion:reduce){.focus{transition:none}}@media print{nav,.focus,#motion{display:none}.viewport{overflow:visible}.canvas{min-width:0}body{background:white}main{padding:0}}
</style><main><h1>${escape(title)}</h1><p class="hint">静态全图始终保留。用步骤焦点讲解已有关系，支持小窗口横向查看。</p>
<nav aria-label="图示播放"><button id="play">播放</button><button id="previous">上一步</button><button id="next">下一步</button><button id="reset">重置</button></nav>
<div class="viewport" tabindex="0" role="region" aria-label="完整技术图，可横向滚动"><div class="canvas"><img alt="${escape(title)}：完整静态图" src="data:image/svg+xml;base64,${image}"><div class="focus" aria-hidden="true"></div></div></div>
<section class="caption" aria-live="polite" aria-atomic="true"><h2 id="step"></h2><p id="detail"></p></section><p id="motion"></p>
<noscript>当前浏览器未启用脚本，完整静态图仍可阅读。</noscript></main>
<script type="application/json" id="steps">${payload}</script>
<script>
const steps=JSON.parse(document.querySelector('#steps').textContent),focus=document.querySelector('.focus'),play=document.querySelector('#play'),previous=document.querySelector('#previous'),next=document.querySelector('#next'),reduced=matchMedia('(prefers-reduced-motion: reduce)');let index=0,timer=null;
function stop(){clearInterval(timer);timer=null;play.textContent='播放';play.setAttribute('aria-pressed','false');}
function show(){const s=steps[index];document.querySelector('#step').textContent=(index+1)+' / '+steps.length+' · '+s.label;document.querySelector('#detail').textContent=s.detail;focus.dataset.active=String(Boolean(s.box));if(s.box)for(const k of ['left','top','width','height'])focus.style[k]=s.box[k]+'%';previous.disabled=index===0;next.disabled=index===steps.length-1;play.disabled=reduced.matches||steps.length<2;document.querySelector('#motion').textContent=reduced.matches?'系统已启用减少动画，可手动逐步查看。':'播放到末步自动停止，离开页面或图示区域时暂停。';}
play.onclick=()=>{if(timer){stop();return;}if(index===steps.length-1)index=0;show();play.textContent='暂停';play.setAttribute('aria-pressed','true');timer=setInterval(()=>{if(index<steps.length-1)index++;show();if(index===steps.length-1)stop();},1800);};
previous.onclick=()=>{stop();index=Math.max(0,index-1);show();};next.onclick=()=>{stop();index=Math.min(steps.length-1,index+1);show();};document.querySelector('#reset').onclick=()=>{stop();index=0;show();};
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});reduced.addEventListener('change',()=>{stop();show();});new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)stop();}).observe(document.querySelector('.viewport'));show();
</script></html>\n`;
}
async function noLinks(filename) {
  let current = path.parse(filename).root;
  for (const part of filename.slice(current.length).split(path.sep)) {
    current = path.join(current, part);
    try { if ((await fs.lstat(current)).isSymbolicLink()) throw Error(`不能沿软链接写入：${current}`); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
}
export async function generate(svgFile, stepsFile, output) {
  const html = animationPage(await fs.readFile(svgFile,'utf8'), JSON.parse(await fs.readFile(stepsFile,'utf8')));
  output = path.resolve(output);
  // Resolve the OS-provided temporary root alias (e.g. macOS /var -> /private/var).
  // Links beneath this trusted root, including user output links, remain forbidden.
  const temporaryRoot = path.resolve(os.tmpdir());
  if (output.startsWith(temporaryRoot + path.sep)) output = path.join(await fs.realpath(temporaryRoot), path.relative(temporaryRoot, output));
  await noLinks(output);
  let existing;
  try { existing = await fs.readFile(output,'utf8'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (existing !== undefined && !existing.startsWith(stamp)) throw Error('输出已存在且不是受管动画页');
  await fs.mkdir(path.dirname(output),{recursive:true});
  await fs.writeFile(output,html,{flag:existing === undefined?'wx':'w'});
  return output;
}
if (process.argv[1] && import.meta.url === pathToFileURL(await fs.realpath(process.argv[1])).href) {
  const args=process.argv.slice(2), values={};
  for(let i=0;i<args.length;i+=2){if(!['--svg','--steps','--out'].includes(args[i])||!args[i+1]||values[args[i]])throw Error('用法：--svg 图.svg --steps 步骤.json --out 图.html');values[args[i]]=args[i+1];}
  if(Object.keys(values).length!==3)throw Error('需要 --svg、--steps、--out');
  generate(values['--svg'],values['--steps'],values['--out']).then(console.log).catch(error=>{console.error(error.message);process.exitCode=1;});
}
