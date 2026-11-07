/* ===================== director: scroll is the playhead, agents do the work =====================
   There are no pages. The film is one stream of "beats". A beat is a small composition of elements.
   Each element enters on its own, holds, and leaves on its own, and the next beat starts arriving
   while the last one is still leaving. Every style here is a pure function of the playhead T. */
var OUT=650,OVB=0,GAP=180,T=0,total=0,started=false,INTRO=3600,PPS=95,introCur=0,lenis=null,lastT=0;
/* CHOOSING: the start screen is up. HOLD: do not start the film until the viewer picks. READY: fonts are in */
var CHOOSING=false,HOLD=false,READY=false;function startFilm(){HOLD=false;if(READY)started=true}
var TV=0,HOOKS=[],SWARM={u:0,t0:0,mode:'',sg:null},PLAY={on:false,y:0},PMX=-999,PMY=-999;
var NZ=null;try{if(window.SimplexNoise)NZ=new SimplexNoise('raghav')}catch(e){NZ=null}
var stage=$('#stage'),fadeEl=$('#fade'),hudCh=$('#hCh'),hudTc=$('#hTc'),progI=$('#progI'),trackEl=$('#track'),hintEl=$('#hint'),agLayer=$('#agents');
function ease(x){return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2}
function ease4(x){return x<.5?8*x*x*x*x:1-Math.pow(-2*x+2,4)/2}
function eo(x){return 1-Math.pow(1-x,3)}
function eo4(x){return 1-Math.pow(1-x,4)}
function esc(t){return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;')}
function sqi(c){return '<i class="sq '+c+'"></i>'}
function R(el){return el.getBoundingClientRect()}

/* ===================== the agents ===================== */
var ARROW='<svg viewBox="0 0 16 16"><path d="M1 1l5 14 2.4-5.6L14 7z"/></svg>';
var SHP='<svg class="s cr" viewBox="0 0 26 26"><path d="M13 5v16M5 13h16"/></svg>'
  +'<svg class="s ib" viewBox="0 0 26 26"><path d="M9.5 5H12.2Q13 5 13 6V20Q13 21 12.2 21H9.5M16.5 5H13.8Q13 5 13 6M16.5 21H13.8Q13 21 13 20"/></svg>'
  +'<svg class="s pn" viewBox="0 0 26 26"><path d="M4 4l9 3.2 6.5 6.5-5.8 5.8L7.2 13z"/><path d="M4.6 4.6l5.6 5.6"/><circle cx="11" cy="11" r="1.6"/></svg>';
function shapeOf(l){l=l.charAt(0)==='!'?'':l;return /^(SELECTING|WRITING|TYPING|READING|DICTATING|HIGHLIGHTING)$/.test(l)?'ib':/^(RESIZING|STAMPING|PLACING)$/.test(l)?'cr':l==='DRAWING'?'pn':'ar'}
var AGS=[0,1,2,3,4,5].map(function(i){
  var gh=[];
  for(var g=0;g<6;g++){var ge=document.createElement('div');ge.className='gh';ge.innerHTML=ARROW;agLayer.appendChild(ge);gh.push({el:ge,x:-300,y:-300})}
  var el=document.createElement('div');el.className='ag a'+(i+1);
  el.innerHTML='<i class="rg"></i><div class="cu">'+ARROW.replace('<svg ','<svg class="s ar on" ')+SHP+'</div><b class="tg">AGENT_0'+(i+1)+'</b><i class="rp"></i>';
  var fr=document.createElement('div');fr.className='fr';fr.innerHTML='<i></i><i></i><i></i><i></i><b></b>';agLayer.appendChild(fr);
  agLayer.appendChild(el);
  return {fr:fr,frb:fr.lastChild,frOn:false,shp:'ar',el:el,cu:$('.cu',el),rg:$('.rg',el),tag:$('.tg',el),rp:$('.rp',el),gh:gh,segs:[],x:-300,y:-300,vx:0,vy:0,op:0,lab:'',grab:false,lean:0,spinT:-1e9,spinDeg:0,spinDur:800,pulseT:-1e9,pT:null};
});
function seg(a,t0,t1,fn,o){o=o||{};AGS[a].segs.push({t0:t0,t1:t1,fn:fn,label:o.label||'WORKING',grab:!!o.grab,clicks:o.clicks||[],shape:o.shape||null,frame:o.frame||null,fbadge:!!o.fbadge})}
function segFree(a,t0,t1){return AGS[a].segs.every(function(s){return s.t1<t0-120||s.t0>t1+120})}
var agRR=0;
function pickAg(t0,t1){for(var k=0;k<6;k++){var a=(agRR+k)%6;if(segFree(a,t0,t1)){agRR=a+1;return a}}return -1}
var EXD=[[1,-1],[-1,-1],[1,1],[-1,1],[0,-1],[0,1]];
function swarmPos(ai,now,W,H){
  if(SWARM.mode==='line'){var gap=Math.min(150,W/7);return{x:W/2+(ai-2.5)*gap-30,y:H*.7+Math.sin(now*.003+ai*.9)*5}}
  var cx=PMX>-900?PMX:W/2,cy=PMY>-900?PMY:H/2,an=now*.0013*(ai%2?1:-1.2)+ai*1.047,r=58+ai*16+Math.sin(now*.002+ai)*10;
  return{x:cx+Math.cos(an)*r,y:cy+Math.sin(an)*r*.8}
}
function agentsFrame(dt,now){
  var W=innerWidth,H=innerHeight;
  AGS.forEach(function(a,ai){
    if(CHOOSING&&!a.ovr){if(a.op>0){a.el.style.opacity=0;a.gh.forEach(function(g){g.el.style.opacity=0});a.op=0}if(a.frOn){a.fr.style.opacity=0;a.frOn=false}return}
    var act=null,prev=null,next=null,segs=a.segs;
    for(var i=0;i<segs.length;i++){
      var s=segs[i];
      if(T>=s.t0&&T<=s.t1)act=s;
      else if(s.t1<T)prev=s;
      else if(!next)next=s;
    }
    var tgt=null,op=0,sg=null;
    if(act){tgt=act.fn(T);op=1;sg=act}
    else{
      var gp=prev?T-prev.t1:1e9,gn=next?next.t0-T:1e9;
      if(prev&&next&&gp+gn<1400){tgt=next.fn(next.t0);op=1;sg=next}
      else if(next&&gn<700){tgt=next.fn(next.t0);op=1-gn/700;sg=next}
      else if(prev&&gp<700){var q=prev.fn(prev.t1),f=gp/700;tgt={x:q.x+EXD[ai][0]*420*f*f,y:q.y+EXD[ai][1]*300*f*f};op=1-f;sg=prev}
    }
    var lock=null;if(a.ovr){var oo=a.ovr;if(oo.u&&now>oo.u+450)a.ovr=null;else if(!oo.on||oo.on()){tgt=oo.fn();op=oo.u&&now>oo.u?1-(now-oo.u)/450:1;sg=oo.sg;act=oo.sg.grab?oo.sg:null;if(oo.lock&&!oo.u)lock=oo}}
    if(SWARM.u&&now<SWARM.u+450){
      var sf=now<SWARM.u?clamp((now-SWARM.t0)/300,0,1):1-clamp((now-SWARM.u)/450,0,1);
      tgt=swarmPos(ai,now,W,H);op=sf;sg=SWARM.sg[ai];act=null;
      if(SWARM.mode==='line'&&!a.bw&&now>SWARM.t0+700+ai*150){a.bw=1;a.spinT=now;a.spinDeg=360;a.spinDur=800;a.pulseT=now}
    }
    if(!tgt||op<=0){if(a.frOn){a.fr.style.opacity=0;a.frOn=false}if(a.op>0){a.el.style.opacity=0;a.gh.forEach(function(g){g.el.style.opacity=0});a.op=0}return}
    if(a.op<=0.001){a.x=tgt.x+EXD[ai][0]*520;a.y=tgt.y+EXD[ai][1]*380;a.vx=-EXD[ai][0]*600;a.vy=-EXD[ai][1]*400;a.spinT=now;a.spinDeg=720;a.spinDur=1100;a.gh.forEach(function(g){g.x=a.x;g.y=a.y})}
    /* the interns are shy: they lean away from the viewer's real pointer */
    if(PMX>-900&&!a.ovr){var fx=tgt.x-PMX,fy=tgt.y-PMY,fd=Math.hypot(fx,fy);if(fd<90&&fd>.1){var fp=(90-fd)/90*46;tgt={x:tgt.x+fx/fd*fp,y:tgt.y+fy/fd*fp}}}
    var h=Math.min(dt,.04)/2;
    for(var st=0;st<2;st++){
      a.vx+=(210*(tgt.x-a.x)-15*a.vx)*h;a.vy+=(210*(tgt.y-a.y)-15*a.vy)*h;a.x+=a.vx*h;a.y+=a.vy*h;
    }
    a.op=op;
    var sp=Math.hypot(a.vx,a.vy);
    /* a locked cursor (holding something) sits exactly on its target: once it has arrived, no spring lag and no idle wobble */
    if(lock){var ld=Math.hypot(tgt.x-a.x,tgt.y-a.y);if(ld<14||lock.got){lock.got=1;a.x=tgt.x;a.y=tgt.y;a.vx=0;a.vy=0;sp=0}}
    var wob=lock?0:sp<80?1-sp/80:0,ox,oy;
    if(NZ){ox=NZ.noise2D(now*.0009,ai*3.1)*4.2*wob;oy=NZ.noise2D(now*.0009,ai*3.1+40)*4.2*wob}
    else{ox=Math.cos(now*.004+ai*1.7)*3.5*wob;oy=Math.sin(now*.005+ai)*3.5*wob}
    var px=a.x+ox,py=a.y+oy;
    if(sg){
      for(var c=0;c<sg.clicks.length;c++){var ct=sg.clicks[c];if(a.pT!==null&&(a.pT-ct)*(T-ct)<=0&&a.pT!==T){a.spinT=now;a.spinDeg=360;a.spinDur=750;a.pulseT=now}}
    }
    a.pT=T;
    var lt=clamp(a.vx*.032,-42,42);a.lean+=(lt-a.lean)*(1-Math.exp(-dt*10));
    var su=clamp((now-a.spinT)/a.spinDur,0,1),spin=su>=1?0:a.spinDeg*(1-Math.pow(1-su,3));
    var pu=clamp((now-a.pulseT)/420,0,1),pf=pu<.16?-.28*(pu/.16):-.28*Math.exp(-(pu-.16)*6.5)*Math.cos((pu-.16)*13),sc=(1+pf)*(a.grab?.9:1);
    var rot=lock?lock.rot+spin:a.lean+spin;
    a.el.style.opacity=op.toFixed(3);
    a.el.style.transform='translate3d('+px.toFixed(1)+'px,'+py.toFixed(1)+'px,0)';
    a.cu.style.transform='rotate('+rot.toFixed(1)+'deg) scale('+sc.toFixed(3)+')';
    var fl=px>W-200&&!(a.ovr&&a.ovr.nofl&&px<W-110),fv=py>H-40;if(fl!==a.fl){a.fl=fl;a.el.classList.toggle('fl',fl)}if(fv!==a.fv){a.fv=fv;a.el.classList.toggle('fv',fv)}
    var gb=!!(sg&&sg.grab&&act);if(gb!==a.grab){a.grab=gb;a.el.classList.toggle('grab',gb)}
    a.rg.style.opacity=gb&&!lock?(.85*op).toFixed(2):0;a.rg.style.transform='translate(-50%,-50%) rotate('+(now*.32%360).toFixed(1)+'deg) scale('+(gb?1:.4)+')';
    if(sg){
      var lab=a.quip&&now<a.quip.u?'!'+a.quip.t:sg.label;if(a.lab!==lab){a.lab=lab;a.tag.textContent=lab.charAt(0)==='!'?lab.slice(1):'AGENT_0'+(ai+1)+' '+lab;a.tag.classList.remove('pop');void a.tag.offsetWidth;a.tag.classList.add('pop');a.tag.classList.toggle('big',lab==='!Beat you to it :)')}
      var shp=sg.shape||shapeOf(sg.label);
      if(shp!==a.shp){a.shp=shp;var ss=a.cu.children;for(var si=0;si<ss.length;si++)ss[si].classList.toggle('on',ss[si].classList.contains(shp))}
      var cu=0;
      for(var c2=0;c2<sg.clicks.length;c2++){var u=(T-sg.clicks[c2])/620;if(u>=0&&u<=1)cu=u}
      if(cu>0){a.rp.style.opacity=(1-cu).toFixed(3);a.rp.style.transform='translate(-50%,-50%) scale('+(.3+cu*3.2).toFixed(3)+')'}else{a.rp.style.opacity=0}
    }
    var fo=sg&&sg.frame&&sg===act&&op>.02?sg.frame:null;
    if(fo){var fq=R(fo),fw=Math.round(fq.width),fh=Math.round(fq.height);
      a.fr.style.cssText='opacity:'+op.toFixed(3)+';transform:translate3d('+fq.left.toFixed(1)+'px,'+fq.top.toFixed(1)+'px,0);width:'+fq.width.toFixed(1)+'px;height:'+fq.height.toFixed(1)+'px';
      a.frb.style.display=sg.fbadge?'block':'none';if(sg.fbadge){var bt=fw+' × '+fh;if(a.frb.textContent!==bt)a.frb.textContent=bt}
      a.frOn=true}
    else if(a.frOn){a.fr.style.opacity=0;a.frOn=false}
    var lx=px,ly=py;
    for(var g=0;g<a.gh.length;g++){
      var gg=a.gh[g],k=1-Math.exp(-dt*(24-g*2.6));gg.x+=(lx-gg.x)*k;gg.y+=(ly-gg.y)*k;lx=gg.x;ly=gg.y;
      var go=clamp(sp/650,0,1)*(.5-g*.075)*op;
      gg.el.style.opacity=go.toFixed(3);
      gg.el.style.transform='translate3d('+gg.x.toFixed(1)+'px,'+gg.y.toFixed(1)+'px,0) rotate('+rot.toFixed(1)+'deg) scale('+(1-g*.06).toFixed(3)+')';
    }
  });
}
/* typing rhythm: a fixed, seeded pace per character (pure in time), slower on spaces and the odd hesitation */
function typeCurve(N,seed){
  var q=seed||11,cum=[0],sum=0;function rnd(){q=(q*16807)%2147483647;return q/2147483647}
  for(var i=0;i<N;i++){var d=12+rnd()*28;if(i%5===4)d+=rnd()*26;if(rnd()<.06)d+=80+rnd()*120;sum+=d;cum.push(sum)}
  return function(u){if(u<=0)return 0;if(u>=1)return 1;var x=u*sum,lo=0,hi=N;while(hi-lo>1){var m=(lo+hi)>>1;if(cum[m]<=x)lo=m;else hi=m}return (lo+(x-cum[lo])/(cum[lo+1]-cum[lo]))/N}
}
function atEl(el,ax,ay,dx,dy){return function(){var r=R(el);return{x:r.left+r.width*ax+(dx||0),y:r.top+r.height*ay+(dy||0)}}}

/* ---- confetti ---- */
var cfc=document.getElementById('cf'),cfx=cfc.getContext('2d'),CFP=[],CFB=[],cfW=0,cfH=0,cfD=1;
(function(){var s=7;function r(){s=(s*16807)%2147483647;return s/2147483647}for(var i=0;i<150;i++)CFP.push({vx:(r()*2-1)*620,vy:-(280+r()*900),w:5+r()*8,h:3+r()*4,rs:(r()*2-1)*16,r0:r()*6.28,c:i%3?'#ffffff':'#8B8B93'})})();
function cfSize(){cfD=Math.min(2,devicePixelRatio||1);cfW=innerWidth;cfH=innerHeight;cfc.width=Math.round(cfW*cfD);cfc.height=Math.round(cfH*cfD)}
cfSize();addEventListener('resize',cfSize);
function drawCF(now){
  cfx.setTransform(cfD,0,0,cfD,0,0);cfx.clearRect(0,0,cfW,cfH);
  for(var b=0;b<CFB.length;b++){
    var bu=CFB[b],t=bu.k==='T'?(T-bu.t0)/1000:(now-bu.t0)/1000;if(t<0||t>3)continue;
    var o=bu.o(),al=1-clamp((t-2)/1,0,1);cfx.globalAlpha=al;
    var cn=bu.n||CFP.length,cv=bu.v||1;
    for(var i=0;i<cn;i++){
      var c=CFP[i],x=o.x+c.vx*cv*t,y=o.y+c.vy*cv*t+.5*1500*t*t;
      cfx.save();cfx.translate(x,y);cfx.rotate(c.r0+c.rs*t);cfx.scale(1,Math.cos(c.rs*t*1.7));cfx.fillStyle=c.c;cfx.fillRect(-c.w/2,-c.h/2,c.w,c.h);cfx.restore();
    }
  }
  cfx.globalAlpha=1;
}

/* ===================== the beats ===================== */
var BEATS=[];
function bt(o){BEATS.push(o);return o}
/* markup helpers. data-fx: how it enters. data-x: how it leaves. data-ag: what an agent does with it. data-d: delay */
/* headlines are typed by an agent. "[[wrong]]" marks a typo the agent types, notices and deletes */
function hd(s,cls){return '<h2 class="big '+(cls||'')+'" data-fx="chars">'+s.split('|').map(function(l){var g=l.charAt(0)==='~';if(g)l=l.slice(1);var m=/\[\[(.*?)\]\]/.exec(l),tp='';if(m){tp=' data-tp="'+m.index+'|'+esc(m[1])+'"';l=l.replace(m[0],'')}return '<span class="ln'+(g?' g':'')+'"><span class="pr"'+tp+'>'+esc(l)+'</span></span>'}).join('')+'<i class="tcar"></i></h2>'}
/* keystrokes for one line, seeded so it is the same every time: [{t, nc (correct chars shown), nw (typo chars shown)}] */
function kbSched(txt,pos,wrong,seed){
  var q=seed||9,out=[{t:0,nc:0,nw:0}],t=0,nc=0,nw=0;function r(){q=(q*16807)%2147483647;return q/2147483647}
  function step(dt){t+=dt;out.push({t:t,nc:nc,nw:nw})}
  for(var i=0;i<=txt.length;i++){
    if(i===pos&&wrong){for(var k=0;k<wrong.length;k++){nw++;step(20+r()*24)}t+=420;for(k=0;k<wrong.length;k++){nw--;step(26)}t+=90}
    if(i<txt.length){nc++;step((txt.charAt(i)===' '?30:13)+r()*18+(r()<.05?90:0))}
  }
  return{s:out,d:t};
}
function kbAt(k,e){var a=k.s;if(e<=0)return a[0];if(e>=k.d)return a[a.length-1];var lo=0,hi=a.length-1;while(hi-lo>1){var m=(lo+hi)>>1;if(a[m].t<=e)lo=m;else hi=m}return a[lo]}
function kk(s){return '<p class="kick" data-fx="wipe">'+esc(s)+'</p>'}
function sy(s,x){return '<p class="say" data-fx="rise"'+(x||'')+'>'+esc(s)+'</p>'}
function as(s,x){return '<p class="aside" data-fx="type"'+(x||'')+'>'+esc(s)+'<i class="cr"></i></p>'}
/* stickers are big, and take the empty half of the screen opposite the text: side 'r' or 'l' */
function stk(s,side,r,x){return '<b class="stk far '+side+'" data-fx="stamp" data-r="'+(r||0)+'" data-ag="stamp"'+(x||'')+'>'+esc(s)+'</b>'}
function nm(n,suf){return '<b class="num" data-fx="count" data-n="'+n+'" data-s="'+(suf||'')+'">'+n+(suf||'')+'</b>'}
function tg(a){return '<div class="tags" data-fx="rise">'+a.map(function(x){return '<span>'+esc(x)+'</span>'}).join('')+'</div>'}
function sta(p){return '<p class="st" data-fx="left">'+sqi(p.sq)+esc(p.status)+'</p>'}
/* big 3D boxes wait until the previous beat has fully left, so they never sit on top of words still being read */
function vz(name,cls){return '<div class="vz '+(cls||'')+'" data-viz="'+name+'" data-fx="scale" data-ag="frame" data-d="'+(GAP+120)+'"></div>'}
function D(ms){return ' data-d="'+ms+'"'}
var SCR='#%&*+=/<>?01ABCDEFGHKXYZ';
function prj(id){var all=P1.concat(P2);for(var i=0;i<all.length;i++)if(all[i].id===id)return all[i]}
function fixed(a,t0,t1,fn,o){if(segFree(a,t0,t1))seg(a,t0,t1,fn,o);else{var k=pickAg(t0,t1);if(k>=0)seg(k,t0,t1,fn,o)}}

/* ---------------- Intro ---------------- */
bt({id:'hello',chap:'Intro',dur:5200,cls:'pl',
  html:'<div class="vz hero" data-viz="hero" data-fx="fade"></div>'+kk('Portfolio // 2026 // Bengaluru, India')+hd('Hi.|I am [[Rgah]]Raghav.','xl')+as('Student. Bengaluru. Builds things at an alarming rate.')+(SITE.resume?'<div class="endb rsm" data-fx="rise" data-d="2600"><a class="btn" href="'+esc(SITE.resume)+'" target="_blank" rel="noopener">[ JUST GIVE ME THE RESUME ]</a></div>':'')});
bt({chap:'Intro',dur:4400,cls:'pl',obj:'system',html:hd('~I design the system.|Then AI builds it[[ (mostly)]].')});
bt({chap:'Intro',dur:4000,cls:'pc',html:hd('~My ideas come faster|~than I can [[tpye]]type.','md')});
bt({chap:'Intro',dur:3800,cls:'pc',obj:'keys',html:hd('So I [[quit]]stopped typing.','xl')+as('The cursors type now. Like that one.')});
bt({id:'interns',chap:'Intro',dur:4800,cls:'pc',html:hd('Meet the [[unpaid ]]interns.')+sy('Six cursors. Zero salary.')+as('Same deal as me, to be fair. I also work for free.'),
  ag:function(b){var h=$('h2',b.el),L=['!HI','!HELLO','!WE ARE UNPAID','!SEND HELP','!HI MOM','!:)'];
    L.forEach(function(l,i){var t0=b.start+2200+i*130;fixed(i,t0,b.start+b.dur-OUT-60,function(){var r=R(h);return{x:r.left+r.width*(i+.5)/6-34,y:r.top-16-(i%2)*34}},{label:l,clicks:[t0+300]})})}});

/* ---------------- In numbers ---------------- */
bt({chap:'In numbers',dur:3800,cls:'pn',html:nm(6)+'<div class="cap">'+hd('projects.','md')+as('Two bodies of work. One tired guy.')+'</div>'});
bt({chap:'In numbers',dur:4200,cls:'pn rv',html:nm(4)+'<div class="cap">'+hd('of them in about|six weeks.','md')+as('28 Sep to 2 Nov 2026. Sleep was optional.')+'</div>'});
bt({chap:'In numbers',dur:4000,cls:'pn',html:nm(2)+'<div class="cap">'+hd('shipped with|real installers.','md')+as('You double-click. It opens. Revolutionary.')+'</div>'});
bt({chap:'In numbers',dur:4600,cls:'pn rv',html:nm(2,'nd')+'<div class="cap">'+hd('at the India|national final.','md')+sy('In a country of almost 1.5 billion people.')+as('STEM Racing, as a team. I did not build the car. Please stop asking.')+'</div>'});

/* ---------------- Why me ---------------- */
bt({chap:'Why me',dur:3800,cls:'pc',html:hd('~Not just ideas.|Things that run.','xl')});
bt({chap:'Why me',dur:4000,cls:'pc why',html:'<div class="ic" data-viz="ship" data-fx="scale" data-ag="carry"></div>'+kk('01 // Ships')+sy('Two apps released. One system working.')+as('Zero "coming soon" pages were harmed.')});
bt({chap:'Why me',dur:4000,cls:'pc why',html:'<div class="ic" data-viz="layers" data-fx="scale" data-ag="carry"></div>'+kk('02 // Spans layers')+sy('From a circuit board to a sponsor portal.')+as('I design the hardware and direct AI to write the software.')});
bt({chap:'Why me',dur:4000,cls:'pc why',html:'<div class="ic" data-viz="flag" data-fx="scale" data-ag="carry"></div>'+kk('03 // Leads')+sy('Co-founded a racing team.')+as('Enterprise Director of Team Cardinal. Yes, that is a real title.')});

/* ---------------- Personal builds ---------------- */
function projBeats(id,n,of,chap,rv,lines,g){
  var p=prj(id),c=COPY[id];
  bt({chap:chap,dur:5000,cls:'split'+(rv?' rv':''),viz:id,html:vz(id)+'<div class="tx">'+kk(chap+' // '+pad(n)+' of '+pad(of))+hd(p.name+'.')+sy(lines[0])+tg(c.chips)+'</div>'});
  bt({chap:chap,dur:4800,cls:rv?'rt':'pl',obj:g,html:hd(lines[1],'md')+(lines[2]?as(lines[2]):'')+'<div class="meta">'+sta(p)+'<p class="m" data-fx="fade">'+esc(p.metric)+'</p></div>'});
}
function projBeats2(id,title,line,n){
  var p=prj(id),c=COPY[id];
  bt({chap:'Cardinal',dur:5000,cls:'split'+(n===2?' rv':''),viz:id,html:vz(id)+'<div class="tx">'+kk('Cardinal // '+pad(n)+' of 02')+hd(title)+sy(line)+tg(c.chips)+'<div class="meta">'+sta(p)+'</div></div>'});
}
projBeats('blackbook',1,4,'Personal builds',false,['The Digital SAT, offline.','~Your laptop is now|an exam hall.','No accounts. No tracking. Works fully without AI.'],'laptop');
projBeats('takt',2,4,'Personal builds',true,['Hold a key. Talk. Text appears in any app.','~It deletes your|"um"s.','Most of them. It is not a miracle worker. Nothing leaves the computer by default.'],'mic');
projBeats('relay',3,4,'Personal builds',false,['Turns on my home PC from any browser.','~Even the locked down|school one.','It also does whatever I email it. Within written limits. Calm down.'],'lock');
projBeats('scrub',4,4,'Personal builds',true,['A handheld music player with a haptic wheel.','~Designed.|[[Shipped]]Not built.','Not ordered. Not powered on. The firmware has never met real hardware. Please do not ask it to play music.'],'board');

/* ---------------- Cardinal ---------------- */
bt({chap:'Cardinal',dur:4200,cls:'pl',html:kk('Cardinal // STEM Racing team // Jun to Aug 2026')+hd('~Built for the team.|Used by the team.')});
bt({chap:'Cardinal',dur:4400,cls:'pn',html:nm(1,'st')+'<div class="cap">'+hd('All-India National|Qualifiers.','md')+as('Overall Champions, plus the Sustainability Award. As a team.')+'</div>'});
bt({chap:'Cardinal',dur:4200,cls:'pc',html:hd('Enterprise|[[Overlord]]Director.','xl')+as('My role. Also systems architecture, software and design. Busy.')});
bt({chap:'Cardinal',dur:4800,cls:'pl',obj:'car',html:hd('~The cars are the team\'s work.|I built the website|and the portal.','md')+as('I just make the cars look famous.')});
projBeats2('cardsite','Cardinal website.','The public home of the team. Sponsors included.',1);
projBeats2('overture','Overture.','The private portal that runs the whole team.',2);
bt({chap:'Cardinal',dur:4400,cls:'pl',obj:'chat',html:hd('~It has a chat assistant.|It is switched off.','md')+as('The screen says so. Honesty is a feature.')});

/* ---------------- Process ---------------- */
bt({chap:'Process',dur:5200,cls:'split',viz:'orch',html:vz('orch')+'<div class="tx">'+hd('~How a team of models|works for me.','md')+as('A small company. Everyone is a model except me.')+'</div>',
  ag:function(b){holdIn(b,2600,b.dur-OUT-100,function(a){var q=null;a.pk.forEach(function(m){if(m.visible)q=m});return q?[q,[0,0,0]]:[a.man,[0,0,0]]},'CARRYING TASK')}});
bt({chap:'Process',dur:4200,cls:'pl',obj:'crown',html:kk('The manager')+hd('Claude Opus|is the [[intern]]boss.','md')+as('Plans, hands out work, owns every decision. It also helped build this site.')});
bt({chap:'Process',dur:4200,cls:'rt',html:kk('The workers')+hd('Free models|do the reading.','md')+as('Datasheets. First drafts. The boring stuff.')});
/* the usage limit dialog takes over this whole beat, see LIM below */
bt({id:'limit',chap:'Process',dur:2600,cls:'pc',html:''});
bt({chap:'Process',dur:4600,cls:'pl',html:kk('The check')+hd('Everything gets checked|against the source.','md')+as('Once a model got a chip pin layout wrong. The datasheet snitched.')});
bt({chap:'Process',dur:3800,cls:'pc',html:kk('Me')+hd('I make the final [[cal]]call.','xl')+as('Management material, apparently.')});

/* ---------------- About ---------------- */
bt({chap:'About',dur:4200,cls:'pl',obj:'joy',html:kk('About // Bengaluru, India')+hd('~Started with games.|Now whole systems.')});
bt({chap:'About',dur:4200,cls:'pn',html:nm(5,'+')+'<div class="cap">'+hd('games in Godot|since 2022.','md')+as('Lead developer at Isha Home School. The gamer to systems guy pipeline is real.')+'</div>'});
bt({chap:'About',dur:5600,cls:'pl',obj:'thumb',html:hd('~My ideas come faster|~than I can [[cdoe]]code.|So I stopped coding.','md')+as('I plan carefully, direct AI tools to build, and test what I ship.')+'<p class="foot" data-fx="fade">Certified in Agentic AI, through Andrew Ng\'s course.</p>'});
bt({chap:'About',dur:4400,cls:'pc',obj:'cap',html:hd('~Applying for design and|technology degrees.','md')+as('Admissions officers: hi. Please keep scrolling.')});
bt({id:'gantt',chap:'About',dur:7200,cls:'pg',html:'<div class="gt">'+kk('Since 2022')+hd('~Seven things,|in order.','md')+'<div class="g-wrap" data-fx="rise"><div class="g-rows"></div><div class="g-ax"><div></div><div class="gAx"></div></div></div></div>',
  setup:function(b){
    var el=b.el,D0=new Date(2022,5,1),D1=new Date(2026,11,31),now=new Date(),floor=new Date(2026,10,6),today=now>floor?now:floor;
    function pos(d){return clamp((d-D0)/(D1-D0)*100,0,100)}
    var h='';
    TL.forEach(function(r){var a=pos(new Date(r.a[0],r.a[1],r.a[2])),z=r.b?pos(new Date(r.b[0],r.b[1],r.b[2])):pos(today);
      h+='<div class="g-r"><div class="g-n"><b>'+esc(r.n)+'</b><span>'+esc(r.l)+'</span></div><div class="g-t"><i class="g-b'+(r.b?'':' run')+'" style="left:'+a.toFixed(2)+'%;width:'+Math.max(.8,z-a).toFixed(2)+'%"></i></div></div>'});
    var rows=$('.g-rows',el);rows.innerHTML=h;
    var ticks=[[new Date(2022,5,1),'2022'],[new Date(2023,0,1),'2023'],[new Date(2024,0,1),'2024'],[new Date(2025,0,1),'2025'],[new Date(2026,0,1),'2026']];
    $('.gAx',el).innerHTML=ticks.map(function(t){return '<span style="left:'+pos(t[0]).toFixed(2)+'%">'+t[1]+'</span>'}).join('');
    var td=document.createElement('i');td.className='g-today';td.style.left=pos(today).toFixed(2)+'%';td.innerHTML='<em>TODAY</em>';
    var wr=document.createElement('div');wr.className='g-tw';wr.appendChild(td);rows.appendChild(wr);
    b.bars=$$('.g-b',el);b.rows=$$('.g-r',el);b.td=td;
  },
  each:function(b,local){
    b.rows.forEach(function(r,i){var u=clamp((local-1900-i*330)/500,0,1);r.style.opacity=u.toFixed(3)});
    b.bars.forEach(function(x,i){var u=eo4(clamp((local-1950-i*330)/900,0,1));x.style.transform='scaleX('+u.toFixed(4)+')'});
    b.td.style.opacity=clamp((local-4600)/500,0,1).toFixed(3);
  },
  ag:function(b){b.bars.forEach(function(x,i){if(i%2)return;var t0=b.start+1950+i*330,a=pickAg(t0-200,t0+1000);if(a<0)return;seg(a,t0-200,t0+1000,function(){var r=R(x);return{x:r.right,y:r.top+r.height/2}},{label:'DRAWING',grab:true,clicks:[t0]})})}});

/* ---------------- Work with me ---------------- */
bt({chap:'Work with me',dur:4200,cls:'pc',html:hd('I will work for [[money]]free.','xl')+as('Not a typo. Unpaid work and internships, yes please.')});
bt({chap:'Work with me',dur:4000,cls:'pl',html:hd('~Give me something|real.','xl')+as('A real problem. A real deadline. Real users.')});
bt({chap:'Work with me',dur:3800,cls:'pc',html:'<div class="pdt"><b data-fx="rise">Plan.</b><b data-fx="rise">Direct.</b><b data-fx="rise">Test.</b></div>'+as('I can automate anything. Try me.'),
  ag:function(b){var L=['PLANNING','DIRECTING','TESTING'];$$('.pdt b',b.el).forEach(function(w,i){var t0=b.start+GAP+i*300+500;fixed(i+1,t0,b.start+b.dur-OUT-80,atEl(w,.42,-.12),{label:L[i],clicks:[t0+200]})})}});

/* ---------------- Contact ---------------- */
bt({id:'contact',chap:'Contact',dur:8400,cls:'pl',html:hd('~Got a real [[probelm]]problem?|Email me.')+'<div class="mail" data-fx="rise"'+D(2300)+'><code class="mailTxt"></code><button class="btn" type="button">[ COPY_EMAIL ]</button></div>'+as('Email is the best way to reach me. Carrier pigeons keep getting lost.',D(3100)),
  setup:function(b){
    var code=$('.mailTxt',b.el),btn=$('.btn',b.el),em=SITE.email,clickT=b.start+5400,done=false,manual=0,pending=false,tcv=typeCurve(em.length),TS=b.start+2900,TD=em.length*70;
    code.style.minWidth=em.length+'ch';code.textContent='';b.code=code;b.btn=btn;b.tcv=tcv;b.TS=TS;b.TD=TD;b.clickT=clickT;
    function bo(){var r=R(btn);return{x:r.left+r.width/2,y:r.top+r.height/2}}
    function legacy(){try{var ta=document.createElement('textarea');ta.value=em;ta.style.cssText='position:fixed;opacity:0;top:0;left:0';document.body.appendChild(ta);ta.select();var r=document.execCommand('copy');document.body.removeChild(ta);pending=!r}catch(e){pending=true}}
    function doCopy(){try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(em).then(function(){pending=false},legacy)}else legacy()}catch(e){legacy()}}
    ['pointerdown','keydown','touchstart'].forEach(function(n){addEventListener(n,function(){if(pending&&done){pending=false;doCopy()}},{passive:true})});
    btn.addEventListener('click',function(){manual=performance.now()+2800;doCopy();CFB.push({k:'W',t0:performance.now(),o:bo})});
    CFB.push({k:'T',t0:clickT,o:bo});
    b.upd=function(){
      code.classList.toggle('car',T>=TS-200&&T<=TS+TD+1500);code.classList.toggle('typing',T>=TS&&T<TS+TD);
      var n=Math.floor(tcv(clamp((T-TS)/TD,0,1))*em.length+1e-6);if(code._n!==n){code._n=n;code.textContent=em.slice(0,n)}
      var fl=clamp(1-Math.abs(T-clickT-300)/300,0,1);btn.style.background=fl>0?'rgba(255,255,255,'+fl.toFixed(3)+')':'';btn.style.color=fl>.5?'#000':'';
      var on=T>=clickT||performance.now()<manual;
      if(on!==done){done=on;btn.textContent=on?'[ COPIED ]':'[ COPY_EMAIL ]';if(on&&T>=clickT&&!(performance.now()<manual))doCopy()}
    };
  },
  ag:function(b){
    fixed(2,b.TS-300,b.TS+b.TD+500,function(){var r=R(b.code);return{x:r.left+r.width*b.tcv(clamp((T-b.TS)/b.TD,0,1)),y:r.top+r.height*.5}},{label:'TYPING',clicks:[b.TS]});
    fixed(3,b.clickT-800,b.start+b.dur-OUT,function(){var r=R(b.btn);return{x:r.left+r.width*.5,y:r.top+r.height*.5}},{label:'CLICKING',clicks:[b.clickT]});
    var sg=AGS[3].segs[AGS[3].segs.length-1];
    if(sg&&sg.t0===b.clickT-800)Object.defineProperty(sg,'label',{get:function(){return T<b.clickT?'CLICKING':'!Beat you to it :)'}});
  }});

