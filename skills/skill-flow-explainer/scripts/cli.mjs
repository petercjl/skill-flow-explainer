#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';
import {main as reportMain} from './report.mjs';
import {source,identity,json,fail,sourceReceipt,status,install,doctor,checkUpdate,updateInstall,recover} from './lifecycle.mjs';
const caps=()=>json(path.join(source,'management.json'));
export async function run(argv){
 let cmd=argv.shift()||'help';if(cmd==='--help')cmd='help';if(['skill','update'].includes(cmd))cmd+=' '+(argv.shift()||'help');
 const spec=caps().commandContracts[cmd];if(!spec)fail('UNKNOWN_COMMAND',{command:cmd});const opts={};
 for(let i=0;i<argv.length;i++){const flag=argv[i],o=spec.options[flag];if(!o||Object.hasOwn(opts,flag))fail('INVALID_ARGUMENT',{flag});if(o.type==='boolean')opts[flag]=true;else{if(!argv[i+1]||argv[i+1].startsWith('--'))fail('MISSING_VALUE',{flag});opts[flag]=argv[++i];}}
 if(opts['--help']||cmd==='help')return {ok:true,...caps(),options:spec.options};for(const [k,v]of Object.entries(spec.options))if(v.required&&!opts[k])fail('REQUIRED_ARGUMENT',{flag:k});
 if(opts['--name']&&opts['--name']!==identity().name)fail('SKILL_NOT_FOUND');
 if(cmd==='version')return {ok:true,...identity()};if(cmd==='capabilities')return {ok:true,...caps()};if(cmd==='doctor')return doctor();
 if(cmd==='skill source'){const r=sourceReceipt();return {...caps(),...r,complete:true,skills:[r]};}
 if(cmd==='skill status')return status(opts['--target'],opts['--agent']);
 if(['skill install','skill update'].includes(cmd))return install(opts['--target'],opts['--agent']);
 if(cmd==='update check')return checkUpdate();
 if(cmd==='update install')return updateInstall(opts['--target'],opts['--agent'],opts['--version'],opts['--yes'],opts['--package-file']);
 if(cmd==='update recover')return recover(opts['--target'],opts['--agent'],opts['--yes']);
 if(cmd==='update status'){status(opts['--target'],opts['--agent']);const state=opts['--target']+'.update-state.json';return {ok:true,operation:fs.existsSync(state)?json(state):null};}
 if(cmd==='prepare')return {...doctor(),update:await checkUpdate({automatic:true})};
 const businessArgs=[cmd];for(const [k,v]of Object.entries(opts))if(k!=='--json')businessArgs.push(k,v);if(cmd==='collect'){const update=await checkUpdate({automatic:true});return {...reportMain(businessArgs),update};}return reportMain(businessArgs);
}
try{const result=await run(process.argv.slice(2));console.log(JSON.stringify(result,null,2));if(result.ok===false)process.exitCode=1;}catch(e){console.error(JSON.stringify({ok:false,error:{code:e.code||'COMMAND_FAILED',message:e.message,details:e.details||{}}}));process.exitCode=1;}
