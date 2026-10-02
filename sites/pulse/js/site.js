/* PULSE motion template — engine. Edit js/data.js for people and work. */
(function(){
  function speck(seed){
    const S=176, c=document.createElement("canvas"); c.width=c.height=S; const x=c.getContext("2d");
    let s=seed; const rnd=()=>(s=s*16807%2147483647)/2147483647;
    const cols=["rgba(255,228,214,.17)","rgba(0,0,0,.26)","rgba(0,0,0,.15)","rgba(255,255,255,.12)","rgba(239,106,46,.3)","rgba(31,198,227,.22)"];
    for(let i=0;i<S*S/12;i++){ const k=rnd(); x.fillStyle=cols[k<.36?0:k<.7?1:k<.93?2:k<.975?3:k<.99?4:5];
      x.fillRect(Math.floor(rnd()*S),Math.floor(rnd()*S),1+Math.floor(rnd()*2.4),1+Math.floor(rnd()*2.4)); }
    x.fillStyle="rgba(0,0,0,.36)"; x.fillRect(S-3,0,3,S); x.fillRect(0,S-3,S,3);
    x.fillStyle="rgba(255,255,255,.06)"; x.fillRect(0,0,S-3,2); x.fillRect(0,0,2,S-3);
    return `url(${c.toDataURL()})`;
  }
  try{ document.documentElement.style.setProperty("--speck",speck(7)); }catch(e){}
})();

const SITE = window.SITE;
const SK = k => `${SITE.storage||"pulse"}-${k}`;
const PROJECTS = SITE.projects;
const LAB = SITE.lab;
const BRANDS = SITE.brands;
const FILTERS = SITE.filters;
const CAPS = SITE.caps;
const STICKERS = SITE.stickers;
const I18N = SITE.i18n;
const creditRe = new RegExp((SITE.creditHighlight||[]).map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|")||"^$");

const PIXEL = (function(){
  const N=16;
  const AE=["","","","","","....###.........","...#...#........","...#...#..##....","...#####.#..#...","...#...#.####...","...#...#.#......","...#...#..###..."];
  const AI=["","","","","",".....###...#....","....#...#.......","....#...#..#....","....#####..#....","....#...#..#....","....#...#..#....","....#...#..#...."];
  const glyph=(rows,col)=>(x,y,i,j)=>(rows[j]||"")[i]==="#"&&col;
  const cap=(x,y,ax,ay,bx,by,r)=>{ const dx=bx-ax, dy=by-ay, t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy))); return Math.hypot(x-ax-dx*t,y-ay-dy*t)<=r; };
  const axis=(dx,dy,deg)=>{ const a=deg*Math.PI/180, ux=Math.cos(a), uy=Math.sin(a); return [dx*ux+dy*uy, Math.abs(dy*ux-dx*uy), ux, uy]; }; // along, across
  const DROPS=[[-90,"#2a8fe6","#a8d8ff"],[150,"#f5ea5a","#fffbd0"],[30,"#ff3050","#ffc2cc"]]; // Resolve: blue top, yellow left, red right
  const RAYS=[[0,7.3],[34,5.6],[58,6.8],[92,5.3],[118,7.1],[150,5.9],[181,5.5],[208,7.2],[240,5.2],[266,6.6],[300,6],[330,5.6]]; // Claude spark
  const ICONS={
    ae:glyph(AE,"#9999ff"),
    ai:glyph(AI,"#ff9a00"),
    resolve:(x,y)=>{ const dx=x-8, dy=y-8, d=Math.hypot(dx,dy);
      if(d>6.2&&d<7.4) return `hsl(${(Math.atan2(dy,dx)*180/Math.PI+280+360)%360} 95% 58%)`; // rainbow rim, cyan at the top
      for(const [a,c,hi] of DROPS){ const [t,s,ux,uy]=axis(dx,dy,a);
        if((t>1.2&&t<=3.8&&s<=1.9*(t-1.2)/2.6)||Math.hypot(dx-ux*3.8,dy-uy*3.8)<=1.9) return t<2.3?hi:c; }
      return 0; },
    claude:(x,y)=>{ const dx=x-8, dy=y-8; if(Math.hypot(dx,dy)<1.8) return "#d97757";
      for(const [a,L] of RAYS){ const [t,s]=axis(dx,dy,a); if(t>0&&t<L&&s<.95*(1-t/L)+.3) return "#d97757"; }
      return 0; },
    krea:(x,y)=>(cap(x,y,5.9,4.3,5.9,11.7,1.5)||cap(x,y,6.6,8.1,10.5,4.5,1.55)||cap(x,y,8.7,10.2,10.3,11.8,1.5))&&"#111"
  };
  return k=>{ const f=ICONS[k]; let r="";
    for(let j=0;j<N;j++) for(let i=0;i<N;i++){ const c=f(i+.5,j+.5,i,j); if(c) r+=`<rect x="${i+.06}" y="${j+.06}" width=".88" height=".88" fill="${c}"/>`; }
    return `<svg viewBox="0 0 ${N} ${N}" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`; };
})();

/* ============ STATE / I18N ============ */
const $ = s => document.querySelector(s);
const pad = n => String(n).padStart(2,"0");
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
let lang = "pt";
{ let saved=null; try{ saved=localStorage.getItem(SK("lang")); }catch(e){}
  lang = (saved==="pt"||saved==="en") ? saved : ((navigator.language||"").toLowerCase().startsWith("pt") ? "pt" : "en"); }
const t = k => I18N[lang][k] ?? k;
const L = o => (o && typeof o==="object" && !Array.isArray(o)) ? (o[lang] ?? o.pt) : o;
let filter = "all", view = "grid";
{ let v=null; try{ v=localStorage.getItem(SK("view")); }catch(e){} if(v==="grid"||v==="list") view=v; }
const langHooks = []; // modules re-label themselves on language change

/* ============ THE SITE CURVE: one cubic-bezier shared by CSS (--ease), reveals and scroll ============ */
const EASE = (function(){
  const DEF=[.12,.6,.4,1];
  let P=[...DEF];
  try{ const s=JSON.parse(localStorage.getItem(SK("curve"))); if(Array.isArray(s) && s.length===4 && s.every(n=>typeof n==="number" && isFinite(n))) P=s; }catch(e){}
  const subs=[], saves=[];
  const bz=(a,b,s)=>{ const u=1-s; return 3*u*u*s*a+3*u*s*s*b+s*s*s; };
  const dbz=(a,b,s)=>{ const u=1-s; return 3*u*u*a+6*u*s*(b-a)+3*s*s*(1-b); };
  function solve(x){
    let s=x;
    for(let i=0;i<8;i++){ const e=bz(P[0],P[2],s)-x; if(Math.abs(e)<1e-6) return s; const d=dbz(P[0],P[2],s); if(Math.abs(d)<1e-6) break; s-=e/d; if(s<0||s>1) break; }
    let lo=0, hi=1; s=x;
    for(let i=0;i<30;i++){ const v=bz(P[0],P[2],s); if(Math.abs(v-x)<1e-6) break; if(v<x) lo=s; else hi=s; s=(lo+hi)/2; }
    return s;
  }
  const apply=()=>document.documentElement.style.setProperty("--ease",`cubic-bezier(${P.map(n=>+n.toFixed(3)).join(",")})`);
  function set(np, save){
    P=[clamp(np[0],0,1),clamp(np[1],-.5,1.5),clamp(np[2],0,1),clamp(np[3],-.5,1.5)].map(n=>Math.round(n*1000)/1000);
    apply(); if(save) try{ localStorage.setItem(SK("curve"),JSON.stringify(P)); }catch(e){}
    subs.forEach(f=>f());
    if(save) saves.forEach(f=>f());
  }
  apply();
  return { get P(){ return P; }, fn:x=>x<=0?0:x>=1?1:bz(P[1],P[3],solve(x)), set, reset(){ set(DEF,true); }, on(f){ subs.push(f); }, onSave(f){ saves.push(f); } };
})();

/* ============ REVEALS: elements rise in on scroll, timed by the curve; replayed after each curve edit ============ */
const RV = (function(){
  if(reduce || !("IntersectionObserver" in window)) return {watch(){}, replay(){}};
  document.documentElement.classList.add("rv-on");
  const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } }),{rootMargin:"0px 0px -6% 0px"});
  return {
    watch(root=document){ root.querySelectorAll(".rv:not(.in)").forEach(el=>io.observe(el)); },
    replay(){
      const vis=[...document.querySelectorAll(".rv.in")].filter(el=>{ const r=el.getBoundingClientRect(); return r.bottom>0 && r.top<innerHeight; });
      vis.forEach(el=>el.classList.remove("in")); void document.body.offsetWidth;
      requestAnimationFrame(()=>vis.forEach(el=>el.classList.add("in")));
    }
  };
})();