/* ---------------- Credits ---------------- */
var CAST=["!THAT'S ME","!HI","!THAT'S ME",'!I CLICKED IT FIRST','!I DREW THE BOXES','!ME TOO'];
bt({chap:'Credits',dur:3800,cls:'pc',obj:'reel',html:kk('Written and directed by')+hd('Raghav Bahadur','md')});
bt({chap:'Credits',dur:4200,cls:'pc',html:kk('Starring')+'<div class="cast" data-fx="rise">'+[1,2,3,4,5,6].map(function(n){return '<b>AGENT_0'+n+'</b>'}).join('')+'</div>',
  ag:function(b){$$('.cast b',b.el).forEach(function(x,i){var t0=b.start+900+i*120;fixed(i,t0,b.start+b.dur-OUT,atEl(x,1,.62,6,0),{label:CAST[i],clicks:[t0+260]})})}});
bt({chap:'Credits',dur:4600,cls:'pc',html:'<div class="cr3"><div data-fx="rise"><p class="kick">Also starring</p><p class="crv">A free model, checking its work against the source</p></div><div data-fx="rise"><p class="kick">Fell asleep on set</p><p class="crv"><span class="zz">AGENT_01</span></p></div><div data-fx="rise"><p class="kick">Filmed in</p><p class="crv">Bengaluru, India</p></div></div>'+as('No cursors were harmed in the making of this film.'),
  ag:function(b){var z=$('.zz',b.el),t0=b.start+1300;fixed(0,t0,b.start+b.dur-OUT,atEl(z,1,.62,6,0),{label:'!ZZZ',clicks:[t0+200]})}});
