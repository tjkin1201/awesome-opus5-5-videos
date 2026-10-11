// Runs the SIM block of remakes/anirockshady-032809.html verbatim in Node and checks the descent path and loop seam.
const fs=require('fs');
const html=fs.readFileSync(process.argv[2],'utf8');
const block=html.split('//SIM-BEGIN')[1].split('//SIM-END')[0];
const {PATH,DOM,LOOP,K,stateAt}=new Function(block+';return {PATH,DOM,LOOP,K,stateAt};')();
const bad=PATH.filter(p=>p.some(v=>!Number.isFinite(v))||p[0]<DOM[0]||p[0]>DOM[1]||p[1]<DOM[2]||p[1]>DOM[3]).length;
let rises=0;for(let i=1;i<PATH.length;i++)if(PATH[i][2]>PATH[i-1][2]+1e-9)rises++;
const settle=PATH.findIndex(p=>p[2]-PATH[K][2]<.05*(PATH[0][2]-PATH[K][2])); // first step within 5% of the final loss drop
const first=stateAt(0),last=stateAt(LOOP),end=stateAt(LOOP-.01);
// the ball resets from trough to crest across the seam; that reset is hidden behind fadeG=0 (opaque black), so only camera and alphas must match
const snap=s=>JSON.stringify([s.yaw,s.pitch,s.title,s.caps,s.conv,s.fadeG]);
let nan=0;for(let t=0;t<=LOOP;t+=1/60){const s=stateAt(t);if(Object.values(s).flat().some(v=>!Number.isFinite(v)))nan++}
console.log('path points',PATH.length,'| NaN/out-of-domain',bad,'| loss rises',rises,'| loss',PATH[0][2].toFixed(3),'->',PATH[K][2].toFixed(3));
console.log('settle step',settle,'/',K,'| final |grad|',end.gn.toFixed(4),'| final step',end.step,'/',K,'| trail',end.trail);
console.log('alpha at t=0: title',first.title,'fadeG',first.fadeG,'| at t=LOOP: title',last.title,'fadeG',last.fadeG);
console.log('stateAt(0)===stateAt(LOOP):',snap(first)===snap(last)?'YES':'NO','| NaN frames',nan);
const ok=bad===0&&rises===0&&end.gn<.02&&end.step===K&&first.fadeG===0&&last.fadeG===0&&first.title===0&&last.title===0&&snap(first)===snap(last)&&nan===0;
console.log('SEAM',ok?'PASS':'FAIL');process.exit(ok?0:1);