/* ============ SCROLL: wheel and anchor jumps glide along the curve (touch and keyboard stay native) ============ */
const SCROLL = (function(){
  let from=0, to=0, t0=0, dur=0, raf=0, last=-1;
  const maxY=()=>document.documentElement.scrollHeight-innerHeight;
  function step(now){
    if(last>=0 && Math.abs(scrollY-last)>3){ raf=0; last=-1; return; } // someone else moved the page (keys, scrollbar): let go
    const k=Math.min(1,(now-t0)/dur);
    window.scrollTo({top:from+(to-from)*EASE.fn(k), behavior:"instant"}); last=scrollY;
    if(k<1) raf=requestAnimationFrame(step); else { raf=0; last=-1; }
  }
  function go(y, sec){
    if(reduce){ window.scrollTo({top:y, behavior:"instant"}); return; }
    from=scrollY; to=clamp(y,0,maxY()); t0=performance.now(); dur=sec*1000; last=-1;
    if(!raf) raf=requestAnimationFrame(step);
  }
  if(fine && !reduce) addEventListener("wheel",e=>{
    if(e.ctrlKey || currentCase>=0 || Math.abs(e.deltaX)>Math.abs(e.deltaY)) return;
    e.preventDefault();
    const d=e.deltaY*(e.deltaMode===1?40:e.deltaMode===2?innerHeight:1);
    go((raf?to:scrollY)+d, .9);
  },{passive:false});
  document.addEventListener("click",e=>{
    const a=e.target.closest('a[href^="#"]'); if(!a || e.defaultPrevented) return;
    const id=a.getAttribute("href").slice(1), el=id==="top"?null:document.getElementById(id);
    if(id!=="top" && !el) return;
    e.preventDefault();
    const y=el ? el.getBoundingClientRect().top+scrollY-$(".bar").offsetHeight : 0;
    go(y, Math.min(1.8,.8+Math.abs(y-scrollY)/3000));
    if(el && id!=="top") setTimeout(()=>el.focus({preventScroll:true}),50);
  });
  return {go};
})();

function fillStatic(){
  document.title = SITE.name + " " + (SITE.studio||"Motion");
  const h1=$(".hero h1"); if(h1) h1.textContent = SITE.name + ", " + L(SITE.role);
  const crumb=$("#crumb-name"); if(crumb) crumb.textContent = SITE.name;
  const rec=$("#rec"); if(rec) rec.textContent = SITE.rec;
  const em=$("#email"); if(em) em.textContent = SITE.email;
  const fb=$("#fact-base"); if(fb) fb.textContent = SITE.facts.base;
  const fn=$("#fact-now"); if(fn) fn.textContent = SITE.facts.now;
  const people=$("#people");
  if(people){
    people.innerHTML = (SITE.people||[]).map(p=>`<article class="person"><h3 class="nm">${p.name}</h3><p class="rl">${L(p.role)}</p><p>${L(p.blurb)}</p></article>`).join("");
  }
  const links=$("#links");
  if(links){
    links.innerHTML = (SITE.links||[]).map(l=>`<a class="btn" href="${l.href}" target="_blank" rel="noopener">${l.label}</a>`).join("");
  }
  const copy=$("#copy-year"); if(copy) copy.textContent = `© ${SITE.year} ${SITE.studio||SITE.name}`;
}
function applyLang(){
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach(el=>{ el.innerHTML = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-aria]").forEach(el=>el.setAttribute("aria-label", t(el.dataset.i18nAria)));
  $("#lang-pt").setAttribute("aria-pressed", lang==="pt");
  $("#lang-en").setAttribute("aria-pressed", lang==="en");
  fillStatic();
  renderFilters(); renderWork(); renderLab(); renderCaps();
  langHooks.forEach(f=>f());
  if(currentCase>=0) renderCase(currentCase);
}
function setLang(l){ lang=l; try{localStorage.setItem(SK("lang"),l)}catch(e){} applyLang(); }
$("#lang-pt").onclick=()=>setLang("pt");
$("#lang-en").onclick=()=>setLang("en");

/* ============ COVERS (real thumbnail; generative pixel art when there is none) ============ */
const BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
function hex(h){h=h.replace("#","");return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]}
function drawCover(cv, p, seed){
  const W=160,H=90; cv.width=W; cv.height=H;
  const x=cv.getContext("2d"); const a=hex(p.c1), b=hex(p.c2);
  const img=x.createImageData(W,H); const ang=(seed*1.7)%Math.PI;
  const ca=Math.cos(ang), sa=Math.sin(ang);
  for(let j=0;j<H;j++)for(let i=0;i<W;i++){
    const u=((i-W/2)*ca+(j-H/2)*sa)/W+.5;
    const wave=.18*Math.sin(i*.09+seed)+.12*Math.cos(j*.13+seed*2);
    const v=Math.min(1,Math.max(0,u+wave-.15));
    const on = v*16 > BAYER[(j%4)*4+(i%4)];
    const c = on?a:b; const k=(j*W+i)*4;
    const scan = j%3===0?.85:1;
    img.data[k]=c[0]*scan; img.data[k+1]=c[1]*scan; img.data[k+2]=c[2]*scan; img.data[k+3]=255;
  }
  x.putImageData(img,0,0);
}
const thumbOf = p => p.thumb || (p.videos && p.videos[0] && p.videos[0].thumb) || null;
function coverEl(p, seed){
  const d=document.createElement("span"); d.className="cover";
  const pixel=()=>{ const cv=document.createElement("canvas"); drawCover(cv,p,seed); d.appendChild(cv); };
  const src=thumbOf(p);
  if(!src){ pixel(); return d; }
  const im=new Image(); im.alt=""; im.decoding="async"; im.loading="lazy"; im.src=src;
  if(p.pos) im.style.objectPosition=p.pos;
  im.onerror=()=>{ im.remove(); pixel(); };
  d.appendChild(im); return d;
}