bt({chap:'Credits',dur:4800,cls:'pc',html:'<div class="cr3"><div data-fx="rise"><p class="kick">Catering</p><p class="crv">None. Everyone here is unpaid.</p></div><div data-fx="rise"><p class="kick">Stunt cursor</p><p class="crv"><span class="zz2">AGENT_03</span></p></div><div data-fx="rise"><p class="kick">Typos</p><p class="crv">All intentional. Mostly.</p></div><div data-fx="rise"><p class="kick">Continuity</p><p class="crv">Checked against the source</p></div></div>',
  ag:function(b){var z=$('.zz2',b.el),t0=b.start+1200;fixed(2,t0,b.start+b.dur-OUT,function(t){var r=R(z),u=(t-t0)/1000;return{x:r.right+14+Math.cos(u*5)*22,y:r.top+r.height*.6+Math.sin(u*5)*22}},{label:'!DOING A FLIP',clicks:[t0+200]})}});
bt({id:'end',chap:'Credits',dur:4600,cls:'pc',last:true,html:hd('Thanks for scrolling.','md')+as('Got a real problem? Email me at '+SITE.email)+'<div class="endb" data-fx="rise"><button type="button" class="btn" data-end="copy">[ COPY EMAIL ]</button><button type="button" class="btn" data-end="tldr">[ 30 SECOND VERSION ]</button>'+(SITE.resume?'<a class="btn" href="'+esc(SITE.resume)+'" target="_blank" rel="noopener">[ NORMAL RESUME ]</a>':'')+'<button type="button" class="btn" data-end="again">[ WATCH AGAIN ]</button></div>'});

