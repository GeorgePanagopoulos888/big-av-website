// Run with: node tests/bradley-playback.cjs
const {readFileSync}=require('node:fs');
const {resolve}=require('node:path');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const root=resolve(__dirname,'..');
const source=readFileSync(root+'/agentic-ai/orbit-assets/orbit-show.js','utf8');
function makeContext(code){
 const frames=[];
 const context=vm.createContext({console:{info(){},warn(){},error(){}},window:{matchMedia:()=>({matches:false}),setTimeout,clearTimeout},document:{querySelectorAll:()=>[],body:{classList:{add(){},remove(){},contains(){return false}}}},location:{protocol:'https:',hostname:'big-av.com'},performance,Float32Array,WeakMap,Map,Set,DOMException,setTimeout,clearTimeout,requestAnimationFrame:fn=>(frames.push(fn),frames.length),cancelAnimationFrame(){}});
 vm.runInContext(code,context);
 return {context,frames};
}
(async()=>{
 const {context:c,frames}=makeContext(source);
 let rejectOld;
 c.testAudio={paused:true,currentTime:0,onended:null,onerror:null,pause(){this.paused=true;},play(){this.paused=false;return new Promise((_,reject)=>{rejectOld=reject});}};
 vm.runInContext('showRunning=true',c);
 const first=vm.runInContext('playAudioOnly(testAudio)',c);
 const firstResult=assert.rejects(first,error=>error.name==='AbortError');
 vm.runInContext('stopAudio()',c);
 await firstResult;
 assert(c.testAudio.paused);assert.equal(c.testAudio.currentTime,0);assert.equal(c.testAudio.onended,null);assert.equal(c.testAudio.onerror,null);
 c.testAudio.play=function(){this.paused=false;return Promise.resolve()};
 const replay=vm.runInContext('playAudioOnly(testAudio)',c);
 rejectOld(new Error('late rejection from stopped playback'));await Promise.resolve();await Promise.resolve();
 assert.equal(typeof c.testAudio.onended,'function','stale play rejection must not clear replay handler');
 c.testAudio.onended();await replay;
 assert.equal(vm.runInContext('currentAudio',c),null);assert.equal(vm.runInContext('cancelCurrentPlayback',c),null);
 let cleared=0;
 c.atomMock={querySelectorAll:()=>[{classList:{add(){}}}],set innerHTML(value){cleared++}};
 vm.runInContext('liveAtoms=atomMock',c);
 const swap=vm.runInContext('orbitAccelerateTransition()',c);
 vm.runInContext('showSession+=1',c);
 frames.pop()(performance.now());await swap;
 assert.equal(cleared,0,'stopped animation must not clear a new orbit');
 console.log('PASS: audio stop settles, replay survives delayed rejection, listeners clear, stale orbit swap cancels.');
})().catch(error=>{console.error(error);process.exitCode=1});
