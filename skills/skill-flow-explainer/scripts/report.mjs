#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
export const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const assert=(x,msg)=>{if(!x)throw new Error(msg)};
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
export function writeNew(p,data){assert(!fs.existsSync(p),'OUTPUT_EXISTS: '+p);fs.mkdirSync(path.dirname(path.resolve(p)),{recursive:true});fs.writeFileSync(p,data,{flag:'wx'});}
export function collect(root){
 root=fs.realpathSync(root);assert(fs.statSync(path.join(root,'SKILL.md')).isFile(),'SKILL_MISSING');
 const files=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){if(['.git','node_modules','__pycache__'].includes(e.name))continue;const full=path.join(dir,e.name),rel=path.relative(root,full).split(path.sep).join('/'),stat=fs.lstatSync(full);if(stat.isSymbolicLink()){files.push({path:rel,excluded:'symbolic-link'});continue;}if(stat.isDirectory()){walk(full);continue;}if(!stat.isFile())continue;const buf=fs.readFileSync(full);const isText=/\.(md|py|mjs|js|ts|json|yaml|yml|html|css|txt|sh)$/.test(e.name)&&buf.length<2000000;files.push({path:rel,sha256:hash(buf),size:buf.length,...(isText?{text:buf.toString('utf8')}:{excluded:'binary-or-size-limit'})});}}
 walk(root);return {schemaVersion:1,collectedAt:new Date().toISOString(),files,sourceHash:hash(JSON.stringify(files.map(({path,sha256,excluded})=>({path,sha256,excluded}))))};
}
export function validate(s,a){
 assert(a.schemaVersion===1&&s.schemaVersion===1,'SCHEMA_VERSION');assert(a.sourceHash===s.sourceHash,'SOURCE_HASH_MISMATCH');
 for(const k of ['title','skill','summary','scope','input','output'])assert(typeof a[k]==='string'&&a[k].trim(),'MISSING_'+k);
 assert(Array.isArray(a.nodes)&&a.nodes.length,'NODES_REQUIRED');const ids=new Set();
 for(const n of a.nodes){assert(/^[a-zA-Z0-9-]+$/.test(n.id)&&!ids.has(n.id),'NODE_ID');ids.add(n.id);for(const k of ['title','purpose','input','output'])assert(typeof n[k]==='string'&&n[k].trim(),'NODE_'+k);assert(Array.isArray(n.dependsOn)&&Array.isArray(n.items),'NODE_ARRAY');for(const i of n.items){assert(['策略','工具','规则','验收'].includes(i.kind)&&['explicit','code','inferred','runtime'].includes(i.basis),'ITEM_TYPE');assert(i.title&&i.text&&i.evidence?.length,'EVIDENCE_REQUIRED');for(const ev of i.evidence){const f=s.files.find(f=>f.path===ev.file);assert(f&&typeof f.text==='string','SOURCE_FILE');const lines=f.text.split('\n');assert(Number.isInteger(ev.start)&&Number.isInteger(ev.end)&&ev.start>0&&ev.end>=ev.start&&ev.end<=lines.length,'SOURCE_LINES');assert(typeof ev.quote==='string'&&ev.quote.trim()&&lines.slice(ev.start-1,ev.end).join('\n').includes(ev.quote),'SOURCE_QUOTE');}}}
 const done=new Set(),visiting=new Set();function visit(id){assert(ids.has(id),'DANGLING_EDGE');assert(!visiting.has(id),'CYCLE');if(done.has(id))return;visiting.add(id);a.nodes.find(n=>n.id===id).dependsOn.forEach(visit);visiting.delete(id);done.add(id);}ids.forEach(visit);
 assert(Array.isArray(a.files)&&a.files.length===s.files.length&&new Set(a.files.map(f=>f.path)).size===s.files.length,'FILE_COVERAGE');for(const f of a.files)assert(s.files.some(x=>x.path===f.path)&&['full','partial','unread','skipped'].includes(f.coverage)&&f.role,'FILE_ROLE');
 for(const k of ['branches','limitations'])assert(Array.isArray(a[k])&&a[k].every(x=>typeof x==='string'),'ARRAY_'+k);
 return {ok:true,nodes:a.nodes.length,claims:a.nodes.reduce((sum,n)=>sum+n.items.length,0),sourceHash:s.sourceHash};
}
export function render(s,a){validate(s,a);const template=fs.readFileSync(new URL('../assets/report.html',import.meta.url),'utf8');assert(template.split('__REPORT_DATA__').length===2,'TEMPLATE_SLOT');return template.replace('__REPORT_DATA__',JSON.stringify(a).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029'));}
export function main(argv){const [cmd,...rest]=argv;const opt={};for(let i=0;i<rest.length;i++){if(rest[i]==='--json')continue;assert(rest[i].startsWith('--')&&rest[i+1]&&!rest[i+1].startsWith('--'),'INVALID_ARGUMENT');opt[rest[i].slice(2)]=rest[++i];}
 if(cmd==='version')return {ok:true,...JSON.parse(fs.readFileSync(new URL('../manifest.json',import.meta.url),'utf8'))};
 if(cmd==='collect'){const s=collect(opt.source);writeNew(opt.out,JSON.stringify(s,null,2));return {ok:true,files:s.files.length,sourceHash:s.sourceHash,output:opt.out};}
 if(['validate','render'].includes(cmd)){const s=read(opt.source),a=read(opt.analysis),v=validate(s,a);if(cmd==='validate')return v;const receipt=opt.out+'.receipt.json';assert(!fs.existsSync(opt.out)&&!fs.existsSync(receipt),'OUTPUT_EXISTS');const html=render(s,a);writeNew(opt.out,html);writeNew(receipt,JSON.stringify({...v,generatedAt:new Date().toISOString(),analysisHash:hash(fs.readFileSync(opt.analysis)),htmlHash:hash(html),targetExecuted:false,semanticReview:'Agent responsibility',operations:['source-evidence-validation','fixed-template-render']},null,2));return {...v,output:opt.out,receipt};}
 return {commands:['collect --source SKILL_DIR --out NEW_JSON','validate --source JSON --analysis JSON','render --source JSON --analysis JSON --out NEW_HTML','version'],managementEntry:'scripts/cli.mjs'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{console.log(JSON.stringify(main(process.argv.slice(2)),null,2));}catch(e){console.error(JSON.stringify({ok:false,error:e.message}));process.exitCode=1;}}
