/* ===================== fun: achievements, director's commentary, and sound =====================
   All three are viewer extras laid over the film. None of them change the film state, which stays a pure function of T. */

/* ---------- achievements ---------- */
var ACH_LIST=[
  ['freed','Free model','Got past the usage limit'],
  ['patience','Patience','Pressed WAIT three times'],
  ['rewind','Rewinder','Scrolled back more than ten seconds'],
  ['speed','Speedrunner','Fast forwarded at 8X or more'],
  ['poke','Do not touch','Poked a cursor'],
  ['idle','Still there','Got checked on by an intern'],
  ['konami','Swarm','Entered the Konami code'],
  ['typed','Secret word','Typed a secret word'],
  ['cc','Commentary','Turned on the director\'s commentary'],
  ['snd','Audiophile','Turned the sound on'],
  ['end','Completionist','Scrolled to the very end'],
  ['post','Post credits','Found the post credits scene'],
  ['scenes','Scene select','Opened the scene menu'],
  ['print','Paper copy','Printed the portfolio. Respect.'],
  ['tldr','In a hurry','Read the 30 second version'],
  ['resume','Resume acquired','Caught the resume button']
];
var ACH={};try{ACH=JSON.parse(localStorage.getItem('rbAch')||'{}')||{}}catch(e){ACH={}}
window.__ach=function(id){
  if(ACH[id])return;var a=null;ACH_LIST.forEach(function(x){if(x[0]===id)a=x});if(!a)return;
  ACH[id]=1;try{localStorage.setItem('rbAch',JSON.stringify(ACH))}catch(e){}
  var n=Object.keys(ACH).length;
  if(window.__achShow)__achShow(a,n);
  if(window.__snd)__snd('ach');
  achPanel();
};
function achPanel(){
  var el=document.getElementById('achList');if(!el)return;
  var n=0;el.innerHTML=ACH_LIST.map(function(a){var on=!!ACH[a[0]];if(on)n++;return '<li class="'+(on?'on':'')+'"><b>'+(on?esc(a[1]):'???')+'</b><span>'+(on?esc(a[2]):'Not found yet')+'</span></li>'}).join('');
  var c=document.getElementById('achN');if(c)c.textContent=n+' of '+ACH_LIST.length;
}