/* ============ RENDER ============ */
function renderFilters(){
  const f=$("#filters"); f.innerHTML="";
  FILTERS.forEach(([k,lab])=>{
    if(k!=="all" && !PROJECTS.some(p=>p.tags.includes(k))) return;
    const b=document.createElement("button"); b.type="button"; b.className="chip"; b.textContent=L(lab);
    b.setAttribute("aria-pressed", filter===k); b.onclick=()=>{filter=k; renderFilters(); renderWork();};
    f.appendChild(b);
  });
}
/* ============ VIDEO: self-hosted <video>, muted autoplay while on screen, paused off screen, one sound at a time ============ */
const AUTO = (function(){
  const ok = !reduce && !(navigator.connection && navigator.connection.saveData); // no autoplay for reduced motion / data saver
  const has = "IntersectionObserver" in window;
  const load = v => { if(!v.getAttribute("src") && v.dataset.src){ v.src=v.dataset.src; v.preload="auto"; } };
  const near = has ? new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ load(e.target); near.unobserve(e.target); } }),{rootMargin:"400px 0px"}) : null;
  const seen = has ? new IntersectionObserver(es=>es.forEach(e=>{
    const v=e.target;
    if(!v.isConnected){ seen.unobserve(v); return; }
    if(e.isIntersecting){
      load(v);
      const blocked = currentCase>=0 && !caseEl.contains(v); // page videos wait behind an open case
      if(!blocked && (ok || !v.muted)) v.play().catch(()=>{});
    } else if(!v.paused) v.pause();
  }),{threshold:.35}) : null;
  function watch(v){
    v.muted=true; v.defaultMuted=true; v.playsInline=true; v.setAttribute("playsinline",""); v.loop=true;
    v.addEventListener("playing",()=>v.classList.add("on"));
    v.addEventListener("volumechange",()=>{ if(!v.muted) solo(v); });
    if(has){ seen.observe(v); near.observe(v); } else load(v);
    return v;
  }
  function make(src, poster){
    const v=document.createElement("video"); v.preload="none"; v.dataset.src=src; if(poster) v.poster=poster;
    v.setAttribute("aria-hidden","true"); return watch(v);
  }
  // Vimeo embeds (ProgSynth until there's an MP4) follow the same rules through the player's postMessage API
  const vim = (f,method,value) => { try{ f.contentWindow.postMessage(JSON.stringify(value===undefined?{method}:{method,value}),"https://player.vimeo.com"); }catch(e){} };
  const seenF = has ? new IntersectionObserver(es=>es.forEach(e=>{
    const blocked = currentCase>=0 && !caseEl.contains(e.target);
    vim(e.target, e.isIntersecting && ok && !blocked ? "play" : "pause");
  }),{threshold:.35}) : null;
  function embed(id, title){
    const f=document.createElement("iframe"); f.dataset.vimeo=id; f.title=title; f.loading="lazy";
    f.allow="autoplay; fullscreen; picture-in-picture";
    f.src=`https://player.vimeo.com/video/${id}?autoplay=${ok?1:0}&muted=1&loop=1&autopause=0&title=0&byline=0&portrait=0&dnt=1`;
    if(seenF) seenF.observe(f); return f;
  }
  // the player stays invisible until Vimeo says it's ready; where embeds are blocked the poster shows instead
  addEventListener("message",e=>{
    if(e.origin!=="https://player.vimeo.com") return;
    let d=e.data; try{ if(typeof d==="string") d=JSON.parse(d); }catch(err){ return; }
    if(d && d.event==="ready") embeds(document).forEach(f=>{ if(f.contentWindow===e.source) f.classList.add("on"); });
  });
  const embeds = root => root.querySelectorAll("iframe[data-vimeo]");
  function solo(v){ document.querySelectorAll("video").forEach(o=>{ if(o!==v && !o.muted) o.muted=true; }); embeds(document).forEach(f=>vim(f,"setVolume",0)); }
  const inView = v => { const r=v.getBoundingClientRect(); return r.bottom>0 && r.top<innerHeight && r.width>0; };
  function hold(root){ root.querySelectorAll("video").forEach(v=>v.pause()); embeds(root).forEach(f=>vim(f,"pause")); }
  function wake(root){ if(ok){ root.querySelectorAll("video").forEach(v=>{ if(inView(v)) v.play().catch(()=>{}); }); embeds(root).forEach(f=>{ if(inView(f)) vim(f,"play"); }); } }
  return {ok, make, watch, embed, hold, wake};
})();
// "Play with sound" sticker for a muted autoplaying video: restarts it from the top with sound, or mutes it again
function soundButton(v, host){
  const b=document.createElement("button"); b.type="button"; b.className="ft-play";
  const sync=()=>{ const on=!v.muted && !v.paused; b.innerHTML=on?`<span aria-hidden="true">■</span> ${t("snd.off")}`:`<span aria-hidden="true">▶</span> ${t("snd.on")}`; b.setAttribute("aria-pressed",on); };
  b.onclick=e=>{ e.stopPropagation(); if(v.muted || v.paused){ if(!v.getAttribute("src")) v.src=v.dataset.src; v.currentTime=0; v.muted=false; v.play().catch(()=>{}); } else v.muted=true; };
  ["volumechange","play","pause"].forEach(ev=>v.addEventListener(ev,sync)); sync();
  host.appendChild(b); return b;
}
function featuredEl(p,i){
  const li=document.createElement("li"); li.className="ft rv";
  li.style.cssText=`--c1:${p.c1};--c2:${p.c2};--ac:${p.ac}`;
  const v=p.teaser||p.videos[0], media=document.createElement("div"); media.className="ft-media";
  media.appendChild(coverEl(p,i+1));
  media.insertAdjacentHTML("beforeend",`<span class="bdgs mono"><span class="bdg">★ ${t("feat")}</span>${p.badge?`<span class="bdg">${L(p.badge)}</span>`:""}</span>`);
  if(v && v.src){ const vid=AUTO.make(v.src, thumbOf(p)); vid.removeAttribute("aria-hidden"); vid.setAttribute("aria-label",`${p.title}: ${L(v.cap)}`); media.appendChild(vid); soundButton(vid, media); }
  li.appendChild(media);
  const info=document.createElement("div"); info.className="ft-info";
  const w=Math.max(...p.title.split(/\s+/).map(s=>s.length));
  info.innerHTML=`<div><span class="ft-meta mono">${pad(i+1)} · ${p.market} · ${p.year}</span><button class="ft-t" type="button" style="--w:${w}">${p.title}</button><p class="ft-s">${L(p.sub)} · ${p.client}</p></div>
    <div><p class="ft-b">${L(p.brief)}</p><div class="ft-tags">${p.tools.map(x=>`<span>${x}</span>`).join("")}</div><button class="btn" type="button">${t("case")}</button></div>`;
  info.querySelectorAll("button").forEach(b=>b.onclick=()=>openCase(i));
  li.appendChild(info);
  return li;
}
function cardEl(p,i,k){
  const li=document.createElement("li"); li.className="wk rv";
  li.style.cssText=`--c1:${p.c1};--c2:${p.c2};--ac:${p.ac};--i:${k%2};--rr:${k%2?1.5:-1.5}deg`;
  const b=document.createElement("button"); b.type="button"; b.className="wk-b";
  const media=document.createElement("span"); media.className="wk-media";
  media.appendChild(coverEl(p,i+1));
  const n=p.videos.length;
  media.insertAdjacentHTML("beforeend",`<span class="wk-n mono">${pad(i+1)}</span><span class="wk-v mono">${n?`▶ ${n} ${n>1?t("vids"):t("vid")}`:t("soon.s")}</span>`);
  if(p.loop && AUTO.ok){ // silent cover loop, plays while the card is on screen
    const lv=AUTO.make(p.loop); if(p.pos) lv.style.objectPosition=p.pos; media.appendChild(lv);
  }
  b.appendChild(media);
  b.insertAdjacentHTML("beforeend",`<span class="wk-meta"><span class="wk-t">${p.title}</span><span class="wk-y mono">${p.market} · ${p.year}</span></span><span class="wk-d">${L(p.sub)} · ${p.client}</span>`);
  b.onclick=()=>openCase(i);
  b.addEventListener("pointerenter",e=>{ if(e.pointerType==="mouse") cursorOn(t("view")); });
  b.addEventListener("pointerleave",cursorOff);
  li.appendChild(b); return li;
}
function renderWork(){
  const vis=PROJECTS.map((p,i)=>({p,i})).filter(({p})=>filter==="all"||p.tags.includes(filter));
  const grid=$("#grid"); grid.innerHTML=""; let k=0;
  vis.forEach(({p,i})=>grid.appendChild(p.feat ? featuredEl(p,i) : cardEl(p,i,k++)));
  const ul=$("#index"); ul.innerHTML="";
  vis.forEach(({p,i})=>{
    const li=document.createElement("li"); li.className="row";
    li.style.cssText=`--c1:${p.c1};--c2:${p.c2};--ac:${p.ac}`;
    const b=document.createElement("button"); b.type="button";
    b.innerHTML=`<span class="t">${p.title}</span><span class="d">${L(p.sub)} · ${p.client}</span><span class="m">${p.market} · ${p.year}</span><span class="ar" aria-hidden="true">→</span>`;
    const th=document.createElement("span"); th.className="thumb-s"; th.appendChild(coverEl(p,i+1)); b.prepend(th);
    b.onclick=()=>openCase(i);
    b.addEventListener("pointerenter",e=>{ if(e.pointerType==="mouse") showPreview(p,i); });
    b.addEventListener("pointerleave",hidePreview);
    li.appendChild(b); ul.appendChild(li);
  });
  RV.watch(grid);
}
function setView(v, save=true){
  view=v; if(save) try{localStorage.setItem(SK("view"),v)}catch(e){}
  $("#grid").hidden = v!=="grid"; $("#index").hidden = v!=="list";
  $("#v-grid").setAttribute("aria-pressed", v==="grid"); $("#v-list").setAttribute("aria-pressed", v==="list");
  hidePreview(); cursorOff();
}
$("#v-grid").onclick=()=>setView("grid");
$("#v-list").onclick=()=>setView("list");
function renderLab(){
  const g=$("#labgrid"); g.innerHTML="";
  LAB.forEach((p,i)=>{
    const a=document.createElement("div"); a.className="card rv";
    a.style.cssText=`--c2:${p.c2};--ac:${p.ac};--i:${i%3};--ar:${p.ar};--arn:${arNum(p.ar)}`;
    const cv=document.createElement("span"); cv.className="cv"; cv.appendChild(coverEl(p,i+11)); a.appendChild(cv);
    if(p.video){ // plays in place, muted; sound only on request
      const v=AUTO.make(p.video, p.thumb); v.removeAttribute("aria-hidden"); v.setAttribute("aria-label",p.title); if(p.pos) v.style.objectPosition=p.pos;
      cv.appendChild(v); if(p.sound) soundButton(v, cv);
    } else if(p.vimeo){ // sound through the Vimeo player's own control; the link is the way out where embeds are blocked
      cv.appendChild(AUTO.embed(p.vimeo, p.title));
      cv.insertAdjacentHTML("beforeend",`<a class="ft-play" href="https://vimeo.com/${p.vimeo}" target="_blank" rel="noopener">${t("vimeo")}</a>`);
    }
    g.appendChild(a);
  });
  RV.watch(g);
}
function renderCaps(){
  $("#caps").innerHTML = CAPS.map(([a,b],i)=>`<li class="rv" style="--i:${i};--rr:0deg"><b>${L(a)}</b><span>${b}</span></li>`).join("");
  RV.watch($("#caps"));
}
function renderBrands(){
  const one=BRANDS.map(b=> b.src
    ? `<span class="lg" style="--h:${b.h||.5}"><img src="${b.src}" alt=""></span>`
    : `<span class="lg lg-word" style="--h:${b.h||.5}">${b.n}</span>`).join("");
  $("#marq .marq-in").innerHTML=`<span>${one}</span><span>${one}</span><span>${one}</span>`;
}