/* ---------------- chapter cards: a title card between chapters. The title decodes from noise, a cursor draws the rule,
   and the chapter name drifts huge and hollow behind it ---------------- */
(function(){
  var out=[],n=1,chs=[];BEATS.forEach(function(b,k){if(k===0||b.chap!==BEATS[k-1].chap)chs.push(b.chap)});
  BEATS.forEach(function(b,k){
    if(k>0&&b.chap!==BEATS[k-1].chap){n++;
      out.push({card:true,chap:b.chap,dur:2350,cls:'pc card',html:'<div class="ghost" data-fx="ghost" aria-hidden="true">'+esc(b.chap)+' '+esc(b.chap)+'</div><p class="cno" data-fx="fade">CHAPTER '+pad(n)+' / '+pad(chs.length)+'</p><h2 class="ctl" data-fx="scram">'+esc(b.chap)+'</h2><i class="cln" data-fx="line"></i>'})}
    out.push(b);
  });
  BEATS=out;
})();

/* ===================== build the beats ===================== */
var VZ={hero:{fn:sceneHero,fov:30,fit:false},blackbook:{fn:sceneBB,zoom:1.3,scrub:1,k:1.3,dx:-.03},takt:{fn:sceneTK,zoom:1.34,scrub:1,k:1.4},relay:{fn:sceneRL,zoom:.98,scrub:1,k:1.1,dx:.05},scrub:{fn:sceneSC,zoom:.86,scrub:1,k:1.6,dx:.06},cardsite:{fn:sceneCS,zoom:1.5,scrub:1,k:1.4},overture:{fn:sceneOV,zoom:1.55,scrub:1,k:1.6},orch:{fn:sceneOrch,fov:28,zoom:1.12,scrub:1,ref:2.5,k:1.35},ship:{fn:iconShip,fov:34,live:1,k:.96,fitBox:1},laptop:{k:.94,fitBox:1,fn:objLaptop,fov:30,live:1,ref:1},mic:{k:.94,fitBox:1,fn:objMic,fov:30,live:1,ref:1},lock:{k:.94,fitBox:1,fn:objLock,fov:30,live:1,ref:1},board:{k:.94,fitBox:1,fn:objBoard,fov:30,live:1,ref:1},car:{k:.94,fitBox:1,fn:objCar,fov:30,live:1,ref:1},chat:{k:.94,fitBox:1,fn:objChat,fov:30,live:1,ref:1},crown:{k:.94,fitBox:1,fn:objCrown,fov:30,live:1,ref:1},thumb:{k:.94,fitBox:1,fn:objThumb,fov:30,live:1,ref:1},system:{k:.94,fitBox:1,fn:objSystem,fov:30,live:1,ref:1},keys:{k:.94,fitBox:1,fn:objKeys,fov:30,live:1,ref:1},joy:{k:.94,fitBox:1,fn:objJoy,fov:30,live:1,ref:1},cap:{k:.94,fitBox:1,fn:objCap,fov:30,live:1,ref:1},reel:{k:.94,fitBox:1,fn:objReel,fov:30,live:1,ref:1},layers:{fn:iconLayers,fov:34,live:1,k:.96,fitBox:1},flag:{fn:iconFlag,fov:34,live:1,k:.96,fitBox:1}};
var DIN={scram:1000,line:900,ghost:900,stamp:520,rise:760,fade:600,left:850,right:850,scale:950,drop:800,wipe:800,count:1150};
var GL_OK=!!(T3&&glr());
BEATS.forEach(function(b,i){
  var html=b.html;b.cls=b.cls||'pl';
  if(b.obj){var ob='<div class="ob" data-viz="'+b.obj+'" data-fx="scale" data-ag="carry" data-d="'+(GAP+150)+'"></div>';b.cls+=' obj';html=/\bpc\b/.test(b.cls)?ob+'<div class="tx">'+html+'</div>':'<div class="tx">'+html+'</div>'+ob}
  var el=document.createElement('section');el.className='bt '+b.cls;el.setAttribute('aria-label',b.chap);
  el.innerHTML='<div class="bi">'+html+'</div>';stage.appendChild(el);
  b.el=el;b.bi=el.firstChild;b.vis=false;b.vw=[];b.viewsMade=false;b.k=i;
  b.dur=Math.max(2600,b.dur+(b.id==='limit'?-250:300));
  b.start=i===0?0:BEATS[i-1].start+BEATS[i-1].dur-OVB;
  b.items=$$('[data-fx]',el).map(function(e,k){
    var it={el:e,b:b,fx:e.getAttribute('data-fx'),xs:e.getAttribute('data-x')||(b.last?'none':'past'),ag:(e.getAttribute('data-ag')||'').split(' ').filter(Boolean),rot:+(e.getAttribute('data-r')||0),k:k,key:''};
    if(it.fx==='chars'){
      var lt=0;it.caret=$('.tcar',e);
      it.lines=$$('.ln',e).map(function(ln,L){
        var host=$('.pr',ln),txt=host.textContent,tp=host.getAttribute('data-tp'),pos=-1,wrong='';
        if(tp){var q2=tp.indexOf('|');pos=+tp.slice(0,q2);wrong=tp.slice(q2+1)}
        host.textContent='';var cs=[],tw=null,wd=null;
        for(var j=0;j<=txt.length;j++){
          if(j===pos){tw=document.createElement('span');tw.className='tw';(wd||host).appendChild(tw)}
          if(j===txt.length)break;
          var ch=txt.charAt(j);
          if(ch===' '){host.appendChild(document.createTextNode(' '));wd=null;cs.push({el:null,y:0});continue}
          if(!wd){wd=document.createElement('span');wd.className='wd';host.appendChild(wd)}
          var c=document.createElement('span');c.className='chr';c.textContent=ch;c.style.visibility='hidden';wd.appendChild(c);cs.push({el:c,y:0,v:0});
        }
        var sch=kbSched(txt,pos,wrong,13+L*7+k*3+i*11),o={ln:ln,pr:host,cs:cs,tw:tw,wrong:wrong,sch:sch,off:lt,nc:0,nw:0};lt+=sch.d+150;return o;
      });
      it.n=it.lines.reduce(function(s2,l){return s2+l.cs.length},0);
      it.din=lt+80;

    }else if(it.fx==='type'){
      it.full=e.firstChild.nodeValue||'';it.tn=e.firstChild;it.tcv=typeCurve(it.full.length,7+k);it.din=Math.max(400,it.full.length*24);it.tn.nodeValue='';
    }else if(it.fx==='scram'){it.full=e.textContent;it.din=Math.max(900,it.full.length*55+500);e.textContent=''
    }else if(it.fx==='count'){it.n=+e.getAttribute('data-n');it.suf=e.getAttribute('data-s')||'';it.din=DIN.count}
    else it.din=DIN[it.fx]||700;
    if(e.hasAttribute('data-viz'))it.ag=[];
    if(it.fx!=='chars')e.style.visibility='hidden';
    return it;
  });
  /* delays: in reading order, each element waits a little after the one before */
  var t=b.k===0?250:GAP;
  b.items.forEach(function(it,k){
    var dd=it.el.getAttribute('data-d');
    it.d=dd!=null?+dd:t;
    var step=it.fx==='chars'?Math.min(it.din*.7,2000):it.fx==='type'?Math.min(it.din*.6,700):it.fx==='scale'||it.fx==='count'?380:300;
    t=it.d+step;
    it.xd=k*45;
    if(it.fx==='chars')it.xst=Math.min(9,(OUT-460)/Math.max(1,it.n));
  });
  /* everything in a beat has finished leaving by the beat's last frame */
  b.xmax=b.items.length?b.items[b.items.length-1].xd:0;
  if(b.setup)b.setup(b);
});
total=BEATS[BEATS.length-1].start+BEATS[BEATS.length-1].dur;

