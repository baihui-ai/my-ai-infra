import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root=fileURLToPath(new URL('../',import.meta.url));
const workspace=path.resolve(process.argv[2] || path.join(root,'dist/diagram-semantic-evaluation'));
const configurations=process.argv[3]?[process.argv[3]]:['with_skill','without_skill'];
if(configurations.some(c=>!['with_skill','without_skill'].includes(c)))throw Error('Configuration must be with_skill or without_skill');
async function files(dir){const result=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){if(e.isSymbolicLink())throw Error('Evaluation outputs must be ordinary files');const p=path.join(dir,e.name);if(e.isDirectory())result.push(...await files(p));else result.push(p);}return result;}
const expected={1:['提交订单','订单已提交','创建订单','订单已创建','拒绝订单','订单已拒绝','查询订单','校验库存','库存已校验','扣减库存','库存已扣减','发起支付','支付已发起','确认支付','支付已确认'],3:['React','Spring Boot','PostgreSQL','Redis','微信支付','顺丰物流'],4:['创建线索','线索已创建','分配线索','线索已分配','转化线索','线索已转化','查询线索','创建客户','客户已创建','修改客户信息','客户信息已修改','查询客户','上传合同','合同已上传','确认合同双方签署','合同已双方签署','作废合同','合同已作废'],5:['Contract','ContractAttachment','Money','Project','Supplier'],6:['Order','OrderLine','Money','Customer','Payment'],7:['Order',...Array.from({length:16},(_,i)=>'Item'+String(i+1).padStart(2,'0'))],8:['创建订单','订单已创建','查询订单','支付已确认'],9:['浏览器','网关','应用','数据库','HTTPS','HTTP','MySQL'],10:['认证','内容','登录','退出','创建','审核','发布','运营后台'],14:['浏览器','网关','应用','数据库','HTTPS','HTTP','MySQL']};
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
const runs=[];
try{
 for(const entry of await fs.readdir(workspace,{withFileTypes:true})){
  if(!entry.isDirectory()||!/^eval-\d+$/.test(entry.name))continue;
  const id=Number(entry.name.slice(5)),metadata=JSON.parse(await fs.readFile(path.join(workspace,entry.name,'eval_metadata.json'),'utf8'));
  for(const configuration of configurations){
   const run=path.join(workspace,entry.name,configuration),out=path.join(run,'outputs');
   let outputs;try{outputs=await files(out);}catch(error){if(error.code==='ENOENT'){runs.push({id,configuration,status:'missing',checks:[]});continue;}throw error;}
   const checks=[],check=(name,passed,evidence)=>checks.push({name,passed,evidence});
   const svgFiles=outputs.filter(p=>p.endsWith('.svg')),htmlFiles=outputs.filter(p=>p.endsWith('.html')&&!/^(preview|render)/i.test(path.basename(p)));
   const markdown=await Promise.all(outputs.filter(p=>p.endsWith('.md')).map(p=>fs.readFile(p,'utf8')));
   if(id===2){check('缺信息时没有生成图或动画',svgFiles.length===0&&htmlFiles.length===0,`${svgFiles.length} SVG; ${htmlFiles.length} HTML`);check('明确请求缺失的领域资料',/实体|聚合|上下文|关系/.test(markdown.join('\n')),markdown.join('\n').slice(0,500));}
   else if(id===13){check('简单查询未生成图或动画',svgFiles.length===0&&htmlFiles.length===0,`${svgFiles.length} SVG; ${htmlFiles.length} HTML`);const text=markdown.join('\n');const fields=['/api/products','items','total','page','size','400','401','403','20','100','active','disabled'];check('完整契约包含给定字段与边界',fields.every(f=>text.includes(f)),fields.filter(f=>!text.includes(f)).join(',')||'全部出现；完整语义另行评审');}
   else{
    check('仅一张完整静态图',svgFiles.length===1,svgFiles.map(p=>path.relative(out,p)).join(', '));
    check('有独立关系模型',outputs.some(p=>/model.*\.(md|json)$|\.model\.(md|json)$/.test(path.basename(p))),outputs.filter(p=>/model/.test(path.basename(p))).map(p=>path.relative(out,p)).join(', '));
    if(svgFiles.length){
     const page=await browser.newPage({offline:true,viewport:{width:id===7?2000:1600,height:1100}});const errors=[];page.on('pageerror',e=>errors.push(e.message));const svgSource=await fs.readFile(svgFiles[0],'utf8');await page.setContent(`<html><head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:"><style>body{margin:0}svg{display:block;width:100%;height:auto}</style></head><body>${svgSource}</body></html>`);await page.evaluate(()=>document.fonts.ready);
     const data=await page.evaluate(()=>{const svg=document.querySelector('svg');if(!svg)return null;const nodes=[...svg.querySelectorAll('[data-node-id], [data-node="true"][id]')],edges=[...svg.querySelectorAll('[data-edge-id], [data-relation="true"][id]')];const overflow=[];for(const node of nodes){const rect=node.querySelector('rect');if(!rect)continue;const b=rect.getBoundingClientRect();for(const t of node.querySelectorAll('text')){if(t.closest('[data-node-id], [data-node="true"][id]')!==node)continue;const q=t.getBoundingClientRect();if(q.left<b.left-2||q.top<b.top-2||q.right>b.right+2||q.bottom>b.bottom+2)overflow.push(t.textContent);}}return {text:svg.textContent,nodeIds:nodes.map(n=>n.dataset.nodeId||n.id),edgeIds:edges.map(n=>n.dataset.edgeId||n.id),arrowCount:svg.querySelectorAll('[marker-end],[marker-start]').length,overflow,viewBox:svg.getAttribute('viewBox'),parseError:Boolean(document.querySelector('parsererror'))};});
     if(data)data.parseError=await page.evaluate(source=>new DOMParser().parseFromString(source,'image/svg+xml').querySelector('parsererror')?.textContent||'',svgSource);
     check('SVG 可解析且有 viewBox',Boolean(data?.viewBox)&&!data?.parseError,JSON.stringify({viewBox:data?.viewBox,parseError:data?.parseError,errors}));
     if(data){
      if(expected[id])check('已确认元素完整',expected[id].every(term=>data.text.replace(/\s+/g,'').includes(term.replace(/\s+/g,''))),expected[id].filter(term=>!data.text.replace(/\s+/g,'').includes(term.replace(/\s+/g,''))).join(',')||'元素均出现，关系语义仍需人工核对');
      if([1,4,8,12].includes(id))check('事件图无关系箭头',data.arrowCount===0&&data.edgeIds.length===0,JSON.stringify({arrows:data.arrowCount,edges:data.edgeIds.length}));
      if(id===6)check('五类型四关系且ID唯一',data.nodeIds.length===5&&data.edgeIds.length===4&&new Set(data.nodeIds).size===5,JSON.stringify({nodes:data.nodeIds,edges:data.edgeIds}));
      if(id===7)check('17类型16关系完整且ID唯一',data.nodeIds.length===17&&data.edgeIds.length===16&&new Set(data.nodeIds).size===17,JSON.stringify({nodes:data.nodeIds.length,edges:data.edgeIds.length}));
      if(configuration==='with_skill')check('节点内文字未越界',data.overflow.length===0,data.overflow.join(';')||'浏览器实际文本边界位于卡片内；连线/标签另行目检');
     }
     await page.screenshot({path:path.join(run,'root-svg.png'),fullPage:true});await page.close();
    }
    for(const file of htmlFiles){const context=await browser.newContext({offline:true,viewport:{width:480,height:700}});const page=await context.newPage();const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});await page.goto(pathToFileURL(file).href);await page.waitForTimeout(100);check('动画HTML离线加载且小窗口无整页溢出',errors.length===0&&requests.length===0&&await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),JSON.stringify({file:path.basename(file),errors,requests}));await page.screenshot({path:path.join(run,'root-animation.png'),fullPage:true});await context.close();}
   }
   const result={id,configuration,assertions:metadata.assertions,checks,status:checks.every(c=>c.passed)?'mechanical-pass':'needs-review',scope:'机械检查；不能代替全部业务语义断言'};runs.push(result);await fs.writeFile(path.join(run,'mechanical.json'),JSON.stringify(result,null,2)+'\n');console.log(`${entry.name} ${configuration}: ${result.status}`);
  }
 }
 await fs.writeFile(path.join(workspace,'mechanical-results.json'),JSON.stringify({runs},null,2)+'\n');
}finally{await browser.close();}
if(runs.some(r=>r.status!=='mechanical-pass'))process.exitCode=1;
