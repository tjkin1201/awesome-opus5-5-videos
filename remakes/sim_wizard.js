// Runs the SIM block of remakes/zacxbt-944604.html verbatim in Node and checks the loop seam.
const fs=require('fs');
const html=fs.readFileSync(process.argv[2],'utf8');
const block=html.split('//SIM-BEGIN')[1].split('//SIM-END')[0];
const api=new Function('const LW=128,LH=96,HZ=60,LOOP=6,STEPS=LOOP*HZ;'+block+';return {S,P,reset,tick,STEPS,NP};')();
const {S,P,reset,tick,STEPS}=api;
const snap=()=>JSON.stringify([S.state,S.st,S.staff,S.arm,S.head,S.sway,S.gemX,S.gemY,S.shx,S.shy,S.boltOn,S.alive]);
reset();tick();const start=snap();   // state after the first step of a cycle
reset();let maxAlive=0,overflow=0;
for(let i=0;i<STEPS;i++){tick();if(S.alive>maxAlive)maxAlive=S.alive;if(S.alive>=api.NP)overflow++;}
const endAlive=S.alive,endState=S.state,endSt=S.st,endBolt=S.boltOn,endShake=S.shake;
reset();tick();const again=snap();
console.log('steps',STEPS,'| end state',endState,'st',endSt,'| alive at end',endAlive,'| bolt',endBolt,'| shake',endShake.toFixed(2));
console.log('max alive',maxAlive,'/',api.NP,'| pool-full steps',overflow);
console.log('deterministic restart:',start===again?'YES':'NO');
const seam=endAlive===0&&endState===0&&endSt===0&&endBolt===0&&endShake===0&&start===again;
console.log('SEAM',seam?'PASS':'FAIL');process.exit(seam?0:1);