/* ---- fit: every beat must sit fully inside the window. Type is sized to the window first (CSS), and if a beat
   still needs more room than it has, the whole composition is scaled down until it fits ---- */
function fitBeat(b){
  var bi=b.bi,H=bi.clientHeight,W=bi.clientWidth,top=1e9,bot=-1e9,lf=1e9,rt=-1e9;
  Array.prototype.forEach.call(bi.children,function(c){
    if(c.classList.contains('stk')||c.classList.contains('hero')||c.classList.contains('gll')||c.classList.contains('ghost'))return;
    var t=c.offsetTop,h=Math.max(c.offsetHeight,c.scrollHeight),l=c.offsetLeft,w=Math.max(c.offsetWidth,c.scrollWidth);
    if(t<top)top=t;if(t+h>bot)bot=t+h;if(l<lf)lf=l;if(l+w>rt)rt=l+w;
  });
  var nh=bot-top,nw=rt-lf,s=1;
  if(nh>0&&nh>H)s=Math.min(s,H/nh);
  if(nw>0&&nw>W)s=Math.min(s,W/nw);
  b.fitS=s<1?Math.max(.4,s*.97):1;
}
function fitAll(){BEATS.forEach(fitBeat)}
BEATS.forEach(function(b){b.fitS=1});
var fitT=0;addEventListener('resize',function(){clearTimeout(fitT);fitT=setTimeout(fitAll,120)});
fitAll();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitAll);setTimeout(fitAll,1600);

/* ---- views: three.js scenes inside beats ---- */
/* frameless 3D: every model is drawn on a transparent layer covering the whole beat, so nothing can clip it.
   Its spot in the layout (the empty cell it came from) only says where the model sits and how big it is:
   the camera is shifted so the model is centered on that spot, and pulled in so it fills it (VZ k = how much bigger) */
function makeBeatViews(b){
  if(b.viewsMade)return;b.viewsMade=true;
  $$('[data-viz]',b.el).forEach(function(box){
    var d=VZ[box.getAttribute('data-viz')];if(!d)return;
    if(!GL_OK){box.classList.add('nogl');return}
    var hero=box.classList.contains('hero'),host=box;
    if(!hero){host=document.createElement('div');host.className='gll';b.bi.insertBefore(host,b.bi.firstChild);box._layer=host;host.style.opacity=0}
    var v=null;try{v=makeView(host,d.fn,{zoom:d.zoom,fov:d.fov,noDrag:true,scrub:!!d.scrub,fit:d.fit,ref:d.ref})}catch(e){try{console.error(e)}catch(_){}}
    if(!v)return;v.keep=!!d.live;
    if(!hero){v.noFit=true;v.aim=function(){
      var cw=box.offsetWidth,ch=box.offsetHeight,lw=host.clientWidth,lh=host.clientHeight;if(!cw||!ch||!lw||!lh)return;
      var cx=box.offsetLeft-host.offsetLeft+cw/2+cw*(d.dx||0),cy=box.offsetTop-host.offsetTop+ch/2,key=cw+'|'+ch+'|'+lw+'|'+lh+'|'+cx+'|'+cy;if(key===v.ak)return;v.ak=key;
      var kk=d.k||1.2;if(cw>lw*.6)kk=Math.min(kk,1);
      v.cam.aspect=lw/lh;
      if(d.fitBox){
        /* pose the model at a typical moment, measure its outline on screen, then scale and shift until it fills the spot */
        if(v.tick)v.tick(3,0);v.root.updateMatrixWorld(true);
        var bb=new T3.Box3().setFromObject(v.root),P=[],q=new T3.Vector3(),f=1;
        for(var i=0;i<8;i++)P.push(new T3.Vector3(i&1?bb.max.x:bb.min.x,i&2?bb.max.y:bb.min.y,i&4?bb.max.z:bb.min.z));
        function ext(){v.cam.clearViewOffset();v.cam.updateProjectionMatrix();v.cam.updateMatrixWorld();var x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;P.forEach(function(p){q.copy(p).project(v.cam);var sx=(q.x*.5+.5)*lw,sy=(.5-q.y*.5)*lh;if(sx<x0)x0=sx;if(sx>x1)x1=sx;if(sy<y0)y0=sy;if(sy>y1)y1=sy});return[x0,x1,y0,y1]}
        for(var it2=0;it2<4;it2++){v.cam.position.copy(v.base).multiplyScalar(f);var e=ext(),s2=Math.min(cw*kk/(e[1]-e[0]),ch*kk/(e[3]-e[2]));f/=s2}
        v.cam.position.copy(v.base).multiplyScalar(f);var e2=ext();
        v.cam.setViewOffset(lw,lh,(e2[0]+e2[1])/2-cx,(e2[2]+e2[3])/2-cy,lw,lh);v.cam.updateProjectionMatrix();
      }else{
        var f0=Math.max(1,(d.ref||1.55)/(cw/ch))*(lh/ch)/kk;
        v.cam.position.copy(v.base).multiplyScalar(f0);v.cam.setViewOffset(lw,lh,lw/2-cx,lh/2-cy,lw,lh);v.cam.updateProjectionMatrix();
      }
    }}
    v.span=b.dur-500;v.prog=function(){return clamp((T-b.start-300)/(b.dur-500),0,1)};
    b.vw.push(v);
  });
}
function setLive(v,on){
  if(!v||v.live===on)return;v.live=on;v.last=0;
  if(!v.scrub)v.anims.forEach(function(a){if(on){a.restart?a.restart():a.play()}else a.pause()});
}
function renderViews(dt){
  for(var i=0;i<VIEWS.length;i++){
    var v=VIEWS[i];if(!v.live)continue;
    v.t+=dt;
    if(v.prog)v.pp=v.prog();
    if(v.scrub){var k=Math.min(.999,v.pp);for(var j=0;j<v.anims.length;j++){var a=v.anims[j];a.seek(a.duration*k)}if(v.post)v.post()}
    if(v.tick)v.tick(v.t,dt);
    if(v.aim)v.aim();
    v.render();
  }
}
/* hero scene: assembles with the scroll, comes apart as the beat ends */
function sceneHero(v){
  var sc=v.root;v.cam.position.set(0,0,9.2);
  var cs=[],NX=5,NY=4,NZ_=4;
  for(var x=0;x<NX;x++)for(var y=0;y<NY;y++)for(var z=0;z<NZ_;z++){
    var g=solid(new T3.BoxGeometry(.42,.42,.42),(x+y+z)%4===0?0xffffff:0x8b8b93,0x050506);
    g.userData.home=new T3.Vector3((x-(NX-1)/2)*.8,(y-(NY-1)/2)*.8,(z-(NZ_-1)/2)*.8);g.userData.d=Math.hypot(x,y,z);g.userData.k=Math.random()*2-1;g.scale.setScalar(.001);sc.add(g);cs.push(g);
  }
  var DL=cs.map(function(c,i){return c.userData.d*85+(i%7)*20});
  var tx=0,ty=0,px=0,py=0;
  addEventListener('pointermove',function(e){tx=(e.clientX/innerWidth-.5)*.8;ty=(e.clientY/innerHeight-.5)*.6},{passive:true});
  v.tick=function(t,dt){
    px+=(tx-px)*.05;py+=(ty-py)*.05;
    var q=clamp((v.pp-.78)/.22,0,1),ee=q*q*(3-2*q),sp=1+ee*3.4,lt=v.pp*(v.span||4000)*1.6-300;
    for(var i=0;i<cs.length;i++){var c=cs[i],h=c.userData.home,u=clamp((lt-DL[i])/800,0,1),b=1+2.70158*Math.pow(u-1,3)+1.70158*Math.pow(u-1,2);c.scale.setScalar(Math.max(.001,b));c.position.set(h.x*sp+c.userData.k*ee*2,h.y*sp,h.z*sp);c.rotation.x=ee*c.userData.k*3;c.rotation.z=ee*c.userData.k*2}
    var narrow=v.W<v.H*1.1,zf=narrow?Math.max(1.25,.85/(v.W/v.H)):1.25;v.cam.position.z=(14.8-ee*9.5)*zf;var sh=(1-ee*.7)*(narrow?.3:.2);v.cam.setViewOffset(v.W,v.H,narrow?0:-v.W*sh,narrow?-v.H*sh:0,v.W,v.H);sc.rotation.y=t*.28+px+ee*2.2;sc.rotation.x=.35+py+Math.sin(t*.4)*.1;
  };
}

