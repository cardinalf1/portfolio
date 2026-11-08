/* ===================== extras: slate, chapter cards, player controls and a few hidden things =====================
   Everything that moves with the film (slate, chapter card) is a pure function of T.
   The player controls and the hidden extras are wall-clock overlays, like the confetti: they never change film state. */
(function(){
  var TITLE=document.title;

  /* for whoever opens the console */
  try{
    console.log('%cRAGHAV BAHADUR // PORTFOLIO FILM','font:700 12px monospace;letter-spacing:.2em;color:#fff;background:#000;padding:6px 10px;border:1px solid #fff');
    console.log('%cYou opened the console. The agents noticed.\nPress ? for the keys. Some things are not on that list.\nEmail: '+SITE.email,'font:12px/1.6 monospace;color:#8B8B93');
  }catch(e){}

  /* a paused film says so in the tab */
  document.addEventListener('visibilitychange',function(){document.title=document.hidden?'Paused. The agents are waiting.':TITLE});
  /* copying anything but the email gets a note */
  document.addEventListener('copy',function(){var sel=String(window.getSelection&&getSelection()||'');if(sel&&sel.indexOf(SITE.email)<0&&window.__toast)__toast('Copying is fine. Hiring is better.')});

  if(reduce)return;

  var endT2=false;HOOKS.push(function(){var e=T>=total-50;if(e!==endT2&&!document.hidden){endT2=e;document.title=e?'Thanks for scrolling.':TITLE}});
  var slate=$('#slate'),slN=$('#slN'),slL=$('#slL'),lt=$('#lt'),ltB=$('b',lt),ltL=$('i',lt),ltS=$('span',lt),toastEl=$('#toast'),keys=$('#keys'),stEl=$('#hSt');

  /* opening slate */
  slN.textContent='Runtime '+tc(RUNTIME).slice(0,5);
  var hr=new Date().getHours();
  if(hr<5)slL.textContent='It is late. This takes about three minutes.';

  /* chapter cards, in the bottom margin like a lower third */
  /* chapters now get full title cards in the film, so the lower third is off */
  var CH=[];
  var ltCur=null;

  /* toast */
  var tAn=null;
  function toast(msg,ms){
    toastEl.textContent=msg;if(tAn)tAn.pause();
    tAn=A.timeline({easing:'easeOutExpo'})
      .add({targets:toastEl,opacity:[0,1],translateY:[14,0],translateX:['-50%','-50%'],duration:450})
      .add({targets:toastEl,opacity:[1,0],translateY:[0,-8],translateX:['-50%','-50%'],duration:420,easing:'easeInQuad'},(ms||2200));
  }

  window.__toast=toast;
  /* nobody scrolling? an intern comes to check */
  var lastIn=performance.now(),idleOn=false,IDL=['!STILL THERE?','!HELLO?','!SCROLL. PLEASE.','!WE GET PAID PER SCROLL','!(WE DO NOT GET PAID)','!FINE. I WILL WAIT.'];
  ['wheel','pointerdown','keydown','touchstart','scroll'].forEach(function(n){addEventListener(n,function(){lastIn=performance.now();if(idleOn){idleOn=false;var a=AGS[5];if(a.ovr&&a.ovr.idle)a.ovr.u=performance.now()}},{passive:true})});
  HOOKS.push(function(dt,now){
    if(!started||idleOn||now-lastIn<9000||T>=total-50||(LIM&&!LIM.open&&T>=LIM.gate-5)||SWARM.u>now)return;
    idleOn=true;var t0=now;window.__ach&&__ach('idle');
    AGS[5].ovr={idle:1,fn:function(){var n2=performance.now(),k=Math.min(1,(n2-t0)/900);return{x:innerWidth*(1.05-.2*k)+Math.sin(n2*.0011)*30,y:innerHeight*.14+Math.cos(n2*.0013)*14}},on:function(){return true},
      sg:{get label(){return IDL[Math.min(IDL.length-1,Math.floor((performance.now()-t0)/2200))]},clicks:[],grab:false,shape:null,frame:null}};
  });
  /* go to a time in the film, smoothly */
  function shotStart(id){var b=beatAt(id);return b?b.start+2600:0}


  /* keyboard help */
  var kAn=null;
  function showKeys(on){
    if(on===keys.classList.contains('on'))return;
    if(kAn)kAn.pause();
    if(on){keys.classList.add('on');keys.setAttribute('aria-hidden','false');
      kAn=A.timeline({easing:'easeOutExpo'}).add({targets:keys,opacity:[0,1],scale:[.96,1],translateX:['-50%','-50%'],translateY:['-50%','-50%'],duration:420})
        .add({targets:$$('#keys dl div, #keys p'),opacity:[0,1],translateY:[8,0],delay:A.stagger(45),duration:500},80);
    }else{keys.setAttribute('aria-hidden','true');
      kAn=A({targets:keys,opacity:[1,0],scale:[1,.97],translateX:['-50%','-50%'],translateY:['-50%','-50%'],duration:220,easing:'easeInQuad',complete:function(){keys.classList.remove('on')}});
    }
  }
  addEventListener('pointerdown',function(e){if(keys.classList.contains('on')&&!keys.contains(e.target))showKeys(false)});

  /* hidden: the Konami code, a few typed words */
  var KON=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'],kon=0,typed='';
  function swarm(mode,ms,labels){
    var now=performance.now();SWARM.mode=mode;SWARM.t0=now;SWARM.u=now+ms;
    SWARM.sg=AGS.map(function(a,i){a.bw=0;return{label:labels[i],clicks:[],shape:null,frame:null,grab:false}});
  }
  var WORDS={
    sudo:function(){toast('Permission denied. Nice try.')},
    hire:function(){toast('Rolling to contact.');goTo(shotStart('contact'),2.6)},
    opus:function(){toast('At your service. Within usage limits.')}
  };
  addEventListener('keydown',function(e){
    if(e.metaKey||e.ctrlKey||e.altKey)return;
    var tg=e.target&&e.target.tagName;if(tg==='INPUT'||tg==='TEXTAREA')return;
    var k=e.key;
    if(k==='?'){e.preventDefault();showKeys(!keys.classList.contains('on'));return}
    if(k==='Escape'){showKeys(false);return}
    var kk=k.length===1?k.toLowerCase():k;
    kon=kk===KON[kon]?kon+1:(kk===KON[0]?1:0);
    if(kon===KON.length){kon=0;swarm('mouse',8000,AGS.map(function(a,i){return i?'!0'+(i+1):'!FOLLOWING YOU'}));toast('Swarm mode. They like you.');window.__ach&&__ach('konami')}
    if(k.length===1&&/[a-z]/i.test(k)){typed=(typed+k.toLowerCase()).slice(-8);for(var w in WORDS){if(typed.slice(-w.length)===w){typed='';WORDS[w]();window.__ach&&__ach('typed');break}}}
  });

  /* hidden: poke a cursor and it answers back */
  var QUIPS=['I am working here','That tickles','Hands off the cursor','No, you click it','Still within limits','I saw that','Ask AGENT_04','Back to work'],qi=0;
  addEventListener('pointerdown',function(e){
    var now=performance.now();
    for(var i=0;i<AGS.length;i++){var a=AGS[i];if(a.op<.5)continue;
      if(Math.hypot(e.clientX-a.x,e.clientY-a.y)<30){a.quip={t:QUIPS[qi++%QUIPS.length].toUpperCase(),u:now+1800};window.__ach&&__ach('poke');window.__snd&&__snd('boing');a.spinT=now;a.spinDeg=-360;a.spinDur=700;a.pulseT=now;break}}
  },{passive:true});

  /* hidden: keep scrolling after the end for a post-credits scene */
  var endHits=0,endT=0,ty0=0;
  function endPush(){
    if(T<total-60)return;var now=performance.now();if(now-endT>2600)endHits=0;endT=now;
    if(++endHits>=3&&now>SWARM.u+600){endHits=0;window.__ach&&__ach('post');swarm('line',6500,['!THANKS','!FOR','!SCROLLING.','!SEE','!YOU','!SOON.'])}
  }
  addEventListener('wheel',function(e){if(e.deltaY>0)endPush()},{passive:true});
  addEventListener('touchstart',function(e){ty0=e.touches[0].clientY},{passive:true});
  addEventListener('touchend',function(e){var t=e.changedTouches[0];if(t&&t.clientY<ty0-30)endPush()},{passive:true});
  addEventListener('keydown',function(e){if(e.key==='PageDown'||e.key==='ArrowDown'||e.key==='End'||(e.key===' '&&!e.shiftKey))endPush()});

  /* deep link: #t=SECONDS starts the film there, in the same seconds the counter shows */
  var deep=/(?:^#|&)t=(\d+(?:\.\d+)?)/.exec(location.hash),deepDone=!deep;

  var spS=0,stTxt='';
  HOOKS.push(function(dt,now,dT){
    if(!deepDone&&started){deepDone=true;introCur=INTRO;var dm=clamp(+deep[1]*1000*total/RUNTIME,0,total),y=Math.max(0,(dm-INTRO)/1000*PPS);if(lenis)lenis.scrollTo(y,{immediate:true,force:true});else window.scrollTo(0,y);T=Math.min(dm,LIM&&!LIM.open?LIM.gate:total);lastT=T;TV=0;dT=0}
    /* slate: holds while the page loads, then fades as the film starts */
    var so=!started?1:1-clamp((T-350)/550,0,1);
    if(so<=0){if(slate.style.display!=='none')slate.style.display='none'}
    else{if(slate.style.display==='none')slate.style.display='';slate.style.opacity=so.toFixed(3)}
    /* chapter card */
    var c=null,a=0,b=0;
    for(var i=0;i<CH.length;i++){var t0=CH[i].s.start+250;if(T>=t0&&T<t0+3500){c=CH[i];a=clamp((T-t0)/500,0,1);b=clamp((T-t0-2900)/450,0,1)}}
    if(c!==ltCur){ltCur=c;if(c){ltB.textContent=c.n;ltS.textContent=c.s.chap}}
    var lo=c?eo(a)*(1-b):0;
    lt.style.opacity=lo.toFixed(3);
    if(c){ltL.style.transform='scaleX('+eo(a).toFixed(3)+')';ltS.style.clipPath='inset(0 '+((1-eo(a))*100).toFixed(1)+'% 0 0)'}
    /* transport status: REW / FF with the speed, like a tape deck */
    spS+=(dT/Math.max(dt,.001)-spS)*(1-Math.exp(-dt*6));
    var s='';
    if(spS<-1900)s='REW '+Math.max(2,Math.round(-spS/1000))+'X';
    else if(spS>2600)s='FF '+Math.round(spS/1000)+'X'+(spS>7000?' // SLOW DOWN':'');
    if(spS<-6000)s+=' // ACT NATURAL';
    if(s!==stTxt){stTxt=s;if(s)stEl.textContent=s;stEl.classList.toggle('on',!!s)}
  });
})();
