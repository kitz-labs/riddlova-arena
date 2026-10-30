import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import vm from "node:vm";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const scope={window:{}};vm.runInNewContext(readFileSync(resolve(root,"i18n.js"),"utf8"),scope,{timeout:2000});
const lang=scope.window.RIDDLOVA_I18N;const base="https://kitz-labs.github.io/riddlova-arena/";
const plain=s=>String(s||"").replace(/<[^>]+>/g,"").replace(/\s+/g," ").trim();
const esc=s=>String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const locales=Object.keys(lang);
const alternates=locales.map(x=>'<link rel="alternate" hreflang="'+x+'" href="'+(x==="en"?base:base+x+"/")+'">').join("");
for(const code of locales.filter(x=>x!=="en")){
 const d={...lang.en,...lang[code]},dir=code==="ar"?" dir=\"rtl\"":"";
 const hero=d.headline.replace("<br>","<br>").replace("<em>","<em>").replace("</em>","</em>");
 const cards=[["dailyTitle","dailyDesc"],["mathTitle","mathDesc"],["memoryTitle","memoryDesc"],["reflexTitle","reflexDesc"]]
   .map(([title,desc],i)=>'<a class="mode-card" href="../?lang='+code+'#games"><span class="mode-tag">'+String(i+1).padStart(2,"0")+' / FREE</span><strong style="margin-top:40px">'+esc(d[title])+'</strong><span class="mode-description">'+esc(d[desc])+'</span><span class="card-footer">PLAY ↗</span></a>').join("");
 const title=esc(plain(d.headline)+" | RIDDLOVA Brain Games");
 const desc=esc(d.heroDesc).slice(0,220);
 const html='<!doctype html><html lang="'+code+'"'+dir+'><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+'</title><meta name="description" content="'+desc+'"><link rel="canonical" href="'+base+code+'/"><link rel="stylesheet" href="../styles.css"><link rel="icon" href="../assets/mark.svg" type="image/svg+xml">'+alternates+'<meta property="og:type" content="website"><meta property="og:title" content="'+title+'"><meta property="og:image" content="'+base+'assets/social-card.png"></head><body><div class="app-shell"><header class="topbar"><a class="brand" href="../?lang='+code+'"><img src="../assets/mark.svg" width="40" height="40" alt=""><span>RIDDLOVA<small>GLOBAL BRAIN ARENA</small></span></a><div class="eyebrow">WORLDWIDE · '+code.toUpperCase()+'</div></header><main><section class="hero" style="min-height:390px"><div class="eyebrow"><span class="l-dot"></span> RIDDLOVA · FREE DAILY BRAIN GAMES</div><h1 style="max-width:950px">'+hero+'</h1><p class="hero-desc">'+esc(d.heroDesc)+'</p><a class="btn btn-primary" href="../?lang='+code+'">'+esc(d.playDaily)+' ↗</a></section><section class="section" style="padding-top:15px"><div class="eyebrow">'+esc(d.chooseMode)+'</div><h2>'+d.modeHeadline+'</h2><p class="hero-desc">'+esc(d.modeDesc)+'</p><div class="mode-grid">'+cards+'</div></section><section class="section" style="padding-bottom:70px"><h2>RIDDLOVA · '+esc(d.dailyTitle)+'</h2><p class="hero-desc">'+esc(d.dailyDesc)+' '+esc(d.inviteDesc)+'</p><a class="btn btn-primary" href="../?lang='+code+'">'+esc(d.playDaily)+' ↗</a></section></main><footer class="footer"><span>© 2026 RIDDLOVA</span><nav class="footer-links"><a href="../privacy.html">'+esc(d.privacy)+'</a><a href="../legal.html">'+esc(d.legal)+'</a></nav></footer></div></body></html>';
 mkdirSync(resolve(root,code),{recursive:true});writeFileSync(resolve(root,code,"index.html"),html,"utf8");
}
const xs=['<?xml version="1.0" encoding="UTF-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'];
for(const code of locales){const loc=code==="en"?base:base+code+"/";xs.push("<url><loc>"+loc+"</loc>"+locales.map(c=>'<xhtml:link rel="alternate" hreflang="'+c+'" href="'+(c==="en"?base:base+c+"/")+'"/>').join("")+"</url>")}
xs.push("</urlset>");writeFileSync(resolve(root,"sitemap.xml"),xs.join("\n"),"utf8");
console.log("Generated localized landing pages: "+locales.join(", "));