(function(){
  achPanel();
  if(reduce)return;

  /* achievement card: slides in at the top right, holds, slides out */
  var card=document.getElementById('achCard'),cAn=null;
  window.__achShow=function(a,n){
    card.querySelector('b').textContent=a[1];card.querySelector('span').textContent=a[2];card.querySelector('em').textContent=n+' / '+ACH_LIST.length;
    if(cAn)cAn.pause();
    cAn=A.timeline({easing:'easeOutExpo'})
      .add({targets:card,opacity:[0,1],translateX:[60,0],duration:550})
      .add({targets:card.querySelector('i'),scaleX:[0,1],duration:2600,easing:'linear'},0)
      .add({targets:card,opacity:[1,0],translateX:[0,40],duration:420,easing:'easeInQuad'},2800);
  };

  /* ---------- sound: synthesized, off until the viewer turns it on ---------- */
  var AC=null,master=null,sndOn=false;
  try{sndOn=localStorage.getItem('rbSnd')==='1'}catch(e){}
  function ctx(){if(AC)return AC;try{var C=window.AudioContext||window.webkitAudioContext;AC=new C();master=AC.createGain();master.gain.value=.55;master.connect(AC.destination)}catch(e){AC=null}return AC}
  var noiseBuf=null;
  function noise(){if(noiseBuf)return noiseBuf;var n=AC.sampleRate*.2|0;noiseBuf=AC.createBuffer(1,n,AC.sampleRate);var d=noiseBuf.getChannelData(0);for(var i=0;i<n;i++)d[i]=Math.random()*2-1;return noiseBuf}
  function env(g,t,a,peak,dec){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+dec)}
  function burst(t,f,q,peak,dec,pan){var s=AC.createBufferSource();s.buffer=noise();var b=AC.createBiquadFilter();b.type='bandpass';b.frequency.value=f;b.Q.value=q;var g=AC.createGain();env(g,t,.002,peak,dec);var p=AC.createStereoPanner?AC.createStereoPanner():null;s.connect(b);b.connect(g);if(p){p.pan.value=pan||0;g.connect(p);p.connect(master)}else g.connect(master);s.start(t);s.stop(t+dec+.05)}
  function tone(t,f,type,peak,dec,f2){var o=AC.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dec);var g=AC.createGain();env(g,t,.004,peak,dec);o.connect(g);g.connect(master);o.start(t);o.stop(t+dec+.05)}
  var lastKey=0;
  window.__snd=function(kind,x){
    if(!sndOn||!ctx()||AC.state!=='running')return;var t=AC.currentTime,pan=x==null?0:clamp(x/innerWidth*2-1,-1,1)*.7;
    if(kind==='key'){if(t-lastKey<.028)return;lastKey=t;burst(t,2600+Math.random()*1400,3,.11,.035,pan);burst(t,320,1.2,.05,.05,pan)}
    else if(kind==='space'){burst(t,900,1.4,.12,.07,pan)}
    else if(kind==='stamp'){tone(t,110,'sine',.5,.28,48);burst(t,600,.8,.35,.12,pan)}
    else if(kind==='click'){burst(t,4200,6,.12,.02,pan);burst(t+.06,3600,6,.08,.018,pan)}
    else if(kind==='boing'){tone(t,520,'triangle',.18,.35,180)}
    else if(kind==='win'){[392,494,587,784].forEach(function(f,i){tone(t+i*.07,f,'triangle',.12,.5)})}
    else if(kind==='ach'){tone(t,880,'sine',.09,.18);tone(t+.09,1318,'sine',.09,.3)}
    else if(kind==='err'){tone(t,140,'square',.07,.22,110)}
  };
  var sb=document.getElementById('hSnd');
  function setSnd(on){
    sndOn=on;try{localStorage.setItem('rbSnd',on?'1':'0')}catch(e){}
    sb.classList.toggle('on',on);sb.setAttribute('aria-label',on?'Sound on':'Sound off');sb.textContent=on?'SND ON':'SND';
    if(on){ctx();if(AC&&AC.resume)AC.resume();__ach('snd');__snd('click')}
  }
  /* browsers only allow audio after a click or key press, so a saved "on" waits for the first one */
  setSnd(sndOn);if(sndOn){sb.textContent='SND ON';var first=function(){if(ctx()&&AC.resume)AC.resume();removeEventListener('pointerdown',first);removeEventListener('keydown',first)};addEventListener('pointerdown',first);addEventListener('keydown',first)}
  sb.addEventListener('click',function(){setSnd(!sndOn)});
  sb.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();setSnd(!sndOn)}});

  /* ---------- director's commentary: one line per beat, like a DVD extra ---------- */
  var COM=[
    'We open on a name. Bold choice. It is his name.',
    'The "(mostly)" was cut in the edit. By AI. Mostly.',
    'This line is true. The typing speed is not great.',
    'He did not actually stop typing. He types prompts now. Long ones.',
    'Six cursors were cast. All six showed up. None were paid.',
    'Two bodies of work: personal builds, and things for his racing team.',
    'Four builds in about six weeks. The calendar is accurate. Unfortunately.',
    'Installers are the least glamorous part of shipping. He did them anyway.',
    'Second, out of every team in the country. He would like you to sit with that.',
    'Things that run. Not things that might run, later, with funding.',
    'Yes, these icons spin. No, they do not mean anything deep.',
    'Circuit board to sponsor portal. He keeps going down layers and coming back up.',
    'He co-founded the team. He did not build the car. Again: not the car.',
    'Blackbook. Practice for the Digital SAT, offline, for free.',
    'The stamp says sorry. It is a little bit sorry.',
    'Takt. You hold a key and talk. Fewer ums than real life.',
    'Every um in this commentary was removed by hand.',
    'relay. It turns his PC on from far away. Nobody else can. He checked.',
    'Yes, it works from school. Within the rules. Please do not email the school.',
    'Scrub. A music player with a wheel that clicks back at you.',
    'It is a drawing. A very detailed, four-layer drawing.',
    'Now the team. This is where the jokes about the car come from.',
    'First place at the qualifiers, plus the Sustainability Award. As a team.',
    'Enterprise Director. Brand, sponsors and budget. The unglamorous half of racing.',
    'For legal reasons we must repeat: he did not build the car.',
    'The public website. The cars look great on it. Someone else built the cars.',
    'Overture, the private portal. Schedules, parts, budget, sponsors.',
    'There is a chat assistant in there. Switched off, and the app says so.',
    'Behind the scenes now. This is how the work actually gets done.',
    'Claude Opus plans and assigns. It also helped make this film.',
    'Free models read the datasheets. Somebody has to.',
    'This is where the budget ran out. You may remember this part.',
    'A model once got a pin layout wrong. The datasheet won. It always wins.',
    'Final call, his. The models get a vote. It is not counted.',
    'He started out making games. This whole site is secretly a game. Try the Konami code.',
    'Five games in Godot, and 2nd place (South Zone) in a game design championship.',
    'He stopped coding by hand. He did not stop thinking by hand.',
    'If you are on an admissions committee: this is the part to remember.',
    'Seven bars. Every date is real. The today line moves with today.',
    'He will work for free. That is not the joke. That is the offer.',
    'Real problems, real deadlines, real users. He will take all three.',
    'Plan, direct, test. In that order. Every time.',
    'The interns copy the email for you. You can also just press the button.',
    'Roll credits. This commentary was written by an agent. He approved it.',
    'Every cursor on this list really did appear in this film.',
    'AGENT_01 slept through the usage limit. Nobody blames them.',
    'Catering really was none.',
    'That is the film. Scroll back up for the director\'s cut. It is the same cut.'
  ];
  var ccEl=document.getElementById('cc'),ccOn=false,ccCur=-1,ccB=document.getElementById('hCC');
  function setCC(on){ccOn=on;ccB.classList.toggle('on',on);ccB.setAttribute('aria-label',on?'Commentary on':'Commentary off');if(on){__ach('cc');window.__toast&&__toast('Director\'s commentary on. Press C to turn it off.',1600)}ccCur=-2}
  ccB.addEventListener('click',function(){setCC(!ccOn)});
  ccB.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();setCC(!ccOn)}});

  addEventListener('keydown',function(e){
    if(e.metaKey||e.ctrlKey||e.altKey)return;var tg=e.target&&e.target.tagName;if(tg==='INPUT'||tg==='TEXTAREA')return;
    if(e.key==='c'||e.key==='C'){setCC(!ccOn)}
    else if(e.key==='m'||e.key==='M'){setSnd(!sndOn)}
  });

  /* ---------- per frame: commentary, sounds that follow the film, and achievements that watch it ---------- */
  var prevT=0,minSince=0,keyCount=0,stamps=[],typed=[],lastDodges=0,lastOpen=!!(LIM&&LIM.open),lastPulse=AGS.map(function(a){return a.pulseT});
  BEATS.forEach(function(b){b.items.forEach(function(it){if(it.fx==='stamp')stamps.push(it);if(it.fx==='chars'||it.fx==='type')typed.push(it)})});
  HOOKS.push(function(dt,now,dT){
    /* commentary */
    var bi=-1,ci=-1;for(var i=0;i<BEATS.length;i++){if(!BEATS[i].card)ci++;if(T>=BEATS[i].start+150)bi=BEATS[i].card?-1:ci}
    var want=ccOn&&started?bi:-1;
    if(want!==ccCur){ccCur=want;var line=want>=0?COM[want]||'':'';
      if(line){ccEl.querySelector('span').textContent=line;A.remove(ccEl);A({targets:ccEl,opacity:[0,1],translateY:[8,0],translateX:['-50%','-50%'],duration:420,easing:'easeOutExpo'})}
      else{A.remove(ccEl);A({targets:ccEl,opacity:0,duration:200,easing:'linear'})}
    }
    /* sounds that follow the playhead, forward only */
    if(sndOn&&dT>0){
      var kc=0;
      for(var j=0;j<typed.length;j++){var it=typed[j];if(!it.b.vis)continue;
        if(it.fx==='chars')it.lines.forEach(function(l){kc+=l.nc+l.nw*2});else kc+=it.tn._n||0}
      if(kc>keyCount){var r=it&&it.el?R(it.el):null;__snd('key',r?r.left+r.width/2:null)}
      keyCount=kc;
      stamps.forEach(function(s){var hit=s.b.start+s.d+s.din*.55;if(prevT<hit&&T>=hit){var rr=R(s.el);__snd('stamp',rr.left+rr.width/2)}});
    }else if(dT<0){keyCount=0}
    AGS.forEach(function(a,k){if(a.pulseT!==lastPulse[k]){lastPulse[k]=a.pulseT;if(sndOn&&a.op>.5)__snd('click',a.x)}});
    if(LIM){if(LIM.dodges>lastDodges){lastDodges=LIM.dodges;__snd('boing')}
      if(LIM.open&&!lastOpen){lastOpen=true;__snd('win');__ach('freed')}}
    /* achievements that watch the film */
    if(dT>0)minSince=T;else if(minSince-T>10000)__ach('rewind');
    if(dt>0&&dT/dt>8000)__ach('speed');
    if(T>=total-60)__ach('end');
    prevT=T;
  });

  /* achievements from the hidden extras */
  var waits=0;var wt=document.getElementById('limWait');if(wt)wt.addEventListener('click',function(){if(++waits>=3)__ach('patience');__snd('err')});
})();

