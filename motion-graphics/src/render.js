const {chromium}=require('/opt/node22/lib/node_modules/playwright');const {spawn}=require('child_process');
const [,,W,H,out,...scenes]=process.argv;const FPS=25;
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const sc of scenes){const p=await b.newPage({viewport:{width:+W,height:+H}});await p.goto('file://'+__dirname+'/scene.html');
const dur=await p.evaluate(n=>setup(n),sc);const N=dur*FPS;
const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',''+FPS,'-i','-','-c:v','libx264','-pix_fmt','yuv420p','-crf','17','-preset','medium','-movflags','+faststart',`${out}/${sc}_${W}x${H}.mp4`],{stdio:['pipe','inherit','inherit']});
for(let i=0;i<N;i++){await p.evaluate(t=>F(t),i/N);const buf=await p.screenshot({type:'jpeg',quality:95});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await p.close();console.log('done',sc,W,H);}
await b.close();})();
