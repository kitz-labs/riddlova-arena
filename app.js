/* RIDDLOVA game engine — deterministic daily questions, offline stats, no paid APIs.
   IMPORTANT: local stats are NOT server-authenticated; no false global leaderboard claims. */
(()=>{"use strict";
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const KEY="riddlova-stats-v1",URL=new URL("./",document.baseURI).href;
const langList=Object.keys(window.RIDDLOVA_I18N||{en:1});const dict=window.RIDDLOVA_I18N||{en:{}};
let lang="en",session=null,timers=[],tick=null,toastTimer=null;
const today=()=>new Date().toISOString().slice(0,10);
function storeGet(){try{const s=JSON.parse(localStorage.getItem(KEY)||"{}");return {xp:Number(s.xp)||0,played:Number(s.played)||0,correct:Number(s.correct)||0,questions:Number(s.questions)||0,best:Number(s.best)||0,streak:Number(s.streak)||0,lastDay:typeof s.lastDay==="string"?s.lastDay:"",dailyDay:typeof s.dailyDay==="string"?s.dailyDay:"",dailyScore:Number(s.dailyScore)||0};}catch{return {xp:0,played:0,correct:0,questions:0,best:0,streak:0,lastDay:"",dailyDay:"",dailyScore:0};}}
let stats=storeGet();
function save(){try{localStorage.setItem(KEY,JSON.stringify(stats))}catch{/* private mode still playable */}}
function tr(key){return dict[lang]?.[key]??dict.en?.[key]??key;}
function setLang(next){lang=langList.includes(next)?next:"en";document.documentElement.lang=lang;document.documentElement.dir=lang==="ar"?"rtl":"ltr";$("#lang").value=lang;try{localStorage.setItem("riddlova-lang",lang)}catch{}
 $$("[data-i18n]").forEach(el=>el.textContent=tr(el.dataset.i18n));
 $$("[data-i18n-html]").forEach(el=>el.innerHTML=tr(el.dataset.i18nHtml)); updateStats(); updateClock();if(session&&session.active)renderGame();}
function hashSeed(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0;}
function rngOf(seed){let x=seed>>>0;return()=>{x+=0x6D2B79F5;let t=x;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296}}
function rand(r,min,max){return Math.floor(r()*(max-min+1))+min}
function shuffled(list,r){const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function choices(correct,r){const nums=new Set([correct]);const deltas=shuffled([-7,-5,-4,-3,-2,-1,1,2,3,4,5,7,9],r);for(const d of deltas){if(correct+d>=0)nums.add(correct+d);if(nums.size>=4)break;}return shuffled([...nums].slice(0,4),r);}
function buildQuestion(r,index){
const type=index%4;
if(type===0){const a=rand(r,3,21),b=rand(r,2,9),factor=rand(r,1,3);const result=a+b*factor;return {type:"math",prompt:a+" + "+b+" × "+factor+" = ?",answer:result,options:choices(result,r)}}
if(type===1){const start=rand(r,1,16),step=rand(r,2,8),seq=Array.from({length:4},(_,i)=>start+i*step);const result=start+4*step;return {type:"sequence",prompt:seq.join(" · ")+" · ?",answer:result,options:choices(result,r)}}
if(type===2){const a=rand(r,2,11),mult=rand(r,2,4);const result=a*mult;return {type:"math",prompt:a+" × "+mult+" = ?",answer:result,options:choices(result,r)}}
const start=rand(r,2,7),pow=rand(r,2,3);const seq=[start,start*pow,start*pow**2,start*pow**3];const result=start*pow**4;return {type:"sequence",prompt:seq.join(" · ")+" · ?",answer:result,options:choices(result,r)};
}
function buildDaily(day){const r=rngOf(hashSeed(day+"|riddlova|daily|v1"));return Array.from({length:5},(_,i)=>buildQuestion(r,i))}
function buildMath(){const r=rngOf(hashSeed(Date.now()+"|"+Math.random()));return Array.from({length:10},(_,i)=>buildQuestion(r,i%2===0?0:2))}
function updateStats(){
 $("#top-streak").textContent=String(stats.streak).padStart(2,"0");
 $("#top-best").textContent=String(stats.best).padStart(3,"0");
 $("#total-xp").textContent=stats.xp.toLocaleString(lang);
 $("#profile-xp").innerHTML=Number(stats.xp).toLocaleString(lang)+" <span>XP</span>";
 $("#profile-played").textContent=stats.played.toLocaleString(lang);
 $("#profile-streak").textContent=stats.streak.toLocaleString(lang);
 $("#profile-accuracy").textContent=stats.questions?Math.round(stats.correct/stats.questions*100)+"%":"0%";
 $("#progress-fill").style.width=(stats.xp%1000/10)+"%";
 $("#mission-status").textContent=stats.dailyDay===today()?tr("completed"):tr("ready");
}
function updateClock(){const now=new Date(),rem=86400000-(Date.now()%86400000);const hh=Math.floor(rem/3600000),mm=Math.floor(rem%3600000/60000),ss=Math.floor(rem%60000/1000);
 $("#countdown").textContent=[hh,mm,ss].map(n=>String(n).padStart(2,"0")).join(":");
 $("#date-pill").textContent=new Intl.DateTimeFormat(lang,{timeZone:"UTC",month:"short",day:"2-digit",year:"numeric"}).format(now);
}
function showToast(message){const el=$("#toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2800)}
function clearTimers(){timers.forEach(clearTimeout);timers=[];if(tick){clearInterval(tick);tick=null}}
function later(fn,ms){const t=setTimeout(fn,ms);timers.push(t);return t}
function openMode(mode){
 if(session?.active){return}
 if(mode==="daily"&&stats.dailyDay===today()){
    showResult({mode:"daily",points:stats.dailyScore,correct:0,total:5,already:true});return;
 }
 clearTimers();session={active:true,mode,round:0,points:0,correct:0,total:mode==="daily"?5:mode==="math"?10:5,
  day:today(),questions:mode==="daily"?buildDaily(today()):mode==="math"?buildMath():[],phase:"intro",times:[],errors:0};
 $("#game-overlay").hidden=false;document.body.style.overflow="hidden";
 $("#game-mode-label").textContent=mode.toUpperCase();$("#game-title").textContent=tr(({daily:"dailyTitle",math:"mathTitle",memory:"memoryTitle",reflex:"reflexTitle"})[mode]);
 $("#game-next").hidden=true;
 if(mode==="daily"||mode==="math"){renderQuestion();if(mode==="math"){session.endsAt=Date.now()+60000;tick=setInterval(()=>{if(!session||session.mode!=="math"||!session.active)return;let left=Math.max(0,Math.ceil((session.endsAt-Date.now())/1000));$("#game-clock").textContent=left+"s";if(!left)endGame()},300)}}
 else if(mode==="memory")startMemory();else startReflex();
}
function updateHud(){if(!session)return;$("#game-round").textContent=String(Math.min(session.round+1,session.total)).padStart(2,"0")+" / "+String(session.total).padStart(2,"0");$("#game-points").textContent=session.points; if(session.mode!=="math")$("#game-clock").textContent=session.mode==="reflex"?"⚡":session.mode==="memory"?"◈":"UTC";}
function renderGame(){if(!session?.active)return;$("#game-title").textContent=tr(({daily:"dailyTitle",math:"mathTitle",memory:"memoryTitle",reflex:"reflexTitle"})[session.mode]);if(["daily","math"].includes(session.mode))renderQuestion();else if(session.mode==="memory"){$("#game-question").textContent=tr(session.phase==="watch"?"memoryWatch":"memoryTap");}else if(session.mode==="reflex"){$("#game-question").textContent=tr("reflexWait");}}
function renderQuestion(){
 const q=session.questions[session.round];if(!q){endGame();return}session.phase="ask";updateHud();$("#game-question").textContent=tr(q.type==="sequence"?"sequence":"mathQuestion");$("#game-feedback").textContent="";$("#game-next").hidden=true;
 const box=$("#game-content");box.replaceChildren();let title=document.createElement("p");title.className="game-prompt";title.textContent=q.prompt;box.append(title);
 const opts=document.createElement("div");opts.className="answers";for(const number of q.options){const btn=document.createElement("button");btn.type="button";btn.className="answer";btn.textContent=String(number);btn.addEventListener("click",()=>chooseAnswer(number,opts));opts.append(btn)}box.append(opts)
}
function chooseAnswer(value,opts){if(session?.phase!=="ask")return;session.phase="answered";const q=session.questions[session.round];const ok=value===q.answer; if(ok){session.points+=100;session.correct++;}else{session.points+=10}
 opts.querySelectorAll("button").forEach(b=>{b.disabled=true;if(Number(b.textContent)===q.answer)b.classList.add("correct");else if(Number(b.textContent)===value)b.classList.add("wrong")});
 $("#game-feedback").textContent=ok?tr("correct")+"100 XP":tr("wrong")+" "+q.answer;
 $("#game-points").textContent=session.points;$("#game-next").hidden=false;
}
function nextQuestion(){if(!session?.active||session.phase!=="answered")return;session.round++;if(session.round>=session.total){endGame();return}renderQuestion()}
function startMemory(){
 session.phase="watch";session.sequence=[];session.memoryIndex=0;session.round=0;updateHud();$("#game-question").textContent=tr("memoryWatch");$("#game-feedback").textContent="";
 const random=rngOf(hashSeed(Date.now().toString()+Math.random()));const chosen=new Set;while(chosen.size<5)chosen.add(rand(random,0,15));session.sequence=[...chosen];
 const board=document.createElement("div");board.className="memory-board";for(let i=0;i<16;i++){const tile=document.createElement("button");tile.type="button";tile.className="memory-tile";tile.setAttribute("aria-label","Tile "+(i+1));tile.dataset.idx=String(i);tile.disabled=true;tile.addEventListener("click",()=>memoryTap(i,tile));board.append(tile)}$("#game-content").replaceChildren(board);
 let offset=650;session.sequence.forEach((idx)=>{later(()=>{if(!session?.active)return;board.children[idx].classList.add("active")},offset);later(()=>{if(!session?.active)return;board.children[idx].classList.remove("active")},offset+470);offset+=750});
 later(()=>{if(!session?.active)return;session.phase="tap";board.querySelectorAll("button").forEach(b=>b.disabled=false);$("#game-question").textContent=tr("memoryTap");},offset+200)
}
function memoryTap(index,tile){
 if(!session||session.phase!=="tap")return;
 const expected=session.sequence[session.memoryIndex];if(index!==expected){session.errors++;tile.classList.add("miss");$("#game-feedback").textContent=tr("memoryWrong");later(()=>tile.classList.remove("miss"),320);
   if(session.errors>=3){endGame()}return;}
 tile.classList.add("hit");tile.disabled=true;session.memoryIndex++;session.correct++;session.round=Math.min(session.memoryIndex-1,4);session.points+=100;updateHud();$("#game-feedback").textContent=tr("memoryGood");
 if(session.memoryIndex===5){later(()=>endGame(),380)}
}
function startReflex(){session.phase="start";session.round=0;updateHud();$("#game-feedback").textContent="";$("#game-question").textContent=tr("reflexWait");const pad=document.createElement("button");pad.className="reflex-pad";pad.id="reflex-pad";pad.textContent=tr("reflexStart");pad.addEventListener("click",reflexTap);$("#game-content").replaceChildren(pad);}
function reflexTap(){
 if(!session?.active||session.mode!=="reflex")return;const pad=$("#reflex-pad");
 if(session.phase==="start"){reflexRound();return}
 if(session.phase==="wait"){session.phase="false";clearTimers();pad.className="reflex-pad ready";pad.textContent=tr("reflexEarly");session.errors++;later(()=>reflexRound(),1000);return}
 if(session.phase!=="go")return;
 const ms=Math.round(performance.now()-session.goAt);if(ms<85){session.phase="false";pad.textContent=tr("reflexEarly");later(()=>reflexRound(),900);return}
 session.phase="result";session.times.push(ms);session.correct++;session.points+=Math.max(10,Math.round(250-Math.min(ms,1000)/5));session.round++;updateHud();pad.className="reflex-pad result";pad.textContent=ms+" ms";$("#game-feedback").textContent=tr("reflexResult")+": "+ms+" ms";later(()=>{if(session?.round>=5)endGame();else reflexRound()},950)
}
function reflexRound(){
 if(!session?.active)return;session.phase="wait";const pad=$("#reflex-pad");if(!pad)return;pad.className="reflex-pad ready";pad.textContent=tr("reflexWait");$("#game-feedback").textContent="";updateHud();const delay=1400+Math.floor(Math.random()*1800);
 later(()=>{if(!session||session.phase!=="wait")return;session.phase="go";session.goAt=performance.now();pad.className="reflex-pad go";pad.textContent=tr("reflexTap");later(()=>{if(session?.phase==="go"){session.phase="result";session.round++;pad.className="reflex-pad result";pad.textContent=tr("didNotTap");later(()=>{if(session?.round>=5)endGame();else reflexRound()},900)}},4000)},delay);
}
function endGame(){if(!session||!session.active)return;clearTimers();const s=session;s.active=false;s.phase="finished";stats.played++;
 stats.correct+=s.correct;stats.questions+=s.total;stats.xp+=s.points;stats.best=Math.max(stats.best,s.points);
 if(s.mode==="daily"&&s.day===today()){stats.dailyDay=today();stats.dailyScore=s.points;
  const yesterday=new Date(Date.parse(today()+"T00:00:00Z")-86400000).toISOString().slice(0,10);
  stats.streak=stats.lastDay===yesterday?stats.streak+1:stats.lastDay===today()?stats.streak:1;stats.lastDay=today();}
 save();updateStats();showResult(s);
}
function showResult(s){clearTimers();$("#game-overlay").hidden=false;document.body.style.overflow="hidden";
 session={active:false,mode:s.mode,points:s.points,correct:s.correct,total:s.total,phase:"finished"};
 $("#game-mode-label").textContent=s.mode.toUpperCase();$("#game-title").textContent=s.already?tr("againTomorrow"):tr("finish");$("#game-question").textContent=s.already?tr("tryOther"):tr("finishDesc");
 const box=$("#game-content");box.replaceChildren();const two=document.createElement("div");two.className="end-stats";
 const first=document.createElement("div");first.className="end-stat";const b1=document.createElement("b");b1.textContent=s.points;first.append(b1);const l1=document.createElement("span");l1.textContent="XP";first.append(l1);
 const second=document.createElement("div");second.className="end-stat";const b2=document.createElement("b");b2.textContent=s.already?"—":(s.mode==="reflex"?(s.times.length?Math.round(s.times.reduce((a,b)=>a+b,0)/s.times.length)+" ms":"—"):Math.round(s.correct/s.total*100)+"%");second.append(b2);const l2=document.createElement("span");l2.textContent=s.mode==="reflex"?"REACTION":tr("accuracyLabel");second.append(l2);two.append(first,second);box.append(two);
 const p=document.createElement("p");p.className="game-hint";p.textContent=tr("offline");box.append(p);
 $("#game-round").textContent="★";$("#game-clock").textContent="FINISHED";$("#game-points").textContent=s.points;$("#game-feedback").textContent="";
 $("#game-actions").replaceChildren();const share=document.createElement("button");share.type="button";share.className="btn btn-primary";share.textContent=tr("shareResult")+" ↗";share.addEventListener("click",()=>shareChallenge(s.points));$("#game-actions").append(share);
 if(s.mode!=="daily"){const again=document.createElement("button");again.className="btn btn-ghost";again.textContent=tr("playAgain");again.addEventListener("click",()=>{closeGame();openMode(s.mode)});$("#game-actions").append(again)}
 const back=document.createElement("button");back.className="btn btn-outline";back.textContent=tr("backToArena");back.addEventListener("click",closeGame);$("#game-actions").append(back);
}
function closeGame(){clearTimers();session=null;$("#game-overlay").hidden=true;document.body.style.overflow="";$("#game-actions").replaceChildren();const next=document.createElement("button");next.type="button";next.className="btn btn-primary";next.id="game-next";next.hidden=true;next.textContent=tr("continue")+" →";next.addEventListener("click",nextQuestion);$("#game-actions").append(next)}
async function shareChallenge(score){const text=tr("shareText")+(Number.isFinite(score)?" "+score+" XP":"");
 const link=URL+"?ref=challenge";const tg=window.Telegram?.WebApp;
 if(tg?.openTelegramLink){tg.openTelegramLink("https://t.me/share/url?url="+encodeURIComponent(link)+"&text="+encodeURIComponent(text));return}
 if(navigator.share){try{await navigator.share({title:"RIDDLOVA",text,url:link});return}catch{}}
 if(navigator.clipboard){try{await navigator.clipboard.writeText(text+" "+link);showToast(tr("copyDone"));return}catch{}}
 window.prompt("Share",text+" "+link)
}
function init(){
 try{const saved=localStorage.getItem("riddlova-lang");const telegramLang=window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code?.slice(0,2);setLang(saved||telegramLang||navigator.language?.slice(0,2)||"en")}catch{setLang("en")}
 $("#lang").addEventListener("change",e=>setLang(e.target.value));$("#hero-start").addEventListener("click",()=>openMode("daily"));$$("[data-mode]").forEach(b=>b.addEventListener("click",()=>openMode(b.dataset.mode)));
 $("#hero-share").addEventListener("click",()=>shareChallenge());$("#invite-btn").addEventListener("click",()=>shareChallenge());
 $("#close-game").addEventListener("click",closeGame);$("#game-next").addEventListener("click",nextQuestion);$("#game-overlay").addEventListener("click",e=>{if(e.target===$("#game-overlay"))closeGame()});document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("#game-overlay").hidden)closeGame()});
 updateStats();updateClock();setInterval(updateClock,1000);
 const tg=window.Telegram?.WebApp;if(tg){try{tg.ready();tg.expand();tg.setHeaderColor("#090a14");tg.setBackgroundColor("#090a14")}catch{}}
 if("serviceWorker" in navigator&&location.protocol==="https:"){navigator.serviceWorker.register("service-worker.js",{scope:"./"}).catch(()=>{})}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
window.RiddlovaQA={daily:buildDaily,rngOf,hashSeed,buildQuestion,choices};
})();