/* ============ CURSOR LABEL + LIST PREVIEW (both follow the pointer) ============ */
const cur=$("#cur"), pv=$("#preview");
let px=0, py=0, cX=0, cY=0, cS=0, cTS=0, cRAF=0, pvx=0, pvy=0, pvOn=false, pvRAF=0;
addEventListener("pointermove",e=>{ px=e.clientX; py=e.clientY; },{passive:true});
function cursorOn(txt){
  if(!fine) return; cur.textContent=txt;
  if(cS<.05){ cX=px; cY=py; } cTS=1; if(!cRAF) cRAF=requestAnimationFrame(curLoop);
}
function cursorOff(){ cTS=0; if(!cRAF && cS>0) cRAF=requestAnimationFrame(curLoop); }
function curLoop(){
  const k=reduce?1:.22; cX+=(px-cX)*k; cY+=(py-cY)*k; cS+=(cTS-cS)*(reduce?1:.2);
  if(cTS===0 && cS<.01) cS=0;
  cur.style.transform=`translate(${(cX+16).toFixed(1)}px,${(cY+16).toFixed(1)}px) rotate(-4deg) scale(${cS.toFixed(3)})`; cur.style.opacity=cS.toFixed(3);
  cRAF = (cTS>0 || cS>0) ? requestAnimationFrame(curLoop) : 0;
}
function showPreview(p,i){
  pv.innerHTML=""; pv.appendChild(coverEl(p,i+1)); pv.style.setProperty("--ac",p.ac);
  if(!pvOn){ pvx=px+28; pvy=py-110; } pvOn=true; pv.classList.add("on"); if(!pvRAF) pvRAF=requestAnimationFrame(pvLoop);
}
function hidePreview(){ pvOn=false; pv.classList.remove("on"); }
function pvLoop(){
  const tx=px+28, ty=py-110; pvx+=(tx-pvx)*.18; pvy+=(ty-pvy)*.18;
  const x=Math.min(pvx, innerWidth-pv.offsetWidth-12);
  pv.style.transform=`translate(${x.toFixed(1)}px,${pvy.toFixed(1)}px) rotate(${((tx-pvx)*.03).toFixed(2)}deg)`;
  pvRAF = pvOn ? requestAnimationFrame(pvLoop) : 0;
}

/* ============ CASE OVERLAY ============ */
const caseEl=$("#case"), caseIn=$("#case-in"), caseHero=$("#case-hero"); let currentCase=-1, lastFocus=null;
const arNum = ar => { const [a,b]=String(ar||"16/9").split("/").map(Number); return a/(b||1); };
function playerHTML(v,p){
  if(!v || !v.src) return `<div class="player" data-soon><div class="play" style="cursor:default"><small>${t("soon")}</small></div></div>`;
  const n=arNum(v.ar);
  const style=`--ar:${v.ar}${n<1?`;width:min(100%,${(78*n).toFixed(1)}vh);margin-inline:auto`:""}`;
  const cap=v.cap?`<span class="cap">${L(v.cap)}</span>`:"";
  return `<div class="player" style="${style}">${cap}<video controls preload="none" poster="${v.thumb}" data-src="${v.src}" aria-label="${p.title}: ${L(v.cap)||""}"></video></div>`;
}
function renderCase(i){
  const p=PROJECTS[i]; currentCase=i;
  caseEl.style.setProperty("--pc1",p.c1); caseEl.style.setProperty("--pc2",p.c2);
  $("#case-count").textContent=`${pad(i+1)} / ${pad(PROJECTS.length)}`;
  const nx=PROJECTS[(i+1)%PROJECTS.length];
  const vids=p.videos.length?p.videos:[null];
  const pair=vids.length>1 && vids.every(v=>v && arNum(v.ar)<1);
  const solo=vids.length===1 && vids[0] && arNum(vids[0].ar)>=1;
  const role=L(p.role)||[];
  const head=`<h2 id="case-title">${p.title}</h2><p class="sub mono">${L(p.sub)} · ${p.client} · ${p.market} · ${p.year}</p>`;
  caseHero.innerHTML=""; caseHero.hidden=!p.hero;
  if(p.hero){ // teaser as a silent looping banner, title over its bottom-left corner
    caseHero.appendChild(AUTO.make(p.hero.src, p.hero.thumb));
    caseHero.insertAdjacentHTML("beforeend",`<div class="wrap hero-t">${head}</div>`);
  }
  caseIn.classList.toggle("solo", !!solo);
  caseIn.innerHTML=`
    ${p.hero?"":head}
    <div class="vids${pair?" pair":""}">${vids.map(v=>playerHTML(v,p)).join("")}</div>
    <div class="side">
      <div><h3>${t("brief")}</h3><p>${L(p.brief)}</p></div>
      ${role.length?`<div><h3>${t("myrole")}</h3><ul>${role.map(r=>`<li>${r}</li>`).join("")}</ul></div>`:""}
      ${p.tools.length?`<div><h3>${t("tools")}</h3><div class="tags">${p.tools.map(x=>`<span>${x}</span>`).join("")}</div></div>`:""}
      <div><h3>${t("credits")}</h3><dl class="credits">${p.credits.map(([k,v])=>`<dt>${k}</dt><dd${creditRe.test(v)?' class="me"':''}>${v}</dd>`).join("")}</dl></div>
    </div>
    <button class="next" type="button" id="case-next"><span><small>${t("next")}</small>${nx.title}</span><span aria-hidden="true">→</span></button>`;
  caseIn.querySelectorAll(".player[data-soon]").forEach((el,k)=>{ const cv=document.createElement("canvas"); drawCover(cv,p,i+k+3); el.prepend(cv); });
  caseIn.querySelectorAll(".player video").forEach(AUTO.watch); // muted autoplay as each one scrolls into view; controls for sound
  $("#case-next").onclick=()=>go(1);
}
function go(d){ caseEl.scrollTo({top:0}); openCase((currentCase+d+PROJECTS.length)%PROJECTS.length); }
function openCase(i){
  if(currentCase<0) lastFocus=document.activeElement;
  hidePreview(); cursorOff(); AUTO.hold($("main")); AUTO.hold(caseEl); renderCase(i); caseEl.classList.add("open"); document.body.style.overflow="hidden";
  try{ history.replaceState(null,"","#"+PROJECTS[i].slug); }catch(e){}
  setTimeout(()=>$("#case-close").focus(),50);
}
function closeCase(){
  caseEl.classList.remove("open"); document.body.style.overflow=""; currentCase=-1;
  AUTO.hold(caseEl); AUTO.wake($("main"));
  setTimeout(()=>{ if(!caseEl.classList.contains("open")){ caseIn.innerHTML=""; caseHero.innerHTML=""; } },750);
  try{ history.replaceState(null,"","#work"); }catch(e){}
  lastFocus&&lastFocus.focus&&lastFocus.focus({preventScroll:true});
}
$("#case-close").onclick=closeCase;
$("#case-prev").onclick=()=>go(-1);
$("#case-fwd").onclick=()=>go(1);
addEventListener("keydown",e=>{ if(currentCase<0) return;
  if(e.key==="Escape") closeCase();
  if(e.key==="ArrowRight") go(1);
  if(e.key==="ArrowLeft") go(-1);
});
caseEl.addEventListener("keydown",e=>{ if(e.key!=="Tab") return; // keep Tab inside the dialog
  const f=[...caseEl.querySelectorAll('button,a[href],iframe')].filter(el=>el.offsetParent!==null); if(!f.length) return;
  const first=f[0], last=f[f.length-1];
  if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
  else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
});

