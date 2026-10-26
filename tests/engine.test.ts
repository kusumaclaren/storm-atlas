import{describe,it,expect}from'vitest';
import{build,evaluate,recommend}from'../src/engine';
import{DatasetSchema,type Character,type Collection,type Options}from'../src/model';
const c=(id:string,role:Character['role']='DPS',tags:Character['tags']=[],supports:Character['supports']=[]):Character=>({id,name:id,rarity:6,afflatus:'Plant',role,tags,supports,offense:.8,sustain:role==='Healer'?.9:0,actionDemand:.4,description:'test',weakness:'test',sourceUrl:'https://example.com',status:'provisional',verifiedAt:null,image:'/art/test.svg',imageCredit:'test',minInsight:1});
const chars=[c('a','DPS',['poison']),c('b','Support',[],['poison']),c('c','Healer'),c('d'),c('e')];const col:Collection=Object.fromEntries(chars.map(c=>[c.id,{insight:3,portray:0,euphoria:false}]));const o:Options={size:3,lock:'',mode:'general',enemy:'Any',immunePoison:false};
describe('recommendation integrity',()=>{
 it('only owned characters and exact size',()=>{const r=build(chars,{a:col.a,b:col.b,c:col.c},o);expect(r.results).toHaveLength(1);expect(r.results[0].members.map(c=>c.id)).toEqual(['a','b','c']);expect(build(chars,col,{...o,size:4}).results.every(r=>r.members.length===4)).toBe(true);});
 it('enforces locked character',()=>expect(build(chars,col,{...o,lock:'e'}).results.every(r=>r.members.some(c=>c.id==='e'))).toBe(true));
 it('does not manufacture teams for insufficient collection',()=>expect(build(chars,{a:col.a},o).results).toHaveLength(0));
 it('disables poison synergy under immunity',()=>{const team=chars.slice(0,3);expect(evaluate(team,col,{...o,immunePoison:true}).parts[0]).toBe(0);expect(evaluate(team,col,o).parts[0]).toBeGreaterThan(0);});
 it('does not enable mechanics below investment requirement',()=>expect(evaluate(chars.slice(0,3),{...col,b:{...col.b,insight:0}},o).parts[0]).toBe(0));
 it('rarity cannot override synergy',()=>{const team=chars.slice(0,3);const low=team.map(c=>({...c,rarity:3}));expect(evaluate(team,col,o).score).toBe(evaluate(low,col,o).score);expect(evaluate(low,col,o).score).toBeGreaterThan(evaluate([chars[0],chars[3],chars[2]],col,o).score);});
 it('score equals transparent breakdown and is deterministic',()=>{const a=recommend(chars,col,o),b=recommend(chars,col,o);expect(a).toEqual(b);for(const t of a.teams)if(t)expect(t.score).toBeCloseTo(t.parts.reduce((a,b)=>a+b,0),1);});
 it('missing alternative remains missing',()=>expect(recommend(chars.slice(0,3),col,o).teams[1]).toBeUndefined());
 it('rejects duplicate ids and invalid coefficients',()=>{const data={schemaVersion:1,version:'test',updatedAt:'2026-10-26',region:'reference',notes:'',characters:chars};expect(DatasetSchema.safeParse(data).success).toBe(true);expect(DatasetSchema.safeParse({...data,characters:[...chars,chars[0]]}).success).toBe(false);expect(DatasetSchema.safeParse({...data,characters:chars.map(c=>({...c,offense:2}))}).success).toBe(false);});
});