/* ===================== more extras: scene select, the viewer's own tag, VHS rewind, the name as home, printing ===================== */
(function(){
  /* printing: the whole film laid out as a plain page, every element in its final state */
  function resetCaches(){BEATS.forEach(function(b){b.dk=null;b.items.forEach(function(it){it.key='';it.ck=null;it.el._v=null;it.el._ty=null;
    if(it.fx==='chars')it.lines.forEach(function(l){l.nc=-1;l.nw=-1;l.cs.forEach(function(c){c.v=-1;c.y=null})});if(it.fx==='type')it.tn._n=-1})})}
  var wasStatic=false;
  addEventListener('beforeprint',function(){if(document.documentElement.classList.contains('printing'))return;wasStatic=document.documentElement.classList.contains('static');document.documentElement.classList.add('static','printing');BEATS.forEach(function(b){b.el.classList.add('on');beatFinal(b)});window.__ach&&__ach('print')});
  addEventListener('afterprint',function(){if(!document.documentElement.classList.contains('printing'))return;document.documentElement.classList.remove('printing');if(!wasStatic){document.documentElement.classList.remove('static');BEATS.forEach(function(b){b.vis=null});resetCaches()}});
  if(reduce)return;

  /* the name in the top bar goes back to the start */
  var nm=document.getElementById('hName');
  function home(){if(window.__chooser){__chooser()}else{goTo(0,1.8)}}
  nm.addEventListener('click',home);nm.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();home()}});

  /* scene select, like a DVD menu: click (or Tab to and press Enter on) the chapter name in the top bar */
  var sc=document.getElementById('scenes'),list=$('ol',sc),chs=[],sAn=null;
  BEATS.forEach(function(b,k){if(k===0||b.chap!==BEATS[k-1].chap)chs.push(b)});
  list.innerHTML=chs.map(function(b,i){var n=(i+1<chs.length?chs[i+1].start:total)-b.start;return '<li><button type="button" data-i="'+i+'"><em>'+pad(i+1)+'</em><b>'+esc(b.chap)+'</b><span>'+tc(filmTime(b.start)).slice(0,5)+'</span><i>'+Math.max(1,Math.round(filmTime(n)/1000))+' s</i></button></li>'}).join('');
  var btns=$$('button',list);
  function showScenes(on){
    if(on===sc.classList.contains('on'))return;if(sAn)sAn.pause();
    if(on){sc.classList.add('on');sc.setAttribute('aria-hidden','false');var cur=0;chs.forEach(function(b,i){if(T>=b.start-50)cur=i});btns.forEach(function(x,i){x.classList.toggle('cur',i===cur)});
      sAn=A.timeline({easing:'easeOutExpo'}).add({targets:sc,opacity:[0,1],duration:300}).add({targets:btns,opacity:[0,1],translateX:[-24,0],delay:A.stagger(35),duration:520},60);
      setTimeout(function(){btns[cur].focus({preventScroll:true})},80);window.__ach&&__ach('scenes')}
    else{sc.setAttribute('aria-hidden','true');sAn=A({targets:sc,opacity:0,duration:200,easing:'linear',complete:function(){sc.classList.remove('on')}})}
  }
  btns.forEach(function(x,i){x.addEventListener('click',function(){showScenes(false);var b=chs[i];goTo(b.start+(i?400:0),1.6)})});
  var ch=document.getElementById('hCh');ch.addEventListener('click',function(){showScenes(!sc.classList.contains('on'))});
  ch.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();showScenes(!sc.classList.contains('on'))}});
  $('.x',sc).addEventListener('click',function(){showScenes(false)});
  addEventListener('keydown',function(e){
    if(e.metaKey||e.ctrlKey||e.altKey)return;var tg=e.target&&e.target.tagName;if(tg==='INPUT'||tg==='TEXTAREA')return;
    if(e.key==='Escape')showScenes(false);
    else if(sc.classList.contains('on')&&(e.key==='ArrowDown'||e.key==='ArrowUp')){e.preventDefault();e.stopPropagation();var i=btns.indexOf(document.activeElement);i=clamp(i+(e.key==='ArrowDown'?1:-1),0,btns.length-1);btns[i].focus({preventScroll:true})}
  },true);
  addEventListener('pointerdown',function(e){if(sc.classList.contains('on')&&!sc.contains(e.target)&&e.target!==ch)showScenes(false)});

  /* the viewer gets a tag too: AGENT_07, following the real mouse */
  var me=document.getElementById('me'),fine=window.matchMedia&&matchMedia('(pointer:fine)').matches,mx2=-99,my2=-99,shown=false,lastMove=0,overBtn=false,meTxt='',meCur='';
  if(fine){
    addEventListener('pointermove',function(e){if(e.pointerType!=='mouse')return;mx2=e.clientX;my2=e.clientY;lastMove=performance.now();
      var t=e.target;overBtn=!!(t&&t.closest&&t.closest('button,[role=button],a'));if(!shown){shown=true;me.style.opacity=1}},{passive:true});
    document.documentElement.addEventListener('mouseleave',function(){shown=false;me.style.opacity=0});
  }
  var vhs=document.getElementById('vhs'),sp2=0;
  HOOKS.push(function(dt,now,dT){
    sp2+=(dT/Math.max(dt,.001)-sp2)*(1-Math.exp(-dt*6));
    /* VHS tracking lines while rewinding fast */
    var vo=clamp((-sp2-2200)/6000,0,.55);
    if(vo>.005){vhs.style.opacity=vo.toFixed(3);vhs.style.backgroundPosition='0 '+((now*.9)%400).toFixed(0)+'px'}else if(vhs.style.opacity!=='0')vhs.style.opacity=0;
    if(!fine||!shown)return;
    var idle=now-lastMove,gate=LIM&&!LIM.open&&T>=LIM.gate-5;
    var s=gate?(overBtn?'TRY HARDER':'STUCK TOO'):overBtn?'CLICKING?':sp2>2600?'SPEEDRUNNING':sp2<-1900?'REWINDING':Math.abs(sp2)>200?'WATCHING':idle>5000?'THINKING':'(YOU)';
    if(s!==meCur){meCur=s;me.textContent='AGENT_07 '+s}
    var fl=mx2>innerWidth-190;if(fl!==me._fl){me._fl=fl;me.classList.toggle('fl',fl)}
    me.style.transform='translate3d('+mx2+'px,'+my2+'px,0)';
  });
})();