/* ============ COPY / CLOCK ============ */
$("#copy").onclick=async e=>{
  const b=e.currentTarget;
  try{ await navigator.clipboard.writeText($("#email").textContent); b.textContent=t("copied"); }
  catch(err){ const r=document.createRange(); r.selectNodeContents($("#email")); const s=getSelection(); s.removeAllRanges(); s.addRange(r); }
  setTimeout(()=>b.textContent=t("copy"),1800);
};
function tick(){ try{ $("#clock").textContent=(SITE.clockPrefix||"PT")+" "+new Intl.DateTimeFormat("pt-PT",{hour:"2-digit",minute:"2-digit",timeZone:SITE.timezone||"Europe/Lisbon"}).format(new Date()); }catch(e){} }
tick(); setInterval(tick,20000);

/* ============ CURVE WIDGET: two handles, a ball riding the curve, no labels. Used by the hero sticker and the dock. ============ */
function curveWidget(svg){
  const NS="http://www.w3.org/2000/svg", X0=16, X1=104, YA=88, YB=34;            // value 0 → y 88, value 1 → y 34
  const gx=v=>X0+v*(X1-X0), gy=v=>YA-v*(YA-YB), ix=x=>(x-X0)/(X1-X0), iy=y=>(YA-y)/(YA-YB);
  const mk=(tag,at,parent=svg)=>{ const n=document.createElementNS(NS,tag); for(const k in at) n.setAttribute(k,at[k]); parent.appendChild(n); return n; };
  const set=(n,at)=>{ for(const k in at) n.setAttribute(k,at[k]); };
  mk("line",{class:"c-g",x1:X0,x2:X1,y1:gy(0),y2:gy(0)}); mk("line",{class:"c-g",x1:X0,x2:X1,y1:gy(1),y2:gy(1)});
  const a1=mk("line",{class:"c-arm"}), a2=mk("line",{class:"c-arm"}), path=mk("path",{class:"c-curve"});
  [[0,0],[1,1]].forEach(([u,v])=>mk("rect",{class:"c-kf",x:-5,y:-5,width:10,height:10,transform:`translate(${gx(u)},${gy(v)}) rotate(45)`}));
  const ball=mk("circle",{class:"c-ball",r:6});
  const H=[0,1].map(k=>{ const g=mk("g",{class:"c-h",tabindex:0,role:"slider","aria-valuemin":0,"aria-valuemax":100});
    mk("circle",{class:"hit",r:17},g); mk("circle",{class:"ring",r:7,style:`animation-delay:${k*.8}s`},g); mk("circle",{class:"v",r:7},g); return g; });
  function render(){
    const [x1,y1,x2,y2]=EASE.P;
    path.setAttribute("d",`M${gx(0)},${gy(0)}C${gx(x1)},${gy(y1)} ${gx(x2)},${gy(y2)} ${gx(1)},${gy(1)}`);
    set(a1,{x1:gx(0),y1:gy(0),x2:gx(x1),y2:gy(y1)}); set(a2,{x1:gx(1),y1:gy(1),x2:gx(x2),y2:gy(y2)});
    [[x1,y1],[x2,y2]].forEach(([x,y],k)=>{ H[k].setAttribute("transform",`translate(${gx(x)},${gy(y)})`); H[k].setAttribute("aria-valuenow",Math.round(x*100)); H[k].setAttribute("aria-valuetext",`${x.toFixed(2)}, ${y.toFixed(2)}`); });
  }
  const pt=e=>{ const m=svg.getScreenCTM(); if(!m) return [0,0]; const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(m.inverse()); return [p.x,p.y]; };
  let drag=-1, ox=0, oy=0, replayT=0;
  const commit=()=>{ EASE.set(EASE.P,true); clearTimeout(replayT); replayT=setTimeout(RV.replay,120); };
  H.forEach((h,k)=>{
    h.addEventListener("pointerdown",e=>{ e.stopPropagation(); e.preventDefault(); const [x,y]=pt(e); drag=k; ox=gx(EASE.P[k*2])-x; oy=gy(EASE.P[k*2+1])-y; h.setPointerCapture(e.pointerId); h.classList.add("on"); });
    h.addEventListener("pointermove",e=>{ if(drag!==k) return; const [x,y]=pt(e); const P=[...EASE.P]; P[k*2]=ix(x+ox); P[k*2+1]=iy(y+oy); EASE.set(P,false); });
    const end=()=>{ if(drag!==k) return; drag=-1; h.classList.remove("on"); commit(); };
    h.addEventListener("pointerup",end); h.addEventListener("pointercancel",end);
    h.addEventListener("keydown",e=>{
      const st=e.shiftKey?.1:.02, P=[...EASE.P];
      if(e.key==="ArrowLeft") P[k*2]-=st; else if(e.key==="ArrowRight") P[k*2]+=st; else if(e.key==="ArrowUp") P[k*2+1]+=st; else if(e.key==="ArrowDown") P[k*2+1]-=st; else return;
      e.preventDefault(); e.stopPropagation(); EASE.set(P,false); commit();
    });
  });
  svg.addEventListener("dblclick",e=>{ e.stopPropagation(); EASE.reset(); RV.replay(); });
  langHooks.push(()=>{ H[0].setAttribute("aria-label",t("cw.h1")); H[1].setAttribute("aria-label",t("cw.h2")); });
  EASE.on(render); render();
  // the ball slides along the curve at constant time steps, so it speeds up where the curve is steep
  let raf=0, vis=false, t0=0;
  const place=u=>set(ball,{cx:gx(u),cy:gy(EASE.fn(u))});
  function loop(now){
    const c=((now-t0)/1000)%2.2, u=Math.min(1,c/1.4); place(u);
    raf=vis?requestAnimationFrame(loop):0;
  }
  place(1);
  if(!reduce && "IntersectionObserver" in window) new IntersectionObserver(es=>{ vis=es[0].isIntersecting; if(vis && !raf){ t0=performance.now(); raf=requestAnimationFrame(loop); } }).observe(svg);
  return {svg, gx, gy};
}
let HERO_CW=null; // {el, api} of the curve sticker in the hero

