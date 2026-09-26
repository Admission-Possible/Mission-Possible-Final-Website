import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=readFileSync(new URL('../public/intro.js',import.meta.url),'utf8');
function setup({seen=false,reduced=false,hash='',storageError=false}={}){
 const classes=new Set(), events={}, timers=[], elements=[{tagName:'MAIN',inert:false,setAttribute(){},removeAttribute(){}}];
 let overlay=null, focused=false, stored=false;
 const button={addEventListener:(n,f)=>events[n]=f,focus(){document.activeElement=button;}};
 const document={activeElement:null,documentElement:{classList:{add:(...x)=>x.forEach(y=>classes.add(y)),remove:(...x)=>x.forEach(y=>classes.delete(y))}},body:{children:elements,append(x){overlay=x;}},addEventListener:(n,f)=>events[n]=f,createElement:()=>({setAttribute(){},querySelector:()=>button,querySelectorAll:()=>[],addEventListener:(n,f)=>events[n]=f,contains:x=>x===button,remove(){overlay=null;}}),getElementById:()=>overlay,querySelectorAll:()=>elements.filter(x=>x.inert),querySelector:()=>({focus(){focused=true;}})};
 vm.runInNewContext(source,{ResizeObserver:class {observe(){} disconnect(){}},document,location:{hash},matchMedia:()=>({matches:reduced,addEventListener:(n,f)=>events.media=f}),sessionStorage:{getItem(){if(storageError)throw Error();return seen?'1':null;},setItem(){stored=true;}},setTimeout:f=>timers.push(f)});
 return {classes,events,elements,timers,document,state:()=>({overlay:!!overlay,focused,stored})};
}
for(const options of [{seen:true},{reduced:true},{hash:'#pathways'}]) assert.equal(setup(options).classes.size,0);
for(const trigger of ['click','escape','animation','timeout','media']){
 const s=setup(); s.events.DOMContentLoaded(); assert.equal(s.elements[0].inert,true);
 if(trigger==='click')s.events.click();
 if(trigger==='escape')s.events.keydown({key:'Escape'});
 if(trigger==='animation')s.events.animationend({animationName:'intro-exit'});
 if(trigger==='timeout')s.timers[0]();
 if(trigger==='media')s.events.media({matches:true});
 assert.equal(s.classes.size,0);assert.equal(s.elements[0].inert,false);assert.deepEqual(s.state(),{overlay:false,focused:true,stored:true});
}
const blocked=setup({storageError:true});blocked.events.DOMContentLoaded();blocked.events.click();assert.equal(blocked.classes.size,0);
console.log('Intro checks passed: replay, reduced motion, deep links, skip, Escape, completion, fail-safe, preference change and unavailable storage.');