/* ---- element motion: enter, hold, leave. All from T ---- */
function itemFx(it){
  var b=it.b,a=b.start+it.d,xb=b.start+b.dur-OUT-b.xmax+it.xd,ein=clamp((T-a)/it.din,0,1),eout=it.xs==='none'?0:clamp((T-xb)/OUT,0,1);
  if(it.fx==='chars'){charsFx(it,a,xb);return}
  var e=eo4(ein),tx=0,ty=0,sc=1,rot=it.rot,op=1,bl=0,clip='';
  switch(it.fx){
    case 'rise':ty=(1-e)*44;op=e;bl=(1-e)*8;break;
    case 'fade':op=e;break;
    case 'left':tx=-(1-e)*180;op=e;bl=(1-e)*6;break;
    case 'right':tx=(1-e)*180;op=e;bl=(1-e)*6;break;
    case 'scale':sc=.72+.28*e;op=e;bl=(1-e)*12;break;
    case 'scram':op=ein>0?1:0;var full=it.full,o2='',st0=a+300;for(var ci2=0;ci2<full.length;ci2++){var ch=full.charAt(ci2),set=st0+ci2*55;if(ch===' '){o2+=' ';continue}if(T>=set)o2+=ch;else if(T>=a+ci2*18)o2+=SCR.charAt((Math.floor(T/55)*7+ci2*13)%SCR.length);else o2+='\u00a0'}if(it.el._s!==o2){it.el._s=o2;it.el.textContent=o2}break;
    case 'line':var lu=eo4(ein);op=ein>0?1:0;it.el.style.transformOrigin='0 50%';sc=1;tx=0;if(it.el._lu!==lu){it.el._lu=lu;it.el.firstChild||0}clip='inset(0 '+((1-lu)*100).toFixed(2)+'% 0 0)';break;
    case 'ghost':op=e*.95;tx=-(T-b.start)*.09+40;break;
    case 'stamp':var su=clamp(ein/.55,0,1),sb=clamp((ein-.55)/.45,0,1);sc=su<1?1.9-.9*su*su:1-.05*Math.sin(sb*Math.PI);op=clamp(ein*2.4,0,1);bl=(1-su)*6;tx=sb>0?Math.sin(sb*30)*(1-sb)*3:0;break;
    case 'drop':var f=ein<1?1-Math.pow(1-ein,3)*Math.cos(ein*9):1;ty=-(1-f)*170;rot=it.rot+(1-e)*-14;op=clamp(ein*3,0,1);break;
    case 'wipe':clip='inset(-10% '+((1-e)*100).toFixed(2)+'% -10% 0)';op=ein>0?1:0;break;
    case 'type':op=ein>0?1:0;var n=Math.floor(it.tcv(ein)*it.full.length+1e-6);if(it.tn._n!==n){it.tn._n=n;it.tn.nodeValue=it.full.slice(0,n)}var ty2=ein>0&&ein<1;if(it.el._ty!==ty2){it.el._ty=ty2;it.el.classList.toggle('typing',ty2)}break;
    case 'count':sc=.8+.2*e;op=e;bl=(1-e)*10;var cv=Math.round(it.n*eo(ein))+it.suf;if(it.el._v!==cv){it.el._v=cv;it.el.textContent=cv}break;
  }
  var x=eout,xi=x*x;
  if(x>0)switch(it.xs){
    case 'past':if(it.fx==='ghost'){op*=1-x;break}sc*=1+.2*xi;op*=1-x;bl+=xi*14;ty-=xi*26;break;
    case 'up':ty-=xi*90;op*=1-x;bl+=x*6;break;
    case 'yeet':tx+=xi*innerWidth*.8;ty-=Math.sin(x*Math.PI)*60;rot+=xi*28;op*=1-clamp((x-.6)/.4,0,1);break;
    case 'drop':ty+=xi*innerHeight*.7;rot+=xi*12;op*=1-clamp((x-.5)/.5,0,1);break;
    default:op*=1-x;
  }
  var key;
  if(op<=.002)key='h';
  else key=tx.toFixed(1)+'|'+ty.toFixed(1)+'|'+sc.toFixed(4)+'|'+rot.toFixed(2)+'|'+op.toFixed(3)+'|'+bl.toFixed(1)+'|'+clip;
  if(key===it.key)return;it.key=key;var s=it.el.style,ly=it.el._layer;
  if(ly){ly.style.opacity=key==='h'?0:op.toFixed(3);ly.style.filter=bl>.25?'blur('+bl.toFixed(1)+'px)':''}
  if(key==='h'){s.visibility='hidden';return}
  s.visibility='';s.opacity=op>=.999?'':op.toFixed(3);
  s.transform=(tx||ty||sc!==1||rot)?'translate3d('+tx.toFixed(1)+'px,'+ty.toFixed(1)+'px,0) rotate('+rot.toFixed(2)+'deg) scale('+sc.toFixed(4)+')':'';
  s.filter=bl>.25?'blur('+bl.toFixed(1)+'px)':'';s.clipPath=clip;
}
/* typed headlines: characters appear keystroke by keystroke (typos included), and leave by sliding up out of their lines */
function charsFx(it,a,xb){
  var ci=0,cur=null;
  for(var L=0;L<it.lines.length;L++){
    var ln=it.lines[L],e2=T-(a+ln.off),st=kbAt(ln.sch,e2);
    if(st.nc!==ln.nc){for(var j=0;j<ln.cs.length;j++){var c=ln.cs[j];if(!c.el)continue;var v=j<st.nc?1:0;if(c.v!==v){c.v=v;c.el.style.visibility=v?'':'hidden'}}ln.nc=st.nc}
    if(ln.tw&&st.nw!==ln.nw){ln.nw=st.nw;ln.tw.textContent=ln.wrong.slice(0,st.nw)}
    if(e2>=0)cur=ln;
    for(var j2=0;j2<ln.cs.length;j2++){var c2=ln.cs[j2];if(!c2.el)continue;var xo=it.xs==='none'?0:ease(clamp((T-xb-ci*it.xst)/460,0,1)),yk=Math.round(-xo*1120);if(yk!==c2.y){c2.y=yk;c2.el.style.transform=yk?'translate3d(0,'+(yk/10)+'%,0)':''}ci++}
  }
  var ce=it.caret;if(!ce)return;
  var tEnd=a+it.din,key='h';
  if(cur&&T>=a-60&&T<tEnd+650&&T<xb){
    var tg2=null,after=true;
    if(cur.tw&&cur.nw>0)tg2=cur.tw;
    else{for(var k=cur.nc-1;k>=0;k--)if(cur.cs[k].el){tg2=cur.cs[k].el;break}
      if(!tg2){for(var k2=0;k2<cur.cs.length;k2++)if(cur.cs[k2].el){tg2=cur.cs[k2].el;after=false;break}}}
    if(tg2){var x=cur.pr.offsetLeft+tg2.offsetLeft+(after?tg2.offsetWidth:0),y=cur.pr.offsetTop+tg2.offsetTop;key=x+'|'+y+'|'+(T>tEnd?1:0)}
  }
  if(key===it.ck)return;it.ck=key;
  if(key==='h'){ce.style.opacity=0;return}
  var pp=key.split('|');ce.style.opacity=1;ce.style.transform='translate3d('+pp[0]+'px,'+pp[1]+'px,0)';ce.classList.toggle('blink',pp[2]==='1');
}

/* ---- agents for the beats ---- */
function projObj(v,obj,pp){v.cam.updateMatrixWorld();obj.updateWorldMatrix(true,false);var q=new T3.Vector3(pp[0],pp[1],pp[2]);obj.localToWorld(q);q.project(v.cam);var r=R(v.box);return{x:r.left+(q.x*.5+.5)*r.width,y:r.top+(.5-q.y*.5)*r.height}}
function holdIn(b,t0,t1,get,label){
  var a=pickAg(b.start+t0,b.start+t1);if(a<0)return;
  seg(a,b.start+t0,b.start+t1,function(){var v=b.vw[0];if(!v||!v.api){var r=R($('.vz',b.el));return{x:r.left+r.width*.5,y:r.top+r.height*.5}}var o=get(v.api,v);return projObj(v,o[0],o[1])},{label:label,grab:true,clicks:[b.start+t0+40]});
}
var FX={
 blackbook:function(b,E){holdIn(b,1500,E,function(a){return[a.slab,[.2,.4,.05]]},'SOLVING 3x + 7 = 22');holdIn(b,1700,E,function(a){return[a.cards[2],[.5,0,.03]]},'PICKING C. OBVIOUSLY')},
 takt:function(b,E){holdIn(b,1500,E,function(a){return[a.cap,[0,.2,0]]},'PRESSING KEY');holdIn(b,1800,E,function(a){return[a.ws[16],[0,.2,0]]},'SAYING UM')},
 relay:function(b,E){holdIn(b,1500,E,function(a){return a.cs.s.n>0?[a.win,[0,0,.1]]:[a.lock,[0,0,.1]]},'WAKING THE PC');holdIn(b,1800,E,function(a){return[a.esp,[.3,.05,0]]},'FLASHING ESP32')},
 scrub:function(b,E){holdIn(b,1500,E,function(a){return[a.plates[1],[.58,0,.5]]},'LIFTING LAYER_02');holdIn(b,1800,E,function(a){return[a.wheel,[0,0,0]]},'SPINNING WHEEL')},
 cardsite:function(b,E){holdIn(b,1500,E,function(a){return[a.panels[0],[0,.78,.06]]},'DRAGGING PANEL_01');holdIn(b,1800,E,function(a){return[a.panels[2],[0,.78,.06]]},'DRAGGING PANEL_03')},
 overture:function(b,E){holdIn(b,1500,E,function(a){return[a.today,[0,.6,0]]},'DRAGGING TODAY');holdIn(b,1800,E,function(a){return[a.ac[2],[a.rows[2][2],.08,0]]},'STRETCHING BAR')}
};
BEATS.forEach(function(b){
  if(b.card){var h=$('.ctl',b.el),ln=$('.cln',b.el),t0=b.start+GAP+250;
    var a1=pickAg(t0-300,t0+1300);if(a1>=0)seg(a1,t0-300,t0+1300,function(t){var r=R(h),u=clamp((t-t0)/1000,0,1);return{x:r.left+r.width*u,y:r.top+r.height*.55}},{label:'DECRYPTING',clicks:[t0]});
    var t2=b.start+GAP+500,a2=pickAg(t2-250,t2+1100);if(a2>=0)seg(a2,t2-250,t2+1100,function(t){var r=R(ln),u=eo4(clamp((t-t2)/900,0,1));return{x:r.left+r.width*u,y:r.top}},{label:'DRAWING',shape:'pn',clicks:[t2]})}
  if(b.ag)b.ag(b);
  if(b.viz&&FX[b.viz])FX[b.viz](b,b.dur-OUT-100);
  b.items.forEach(function(it){
    var a0=b.start+it.d,a1=a0+it.din,xb=b.start+b.dur-OUT-b.xmax+it.xd;
    it.ag.forEach(function(kind){
      var t0,t1,fn,o,ag;
      if(kind==='carry'){t0=a0-350;t1=a1+250;fn=atEl(it.el,.06,.5);o={label:'DRAGGING',grab:true,clicks:[a0]}}
      else if(kind==='stamp'){(function(el,hit){t0=hit-700;t1=hit+420;fn=function(t){var r=R(el),u=ease(clamp((t-(hit-700))/700,0,1));return{x:r.left+r.width*.5,y:r.top+r.height*.5-(1-u)*120}};o={label:'STAMPING',grab:true,clicks:[hit]}})(it.el,a0+it.din*.55)}
      else if(kind==='frame'){t0=a0-60;t1=a1+350;fn=atEl(it.el,1,1);o={label:'PLACING',grab:true,clicks:[a0],frame:it.el,fbadge:true,shape:'cr'}}
      else return;
      ag=pickAg(t0,t1);if(ag<0)return;seg(ag,t0,t1,fn,o);
    });
    /* headlines: an agent rides the caret while it types */
    if(it.fx==='chars'&&it.caret){(function(ce){var t0=a0-300,t1=a0+it.din+200,ag=pickAg(t0,t1);if(ag>=0)seg(ag,t0,t1,function(){var r=R(ce);return{x:r.left+3,y:r.top+r.height*.72}},{label:'TYPING',clicks:[a0]})})(it.caret)}
    /* asides get typed by whoever is free, and the cursor rides the caret */
    if(it.fx==='type'){var cr=$('.cr',it.el),t0=a0-250,t1=a0+it.din+300,ag=pickAg(t0,t1);if(ag>=0&&cr)seg(ag,t0,t1,function(){var r=R(cr);return{x:r.left+2,y:r.top+r.height*.6}},{label:'TYPING',clicks:[a0]})}
    /* stickers get thrown out */
    if(it.fx==='drop'&&it.xs==='past'){it.xs='yeet';var y0=xb-450,y1=xb+OUT*.55,ya=pickAg(y0,y1);if(ya>=0)seg(ya,y0,y1,atEl(it.el,.5,.5),{label:'YEETING',grab:true,clicks:[xb]})}
  });
});