/* ============ HERO: pixel type + draggable stickers ============ */
(function(){
  const cv=$("#pix"), ctx=cv.getContext("2d"), layer=$("#stk"), tcEl=$("#tc");
  let W=0,H=0,step=6,parts=[],mouse={x:-9999,y:-9999},t0=performance.now(),raf=0,visible=true,zTop=10;
  const COLS=SITE.heroColors;

  // stickers: plain DOM, positions in stage pixels, thrown with inertia and bounced off the stage edges
  const S=STICKERS.map((d,n)=>{
    const el=document.createElement("div"); el.className="stk"+(d.k==="badge"||d.k==="curve"?" "+d.k:"")+(d.px?" px"+(d.round?" round":""):"")+(d.nm?" nm":"");
    if(d.k!=="curve") el.setAttribute("aria-hidden","true");
    const inner=d.k==="badge"
      ? `<svg class="ring" viewBox="0 0 120 120" aria-hidden="true"><defs><path id="ring-p" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0"/></defs><text><textPath href="#ring-p" textLength="287" lengthAdjust="spacing">${t("badge")}</textPath></text></svg><span>${SITE.mark}</span>`
      : d.k==="curve" ? `<svg class="cw" viewBox="0 0 120 120"></svg>` : d.px ? PIXEL(d.px) : d.html;
    el.innerHTML=`<div class="stk-i" style="--c:${d.c};--t:${d.t};--d:${(.3+n*.09).toFixed(2)}s">${inner}</div>`;
    layer.appendChild(el);
    if(d.k==="curve"){ el.setAttribute("role","group"); el.dataset.i18nAria="cw"; HERO_CW={el, api:curveWidget(el.querySelector("svg"))}; }
    const s={el,d,x:0,y:0,vx:0,vy:0,r:d.r,lift:0,drag:false,w:0,h:0,id:null,ox:0,oy:0,lx:0,ly:0,lt:0,placed:false};
    el.addEventListener("pointerdown",e=>grab(s,e));
    el.addEventListener("pointermove",e=>move(s,e));
    el.addEventListener("pointerup",()=>drop(s));
    el.addEventListener("pointercancel",()=>drop(s));
    return s;
  });
  langHooks.push(()=>{ const tp=layer.querySelector("textPath"); if(tp) tp.textContent=t("badge"); });
  const lp=e=>{ const r=layer.getBoundingClientRect(); return [e.clientX-r.left, e.clientY-r.top]; };
  function grab(s,e){
    if(e.button>0) return; e.preventDefault();
    mouse.x=mouse.y=-9999; // the canvas stops getting moves while a sticker holds the pointer
    const [x,y]=lp(e); s.drag=true; s.id=e.pointerId; s.el.setPointerCapture(e.pointerId);
    s.ox=x-s.x; s.oy=y-s.y; s.lx=x; s.ly=y; s.lt=performance.now(); s.vx=s.vy=0;
    s.el.classList.add("drag"); s.el.style.zIndex=++zTop; kick();
  }
  function move(s,e){
    if(!s.drag||e.pointerId!==s.id) return;
    const [x,y]=lp(e), now=performance.now(), dt=Math.max(8,now-s.lt);
    s.vx=s.vx*.3+(x-s.lx)/dt*16.7*.7; s.vy=s.vy*.3+(y-s.ly)/dt*16.7*.7; // px per 60fps frame
    s.lx=x; s.ly=y; s.lt=now; s.x=x-s.ox; s.y=y-s.oy;
  }
  function drop(s){
    if(!s.drag) return; s.drag=false; s.el.classList.remove("drag");
    if(performance.now()-s.lt>90){ s.vx=s.vy=0; } // held still before letting go: no throw
    const m=Math.hypot(s.vx,s.vy); if(m>45){ s.vx*=45/m; s.vy*=45/m; }
    kick();
  }
  function bounds(s){
    const hw=s.w/2, hh=s.h/2;
    if(s.x<hw){ s.x=hw; s.vx=Math.abs(s.vx)*.55; } else if(s.x>W-hw){ s.x=W-hw; s.vx=-Math.abs(s.vx)*.55; }
    if(s.y<hh){ s.y=hh; s.vy=Math.abs(s.vy)*.55; } else if(s.y>H-hh){ s.y=H-hh; s.vy=-Math.abs(s.vy)*.55; }
  }
  function place(s){
    s.el.style.transform=`translate(${(s.x-s.w/2).toFixed(1)}px,${(s.y-s.h/2).toFixed(1)}px) rotate(${s.r.toFixed(2)}deg) scale(${(1+s.lift*.08).toFixed(3)})`;
    if(s.d.k==="curve") s.el.classList.toggle("flip", s.x<W*.5); // its speech bubble opens towards the free side
  }
  function stepStickers(){
    let active=false;
    for(const s of S){
      if(!s.w) continue;
      if(!s.drag){ s.x+=s.vx; s.y+=s.vy; s.vx*=.94; s.vy*=.94; if(Math.abs(s.vx)<.03) s.vx=0; if(Math.abs(s.vy)<.03) s.vy=0; }
      bounds(s);
      const tr=s.d.r+Math.max(-28,Math.min(28,s.vx*1.4)); s.r+=(tr-s.r)*.14;
      const tl=s.drag?1:0; s.lift+=(tl-s.lift)*.25;
      place(s);
      if(s.drag||s.vx||s.vy||Math.abs(tr-s.r)>.05||Math.abs(tl-s.lift)>.01) active=true;
    }
    return active;
  }

  // Pixelify's C and G are near-closed boxes that read as O/Q once sampled ("OOSTA"): cut their mouths open before sampling.
  // Values = [left edge of the cut, top, height] as shares of the glyph's ink box; the cut runs to the glyph's right edge.
  const MOUTH={C:[.55,.28,.44], G:[.6,.2,.3]};
  function openMouths(o,txt,cx,cy){
    o.textAlign="left"; const left=cx-o.measureText(txt).width/2;
    [...txt].forEach((ch,n)=>{ const m=MOUTH[ch]; if(!m) return;
      const x0=left+o.measureText(txt.slice(0,n)).width, b=o.measureText(ch);
      const il=x0-b.actualBoundingBoxLeft, w=b.actualBoundingBoxLeft+b.actualBoundingBoxRight, it=cy-b.actualBoundingBoxAscent, h=b.actualBoundingBoxAscent+b.actualBoundingBoxDescent;
      o.clearRect(il+w*m[0], it+h*m[1], w*(1-m[0])+1, h*m[2]); });
    o.textAlign="center";
  }

  // pixel particles
  function build(){
    const r=cv.getBoundingClientRect(); if(r.width<2||r.height<2) return;
    const oW=W, oH=H, dpr=Math.min(2,devicePixelRatio||1); W=r.width; H=r.height;
    cv.width=W*dpr; cv.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    step=Math.max(4,Math.round(W/150));
    const off=document.createElement("canvas"); off.width=W; off.height=H; const o=off.getContext("2d");
    o.fillStyle="#fff"; o.textAlign="center"; o.textBaseline="middle";
    const lines=SITE.heroLines.map(([txt,s],i)=>[txt, i===0 && W<560 ? Math.max(s,.52) : s]);
    let big=Math.min(H*.36, W/5.2); const fam='"Pixelify Sans", monospace';
    o.font=`600 ${big}px ${fam}`; const wd=o.measureText(lines[lines.length-1][0]).width; if(wd>W*.94) big*=W*.94/wd;
    const sizes=lines.map(([,s])=>big*s); const gap=big*.04; const total=sizes.reduce((a,b)=>a+b,0)+gap*2;
    let y=(H-total)/2; const bands=[];
    lines.forEach(([txt],k)=>{ o.font=`600 ${sizes[k]}px ${fam}`; o.fillText(txt,W/2,y+sizes[k]/2); openMouths(o,txt,W/2,y+sizes[k]/2); bands.push([y,y+sizes[k]]); y+=sizes[k]+gap; });
    const ow=off.width, data=o.getImageData(0,0,ow,off.height).data; parts=[];
    const fine0=Math.max(3,Math.round(step*.55)); // the small name line gets finer pixels so it stays legible
    for(let j=0;j<H;){
      const band=bands.findIndex(([a,b])=>j>=a-2&&j<=b+2), st=band===0?fine0:step;
      for(let i=0;i<ow;i+=st){
        if(data[(j*ow+i)*4+3]>128) parts.push({hx:i,hy:j,x:i,y:j,vx:0,vy:0,s:st,c:COLS[Math.max(0,band)],ph:Math.random()*6.28});
      }
      j+=st;
    }
    for(const s of S){
      s.w=s.el.offsetWidth; s.h=s.el.offsetHeight; if(!s.w) continue; // hidden on phones
      if(!s.placed){ const m=W<560&&s.d.m; s.x=(m?m[0]:s.d.x)*W; s.y=(m?m[1]:s.d.y)*H; s.placed=true; } else if(oW){ s.x*=W/oW; s.y*=H/oH; }
      bounds(s); place(s);
    }
    draw();
  }
  function draw(){
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle="rgba(30,4,8,.45)";
    for(const p of parts) ctx.fillRect(p.x+p.s*.5,p.y+p.s*.5,p.s-1,p.s-1);
    for(const p of parts){ ctx.fillStyle=p.c; ctx.fillRect(p.x,p.y,p.s-1,p.s-1); }
  }
  function stepParticles(now){
    const R=Math.max(70,W*.09), tt=(now-t0)/1000;
    const F=[]; for(const s of S){ if(s.w && (s.drag||Math.hypot(s.vx,s.vy)>1)) F.push([s.x,s.y,Math.max(s.w,s.h)*.6]); } // moving stickers plough through the letters
    for(const p of parts){
      let dx=p.x-mouse.x, dy=p.y-mouse.y, d2=dx*dx+dy*dy;
      if(d2<R*R){ const d=Math.sqrt(d2)||1, f=(1-d/R)*6; p.vx+=dx/d*f; p.vy+=dy/d*f; }
      for(const [fx,fy,fr] of F){ dx=p.x-fx; dy=p.y-fy; d2=dx*dx+dy*dy; if(d2<fr*fr){ const d=Math.sqrt(d2)||1, f=(1-d/fr)*5; p.vx+=dx/d*f; p.vy+=dy/d*f; } }
      p.vx+=(p.hx-p.x)*.06+Math.sin(tt*2+p.ph)*.02; p.vy+=(p.hy-p.y)*.06;
      p.vx*=.78; p.vy*=.78; p.x+=p.vx; p.y+=p.vy;
    }
  }
  function timecode(now){ const f=Math.floor((now-t0)/40); tcEl.textContent=[Math.floor(f/90000),Math.floor(f/1500)%60,Math.floor(f/25)%60,f%25].map(pad).join(":"); }
  function loop(now){
    raf=0;
    let active=stepStickers();
    if(!reduce && visible){ stepParticles(now); draw(); timecode(now); active=true; }
    if(active) raf=requestAnimationFrame(loop);
  }
  function kick(){ if(!raf) raf=requestAnimationFrame(loop); }
  function burst(x,y){ for(const p of parts){ const dx=p.x-x, dy=p.y-y, d=Math.hypot(dx,dy)||1; const f=Math.max(0,1-d/(W*.5))*40; p.vx+=dx/d*f+(Math.random()-.5)*6; p.vy+=dy/d*f+(Math.random()-.5)*6; } }
  // on top of the burst: a hard shockwave that throws the pixel tool logos away from the click (only those, not the badge or the curve).
  // Everything on stage gets a real kick, the nearest ones hardest; they tilt, pop, bounce off the edges and plough through the letters.
  function shove(x,y){
    const R=Math.hypot(W,H);
    for(const s of S){ if(!s.d.px||!s.w||s.drag) continue;
      const dx=s.x-x, dy=s.y-y, d=Math.hypot(dx,dy)||1, f=Math.min(60,22+44*Math.max(0,1-d/R));
      s.vx+=dx/d*f; s.vy+=dy/d*f-6; s.lift=1; }
  }
  cv.addEventListener("pointermove",e=>{ const r=cv.getBoundingClientRect(); mouse.x=e.clientX-r.left; mouse.y=e.clientY-r.top; });
  cv.addEventListener("pointerleave",()=>{ mouse.x=mouse.y=-9999; });
  cv.addEventListener("pointerdown",e=>{ const r=cv.getBoundingClientRect(); if(!reduce){ const x=e.clientX-r.left, y=e.clientY-r.top; burst(x,y); shove(x,y); kick(); } });
  let rt, ready=false; const rebuild=()=>{ if(!ready) return; clearTimeout(rt); rt=setTimeout(()=>{ build(); kick(); },150); };
  if("ResizeObserver" in window) new ResizeObserver(rebuild).observe(cv); else addEventListener("resize",rebuild);
  (document.fonts&&document.fonts.load ? document.fonts.load('600 40px "Pixelify Sans"').catch(()=>{}) : Promise.resolve()).then(()=>{ ready=true; build(); kick(); });
  if("IntersectionObserver" in window) new IntersectionObserver(es=>es.forEach(e=>{ visible=e.isIntersecting; if(visible) kick(); })).observe(cv);
})();

