import type {Character,Collection,Options,Result} from './model';
export const labels=['Sinergi','Ofensif','Sustain','Efisiensi aksi','Encounter'];
export const weights=[30,20,20,15,15];
const advantages:Record<string,string>={Beast:'Plant',Plant:'Star',Star:'Mineral',Mineral:'Beast',Spirit:'Intellect',Intellect:'Spirit'};
export function evaluate(members:Character[],collection:Collection,o:Options):Result{
 const reasons:string[]=[],warnings:string[]=[];
 const active=members.filter(c=>collection[c.id]?.insight>=c.minInsight);
 let links=0;
 for(const a of active)for(const b of active){if(a.id===b.id)continue;const match=a.supports.filter(t=>b.tags.includes(t)&&!(o.immunePoison&&t==='poison'));if(match.length){links+=Math.min(match.length,2);reasons.push(`${a.name} → ${b.name}: dukungan ${match.join(', ')} cocok dengan mekanisme penerima (model kualitatif).`);}}
 const sy=Math.min(1,links/(o.size===3?3:5));
 const damage=Math.min(1,members.reduce((n,c)=>n+c.offense*(o.immunePoison&&c.tags.includes('poison')?.35:1),0)/(o.mode==='waves'?1.8:1.6));
 const sustain=Math.min(1,members.reduce((n,c)=>n+c.sustain,0)/(o.mode==='boss'?1:.75));
 const demand=members.reduce((n,c)=>n+c.actionDemand,0);
 const action=Math.max(0,1-Math.max(0,demand-(o.size===3?1.5:2))/.9);
 const relevant=o.mode==='boss'?members.some(c=>c.tags.includes('ultimate')||c.tags.includes('poison')):o.mode==='waves'?members.filter(c=>c.offense>=.6).length>=2:true;
 const match=members.reduce((n,c)=>n+(o.enemy==='Any'?.5:advantages[c.afflatus]===o.enemy?1:advantages[o.enemy]===c.afflatus?0:.5),0)/members.length;
 const encounter=.5*match+.5*(relevant?1:.3);
 const parts=[sy,damage,sustain,action,encounter].map((v,i)=>Math.round(v*weights[i]*10)/10);
 if(sustain<.7)warnings.push('Sustain terbatas untuk preset ini; kemampuan bertahan belum disimulasikan.');
 if(action<.7)warnings.push('Beberapa anggota berebut aksi; rotasi memerlukan kompromi.');
 if(o.immunePoison&&members.some(c=>c.tags.includes('poison')))warnings.push('Musuh kebal Poison: bonus sinergi Poison dinonaktifkan dan kontribusi ofensif terkait dikurangi.');
 for(const c of members){if(!active.includes(c))warnings.push(`${c.name}: Insight belum memenuhi asumsi mekanisme; bonus sinerginya dinonaktifkan.`);if(collection[c.id]?.euphoria)warnings.push(`${c.name}: Euphoria belum dimodelkan; hasil memakai kit dasar.`);}
 if(!reasons.length)reasons.push('Belum ada aturan sinergi aktif untuk komposisi ini.');
 return {members,parts,score:Math.round(parts.reduce((a,b)=>a+b,0)*10)/10,reasons,warnings};
}
export function build(chars:Character[],collection:Collection,o:Options){
 const pool=chars.filter(c=>collection[c.id]); const results:Result[]=[];let evaluated=0;const limit=250000;let truncated=false;
 function walk(start:number,team:Character[]){if(evaluated>=limit){truncated=true;return;}if(team.length===o.size){evaluated++;if(o.lock&&!team.some(c=>c.id===o.lock))return;results.push(evaluate(team,collection,o));if(results.length>1200){results.sort((a,b)=>b.score-a.score);results.length=100;}return;}for(let i=start;i<=pool.length-(o.size-team.length);i++){walk(i+1,[...team,pool[i]]);if(truncated)break;}}
 walk(0,[]);results.sort((a,b)=>b.score-a.score||a.members.map(c=>c.id).join().localeCompare(b.members.map(c=>c.id).join()));
 return {results:results.slice(0,100),evaluated,truncated};
}
export function recommend(chars:Character[],collection:Collection,o:Options){
 const general=build(chars,collection,{...o,mode:'general'});const mode=build(chars,collection,o);const first=general.results[0];
 const key=(r:Result)=>r.members.map(c=>c.id).sort().join();
 const alt=general.results.find(r=>first&&key(r)!==key(first)&&r.members.some(c=>c.role==='DPS'&&!first.members.some(a=>a.id===c.id)))??general.results.find(r=>first&&key(r)!==key(first));
 return {teams:[first,alt,mode.results[0]],evaluated:general.evaluated+mode.evaluated,truncated:general.truncated||mode.truncated};
}