/* ===================== the 30 second version, for anyone short on time: admissions, recruiters, colleagues ===================== */
(function(){
  if(reduce)return;
  var box=document.getElementById('tldr');
  var FACTS=[
    ['6','projects, in two bodies of work'],
    ['4','personal builds in about six weeks'],
    ['2','released with real installers'],
    ['2nd','India national final, STEM Racing (team result)'],
    ['1st','All-India National Qualifiers, plus the Sustainability Award (team result)']
  ];
  var rows=P1.concat(P2).map(function(p,i){return '<li><span class="tn">'+pad(i+1)+'</span><div><b>'+esc(p.name)+'</b><em>'+esc(p.line)+'</em></div><span class="ts">'+sqi(p.sq)+esc(p.status)+'</span></li>'}).join('');
  box.innerHTML='<div class="lb"><b>SUMMARY.TXT</b><span>THE 30 SECOND VERSION</span><span class="x" role="button" tabindex="0" aria-label="Close">[ ESC ]</span></div>'+
    '<div class="tg2"><section class="tl">'+
      '<p class="k">Bengaluru, India // Student, Isha Home School</p>'+
      '<h2>Raghav Bahadur</h2>'+
      '<p class="one">I design the system, then direct AI tools to build it, and I test what ships. Software with working installers, a circuit board, and the website and portal for my STEM Racing team.</p>'+
      '<p class="av"><i></i>Open to unpaid work and internships. Applying for design and technology degrees.</p>'+
      '<dl>'+FACTS.map(function(f){return '<div><dt>'+esc(f[0])+'</dt><dd>'+esc(f[1])+'</dd></div>'}).join('')+'</dl>'+
      '<p class="nt">Certified in Agentic AI (Andrew Ng\'s course). Co-founder and Enterprise Director of Team Cardinal. The race cars are the team\'s work; I built the website and the management portal.</p>'+
    '</section><section class="tr"><p class="k">What I have built</p><ol>'+rows+'</ol>'+
      '<p class="k" style="margin-top:22px">How I work</p><p class="hw">Claude Opus plans and assigns. Free models read datasheets and draft. Every result is checked against the source. I make the final call.</p>'+
    '</section></div>'+
    '<div class="ta"><button type="button" class="pri" data-a="copy">[ COPY EMAIL ] <span>'+esc(SITE.email)+'</span></button><a class="btn2" href="mailto:'+esc(SITE.email)+'">[ WRITE TO ME ]</a>'+(SITE.resume?'<a class="btn2" href="'+esc(SITE.resume)+'" target="_blank" rel="noopener">[ FULL RESUME ]</a>':'')+'<button type="button" data-a="print">[ SAVE AS PDF ]</button><a class="btn2" href="?plain">[ PLAIN TEXT ]</a><button type="button" data-a="film">[ BACK TO THE FILM ]</button></div>';
  var tAn=null,lastFocus=null;
  function show(on){
    /* the 30 second version lives on its own page now */
    if(on){window.__ach&&__ach('tldr');location.href='30s.html';return}
    if(on===box.classList.contains('on'))return;if(tAn)tAn.pause();
    if(on){lastFocus=document.activeElement;box.classList.add('on');box.setAttribute('aria-hidden','false');
      tAn=A.timeline({easing:'easeOutExpo'}).add({targets:box,opacity:[0,1],duration:320})
        .add({targets:$$('.tl > *, .tr > *, .ta > *',box),opacity:[0,1],translateY:[14,0],delay:A.stagger(28),duration:620},40);
      setTimeout(function(){var b=$('.pri',box);if(b)b.focus({preventScroll:true})},60);window.__ach&&__ach('tldr')}
    else{box.setAttribute('aria-hidden','true');tAn=A({targets:box,opacity:0,duration:220,easing:'linear',complete:function(){box.classList.remove('on')}});if(lastFocus&&lastFocus.focus)try{lastFocus.focus({preventScroll:true})}catch(e){}}
  }
  window.__tldr=show;
  function copy(){var em=SITE.email;function ok(){window.__toast&&__toast('Copied '+em+'. Talk soon.',1800)}
    try{navigator.clipboard.writeText(em).then(ok,function(){fallback()})}catch(e){fallback()}
    function fallback(){try{var ta=document.createElement('textarea');ta.value=em;ta.style.cssText='position:fixed;opacity:0';document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);ok()}catch(e){window.__toast&&__toast(em,2400)}}}
  window.__copyEmail=copy;
  box.addEventListener('click',function(e){var b=e.target.closest('[data-a]');if(!b)return;var a=b.getAttribute('data-a');
    if(a==='copy')copy();else if(a==='print'){show(false);setTimeout(function(){window.print()},260)}else if(a==='film')show(false)});
  $('.x',box).addEventListener('click',function(){show(false)});
  addEventListener('keydown',function(e){
    if(e.metaKey||e.ctrlKey||e.altKey)return;var tg=e.target&&e.target.tagName;if(tg==='INPUT'||tg==='TEXTAREA')return;
    if(CHOOSING)return;
    if((e.key==='t'||e.key==='T')&&!(tg==='BUTTON'&&!box.contains(e.target))){e.preventDefault();show(!box.classList.contains('on'))}
    else if(e.key==='Escape'&&box.classList.contains('on'))show(false);
    else if(e.key==='Tab'&&box.classList.contains('on')){var f=$$('button,a,[tabindex="0"]',box);if(!f.length)return;var i=f.indexOf(document.activeElement);if(e.shiftKey&&i<=0){e.preventDefault();f[f.length-1].focus()}else if(!e.shiftKey&&i===f.length-1){e.preventDefault();f[0].focus()}}
  },true);
  addEventListener('pointerdown',function(e){if(box.classList.contains('on')&&!box.contains(e.target)&&!e.target.closest('#hTl'))show(false)});
  /* top bar: 30s and email are always one click away */
  var tb=document.getElementById('hTl'),eb=document.getElementById('hEm'),rs=document.getElementById('hRs');
  if(rs){if(SITE.resume)rs.href=SITE.resume;else rs.style.display='none'}
  function key(n,f){n.addEventListener('click',f);n.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();f()}})}
  key(tb,function(){show(!box.classList.contains('on'))});key(eb,copy);
  /* the last slide's buttons */
  var endB=BEATS.filter(function(b){return b.id==='end'})[0];
  if(endB)endB.el.addEventListener('click',function(e){var b=e.target.closest('[data-end]');if(!b)return;var a=b.getAttribute('data-end');
    if(a==='copy')copy();else if(a==='tldr')show(true);else if(a==='again'){goTo(0,2.4)}});
})();