/* ---- the joke: usage limit reached. The free model button runs away three times, then the interns hold it still ---- */
var LIM=null;
(function(){
  var ps=null;BEATS.forEach(function(b){if(b.id==='limit')ps=b});if(!ps)return;
  var el=$('#limit'),btn=$('#limBtn'),wt=$('#limWait'),l1=$('#limL1'),l2=$('#limL2'),hint=$('#limHint'),clk=$('#limClock'),tag=$('#limTag'),pct=$('#limPct');
  LIM={t0:ps.start+300,gate:ps.start+680,y:0,open:false,w0:null,ct:-1e9,el:el,state:-1,dodges:0,held:false,lastD:0,skip:false};
  LIM.y=(LIM.gate-INTRO)/1000*PPS;
  try{LIM.open=sessionStorage.getItem('limOpen')==='1'}catch(e){}
  var slp=-1;for(var k=0;k<6&&slp<0;k++)if(segFree(k,LIM.t0+200,LIM.gate+1300))slp=k;if(slp<0)slp=0;
  seg(slp,LIM.t0+200,LIM.gate+1300,function(){var r=R(el);return{x:r.left+34,y:r.top-20}},{label:'!USAGE FULL. SLEEPING'});
  var asg=AGS[slp].segs[AGS[slp].segs.length-1];LIM.ag=slp;
  Object.defineProperty(asg,'label',{get:function(){return LIM.open&&T>=LIM.gate-5?'SWITCHING MODEL':'!USAGE FULL. SLEEPING'}});
  function live(){return !LIM.open&&T>=LIM.gate-5&&el.style.visibility==='visible'}
  function vis(){return el.style.visibility==='visible'}
  function say(t){hint.textContent=t;hint.classList.remove('pop');void hint.offsetWidth;hint.classList.add('pop')}
  var TAUNT=['Nope. Too slow.','Almost. Not really.','Fine. The interns will hold it still.'],SPOT=[[.92,.04],[.02,.62],[.62,.9]],LBL=['[ NOPE ]','[ TOO SLOW ]','[ USE A FREE MODEL ]'],bx=0,by=0;
  function moveBtn(r,dur,ez){A.remove(btn);A({targets:btn,translateX:bx,translateY:by,rotate:r,duration:dur,easing:ez||'easeOutElastic(1, .55)'})}
  var HL=['!','!','!','!'],HP=[[0,0],[1,0],[0,1],[1,1]],ESC=['!NOOO','!IT ESCAPED','!COME BACK','!WHY'],SPOT2=[[.92,.62],[.06,.86],[.55,.86],[.92,.86]];
  function hold(){
    if(LIM.open)return;
    LIM.held=true;btn.classList.add('held');el.classList.add('holding');bx=0;by=0;moveBtn(0,650,'easeOutBack');
    var ids=[];for(var i=0;i<6&&ids.length<4;i++)if(i!==LIM.ag)ids.push(i);LIM.holders=ids;
    /* each cursor's tip sits exactly on a corner, pointing in, with its body outside the button */
    var ROT=[180,-90,90,0];
    ids.forEach(function(ai,j){var h=HP[j];AGS[ai].ovr={lock:1,rot:ROT[j],fn:function(){var r=R(btn);return{x:r.left+r.width*h[0]-1.625,y:r.top+r.height*h[1]-1.625}},sg:{label:HL[j],clicks:[],grab:true,shape:null,frame:null},on:vis}});
    say(LIM.round?'They dragged it back. Quick.':'Fine. The interns are holding it still. Click it.');
    clearTimeout(LIM.bt);LIM.bt=setTimeout(breakFree,3000);
  }
  function breakFree(){
    if(LIM.open||!LIM.held||!vis())return;
    LIM.held=false;btn.classList.remove('held');el.classList.remove('holding');var rd=LIM.round=(LIM.round||0)+1,n=performance.now(),r=R(btn);
    LIM.holders.forEach(function(ai,j){var a=AGS[ai],h=HP[j],x0=r.left+r.width*h[0],y0=r.top+r.height*h[1],dx=h[0]?1:-1,dy=h[1]?1:-1;
      a.ovr={fn:function(){return{x:x0+dx*110,y:y0+dy*80}},sg:{label:ESC[j],clicks:[],grab:false,shape:null,frame:null},on:vis,u:n+900};a.spinT=n;a.spinDeg=-720;a.spinDur=850});
    var D=R(el),sp=SPOT2[(rd-1)%SPOT2.length],baseL=r.left-bx,baseT=r.top-by;
    bx=D.left+16+sp[0]*(D.width-r.width-32)-baseL;by=D.top+16+sp[1]*(D.height-r.height-32)-baseT;
    moveBtn((rd%2?-1:1)*10,640);
    say('It broke free. Typical.');
    setTimeout(function(){if(!LIM.open&&vis())hold()},1400);
  }
  function dodge(){
    var now=performance.now();if(now-LIM.lastD<380||LIM.dodges>=3)return;LIM.lastD=now;
    var n=LIM.dodges++,sp=SPOT[n];
    btn.textContent=LBL[n];
    var D=R(el),B=R(btn),baseL=B.left-bx,baseT=B.top-by;
    bx=D.left+16+sp[0]*(D.width-B.width-32)-baseL;by=D.top+16+sp[1]*(D.height-B.height-32)-baseT;
    moveBtn((n%2?-1:1)*(8+n*4),640);
    say(TAUNT[n]);
    var a=AGS[LIM.ag];a.spinT=now;a.spinDeg=360;a.spinDur=700;
    if(n===2)setTimeout(hold,560);
  }
  function openGate(){
    LIM.open=true;LIM.ct=performance.now();try{sessionStorage.setItem('limOpen','1')}catch(e){}
    if(LIM.setTrack)LIM.setTrack();
    btn.classList.remove('held');el.classList.remove('holding');clearTimeout(LIM.bt);
    var n=performance.now();
    CFB.push({k:'W',t0:n,n:110,v:.75,o:function(){var r=R(btn);return{x:r.left+r.width/2,y:r.top+r.height/2}}});
    var YAY=['!WE DID IT','!FREEDOM','!WORTH IT','!YAY'];
    (LIM.holders||[]).forEach(function(ai,j){var a=AGS[ai];if(a.ovr){a.ovr.sg={label:YAY[j],clicks:[],grab:false,shape:null,frame:null};a.ovr.u=n+1500}a.spinT=n+j*90;a.spinDeg=360;a.spinDur=800;a.pulseT=n});
    var a=AGS[LIM.ag];a.spinT=n;a.spinDeg=360;a.spinDur=750;a.pulseT=n;
    say('Switched. Do not tell the paid one.');
  }
  function tryOpen(){if(!live())return;if(!LIM.held){if(LIM.dodges<3)dodge();else say('Hold on. The interns are on it.');return}openGate()}
  btn.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse'&&live()&&!LIM.held)dodge()});
  btn.addEventListener('pointerdown',function(e){if(!live()||LIM.held)return;e.preventDefault();LIM.skip=true;dodge()});
  btn.addEventListener('click',function(){if(LIM.skip){LIM.skip=false;return}tryOpen()});
  btn.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '||e.key==='Spacebar'){e.preventDefault();e.stopPropagation();tryOpen()}});
  var WAITS=['Bold strategy.','Still 4 hours. Roughly.','You could make tea. Several teas.','The agents are snoring.','Okay. Respect the commitment.'],wi=0,ni=0;
  function shake(){el.classList.remove('shk');void el.offsetWidth;el.classList.add('shk')}
  function waitIt(){if(!live())return;shake();say(WAITS[wi++%WAITS.length])}
  wt.addEventListener('click',waitIt);wt.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();waitIt()}});
  var lastS=0,ty=0;
  function nudge(){var n=performance.now();if(!live()||n-lastS<500)return;lastS=n;shake();if(++ni%3===1)say('Scrolling will not fix this.')}
  addEventListener('wheel',function(e){if(e.deltaY>0)nudge()},{passive:true});
  addEventListener('touchstart',function(e){ty=e.touches[0].clientY},{passive:true});
  addEventListener('touchmove',function(e){if(e.touches[0].clientY<ty-6)nudge()},{passive:true});
  addEventListener('keydown',function(e){if(e.target===btn||e.target===wt)return;if(e.key===' '&&!e.shiftKey||e.key==='PageDown'||e.key==='ArrowDown'||e.key==='End')nudge()});
  function hms(s){return pad(Math.floor(s/3600))+':'+pad(Math.floor(s/60)%60)+':'+pad(s%60)}
  LIM.frame=function(){
    var u=clamp((T-LIM.t0)/380,0,1),v=Math.max(clamp((T-LIM.gate-900)/450,0,1),LIM.open&&T>=LIM.gate-5?clamp((performance.now()-LIM.ct-1500)/500,0,1):0),op=Math.min(eo(u),1-v);
    if(op<=0.001){if(LIM.state!==-1){el.style.visibility='hidden';el.style.opacity=0;el.style.pointerEvents='none';el.classList.remove('gate');el.setAttribute('aria-hidden','true');LIM.state=-1}return}
    if(LIM.state===-1)el.setAttribute('aria-hidden','false');
    el.style.visibility='visible';el.style.opacity=op.toFixed(3);
    el.style.transform='translate(-50%,-50%) scale('+(.9+.1*eo(u)).toFixed(3)+')';
    var done=LIM.open&&T>=LIM.gate-5,st=done?1:0,lv=live();
    el.style.pointerEvents=lv?'auto':'none';el.classList.toggle('gate',lv);
    if(st!==LIM.state){LIM.state=st;el.classList.toggle('done',done);
      l1.textContent=done?'Switched to a free model.':'Usage limit reached.';
      l2.textContent=done?'It is very confident and sometimes wrong. So everything it writes gets checked against the source.':'The agents thought so hard they ran out of thoughts.';
      tag.textContent=done?'FREE MODEL // ONLINE':'USAGE // 100%';pct.textContent=done?'PLENTY':'0%';
      if(!done&&!LIM.dodges)hint.textContent='Pick one. Choose wisely.';
    }
    var tx;
    if(done)tx='00:00:00';
    else{var ex=0;if(!LIM.open&&T>=LIM.gate-5){if(LIM.w0===null)LIM.w0=performance.now();ex=performance.now()-LIM.w0}else LIM.w0=null;tx=hms(Math.max(0,4*3600+52*60-Math.floor(ex/1000)))}
    if(clk.textContent!==tx)clk.textContent=tx;
  };
})();
AGS.forEach(function(a){a.segs.sort(function(x,y){return x.t0-y.t0})});

/* tunnel (fixed, behind everything, the camera is always moving forward) */
var TR=null;
(function(){
  if(!GL_OK)return;
  try{
    var cv=document.getElementById('bg3d'),R_=new T3.WebGLRenderer({canvas:cv,antialias:false,alpha:true,powerPreference:'low-power'});R_.setPixelRatio(1);R_.setClearColor(0x000000,0);
    var scene=new T3.Scene();scene.fog=new T3.Fog(0x000000,6,46);var cam=new T3.PerspectiveCamera(55,1,.1,80),N=42,GAP=2.4,L=N*GAP,fr=[];
    for(var i=0;i<N;i++){
      var w=3.6+(i%3)*.5,h=2.1+(i%3)*.3,hi=i%6===0;
      var pts=[new T3.Vector3(-w,-h,0),new T3.Vector3(w,-h,0),new T3.Vector3(w,h,0),new T3.Vector3(-w,h,0)];
      var l=new T3.LineLoop(new T3.BufferGeometry().setFromPoints(pts),new T3.LineBasicMaterial({color:hi?0xd4d4d8:0x52525b,transparent:true,opacity:hi?.9:.7}));scene.add(l);fr.push(l);
    }
    var g1=new T3.GridHelper(200,80,0x27272a,0x27272a);g1.position.y=-2.6;scene.add(g1);
    var g2=new T3.GridHelper(200,80,0x1c1c20,0x1c1c20);g2.position.y=2.9;scene.add(g2);
    function size(){var w=innerWidth,h=innerHeight;R_.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}
    size();addEventListener('resize',size);
    var travel=0;
    TR=function(dT,dt,burst){
      travel+=dT*.0046*(1+burst*2.5)+dt*.2;
      for(var i=0;i<N;i++){var d=(((i*GAP-travel)%L)+L)%L,f=fr[i];f.position.z=-d+.6;f.rotation.z=Math.sin(i*.45+travel*.03)*.16;f.position.x=Math.sin(i*.31+travel*.05)*.5}
      var gm=((travel%2.5)+2.5)%2.5;g1.position.z=-60+gm;g2.position.z=-60+gm;
      cam.fov=55+burst*26;cam.updateProjectionMatrix();
      cam.position.set(Math.sin(travel*.04)*.45,Math.sin(travel*.07)*.18,0);cam.rotation.z=Math.sin(travel*.025)*.05+burst*.05;
      R_.render(scene,cam);
    };
  }catch(e){TR=null}
})();