/* ============ DOCK: the curve follows you down the page (says so once, the first time it appears) ============ */
(function(){
  const dock=$("#dock"); curveWidget(dock.querySelector("svg"));
  if(!("IntersectionObserver" in window)) return;
  let told=false; try{ told=localStorage.getItem(SK("dock-tip"))==="1"; }catch(e){}
  new IntersectionObserver(es=>{
    const on=!es[0].isIntersecting; dock.classList.toggle("on", on);
    if(on && !told){ told=true; try{ localStorage.setItem(SK("dock-tip"),"1"); }catch(e){}
      setTimeout(()=>dock.classList.add("tip"),700); setTimeout(()=>dock.classList.remove("tip"),5200); }
  }).observe($("#hero"));
})();

/* ============ CURVE INTRO: first visit only. Bubble + pulsing handles + a ghost hand dragging a handle; after the first edit it invites a scroll. ============ */
(function(){
  const KEY=SK("curve-intro"); let done=false; try{ done=localStorage.getItem(KEY)==="done"; }catch(e){}
  if(done || !HERO_CW) return;
  const stk=HERO_CW.el, api=HERO_CW.api, NS="http://www.w3.org/2000/svg";
  let stage="a";
  stk.classList.add("intro");
  const tip=document.createElement("div"); tip.className="cw-tip";
  const fill=()=>{ tip.innerHTML=`<b>${t(`tip.${stage}.h`)}</b>${t(`tip.${stage}.p`)}<button class="cw-x" type="button" aria-label="${t("tip.x")}">×</button>`; tip.querySelector(".cw-x").onclick=finish; };
  fill(); langHooks.push(fill);
  tip.addEventListener("pointerdown",e=>e.stopPropagation()); // reading the bubble never drags the sticker
  stk.appendChild(tip);
  function finish(){
    if(done) return; done=true; try{ localStorage.setItem(KEY,"done"); }catch(e){}
    stopDemo(); stk.classList.remove("intro"); removeEventListener("scroll",onScroll);
    if(tip.animate && !reduce) tip.animate([{opacity:1},{opacity:0,transform:"scale(.85)"}],{duration:260,easing:"ease-in"}).onfinish=()=>tip.remove(); else tip.remove();
  }
  function onScroll(){ if(scrollY>innerHeight*.7) finish(); }
  EASE.onSave(()=>{
    if(done || stage==="b") return;
    stage="b"; stopDemo(); stk.classList.remove("intro"); fill();
    addEventListener("scroll",onScroll,{passive:true}); setTimeout(finish,12000);
  });
  // ghost demo: a dashed copy of the curve and a hand pull the first handle somewhere else and back (the real curve is untouched)
  const g=document.createElementNS(NS,"g"); g.setAttribute("class","c-demo"); g.style.opacity=0;
  g.innerHTML='<path class="c-ghost"/><circle class="c-gh" r="7"/><path class="c-hand" d="M0,0L0,15L4,11.5L7,18L9.5,17L6.8,10.6L12,10.6Z"/>';
  api.svg.appendChild(g);
  const [gp,gc,hand]=g.children;
  let draf=0, stopped=false, runs=0;
  function frame(x1,y1,x2,y2){
    gp.setAttribute("d",`M${api.gx(0)},${api.gy(0)}C${api.gx(x1)},${api.gy(y1)} ${api.gx(x2)},${api.gy(y2)} ${api.gx(1)},${api.gy(1)}`);
    gc.setAttribute("cx",api.gx(x1)); gc.setAttribute("cy",api.gy(y1));
    hand.setAttribute("transform",`translate(${(api.gx(x1)+2).toFixed(1)},${(api.gy(y1)+2).toFixed(1)})`);
  }
  function demo(){
    if(stopped || reduce) return;
    const [a,b,c,d]=EASE.P, tx=a<.5?Math.min(1,a+.45):a-.45, ty=b>.5?b-.9:b+.9, t0=performance.now(), sm=u=>u*u*(3-2*u);
    const step=now=>{
      if(stopped) return;
      const s=(now-t0)/1000; let k=0;
      if(s<.35) g.style.opacity=s/.35; else if(s<1.35) k=sm(s-.35); else if(s<1.8) k=1; else if(s<2.8) k=1-sm(s-1.8);
      else if(s<3.1) g.style.opacity=1-(s-2.8)/.3;
      else { g.style.opacity=0; if(++runs<3) setTimeout(demo,2400); return; }
      if(s>=.35 && s<2.8) g.style.opacity=1;
      frame(a+(tx-a)*k, b+(ty-b)*k, c, d); draf=requestAnimationFrame(step);
    };
    draf=requestAnimationFrame(step);
  }
  function stopDemo(){ stopped=true; cancelAnimationFrame(draf); g.style.opacity=0; }
  stk.addEventListener("pointerdown",stopDemo,true);
  setTimeout(demo,2000);
})();