/* ===================== buttons that play hard to get (the resume buttons), like the free model button =====================
   runaway(a, cfg) makes a link flee three times, get chased by interns, get pinned by its real corners (measured from
   markers inside it, since the film's camera can tilt it), break free after 3 seconds, and finally work when clicked
   while pinned. It only flees to empty parts of the screen.
   cfg.vis()       is it on screen right now
   cfg.obstacles() rects it must not land on
   cfg.labels      the three labels it shows as it runs (the last is its real label)
   cfg.onOpen()    extra things to do once it is clicked for real */
function runaway(a,cfg){
  a.innerHTML='<span class="rl">'+esc(a.textContent)+'</span><i class="ck a1"></i><i class="ck a2"></i><i class="ck a3"></i><i class="ck a4"></i>';
  a.classList.add('runaway');
  var lab=a.querySelector('.rl'),CK=$$('.ck',a);
  var dodges=0,held=false,round=0,lastD=0,skip=false,bx=0,by=0,bt=0,holders=[],chasers=[],opened=false;
  var LBL=cfg.labels;
  var TAUNT=['Nope. Too slow.','It is a good film. Promise.','Fine. The interns are on it.'];
  var ROT=[180,-90,90,0],ESC=['!NOOO','!IT ESCAPED','!COME BACK','!WHY'];
  var CH=[['!AFTER IT','!THERE IT GOES'],['!LEFT. NO, RIGHT','!I GOT THIS'],['!CORNER IT','!GET IT','!NOW WE HAVE IT']];
  function say(t,ms){window.__toast&&__toast(t,ms||1500)}
  function vis(){return cfg.vis()&&a.getBoundingClientRect().width>0}
  function corner(j){var r=CK[j].getBoundingClientRect();return{x:r.left-1.625,y:r.top-1.625}}
  function center(){var r=a.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}}
  function move(ez,dur,rot){A.remove(a);A({targets:a,translateX:bx,translateY:by,rotate:rot||0,duration:dur||640,easing:ez||'easeOutElastic(1, .55)'})}
  function freeSpot(){
    var W=innerWidth,H=innerHeight,r=a.getBoundingClientRect(),w=r.width,h=r.height,pad=18,obs=cfg.obstacles().slice();
    obs.push({left:0,top:0,right:W,bottom:72});obs.push({left:W*.25,top:H*.72,right:W*.75,bottom:H});
    var cur=center(),best=null,bd=-1;
    for(var gy=0;gy<9;gy++)for(var gx=0;gx<9;gx++){
      var x=24+gx/8*(W-w-48),y=80+gy/8*(H-h-150),box={left:x-pad,top:y-pad,right:x+w+pad,bottom:y+h+pad};
      if(obs.some(function(o){return box.left<o.right&&box.right>o.left&&box.top<o.bottom&&box.bottom>o.top}))continue;
      var d=Math.hypot(x+w/2-cur.x,y+h/2-cur.y)+Math.random()*60;
      if(d>bd&&d<Math.max(W,H)*.75){bd=d;best={x:x,y:y}}
    }
    return best;
  }
  function jump(){var sp=freeSpot(),r=a.getBoundingClientRect();if(!sp){bx=0;by=0;return}var c0x=r.left+r.width/2-bx,c0y=r.top+r.height/2-by;bx=sp.x+r.width/2-c0x;by=sp.y+r.height/2-c0y}
  function freeIds(n){var ids=[];for(var i=0;i<6&&ids.length<n;i++)if(!AGS[i].ovr||AGS[i].ovr.res)ids.push(i);return ids}
  function chase(n){
    var lines=CH[Math.min(n,CH.length-1)],now=performance.now(),ids=freeIds(n===2?3:2);chasers=ids;
    ids.forEach(function(ai,j){var off=[[-70,34],[80,-30],[-24,64]][j];
      AGS[ai].ovr={res:1,fn:function(){var c=center();return{x:c.x+off[0],y:c.y+off[1]}},sg:{label:lines[j%lines.length],clicks:[],grab:false,shape:null,frame:null},on:vis,u:n===2?0:now+1500}});
  }
  function letGo(list){list.forEach(function(ai){var g=AGS[ai];if(g.ovr&&g.ovr.res)g.ovr=null})}
  function hold(){
    if(opened||!vis())return;held=true;a.classList.add('held');bx=0;by=0;move('easeOutBack',650);
    letGo(chasers);chasers=[];holders=freeIds(4);
    holders.forEach(function(ai,j){AGS[ai].ovr={res:1,lock:1,rot:ROT[j],fn:function(){return corner(j)},sg:{label:j===3?'!NOW. CLICK IT':'!',clicks:[],grab:true,shape:null,frame:null},on:vis}});
    say(round?'They dragged it back. Click it.':'Got it. Click it now.',2200);
    clearTimeout(bt);bt=setTimeout(breakFree,3000);
  }
  function breakFree(){
    if(opened||!held)return;
    if(!vis()){held=false;a.classList.remove('held');letGo(holders);holders=[];return}
    held=false;a.classList.remove('held');round++;var n=performance.now();
    holders.forEach(function(ai,j){var g=AGS[ai],c=corner(j),dx=j%2?1:-1,dy=j>1?1:-1;
      g.ovr={res:1,fn:function(){return{x:c.x+dx*110,y:c.y+dy*80}},sg:{label:ESC[j],clicks:[],grab:false,shape:null,frame:null},on:vis,u:n+900};g.spinT=n;g.spinDeg=-720;g.spinDur=850});
    holders=[];jump();move(null,640,(round%2?-1:1)*10);
    say('It broke free. Typical.');window.__snd&&__snd('boing');
    setTimeout(function(){if(!opened&&vis()){chase(2);setTimeout(function(){if(!opened&&vis())hold()},700)}},700);
  }
  function dodge(){
    var now=performance.now();if(held||opened||dodges>=3||now-lastD<380)return;lastD=now;
    var n=dodges++;lab.textContent=LBL[n];jump();move(null,640,(n%2?-1:1)*(8+n*4));say(TAUNT[n]);window.__snd&&__snd('boing');chase(n);
    if(n===2)setTimeout(hold,900);
  }
  function opening(){
    opened=true;held=false;clearTimeout(bt);a.classList.remove('held');var n=performance.now();
    CFB.push({k:'W',t0:n,n:90,v:.65,o:center});
    var YAY=['!FINALLY','!READ IT ALL','!WORTH IT','!YAY'];
    holders.forEach(function(ai,j){var g=AGS[ai];if(g.ovr){g.ovr.sg={label:YAY[j],clicks:[],grab:false,shape:null,frame:null};g.ovr.lock=0;g.ovr.u=n+1500}g.spinT=n+j*90;g.spinDeg=360;g.spinDur=800});
    holders=[];window.__snd&&__snd('win');window.__ach&&__ach('resume');say('Fair enough. Opening the resume.',1800);
    setTimeout(function(){bx=0;by=0;move('easeOutExpo',600)},900);
    if(cfg.onOpen)cfg.onOpen();
  }
  function blocked(){return !opened&&!held&&vis()}
  function nope(){if(dodges<3)dodge();else say('Wait for it. The interns are on it.')}
  a.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse'&&blocked())dodge()});
  a.addEventListener('pointerdown',function(e){if(blocked()){e.preventDefault();skip=true;nope()}});
  a.addEventListener('click',function(e){if(skip){skip=false;e.preventDefault();return}if(blocked()){e.preventDefault();nope();return}if(held)opening()});
  a.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&blocked()){e.preventDefault();e.stopPropagation();nope()}});
  HOOKS.push(function(){if((held||holders.length||chasers.length)&&!vis()){held=false;clearTimeout(bt);a.classList.remove('held');letGo(holders.concat(chasers));holders=[];chasers=[]}});
  return {reset:function(){opened=false;dodges=0;round=0;lab.textContent=LBL[2];bx=0;by=0;move('easeOutExpo',300)}};
}