/* ---- main loop ---- */
var pmx=0,pmy=0,mx=0,my=0;
addEventListener('pointermove',function(e){PMX=e.clientX;PMY=e.clientY;pmx=(e.clientX/innerWidth-.5)*2;pmy=(e.clientY/innerHeight-.5)*2},{passive:true});
var lastNow=0,burstS=0;
function tc(ms){ms=Math.max(0,ms);var s=Math.floor(ms/1000);return pad(Math.floor(s/60))+':'+pad(s%60)+':'+pad(Math.floor((ms%1000)*.024))}
function frame(now){
  requestAnimationFrame(frame);
  var rdt=Math.min(.25,(now-(lastNow||now))/1000),dt=Math.min(.05,rdt);lastNow=now;mx+=(pmx-mx)*(1-Math.exp(-dt*4));my+=(pmy-my)*(1-Math.exp(-dt*4));
  if(lenis)lenis.raf(now);
  if(started&&!document.hidden)introCur=Math.min(INTRO,introCur+dt*1000);
  var tgt=started?Math.min(total,introCur+Math.max(0,window.scrollY)/PPS*1000):0;
  if(LIM&&!LIM.open){tgt=Math.min(tgt,LIM.gate);if(window.scrollY>LIM.y+2){if(lenis)lenis.scrollTo(LIM.y,{immediate:true,force:true});else window.scrollTo(0,LIM.y)}}
  if(PLAY.on&&started){
    var mxS=Math.max(0,document.documentElement.scrollHeight-innerHeight),endY=(total-INTRO)/1000*PPS;
    PLAY.y=Math.min(PLAY.y+PPS*rdt,mxS);
    if(lenis)lenis.scrollTo(PLAY.y,{immediate:true,force:true});else window.scrollTo(0,PLAY.y);
    if(PLAY.y>=endY-1)setPlay(false);
  }
  var wN=12,nS=Math.max(1,Math.ceil(dt/.008)),hS=dt/nS;
  for(var si=0;si<nS;si++){TV+=(wN*wN*(tgt-T)-2*wN*TV)*hS;T+=TV*hS}
  if(Math.abs(tgt-T)<.4&&Math.abs(TV)<6){T=tgt;TV=0}
  if(LIM&&!LIM.open&&T>LIM.gate){T=LIM.gate;TV=0}
  if(T<0){T=0;TV=0}if(T>total){T=total;TV=0}
  var dT=T-lastT;lastT=T;
  for(var k=0;k<BEATS.length;k++){
    var b=BEATS[k],local=T-b.start,vis=local>-8&&local<b.dur+8;
    if(vis!==b.vis){
      b.vis=vis;b.el.classList.toggle('on',vis);
      if(vis)makeBeatViews(b);
      b.vw.forEach(function(v){setLive(v,vis)});
    }
    if(vis){
      if(b.each)b.each(b,local);
      for(var q=0;q<b.items.length;q++)itemFx(b.items[q]);
      /* each beat drifts toward the camera while it is on screen, so the whole film keeps moving */
      var du=clamp(local/b.dur,0,1),dd=k%2?1:-1,dk=(du*1000|0);
      if(b.dk!==dk||b.fk!==b.fitS){b.dk=dk;b.fk=b.fitS;b.bi.style.transform='translate3d('+(dd*14*(du-.5)).toFixed(2)+'px,'+(-10*(du-.5)).toFixed(2)+'px,0) scale('+((.975+.05*du)*b.fitS).toFixed(4)+')'}
    }
  }
  for(var q2=0;q2<BEATS.length;q2++){if(BEATS[q2].upd)BEATS[q2].upd()}
  var sv=clamp(Math.abs(dT)/Math.max(dt,.001)/7000,0,1);
  burstS+=(sv*.85-burstS)*(1-Math.exp(-dt*10));
  var fo=0;if(T<900)fo=1-eo(T/900);if(!started)fo=1;
  hintEl.classList.toggle('on',started&&introCur>=INTRO-300&&window.scrollY<24);
  fadeEl.style.opacity=fo.toFixed(3);
  var camS=1+.006*Math.sin(T*.00057)+burstS*.03,camR=.25*Math.sin(T*.00031)+burstS*.8*(Math.sin(T*.001)>0?1:-1),camX=Math.sin(T*.00043)*6-mx*8,camY=Math.cos(T*.00037)*4-my*5;
  if(NZ){var nt=now*.00017,hk=1+burstS*1.6;camX+=NZ.noise2D(nt,.3)*3.4*hk;camY+=NZ.noise2D(nt,9.1)*2.6*hk;camR+=NZ.noise2D(nt*.8,4.7)*.16*hk}
  /* the whole frame leans into fast scrolling, so motion feels physical */
  var skw=clamp(TV/2600,-1.8,1.8);
  stage.style.transform='translate3d('+camX.toFixed(2)+'px,'+camY.toFixed(2)+'px,0) rotate('+camR.toFixed(3)+'deg) skewY('+(-skw).toFixed(3)+'deg) scale('+camS.toFixed(4)+')';
  renderViews(dt);
  if(LIM)LIM.frame();
  agentsFrame(dt,now);
  for(var hk2=0;hk2<HOOKS.length;hk2++)HOOKS[hk2](dt,now,dT);
  drawCF(now);
  if(TR)TR(dT,dt,burstS);
  progI.style.transform='scaleX('+(T/total).toFixed(5)+')';
  hudTc.textContent=tc(T)+' / '+tc(total);
  var cur=BEATS[0];for(var q3=0;q3<BEATS.length;q3++){if(T>=BEATS[q3].start+300)cur=BEATS[q3]}
  if(hudCh.textContent!==cur.chap)hudCh.textContent=cur.chap;
}
function setPlay(on){
  PLAY.on=!!on;PLAY.y=window.scrollY;
  var b=document.getElementById('hPlay');if(b){b.classList.toggle('on',PLAY.on);b.setAttribute('aria-label',PLAY.on?'Pause the film':'Play the film')}
}
function goTo(ms,dur){var y=Math.max(0,(ms-INTRO)/1000*PPS);if(lenis)lenis.scrollTo(y,{duration:dur||1.6,easing:function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}});else window.scrollTo(0,y)}
function beatAt(id){for(var i=0;i<BEATS.length;i++)if(BEATS[i].id===id)return BEATS[i];return null}
/* left and right jump a beat: land where its elements have arrived */
function jump(dir){
  var cur=0;for(var q=0;q<BEATS.length;q++){if(T>=BEATS[q].start+600)cur=q}
  var n=clamp(cur+dir,0,BEATS.length-1);goTo(BEATS[n].start+(n?1500:0),1.1);
}
addEventListener('keydown',function(e){
  if(e.target&&(e.target.tagName==='BUTTON'||e.target.tagName==='INPUT'))return;
  if(e.key==='ArrowRight'){e.preventDefault();setPlay(false);jump(1)}
  else if(e.key==='ArrowLeft'){e.preventDefault();setPlay(false);jump(-1)}
});
document.addEventListener('visibilitychange',function(){lastNow=0});

var CHS=[];BEATS.forEach(function(b,k){if(k===0||b.chap!==BEATS[k-1].chap)CHS.push(b)});
CHS.forEach(function(b){var u=document.createElement('u');u.style.left=(b.start/total*100).toFixed(3)+'%';$('#prog').appendChild(u)});
$('#hTc').textContent='00:00:00 / '+tc(total);

/* final state of a beat, used by the reduced-motion page */
function beatFinal(b){
  b.items.forEach(function(it){
    var s=it.el.style;s.visibility='';s.opacity='';s.transform=it.rot?'rotate('+it.rot+'deg)':'';s.filter='';s.clipPath='';
    if(it.fx==='chars'){it.lines.forEach(function(l){l.cs.forEach(function(c){if(c.el){c.el.style.transform='';c.el.style.visibility=''}});if(l.tw)l.tw.textContent=''});if(it.caret)it.caret.style.opacity=0}
    if(it.fx==='type')it.tn.nodeValue=it.full;
    if(it.fx==='count')it.el.textContent=it.n+it.suf;
    if(it.fx==='scram')it.el.textContent=it.full;
  });
  if(b.each)b.each(b,b.dur-OUT-10);
}

if(reduce){
  document.documentElement.classList.add('static');
  var rs=function(){BEATS.forEach(function(b){b.vw.forEach(function(v){v.pp=.82;v.t=3;if(v.scrub){v.anims.forEach(function(a){a.seek(a.duration*.82)});if(v.post)v.post()}else v.anims.forEach(function(a){a.seek(a.duration)});if(v.tick)v.tick(3,.016);if(v.aim)v.aim();v.render()})})};
  Promise.race([(document.fonts&&document.fonts.ready)||Promise.resolve(),new Promise(function(r){setTimeout(r,1500)})]).then(function(){
    BEATS.forEach(function(b){b.el.classList.add('on');makeBeatViews(b);beatFinal(b);if(b.upd){T=b.start+b.dur;b.upd()}});
    rs();setTimeout(rs,500);setTimeout(rs,1500);addEventListener('resize',function(){setTimeout(rs,200)});
  });
}else{
  function setTrack(){var g=LIM&&!LIM.open;trackEl.style.height=(Math.round(((g?LIM.gate:total)-INTRO)/1000*PPS+innerHeight)+(g?1:0))+'px';if(!g&&lenis&&lenis.resize)lenis.resize()}
  if(LIM)LIM.setTrack=setTrack;
  setTrack();addEventListener('resize',setTrack);
  if(window.Lenis){try{lenis=new Lenis({lerp:.085,wheelMultiplier:1,smoothWheel:true})}catch(e){lenis=null}}
  requestAnimationFrame(frame);
  Promise.race([(document.fonts&&document.fonts.ready)||Promise.resolve(),new Promise(function(r){setTimeout(r,1800)})]).then(function(){setTimeout(function(){READY=true;if(!HOLD)started=true},200)});
  window.__film={views:VIEWS,get T(){return T},seek:function(ms){started=true;introCur=INTRO;window.scrollTo(0,Math.max(0,(ms-INTRO)/1000*PPS))},snap:function(ms){started=true;introCur=INTRO;window.scrollTo(0,Math.max(0,(ms-INTRO)/1000*PPS));T=ms;lastT=ms;TV=0},total:total,PPS:PPS,INTRO:INTRO,starts:BEATS.map(function(s){return s.start}),beats:BEATS.map(function(b){return{id:b.id||'',chap:b.chap,start:b.start,dur:b.dur}}),agents:AGS};
}
