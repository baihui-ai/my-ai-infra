import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createHash, randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec=promisify(execFile),root=fileURLToPath(new URL('../',import.meta.url));
const argumentsList=process.argv.slice(2),options={};
for(let i=0;i<argumentsList.length;i++){
  const key=argumentsList[i];
  if(key==='--offline')options.offline=true;
  else if(['--runs','--artifacts'].includes(key)&&argumentsList[i+1])options[key.slice(2)]=argumentsList[++i];
  else throw Error('Usage: npm run eval:java -- [--offline] [--runs DIR] [--artifacts DIR]');
}
const runs=path.resolve(options.runs||path.join(root,'dist/java-norms-evaluation'));
const artifacts=path.resolve(options.artifacts||path.join(runs,'runtime-verification'));
const fixture=path.join(root,'assets/skills/java-dev/evals/project-adaptation');
const configurations=['with_skill','without_skill'];
for(const configuration of configurations){
  const actual=await fs.readFile(path.join(runs,configuration,'outputs/pom.xml'));
  if(!actual.equals(await fs.readFile(path.join(fixture,'input/pom.xml'))))throw Error('Evaluation POM changed; review it before running Maven');
}
await fs.mkdir(artifacts,{recursive:true});
if((await fs.lstat(artifacts)).isSymbolicLink())throw Error('Artifact directory cannot be a symlink');
const work=await fs.mkdtemp(path.join(artifacts,'run-')),repository=path.join(artifacts,'m2');
await fs.mkdir(repository,{recursive:true});
if((await fs.lstat(repository)).isSymbolicLink())throw Error('Evaluation repository cannot be a symlink');
const settings=path.join(work,'settings.xml');await fs.writeFile(settings,'<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"/>\n');
const environment={...process.env};for(const key of ['JAVA_TOOL_OPTIONS','_JAVA_OPTIONS','JDK_JAVA_OPTIONS','MAVEN_OPTS','MAVEN_ARGS'])delete environment[key];
let currentChild,cancelled=false,container;
const report={checkedAt:new Date().toISOString(),platform:process.platform,host:os.arch(),configurations:{},limitations:['One synthetic MySQL dataset, not production-scale performance or concurrent scheduler verification.','Spring repository factory is real; full Boot application and scheduler wiring are not tested.']};
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>{cancelled=true;currentChild?.kill('SIGTERM');});
async function run(command,args,log){
  if(cancelled)throw Error('Evaluation cancelled');
  const operation=exec(command,args,{cwd:work,env:environment,timeout:360000,maxBuffer:16*1024*1024});currentChild=operation.child;
  try{const result=await operation;if(log)await fs.writeFile(log,result.stdout+result.stderr);return result;}
  catch(error){if(log)await fs.writeFile(log,(error.stdout||'')+(error.stderr||''));throw error;}
  finally{currentChild=null;}
}
async function downloaded(url){
  const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(60000)});
  if(!response.ok)throw Error('Public artifact download failed: '+response.status);
  const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length>50*1024*1024)throw Error('Public artifact exceeds evaluation size limit');return bytes;
}
async function repairCentral(log){
  if(options.offline)return false;
  const coordinates=[...log.matchAll(/Could not transfer artifact ([A-Za-z0-9_.:-]+) from\/to central/g)].map(match=>match[1]);
  if(!coordinates.length)return false;
  for(const coordinate of new Set(coordinates)){
    const parts=coordinate.split(':');if(![4,5].includes(parts.length))return false;
    const [group,artifact,type]=parts,version=parts.at(-1),classifier=parts.length===5?'-'+parts[3]:'';
    if(![group,artifact,type,version,classifier||'none'].every(part=>/^[A-Za-z0-9_.-]+$/.test(part)&&!part.includes('..')))return false;
    const relative=group.replaceAll('.','/')+'/'+artifact+'/'+version+'/'+artifact+'-'+version+classifier+'.'+type;
    const url='https://repo.maven.apache.org/maven2/'+relative;
    const [bytes,checksum]=await Promise.all([downloaded(url),downloaded(url+'.sha1')]);
    const expected=checksum.toString('utf8').trim().split(/\s/)[0];
    if(!/^[a-f0-9]{40}$/i.test(expected)||createHash('sha1').update(bytes).digest('hex')!==expected.toLowerCase())throw Error('Maven Central checksum mismatch');
    const target=path.join(repository,relative);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,bytes);
    console.log('Verified interrupted public artifact: '+coordinate);
  }
  return true;
}
async function mavenCommand(){
  const home=process.env.MAI_MAVEN_HOME||process.env.MAVEN_HOME;
  if(!home){if(process.platform==='win32')throw Error('Set MAI_MAVEN_HOME to the Maven installation directory on Windows');return ['mvn',[]];}
  const boot=path.join(home,'boot'),jars=(await fs.readdir(boot)).filter(name=>/^plexus-classworlds-.*\.jar$/.test(name));
  if(jars.length!==1)throw Error('Maven boot launcher is ambiguous');
  return ['java',['-Dclassworlds.conf='+path.join(home,'bin/m2.conf'),'-Dmaven.home='+home,'-Dmaven.multiModuleProjectDirectory='+work,'-classpath',path.join(boot,jars[0]),'org.codehaus.plexus.classworlds.launcher.Launcher']];
}
async function compile(configuration){
  const target=path.join(work,configuration),source=path.join(runs,configuration,'outputs');await fs.mkdir(target);
  await fs.cp(path.join(source,'src'),path.join(target,'src'),{recursive:true});await fs.copyFile(path.join(source,'pom.xml'),path.join(target,'pom.xml'));
  const [command,prefix]=await mavenCommand();
  for(let attempt=1;attempt<=3;attempt++){
    const log=path.join(target,`compile-${attempt}.log`);
    try{await run(command,[...prefix,...(options.offline?['-o']:['-U']),'--batch-mode','--no-transfer-progress','-s',settings,'-gs',settings,'-Dmaven.repo.local='+repository,'-Dproject.build.sourceEncoding=UTF-8','-f',path.join(target,'pom.xml'),'org.apache.maven.plugins:maven-compiler-plugin:3.13.0:compile','org.apache.maven.plugins:maven-dependency-plugin:3.7.1:build-classpath','-Dmdep.outputFile=classpath.txt'],log);break;}
    catch(error){if(attempt===3||!await repairCentral(await fs.readFile(log,'utf8')))throw error;}
  }
  console.log('Compiled frozen '+configuration+' sources with Java 17');return target;
}
async function fingerprints(directory){
  const result={};
  async function visit(relative){for(const item of await fs.readdir(path.join(directory,relative),{withFileTypes:true})){const name=path.posix.join(relative,item.name);if(item.isDirectory())await visit(name);else if(item.isFile())result[name]=createHash('sha256').update(await fs.readFile(path.join(directory,name))).digest('hex');else throw Error('Evaluation source contains an unsupported link');}}
  await visit('src');await visit('db');result['pom.xml']=createHash('sha256').update(await fs.readFile(path.join(directory,'pom.xml'))).digest('hex');return result;
}
const frozen=Object.fromEntries(await Promise.all(configurations.map(async configuration=>[configuration,await fingerprints(path.join(runs,configuration,'outputs'))])));
report.sourceFingerprints=frozen;report.probeSha256=createHash('sha256').update(await fs.readFile(path.join(fixture,'JavaRuntimeProbe.java'))).digest('hex');
report.compilerPlugin='org.apache.maven.plugins:maven-compiler-plugin:3.13.0';
try{
  await run('docker',['info','--format','{{.ServerVersion}}']);
  const java=await run('java',['-version']);report.javaVersion=(java.stderr||java.stdout).trim();
  const driver=path.join(artifacts,'mysql-connector-j-8.4.0.jar'),driverHash='d77962877d010777cff997015da90ee689f0f4bb76848340e1488f2b83332af5';
  let bytes=await fs.readFile(driver).catch(error=>{if(error.code==='ENOENT')return null;throw error;});
  if(!bytes){if(options.offline)throw Error('Offline JDBC driver missing');bytes=await downloaded('https://repo.maven.apache.org/maven2/com/mysql/mysql-connector-j/8.4.0/mysql-connector-j-8.4.0.jar');await fs.writeFile(driver,bytes);}
  if(createHash('sha256').update(bytes).digest('hex')!==driverHash)throw Error('Pinned JDBC driver checksum mismatch');
  container='mai-java-eval-'+randomUUID();
  await run('docker',['run','--detach',...(options.offline?['--pull','never']:[]),'--rm','--name',container,'--label','my-ai-infra-evaluation=true','--tmpfs','/var/lib/mysql:rw,size=536870912','--env','MYSQL_ALLOW_EMPTY_PASSWORD=yes','--env','MYSQL_ROOT_HOST=%','--publish','127.0.0.1::3306','mysql:8.4']);
  const info=JSON.parse((await run('docker',['inspect',container])).stdout)[0];
  if(info.Config.Labels['my-ai-infra-evaluation']!=='true')throw Error('Test container ownership changed');
  const binding=info.NetworkSettings.Ports['3306/tcp']?.[0];if(binding?.HostIp!=='127.0.0.1')throw Error('Test database is not bound to loopback');
  report.mysqlImageId=info.Image;
  let ready=false;for(let attempt=0;attempt<120;attempt++){try{await run('docker',['exec',container,'mysqladmin','ping','--silent']);ready=true;break;}catch{if(cancelled)throw Error('Evaluation cancelled');await new Promise(resolve=>setTimeout(resolve,500));}}
  if(!ready)throw Error('Isolated MySQL did not become ready');
  for(const configuration of configurations){
    const target=await compile(configuration),dependencies=(await fs.readFile(path.join(target,'classpath.txt'),'utf8')).trim();
    const classpath=[path.join(target,'target/classes'),driver,dependencies].join(path.delimiter),probeClasses=path.join(target,'probe-classes');
    await run('javac',['--release','17','-encoding','UTF-8','-cp',classpath,'-d',probeClasses,path.join(fixture,'JavaRuntimeProbe.java')],path.join(target,'probe-compile.log'));
    const source=path.join(runs,configuration,'outputs'),runtimeLog=path.join(target,'runtime.log');
    const result=await run('java',['-cp',probeClasses+path.delimiter+classpath,'example.order.JavaRuntimeProbe',binding.HostPort,'mai_eval_'+configuration,path.join(source,'db/schema.sql'),path.join(source,'db/order-export-record.sql')],runtimeLog);
    const lines=result.stdout.split(/\r?\n/),checks=lines.filter(line=>line.startsWith('CHECK\tPASS\t')).map(line=>line.slice(11));
    if(checks.length!==9||!lines.includes('RESULT\tPASS'))throw Error('Runtime probe did not complete every check');
    report.configurations[configuration]={compiled:true,checks,mysql:lines.find(line=>line.startsWith('MYSQL\t'))?.slice(6),plans:lines.filter(line=>/^(ORM_PLAN|PLAN)\t/.test(line)),log:path.relative(artifacts,runtimeLog)};
    console.log(configuration+': '+checks.length+' real MySQL checks passed');
  }
  for(const configuration of configurations)if(JSON.stringify(frozen[configuration])!==JSON.stringify(await fingerprints(path.join(runs,configuration,'outputs'))))throw Error('Frozen executor sources changed during verification');
  report.frozenSourcesUnchanged=true;report.status='passed';
}catch(error){report.status='failed';report.error=error.message;process.exitCode=1;}
finally{
  if(container){try{await exec('docker',['rm','--force','--volumes',container],{timeout:30000});report.containerRemoved=true;}catch(error){report.containerRemoved=false;report.cleanupError=error.message;process.exitCode=1;}}
  await fs.writeFile(path.join(work,'results.json'),JSON.stringify(report,null,2)+'\n');
  await fs.writeFile(path.join(artifacts,'latest.json'),JSON.stringify({run:path.basename(work),status:report.status},null,2)+'\n');
  console.log('Runtime evaluation report: '+path.join(work,'results.json'));if(report.status!=='passed')console.error(report.error);
}