/* the first slide's resume button */
(function(){
  if(reduce)return;
  var a=document.querySelector('.rsm a');if(!a)return;
  runaway(a,{
    labels:['[ NOPE ]','[ WATCH THE FILM FIRST ]','[ JUST GIVE ME THE RESUME ]'],
    vis:function(){var b=BEATS[0];return b&&b.vis&&getComputedStyle(a.parentNode).visibility!=='hidden'},
    obstacles:function(){var W=innerWidth,H=innerHeight,o=[];
      BEATS[0].items.forEach(function(it){if(it.el.classList.contains('rsm')||it.el.classList.contains('hero'))return;var q=it.el.getBoundingClientRect();if(q.width)o.push(q)});
      if(W>860)o.push({left:W*.5,top:H*.14,right:W*.95,bottom:H*.84});else o.push({left:0,top:H*.62,right:W,bottom:H*.9});
      return o}
  });
})();

/* ===================== before the film: how do you want this? ===================== */
(function(){
  var ch=document.getElementById('choose');if(!ch)return;
  if(reduce){ch.style.display='none';return}
  var skip=/(?:^#|&)t=\d/.test(location.hash)||/[?&]film\b/.test(location.search);
  var open=false,picker=AGS[5],ra=null;
  function enter(first){
    open=true;CHOOSING=true;document.documentElement.classList.add('choosing');ch.style.display='';ch.style.opacity=1;
    if(lenis&&lenis.stop)lenis.stop();if(ra&&!first)ra.reset();
    picker.ovr={nofl:1,fn:function(){var r=cool.getBoundingClientRect();return{x:r.right+10,y:r.top+r.height*.5-12}},sg:{label:'!PICK THIS ONE',clicks:[],grab:false,shape:null,frame:null},on:function(){return open}};
    A({targets:$$('#choose .k, #choose h1, #choose .opt, #choose .ft'),opacity:[0,1],translateY:[18,0],delay:A.stagger(70,{start:150}),duration:800,easing:'easeOutExpo'});
    setTimeout(function(){try{cool.focus({preventScroll:true})}catch(e){}},400);
  }
  window.__chooser=function(){if(!open)enter(false)};
  var cool=document.getElementById('chCool'),fast=document.getElementById('chFast'),norm=document.getElementById('chNormal');
  if(SITE.resume)norm.href=SITE.resume;else norm.parentNode.style.display='none';
  if(skip)ch.style.display='none';else{HOLD=true;enter(true)}
  function close(then){
    if(!open)return;open=false;picker.ovr=null;
    /* every pick starts the film from the top */
    window.scrollTo(0,0);if(lenis&&lenis.scrollTo)lenis.scrollTo(0,{immediate:true,force:true});T=0;TV=0;lastT=0;introCur=0;
    A({targets:ch,opacity:0,duration:420,easing:'easeInQuad',complete:function(){ch.style.display='none';CHOOSING=false;document.documentElement.classList.remove('choosing');if(lenis&&lenis.start)lenis.start();startFilm();if(then)then()}});
  }
  cool.addEventListener('click',function(){close()});
  fast.addEventListener('click',function(){window.__ach&&__ach('tldr');location.href='30s.html'});
  addEventListener('keydown',function(e){if(!open)return;if(e.key==='Escape'){e.preventDefault();close()}},true);
  ra=runaway(norm,{
    labels:['[ NOPE ]','[ ARE YOU SURE? ]','[ NORMAL RESUME ]'],
    vis:function(){return open},
    obstacles:function(){return $$('#choose .k, #choose h1, #choose .opt > p, #chCool, #chFast, #choose .ft').map(function(e){return e.getBoundingClientRect()})},
    onOpen:function(){setTimeout(function(){window.__toast&&__toast('Opened in a new tab. The cool one is still here.',2400)},1900)}
  });
})();