/* ============ FLOOR: coloured rubber tiles on the empty floor, 7 loose ones hiding something; find all for playground mode ============ */
const FLOOR = (function(){
  const layer=$("#floor"), chip=$("#eggs"), toastEl=$("#toast"), T=88, M=18; // tile size, clearance around content
  const PAL=["#c4553a","#d6ac38","#2f7a62","#3a67a0","#e0782f","#c9668c","#6f4f96"]; // terracotta, mustard, green, blue, orange, pink, violet
  const EGGS=SITE.eggs.map(e=>({...e, ico: String(e.ico).includes("<") ? e.ico : `<span class="ico">${e.ico}</span>`}));
  const BLOCKS=".hero-top,.stage-h,.hero-foot,.brands,.sh,.grid>li,.index,.lab>.card,.bio,.facts,.caps,.people,.contact .eyebrow,.contact h2,.mail,.links,footer";
  let found=new Set(), recreio=false, wave=null, timer=0, toastT=0;
  try{ found=new Set(JSON.parse(localStorage.getItem(SK("eggs"))||"[]").filter(id=>EGGS.some(e=>e.id===id))); recreio=localStorage.getItem(SK("recreio"))==="1"; }catch(e){}
  const save=()=>{ try{ localStorage.setItem(SK("eggs"),JSON.stringify([...found])); localStorage.setItem(SK("recreio"),recreio?"1":"0"); }catch(e){} };
  const h2=(x,y,s)=>{ let h=Math.imul(x|0,374761393)^Math.imul(y|0,668265263)^Math.imul(s,982451653); h=Math.imul(h^(h>>>13),1274126177); return ((h^(h>>>16))>>>0)/4294967296; };
  const vn=(x,y,s)=>{ const xi=Math.floor(x), yi=Math.floor(y), xf=x-xi, yf=y-yi, u=xf*xf*(3-2*xf), v=yf*yf*(3-2*yf);
    const a=h2(xi,yi,s), b=h2(xi+1,yi,s), c=h2(xi,yi+1,s), d=h2(xi+1,yi+1,s); return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v; };
  const shade=(hex,k)=>{ const n=parseInt(hex.slice(1),16); return `rgb(${Math.min(255,(n>>16)*k)|0},${Math.min(255,(n>>8&255)*k)|0},${Math.min(255,(n&255)*k)|0})`; };
  function box(el){ let x=0,y=0,e=el; while(e){ x+=e.offsetLeft; y+=e.offsetTop; e=e.offsetParent; } return [x,y,x+el.offsetWidth,y+el.offsetHeight]; } // layout box, ignores reveal transforms
  function toast(html){ toastEl.innerHTML=html; toastEl.classList.add("on"); clearTimeout(toastT); toastT=setTimeout(()=>toastEl.classList.remove("on"),4200); }
  function count(){
    chip.hidden=found.size===0;
    const all=found.size===EGGS.length;
    chip.textContent=`◆ ${found.size}/${EGGS.length}`+(all?` · ${t(recreio?"rec.on":"rec.off")}`:"");
  }
  chip.onclick=()=>{
    if(found.size<EGGS.length){ toast(t("egg.hint")); return; }
    recreio=!recreio; save(); count();
    wave=[innerWidth/2+scrollX, innerHeight/2+scrollY]; build(); toast(t(recreio?"rec.on":"rec.off"));
  };
  function lift(b,hole,egg){
    b.classList.add("up"); open(hole,egg); found.add(egg.id); save(); count();
    toast(`${L(egg.m)}<span class="mono">${found.size}/${EGGS.length}</span>`);
    setTimeout(()=>b.remove(),600);
    if(found.size===EGGS.length && !recreio) setTimeout(()=>{
      recreio=true; save(); count(); const r=box(hole); wave=[r[0]+T/2,r[1]+T/2]; build(); toast(t("egg.done"));
    },1600);
  }
  function open(hole,egg){ hole.classList.add("open"); hole.tabIndex=0; hole.setAttribute("role","button"); hole.setAttribute("aria-label",L(egg.m)); }
  function build(){
    timer=0;
    const W=document.documentElement.clientWidth, foot=$("footer"), H=box(foot)[3];
    layer.style.height=H+"px";
    document.querySelectorAll(".z-dark,.z-red").forEach(el=>el.style.setProperty("--bgy",-(box(el)[1]%T)+"px")); // keep every zone on the same tile grid
    const occ=[...document.querySelectorAll(BLOCKS)].filter(el=>el.offsetParent||el===foot).map(box).filter(r=>r[2]>r[0] && r[3]>r[1]);
    const zones=[...document.querySelectorAll(".z-dark,.z-red")].map(el=>[box(el),el.classList.contains("z-red")?"var(--signal)":"var(--floor-2)"]);
    const free=[];
    for(let r=0;r*T<H;r++) for(let c=0;(c+1)*T<=W;c++){ // whole tiles only, no sliver at the right edge
      const x0=c*T, y0=r*T;
      if(occ.some(o=>x0<o[2]+M && x0+T>o[0]-M && y0<o[3]+M && y0+T>o[1]-M)) continue;
      free.push({c, r, x:x0, y:y0});
    }
    // loose tiles wear the colour of the floor they sit on, so nothing gives them away; playground mode colours every free tile
    const floorAt=(x,y)=>{ const z=zones.find(([b])=>x>=b[0] && x+T<=b[2] && y>=b[1] && y+T<=b[3]); return z?z[1]:(zones.some(([b])=>y<b[3] && y+T>b[1])?null:"var(--floor)"); };
    const heroB=box($("#hero"))[3], eggAt=new Map(), spots=free.filter(f=>f.y>=heroB && floorAt(f.x,f.y)); // not under the hero's glow, not straddling two zones
    const order=[...spots].sort((a,b)=>h2(a.c,a.r,31)-h2(b.c,b.r,31)), chosen=[]; // stable pseudo-random picks, at least 4 tiles apart when possible
    for(const f of order){ if(chosen.length===EGGS.length) break; if(chosen.every(g=>Math.hypot(g.c-f.c,g.r-f.r)>=4)) chosen.push(f); }
    for(const f of order){ if(chosen.length===EGGS.length) break; if(!chosen.includes(f)) chosen.push(f); }
    chosen.sort((a,b)=>a.r-b.r||a.c-b.c).forEach((f,i)=>eggAt.set(f,EGGS[i]));
    const cells=free.filter(f=>recreio || eggAt.has(f)).map(f=>{
      const off=Math.floor(vn(f.c*.11,f.r*.11,23)*PAL.length); // playground mode: a 4-colour diagonal checker, like poured playground floors
      return {x:f.x, y:f.y, egg:eggAt.get(f), col:recreio ? shade(PAL[(off+(f.c+2*f.r)%4)%PAL.length], .9+h2(f.c,f.r,9)*.16) : floorAt(f.x,f.y)};
    });
    const frag=document.createDocumentFragment();
    cells.forEach(cell=>{
      const pos=`left:${cell.x}px;top:${cell.y}px;--c:${cell.col}`, egg=cell.egg;
      if(egg){
        const hole=document.createElement("div"); hole.className="hole"; hole.style.cssText=pos; hole.innerHTML=egg.ico;
        hole.onclick=()=>toast(L(egg.m)); hole.onkeydown=e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); toast(L(egg.m)); } };
        frag.appendChild(hole);
        if(found.has(egg.id)){ open(hole,egg); return; }
        const b=document.createElement("button"); b.type="button"; b.className="tl loose"; b.style.cssText=pos; b.setAttribute("aria-label",t("tile"));
        b.onclick=()=>lift(b,hole,egg); frag.appendChild(b); return;
      }
      const d=document.createElement("div"); d.className="tl"; d.style.cssText=pos;
      if(wave && !reduce){ d.classList.add("in"); d.style.setProperty("--dl",Math.min(1.6,Math.hypot(cell.x-wave[0],cell.y-wave[1])/1400).toFixed(2)+"s"); }
      frag.appendChild(d);
    });
    layer.replaceChildren(frag); wave=null;
  }
  const schedule=()=>{ clearTimeout(timer); timer=setTimeout(build,220); };
  if("ResizeObserver" in window) new ResizeObserver(schedule).observe(document.body); else addEventListener("resize",schedule);
  addEventListener("load",schedule); if(document.fonts) document.fonts.ready.then(schedule);
  langHooks.push(()=>{ count(); layer.querySelectorAll(".loose").forEach(b=>b.setAttribute("aria-label",t("tile"))); });
  return {build:schedule};
})();

/* ============ BRAND STRIP: drifts with the scroll direction, speeds up with scroll velocity ============ */
(function(){
  renderBrands();
  const m=$("#marq"), inn=m.firstElementChild; if(reduce || !("IntersectionObserver" in window)) return;
  let x=0, w=0, v=-.6, dir=-1, lastY=scrollY, raf=0, vis=false;
  const measure=()=>{ w=inn.firstElementChild.getBoundingClientRect().width; };
  function loop(){
    const dy=scrollY-lastY; lastY=scrollY; if(dy) dir=dy>0?-1:1;
    v+=(dir*(.6+Math.min(60,Math.abs(dy))*.35)-v)*.08; x+=v;
    if(w){ if(x<=-w) x+=w; else if(x>0) x-=w; }
    inn.style.transform=`translate3d(${x.toFixed(2)}px,0,0)`;
    raf=vis?requestAnimationFrame(loop):0;
  }
  new IntersectionObserver(es=>{ vis=es[0].isIntersecting; if(vis && !raf){ lastY=scrollY; measure(); raf=requestAnimationFrame(loop); } }).observe(m);
  addEventListener("resize",measure); addEventListener("load",measure);
})();

/* ============ BOOT ============ */
applyLang(); setView(view,false); RV.watch();
// deep link
(function(){ const h=(location.hash||"").slice(1); const i=PROJECTS.findIndex(p=>p.slug===h); if(i>=0) openCase(i); })();
