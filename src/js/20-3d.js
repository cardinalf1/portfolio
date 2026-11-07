/* ======================== 3D: every illustration is a three.js scene on one shared renderer ======================== */
var GLR=null,VIEWS=[],glRun=false;
function glr(){
  if(GLR!==null)return GLR;
  try{
    var c=document.createElement('canvas');
    GLR=new T3.WebGLRenderer({canvas:c,antialias:true,alpha:true,preserveDrawingBuffer:true});
    GLR.setPixelRatio(1);GLR.setClearColor(0x000000,0);GLR.setScissorTest(true);
  }catch(e){GLR=false}
  return GLR;
}
function solid(geo,edge,fill,dash){
  var g=new T3.Group();
  if(fill!=null){g.add(new T3.Mesh(geo,new T3.MeshBasicMaterial({color:fill,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1})))}
  var e=new T3.EdgesGeometry(geo,25),m=dash?new T3.LineDashedMaterial({color:edge,dashSize:.06,gapSize:.04}):new T3.LineBasicMaterial({color:edge}),l=new T3.LineSegments(e,m);
  if(dash)l.computeLineDistances();g.add(l);g.userData.fill=g.children[0].isMesh?g.children[0]:null;g.userData.edges=l;return g;
}
function circ(r,seg,col,op){
  var p=[];for(var i=0;i<seg;i++){var a=i/seg*Math.PI*2;p.push(new T3.Vector3(Math.cos(a)*r,0,Math.sin(a)*r))}
  var l=new T3.LineLoop(new T3.BufferGeometry().setFromPoints(p),new T3.LineBasicMaterial({color:col,transparent:true,opacity:op==null?1:op}));return l;
}
function cvTex(w,h,fn){
  var c=document.createElement('canvas');c.width=w;c.height=h;var x=c.getContext('2d'),t=new T3.CanvasTexture(c);
  if(T3.SRGBColorSpace)t.colorSpace=T3.SRGBColorSpace;
  t.anisotropy=4;
  var o={c:c,x:x,t:t,draw:function(){fn(x,w,h);t.needsUpdate=true}};o.draw();return o;
}
var MONO='"JetBrains Mono",ui-monospace,Menlo,Consolas,monospace',SANS='Inter,system-ui,Segoe UI,Roboto,Arial,sans-serif';
function label(txt,sz,col){
  var tx=cvTex(512,96,function(x,w,h){x.clearRect(0,0,w,h);x.font='500 36px '+MONO;x.fillStyle=col||'#8B8B93';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,w/2,h/2)});
  var sp=new T3.Sprite(new T3.SpriteMaterial({map:tx.t,transparent:true,depthTest:false}));sp.scale.set(sz*5.3,sz,1);sp.renderOrder=10;sp.userData.tex=tx;return sp;
}
function plane(w,h,tx,tr){var m=new T3.Mesh(new T3.PlaneGeometry(w,h),new T3.MeshBasicMaterial({map:tx.t,transparent:tr!==false}));return m}
function grid(y,n,div){var g=new T3.GridHelper(n||6,div||24,0x27272a,0x27272a);g.position.y=y;return g}
function wrap(x,text,maxW,lh,x0,y0){var words=text.split(' '),line='',y=y0;for(var i=0;i<words.length;i++){var t=line?line+' '+words[i]:words[i];if(x.measureText(t).width>maxW&&line){x.fillText(line,x0,y);line=words[i];y+=lh}else line=t}if(line)x.fillText(line,x0,y)}
function eio(a){return a}

function makeView(box,setup,o){
  o=o||{};var R=glr();if(!R||!T3||!box)return null;
  var cv=document.createElement('canvas');cv.className='gl3';box.appendChild(cv);
  var cx=cv.getContext('2d'),scene=new T3.Scene(),cam=new T3.PerspectiveCamera(o.fov||30,1,.1,100),root=new T3.Group();scene.add(root);
  var v={scrub:!!o.scrub,sp:null,prog:null,pp:0,box:box,cv:cv,scene:scene,cam:cam,root:root,live:false,t:0,last:0,dy:0,dp:0,W:0,H:0,tick:null,anims:[]};
  function fit(){if(v.base&&!v.noFit)cam.position.copy(v.base).multiplyScalar(Math.max(1,(v.ref||1.55)/cam.aspect))}
  function size(){
    var w=box.clientWidth,h=box.clientHeight,d=Math.min(2,devicePixelRatio||1);if(!w||!h)return;
    cv.width=Math.round(w*d);cv.height=Math.round(h*d);cv.style.width=w+'px';cv.style.height=h+'px';v.W=cv.width;v.H=cv.height;cam.aspect=w/h;cam.updateProjectionMatrix();fit();
  }
  v.render=function(){
    var W=v.W,H=v.H;if(!W)return;var rc=R.domElement;
    if(rc.width<W||rc.height<H)R.setSize(Math.max(rc.width,W),Math.max(rc.height,H),false);
    R.setViewport(0,0,W,H);R.setScissor(0,0,W,H);R.clear();R.render(scene,cam);
    cx.clearRect(0,0,W,H);cx.drawImage(rc,0,rc.height-H,W,H,0,0,W,H);
  };
  if('ResizeObserver' in window)new ResizeObserver(size).observe(box);size();
  if(!o.noDrag){
    var dr=false,lx=0,ly=0;
    cv.addEventListener('pointerdown',function(e){dr=true;lx=e.clientX;ly=e.clientY;try{cv.setPointerCapture(e.pointerId)}catch(_){}cv.style.cursor='grabbing'});
    cv.addEventListener('pointermove',function(e){if(!dr)return;v.dy+=(e.clientX-lx)*.008;v.dp=clamp(v.dp+(e.clientY-ly)*.004,-.5,.6);lx=e.clientX;ly=e.clientY});
    addEventListener('pointerup',function(){dr=false;cv.style.cursor='grab'});
  }else cv.style.pointerEvents='none';
  setup(v);v.ref=o.ref;v.base=cam.position.clone().multiplyScalar(o.zoom||1);v.noFit=o.fit===false;fit();VIEWS.push(v);return v;
}
function tlLoop(v,reset){var tl=A.timeline(v.scrub?{autoplay:false}:{autoplay:false,loop:true,loopBegin:reset});v.anims.push(tl);if(reset)reset();return tl}
function colTargets(arr){return arr.map(function(m){return m.color})}
function bar(w,d,col){var g=new T3.BoxGeometry(w,1,d);g.translate(0,.5,0);return new T3.Mesh(g,new T3.MeshBasicMaterial({color:col}))}

/* ---- Blackbook: a test screen, with answer cards that fly in and one gets picked ---- */
function sceneBB(v){
  var sc=v.root,q='If 3x + 7 = 22, what is the value of x?',S={typed:0,time:1477};
  v.cam.position.set(0,.6,5.6);v.cam.lookAt(-.1,.0,0);
  var slab=solid(new T3.BoxGeometry(2.7,1.7,.08),0xffffff,0x050506);slab.position.set(-.7,.35,-.2);sc.add(slab);
  var scr=cvTex(1024,640,function(x,w,h){
    x.fillStyle='#0A0A0C';x.fillRect(0,0,w,h);x.textBaseline='alphabetic';
    x.font='500 30px '+MONO;x.fillStyle='#8B8B93';x.textAlign='left';x.fillText('MODULE 1, MATH',44,70);
    x.textAlign='center';x.fillStyle='#fff';x.font='700 52px '+MONO;x.fillText(mmss(S.time),w/2,74);
    x.textAlign='right';x.fillStyle='#8B8B93';x.font='500 30px '+MONO;x.fillText('Q 7 OF 22',w-44,70);
    x.fillStyle='#3F3F46';x.fillRect(44,104,w-88,2);
    x.textAlign='left';x.fillStyle='#fff';x.font='600 58px '+SANS;wrap(x,q.slice(0,S.typed),w-110,78,48,210);
    x.fillStyle='#27272A';x.fillRect(48,420,640,16);x.fillRect(48,470,430,16);
  });
  var sp=plane(2.62,1.62,scr);sp.position.set(-.7,.35,-.155);sc.add(sp);
  var vals=['A','B','C','D'],nums=['3','7','5','15'],cards=[];
  vals.forEach(function(L,i){
    var g=new T3.Group();g.st=0;
    var b=solid(new T3.BoxGeometry(1.1,.27,.05),0xffffff,0x0a0a0c);g.add(b);
    var tx=cvTex(512,128,function(x,w,h){
      x.clearRect(0,0,w,h);var on=g.st===2,dead=g.st===1;
      x.globalAlpha=dead?.4:1;x.strokeStyle=on?'#000':'#8B8B93';x.lineWidth=3;x.strokeRect(22,32,64,64);
      x.fillStyle=on?'#000':'#fff';x.font='500 40px '+MONO;x.textAlign='center';x.textBaseline='middle';x.fillText(L,54,66);
      x.textAlign='left';x.font='500 52px '+MONO;x.fillText(nums[i],118,68);
      if(dead){x.fillRect(108,66,150,4)}
    });
    var p=plane(1.06,.25,tx);p.position.z=.028;g.add(p);g.draw=function(){tx.draw();b.userData.fill.material.color.set(g.st===2?0xffffff:0x0a0a0c)};
    g.position.set(1.45,.85-i*.36,.55);sc.add(g);cards.push(g);
  });
  var bars=[];
  for(var i=0;i<22;i++){var b=bar(.07,.07,0x1a1a1e);b.geometry.scale(1,.07,1);b.position.set(-2.0+i*.128,-.72,0);sc.add(b);bars.push(b)}
  var base=grid(-.8,7,28);sc.add(base);
  var CF={t:0},cfp=[];
  for(var ci=0;ci<80;ci++){var cm=new T3.Mesh(new T3.BoxGeometry(.06,.012,.035),new T3.MeshBasicMaterial({color:ci%3?0xffffff:0x8b8b93}));cm.visible=false;sc.add(cm);cfp.push({m:cm,vx:(Math.random()*2-1)*2.2,vy:1.6+Math.random()*2.4,vz:(Math.random()*2-1)*1.2+.4,sp:(Math.random()*2-1)*14,sq:(Math.random()*2-1)*9})}
  function cfu(){var t=CF.t,vis=t>.001&&t<.999,fade=1-clamp((t-.72)/.28,0,1);cfp.forEach(function(c){c.m.visible=vis;if(!vis)return;c.m.position.set(1.45+c.vx*t*1.5,.13+c.vy*t*1.5-3.2*t*t,1.0+c.vz*t*1.5);c.m.rotation.set(c.sp*t,c.sq*t,c.sp*t*.6);c.m.scale.setScalar(fade)})}
  function reset(){
    S.typed=0;S.time=1477;
    cards.forEach(function(c,i){c.position.set(1.45,.85-i*.36,4.6);c.rotation.set(0,1.3,0);c.st=0;c.draw()});
    bars.forEach(function(b){b.scale.y=1;b.material.color.setRGB(.1,.1,.12)});scr.draw();
  }
  var tl=tlLoop(v,reset);
  tl.add({targets:cards.map(function(c){return c.position}),z:[4.6,.55],delay:A.stagger(130),duration:1100,easing:'easeOutExpo'})
    .add({targets:cards.map(function(c){return c.rotation}),y:[1.3,0],delay:A.stagger(130),duration:1100,easing:'easeOutExpo'},0)
    .add({targets:S,typed:[0,q.length],round:1,duration:1500,easing:'linear',update:function(){scr.draw()}},'-=500')
    .add({targets:bars.slice(0,7).map(function(b){return b.scale}),y:[1,5],delay:A.stagger(90),duration:420,easing:'easeOutBack'},'+=100')
    .add({targets:colTargets(bars.slice(0,7).map(function(b){return b.material})),r:[.1,.55],g:[.1,.55],b:[.12,.58],delay:A.stagger(90),duration:300,easing:'linear'},'-=900')
    .add({targets:S,time:[1477,1468],round:1,duration:2600,easing:'linear',update:function(){scr.draw()}},'-=700')
    .add({targets:cards[2].position,z:[.55,1.0],duration:500,easing:'easeOutBack',begin:function(){cards[2].st=2;cards[2].draw()}},'-=1180')
    .add({targets:bars[6].material.color,r:[.55,1],g:[.55,1],b:[.58,1],duration:300,easing:'linear'},'-=300')
    .add({targets:cards[2].rotation,y:[0,Math.PI*2],duration:900,easing:'easeInOutCubic'},'-=800')
    .add({targets:CF,t:[0,1],duration:1800,easing:'linear'},'-=300')
    .add({targets:{x:0},x:1,duration:1200})
    .add({targets:cards.map(function(c){return c.rotation}),y:[0,-1.3],delay:A.stagger(90),duration:600,easing:'easeInExpo'})
    .add({targets:bars.slice(0,7).map(function(b){return b.scale}),y:[5,1],duration:500,easing:'easeInQuad'},'-=500');
  v.post=function(){
    var n1=cards[1].rotation.x>.6?1:0,n2=(S.typed>=q.length&&cards[2].position.z>.75)?2:0;
    if(cards[1].st!==n1){cards[1].st=n1;cards[1].draw()}
    if(cards[2].st!==n2){cards[2].st=n2;cards[2].draw()}
    cfu();
  };
  v.api={cards:cards,bars:bars,slab:slab};
  v.tick=function(t){sc.rotation.y=Math.sin(t*.35)*.42+v.dy;sc.rotation.x=.1+v.dp};
}

/* ---- Takt: a keycap, a live waveform in depth, a text panel that types ---- */
function sceneTK(v){
  var sc=v.root,txt='Meet me at ten tomorrow.',S={amp:.1,n:0,press:0};
  v.cam.position.set(.2,1.7,5.6);v.cam.lookAt(.1,.0,0);
  var plate=solid(new T3.BoxGeometry(1.25,.1,1.25),0x8b8b93,0x050506);plate.position.set(-1.8,-.3,.3);sc.add(plate);
  var cap=solid(new T3.BoxGeometry(1,.36,1),0xffffff,0x050506);cap.position.set(-1.8,.05,.3);sc.add(cap);
  var lg=cvTex(256,256,function(x,w,h){x.clearRect(0,0,w,h);x.fillStyle=S.press>.5?'#000':'#fff';x.font='700 54px '+MONO;x.textAlign='center';x.textBaseline='middle';x.fillText('HOLD',w/2,h/2)});
  var lp=plane(.8,.8,lg);lp.rotation.x=-Math.PI/2;lp.position.set(0,.185,0);cap.add(lp);
  var ws=[];for(var i=0;i<30;i++){var b=bar(.06,.06,0xffffff);b.position.set(-.85+i*.082,-.25,.3);sc.add(b);ws.push(b)}
  var slab=solid(new T3.BoxGeometry(2.3,1.1,.07),0xffffff,0x050506);slab.position.set(1.7,.35,-.5);slab.rotation.y=-.45;sc.add(slab);
  var pn=cvTex(1024,480,function(x,w,h){
    x.fillStyle='#0A0A0C';x.fillRect(0,0,w,h);x.fillStyle='#8B8B93';x.font='500 28px '+MONO;x.textAlign='left';x.fillText('ANY APP  /  TEXT FIELD',40,60);
    x.fillStyle='#27272A';x.fillRect(40,90,w-80,2);
    x.fillStyle='#fff';x.font='500 66px '+MONO;var s=txt.slice(0,S.n);x.fillText(s,40,230);
    if(Math.floor(performance.now()/450)%2===0){var m=x.measureText(s).width;x.fillRect(46+m,170,28,70)}
    if(S.n>=txt.length){x.fillStyle='#8B8B93';x.font='500 30px '+MONO;x.fillText('0.6 TO 1.1 S, KEY RELEASE TO TEXT',40,400)}
  });
  var pp=plane(2.22,1.04,pn);pp.position.z=.04;slab.add(pp);
  sc.add(grid(-.36,7,28));
  function reset(){S.amp=.1;S.n=0;S.press=0;cap.position.y=.05;cap.userData.fill.material.color.set(0x050506);lg.draw();pn.draw()}
  var tl=tlLoop(v,reset);
  tl.add({targets:cap.position,y:[.05,-.04],duration:150,easing:'easeOutQuad',begin:function(){S.press=1;lg.draw()}})
    .add({targets:cap.userData.fill.material.color,r:[.02,1],g:[.02,1],b:[.02,1],duration:150,easing:'linear'},'-=150')
    .add({targets:S,amp:[.1,1],duration:500,easing:'easeOutCubic'},'-=60')
    .add({targets:{x:0},x:1,duration:1900})
    .add({targets:cap.position,y:[-.04,.05],duration:200,easing:'easeOutBack',begin:function(){S.press=0;lg.draw()}})
    .add({targets:cap.userData.fill.material.color,r:[1,.02],g:[1,.02],b:[1,.02],duration:200,easing:'linear'},'-=200')
    .add({targets:S,amp:[1,.1],duration:350,easing:'easeInQuad'},'-=200')
    .add({targets:S,n:[0,txt.length],round:1,duration:txt.length*42,easing:'linear'})
    .add({targets:{x:0},x:1,duration:2500})
    .add({targets:S,n:[txt.length,0],round:1,duration:500,easing:'easeInQuad'});
  v.post=function(){var pr=cap.position.y<0?1:0;if(S.press!==pr){S.press=pr;lg.draw()}};
  v.api={cap:cap,slab:slab,ws:ws};
  v.tick=function(t){
    for(var i=0;i<ws.length;i++){var n=Math.abs(Math.sin(t*5+i*.5)*Math.sin(t*2.3+i*.23));ws[i].scale.y=.04+S.amp*n*1.3}
    pn.draw();sc.rotation.y=Math.sin(t*.4)*.3+v.dy;sc.rotation.x=.06+v.dp;
  };
}

/* ---- relay: an email wakes a powered-off PC, unlocks its disk, streams the desktop, sends a report ---- */
function sceneRL(v){
  var sc=v.root;v.cam.position.set(0,1.9,7);v.cam.lookAt(0,.1,0);
  var S={fan:0,type:0},fans=[];
  var glow=[],pc=new T3.Group();pc.position.set(-2.2,.45,0);pc.rotation.y=.22;sc.add(pc);
  function pbox(w,h,d,x,y,z,edge,fill){var o=solid(new T3.BoxGeometry(w,h,d),edge,fill);o.position.set(x,y,z);pc.add(o);return o}
  function pline(pts,col,isGlow){var m=new T3.LineBasicMaterial({color:col}),l=new T3.Line(new T3.BufferGeometry().setFromPoints(pts.map(function(q){return new T3.Vector3(q[0],q[1],q[2])})),m);pc.add(l);if(isGlow)glow.push(m);return l}
  function pfan(x,y,z,r,n,col){
    var rg=circ(r,48,col);rg.rotation.x=Math.PI/2;rg.position.set(x,y,z);pc.add(rg);
    var hub=solid(new T3.CylinderGeometry(r*.2,r*.2,.012,20),col,0x050506);hub.rotation.x=Math.PI/2;hub.position.set(x,y,z+.004);pc.add(hub);
    var sp=new T3.Group();sp.position.set(x,y,z+.012);
    for(var k=0;k<n;k++){var l=new T3.Line(new T3.BufferGeometry().setFromPoints([new T3.Vector3(r*.22,0,0),new T3.Vector3(r*.6,r*.2,0),new T3.Vector3(r*.96,r*.06,0)]),new T3.LineBasicMaterial({color:col}));l.rotation.z=k*Math.PI*2/n;sp.add(l)}
    pc.add(sp);fans.push(sp);
  }
  /* chassis: back plate and four frame bars, open to the glass side */
  pbox(.98,1.5,.02,0,0,-.26,0x3f3f46,0x050506);
  pbox(1.0,.05,.56,0,.725,0,0xffffff,0x0a0a0c);pbox(1.0,.05,.56,0,-.725,0,0xffffff,0x0a0a0c);
  pbox(.05,1.5,.56,-.475,0,0,0xffffff,0x0a0a0c);pbox(.05,1.5,.56,.475,0,0,0xffffff,0x0a0a0c);
  /* glass: bezel and two reflection streaks */
  pline([[-.45,-.7,.28],[.45,-.7,.28],[.45,.7,.28],[-.45,.7,.28],[-.45,-.7,.28]],0x8b8b93);
  pline([[-.34,.7,.28],[.06,-.7,.28]],0x3f3f46);pline([[-.2,.7,.28],[.2,-.7,.28]],0x27272a);
  /* intake fans on the left, three stacked */
  [.5,.2,-.1].forEach(function(y){pbox(.27,.27,.05,-.31,y,-.2,0x3f3f46,0x0a0a0c);pfan(-.31,y,-.17,.115,9,0xd4d4d8)});
  /* motherboard, cooler block, RAM, radiator, tubes */
  pbox(.5,.74,.02,.15,.28,-.22,0x3f3f46,0x0a0a0c);
  pbox(.16,.16,.06,.05,.44,-.17,0xffffff,0x050506);var cr=circ(.055,32,0xffffff);cr.rotation.x=Math.PI/2;cr.position.set(.05,.44,-.135);pc.add(cr);glow.push(cr.material);
  for(var m=0;m<4;m++){pbox(.026,.3,.045,.25+m*.045,.38,-.19,0xd4d4d8,0x050506);pline([[.25+m*.045,.24,-.165],[.25+m*.045,.52,-.165]],0xffffff,true)}
  pbox(.62,.09,.07,.14,.64,-.1,0x8b8b93,0x0a0a0c);
  pline([[.0,.52,-.15],[-.05,.58,-.12],[-.05,.6,-.1]],0x8b8b93);pline([[.1,.52,-.15],[.12,.58,-.12],[.12,.6,-.1]],0x8b8b93);
  pfan(.38,.46,-.19,.075,7,0x8b8b93);
  /* vertical graphics card with three fans and a light strip */
  pbox(.58,.3,.075,.16,-.3,-.04,0xffffff,0x050506);
  [-.06,.12,.3].forEach(function(x){pfan(x+.04,-.3,.0,.07,9,0xffffff)});
  pline([[-.12,-.14,.005],[.44,-.14,.005]],0xffffff,true);
  /* power supply shroud with vents */
  pbox(.9,.2,.5,0,-.6,-.01,0x8b8b93,0x0a0a0c);
  for(var vi=0;vi<4;vi++)pline([[.12,-.66+vi*.04,.246],[.4,-.66+vi*.04,.246]],0x3f3f46);
  pline([[.05,-.5,-.2],[.05,-.38,-.2],[-.04,-.3,-.2]],0xd4d4d8);pline([[.3,-.5,-.2],[.3,-.2,-.2],[.4,-.1,-.2]],0xd4d4d8);
  /* power ring, LED, feet */
  var pr=circ(.035,24,0xffffff);pr.rotation.x=Math.PI/2;pr.position.set(.38,.745,.2);pc.add(pr);
  var led=solid(new T3.BoxGeometry(.07,.07,.04),0x8b8b93,0x1a1a1e);led.position.set(.34,-.6,.27);pc.add(led);
  pbox(.14,.05,.4,-.34,-.775,0,0x8b8b93,0x0a0a0c);pbox(.14,.05,.4,.34,-.775,0,0x8b8b93,0x0a0a0c);
  var lock=solid(new T3.BoxGeometry(.26,.2,.1),0xffffff,0x050506);lock.position.set(-.22,-.6,.3);pc.add(lock);
  var sh=new T3.Group();sh.position.set(.0,.11,0);var arc=[];for(var i=0;i<=16;i++){var a=Math.PI*i/16;arc.push(new T3.Vector3(Math.cos(a)*-.08+.08,Math.sin(a)*.1,0))}
  sh.add(new T3.Line(new T3.BufferGeometry().setFromPoints(arc),new T3.LineBasicMaterial({color:0xffffff})));sh.position.set(-.08,.11,0);lock.add(sh);
  var esp=solid(new T3.BoxGeometry(.7,.06,.42),0xffffff,0x050506);esp.position.set(-.5,-.38,1.2);sc.add(esp);
  var chip=solid(new T3.BoxGeometry(.22,.05,.22),0x8b8b93,0x0a0a0c);chip.position.set(.1,.055,0);esp.add(chip);
  var eled=solid(new T3.BoxGeometry(.05,.03,.05),0x8b8b93,0x1a1a1e);eled.position.set(-.25,.045,.1);esp.add(eled);
  var rings=[0,1,2].map(function(){var r=circ(.4,64,0xffffff,0);r.position.set(-.5,-.34,1.2);sc.add(r);return r});
  var win=solid(new T3.BoxGeometry(1.7,1.1,.06),0xffffff,0x050506);win.position.set(2.3,.55,-.2);win.rotation.y=-.4;sc.add(win);
  var wtx=cvTex(768,500,function(x,w,h){
    x.fillStyle='#0A0A0C';x.fillRect(0,0,w,h);var on=S.type>.01;x.fillStyle='#27272A';x.fillRect(0,0,w,46);
    x.fillStyle='#8B8B93';x.font='500 24px '+MONO;x.textAlign='left';x.fillText('ANY BROWSER  /  YOUR DESKTOP',20,31);
    x.strokeStyle=on?'#fff':'#3F3F46';x.lineWidth=2;x.strokeRect(30,80,w-60,h-110);
    x.fillStyle=on?'#D4D4D8':'#27272A';for(var i=0;i<6;i++){x.fillRect(60,115+i*52,(w-180)*(i%2?.5:.82)*Math.min(1,S.type*1.2),18)}
    if(!on){x.fillStyle='#3F3F46';x.font='500 30px '+MONO;x.textAlign='center';x.fillText('NO SIGNAL',w/2,h/2+10)}
  });
  var wp=plane(1.62,1.05,wtx);wp.position.z=.04;win.add(wp);
  var env=function(){var g=new T3.Group();g.add(solid(new T3.BoxGeometry(.46,.03,.3),0xffffff,0x0a0a0c));var f=new T3.Line(new T3.BufferGeometry().setFromPoints([new T3.Vector3(-.23,.02,-.15),new T3.Vector3(0,.02,.02),new T3.Vector3(.23,.02,-.15)]),new T3.LineBasicMaterial({color:0xffffff}));g.add(f);g.visible=false;sc.add(g);return g};
  var e1=env(),e2=env();
  var cIn=new T3.QuadraticBezierCurve3(new T3.Vector3(3.8,2.3,1.5),new T3.Vector3(1.6,2.4,1.9),new T3.Vector3(-.5,-.2,1.2));
  var cOut=new T3.QuadraticBezierCurve3(new T3.Vector3(-1.9,.6,.5),new T3.Vector3(.2,2.6,.6),new T3.Vector3(3.9,2.2,.7));
  var cS=new T3.LineCurve3(new T3.Vector3(-1.7,.35,.2),new T3.Vector3(1.7,.5,-.1));
  var sl=new T3.Line(new T3.BufferGeometry().setFromPoints(cS.getPoints(40)),new T3.LineDashedMaterial({color:0xffffff,dashSize:.08,gapSize:.06}));sl.computeLineDistances();sl.geometry.setDrawRange(0,0);sc.add(sl);
  var spk=[0,1,2,3].map(function(){var m=solid(new T3.BoxGeometry(.07,.07,.07),0xffffff,0xffffff);m.visible=false;sc.add(m);return {m:m,o:{t:0}}});
  var L1=label('EMAIL',.2,'#D4D4D8'),L2=label('ESP32',.2,'#D4D4D8'),L3=label('YOUR PC',.2,'#D4D4D8'),L4=label('BROWSER',.2,'#D4D4D8'),L5=label('DISK UNLOCKED',.17,'#FFFFFF');
  L2.position.set(-.5,.05,1.2);L3.position.set(-2.2,1.5,0);L4.position.set(2.3,1.3,-.2);L5.position.set(-2.2,-.7,.6);L1.position.set(3.0,2.0,1.4);
  [L1,L2,L3,L4,L5].forEach(function(l){l.material.opacity=0;sc.add(l)});
  sc.add(grid(-.42,10,30));
  var CMDS=['render my scene, mail me the video','back up my files to the drive','start my game server'],MC={v:0};
  var mtx=cvTex(768,300,function(x,w,h){
    x.fillStyle='#0A0A0C';x.fillRect(0,0,w,h);x.strokeStyle='#3F3F46';x.lineWidth=3;x.strokeRect(2,2,w-4,h-4);
    x.fillStyle='#27272A';x.fillRect(0,0,w,50);x.fillStyle='#8B8B93';x.font='500 24px '+MONO;x.textAlign='left';x.textBaseline='alphabetic';x.fillText('NEW MAIL   TO: MY PC',22,34);
    var i=MC.v>=3?2:Math.min(2,Math.floor(MC.v)),fr=MC.v>=3?1:MC.v-Math.floor(MC.v),cmd=CMDS[i],n=Math.floor(Math.min(1,fr*1.7)*cmd.length);
    x.fillStyle='#fff';x.font='700 30px '+MONO;x.fillText('> '+cmd.slice(0,n)+(n<cmd.length?'_':''),30,140);
    x.fillStyle='#3F3F46';x.fillRect(30,196,w-60,6);x.fillStyle='#fff';x.fillRect(30,196,(w-60)*Math.max(0,Math.min(1,(fr-.55)/.45)),6);
    x.fillStyle=fr>.55?'#fff':'#8B8B93';x.font='500 24px '+MONO;x.fillText(fr>.99?'[ DONE ]':fr>.55?'[ RUNNING ON YOUR PC ]':'[ WRITING ]',30,250);
  });
  var mail=plane(1.9,.74,mtx);mail.position.set(.45,1.75,.3);mail.rotation.y=-.12;mail.material.opacity=0;sc.add(mail);
  var cs={e:{t:0},r:{t:0},s:{n:0}};
  function reset(){MC.v=0;mail.material.opacity=0;S.fan=0;S.type=0;e1.visible=e2.visible=false;cs.e.t=0;cs.r.t=0;cs.s.n=0;sl.geometry.setDrawRange(0,0);
    led.userData.fill.material.color.set(0x1a1a1e);eled.userData.fill.material.color.set(0x1a1a1e);lock.userData.edges.material.color.set(0xffffff);sh.rotation.z=0;
    rings.forEach(function(r){r.material.opacity=0;r.scale.set(1,1,1)});[L1,L2,L3,L4,L5].forEach(function(l){l.material.opacity=0});wtx.draw()}
  var tl=tlLoop(v,reset);
  tl.add({targets:L1.material,opacity:[0,1],duration:300,easing:'linear'})
    .add({targets:cs.e,t:[0,1],duration:1500,easing:'easeInOutQuad',begin:function(){e1.visible=true},update:function(){e1.position.copy(cIn.getPoint(cs.e.t));e1.rotation.y=cs.e.t*5;e1.scale.setScalar(1-.5*cs.e.t)},complete:function(){e1.visible=false}},'-=100')
    .add({targets:[L2.material],opacity:[0,1],duration:300,easing:'linear'},'-=300')
    .add({targets:eled.userData.fill.material.color,r:[.1,1],g:[.1,1],b:[.1,1],duration:150,easing:'linear'},'-=100')
    .add({targets:rings.map(function(r){return r.scale}),x:[1,5],z:[1,5],delay:A.stagger(260),duration:1300,easing:'easeOutCubic'},'-=100')
    .add({targets:rings.map(function(r){return r.material}),opacity:[.9,0],delay:A.stagger(260),duration:1300,easing:'easeOutCubic'},'-=1300')
    .add({targets:L3.material,opacity:[0,1],duration:300,easing:'linear'},'-=700')
    .add({targets:led.userData.fill.material.color,r:[.1,1],g:[.1,1],b:[.1,1],duration:200,easing:'linear'},'-=200')
    .add({targets:S,fan:[0,16],duration:2400,easing:'easeInOutSine'},'-=200')
    .add({targets:MC,v:[0,3],duration:3600,easing:'linear'},'-=2400')
    .add({targets:sh.rotation,z:[0,-1.2],duration:600,easing:'easeOutBack'},'-=1200')
    .add({targets:L5.material,opacity:[0,1],duration:300,easing:'linear'},'-=300')
    .add({targets:L4.material,opacity:[0,1],duration:300,easing:'linear'},'-=100')
    .add({targets:cs.s,n:[0,41],round:1,duration:800,easing:'easeInOutSine',update:function(){sl.geometry.setDrawRange(0,Math.round(cs.s.n))}},'-=100')
    .add({targets:S,type:[0,1],duration:700,easing:'easeOutQuad',update:function(){wtx.draw()}},'-=100')
    .add({targets:spk.map(function(p){return p.o}),t:[0,1],delay:A.stagger(260),duration:1000,easing:'linear',loop:2,begin:function(){spk.forEach(function(p){p.m.visible=true})},update:function(){spk.forEach(function(p){p.m.position.copy(cS.getPoint(p.o.t%1))})}},'-=300')
    .add({targets:cs.r,t:[0,1],duration:1600,easing:'easeInOutQuad',begin:function(){e2.visible=true;spk.forEach(function(p){p.m.visible=false})},update:function(){e2.position.copy(cOut.getPoint(cs.r.t));e2.rotation.y=-cs.r.t*4},complete:function(){e2.visible=false}},'+=1600')
    .add({targets:{x:0},x:1,duration:900});
  v.post=function(){
    mail.material.opacity=Math.max(0,Math.min(1,MC.v*6))*Math.max(0,Math.min(1,(3.15-MC.v)*6));if(mail.material.opacity>0)mtx.draw();
    e1.visible=cs.e.t>.001&&cs.e.t<.999;e2.visible=cs.r.t>.001&&cs.r.t<.999;
    spk.forEach(function(p){p.m.visible=cs.s.n>=40&&cs.r.t<.001&&p.o.t>.001&&p.o.t<.999});
  };
  v.api={e1:e1,e2:e2,cs:cs,lock:lock,esp:esp,win:win,pc:pc};
  v.tick=function(t,dt){fans.forEach(function(f){f.rotation.z+=S.fan*dt*.9});var gl=.2+.8*Math.min(1,S.fan/14);glow.forEach(function(m){m.color.setScalar(gl)});sc.rotation.y=Math.sin(t*.3)*.28+v.dy;sc.rotation.x=.04+v.dp};
}

/* ---- Cardinal website: the page as a carousel of panels ---- */
function sceneCS(v){
  var sc=v.root;v.cam.position.set(0,.7,6.6);v.cam.lookAt(0,0,0);
  var names=['HERO','SYSTEMS','TEAM','PARTNERS','PROSPECTUS'],car=new T3.Group();sc.add(car);var panels=[];
  function art(x,w,h,k){
    x.fillStyle='#050506';x.fillRect(0,0,w,h);x.strokeStyle='#8B8B93';x.lineWidth=3;
    [[30,30,1,1],[w-30,30,-1,1],[30,h-30,1,-1],[w-30,h-30,-1,-1]].forEach(function(c){x.beginPath();x.moveTo(c[0],c[1]+c[3]*34);x.lineTo(c[0],c[1]);x.lineTo(c[0]+c[2]*34,c[1]);x.stroke()});
    x.fillStyle='#8B8B93';x.font='500 26px '+MONO;x.textAlign='left';x.fillText('CARDINAL // '+names[k],64,84);
    x.textBaseline='alphabetic';
    if(k===0){x.fillStyle='#8B8B93';x.font='800 98px '+SANS;x.fillText('Built to',64,270);x.fillStyle='#fff';x.fillText('compete.',64,372);x.strokeStyle='#fff';x.lineWidth=2;x.strokeRect(64,420,230,56);x.fillStyle='#fff';x.font='500 24px '+MONO;x.fillText('[ OUR_CARS ]',84,456)}
    if(k===1){x.strokeStyle='#fff';x.lineWidth=3;for(var i=0;i<3;i++){var X=90+i*250;x.strokeRect(X,170,200,120);x.beginPath();x.moveTo(X,330+i*8);x.lineTo(X+200,330+i*8);x.stroke()}x.fillStyle='#fff';x.font='700 56px '+SANS;x.fillText('Switch the car.',64,430)}
    if(k===2){x.strokeStyle='#8B8B93';x.lineWidth=2;for(var r=0;r<2;r++)for(var c=0;c<4;c++){x.strokeRect(70+c*180,150+r*150,130,120)}x.fillStyle='#fff';x.font='700 56px '+SANS;x.fillText('The people.',64,470)}
    if(k===3){x.strokeStyle='#8B8B93';x.lineWidth=2;for(var r=0;r<2;r++)for(var c=0;c<3;c++){x.strokeRect(70+c*240,150+r*130,200,90)}x.fillStyle='#fff';x.font='700 56px '+SANS;x.fillText('Our partners.',64,450)}
    if(k===4){x.strokeStyle='#fff';x.lineWidth=2;x.strokeRect(70,140,330,350);x.fillStyle='#27272A';for(var i=0;i<9;i++)x.fillRect(100,175+i*34,i%3?250:170,10);x.fillStyle='#fff';x.font='700 56px '+SANS;x.fillText('Sponsor us.',440,330)}
  }
  names.forEach(function(n,k){
    var g=new T3.Group(),slab=solid(new T3.BoxGeometry(2.4,1.5,.06),0xffffff,0x050506);g.add(slab);
    var tx=cvTex(1024,640,function(x,w,h){art(x,w,h,k)}),p=plane(2.34,1.46,tx);p.position.z=.035;g.add(p);
    var a=k/5*Math.PI*2;g.position.set(Math.sin(a)*2.7,0,Math.cos(a)*2.7);g.rotation.y=a;car.add(g);panels.push(g);
  });
  car.rotation.y=0;sc.add(grid(-1,9,36));
  var st={a:0},tl=A.timeline({autoplay:false,loop:true});v.anims.push(tl);
  for(var i=0;i<5;i++)tl.add({targets:st,a:[i*72,(i+1)*72],duration:1700,easing:'easeInOutQuart',delay:i?600:900});
  v.api={panels:panels,car:car};
  v.tick=function(t){car.rotation.y=-st.a*Math.PI/180+v.dy;sc.rotation.x=.14+v.dp;sc.position.y=Math.sin(t*.8)*.04};
}

/* ---- Overture: a 3D Gantt, planned against actual, with a day marker sweeping across ---- */
function sceneOV(v){
  var sc=v.root;v.cam.position.set(1.4,3.8,6.2);v.cam.lookAt(.3,0,0);
  var rows=[[0,4,3.2],[1,3.4,3],[2,3.2,2.4],[3.5,3,2.9],[5,2.6,1.6],[6.5,2.2,2.2]],pl=[],ac=[];
  rows.forEach(function(r,i){
    var z=-1.3+i*.52,g=new T3.BoxGeometry(r[1],.1,.34);g.translate(r[1]/2,0,0);
    var p=new T3.LineSegments(new T3.EdgesGeometry(g),new T3.LineBasicMaterial({color:0x8b8b93}));p.position.set(-3+r[0]*.5,.05,z);sc.add(p);pl.push(p);
    var g2=new T3.BoxGeometry(r[2],.16,.22);g2.translate(r[2]/2,0,0);
    var a=solid(g2,0xffffff,0xffffff);a.position.set(-3+r[0]*.5,.08,z);a.scale.x=.001;sc.add(a);ac.push(a);
  });
  var tw=[];for(var i=0;i<4;i++){var b=bar(.34,.34,0x0f0f12);b.position.set(4.2+i*.5,-.02,-1.2+i*.2);b.scale.y=.001;var ed=new T3.LineSegments(new T3.EdgesGeometry(new T3.BoxGeometry(.34,1.5,.34)),new T3.LineBasicMaterial({color:0x3f3f46}));ed.position.set(4.2+i*.5,.73,-1.2+i*.2);sc.add(ed);sc.add(b);tw.push(b)}
  var today=solid(new T3.BoxGeometry(.01,1.2,3.4),0xffffff,null,true);today.position.set(-3,.6,.2);sc.add(today);
  var lb=label('TODAY',.18,'#FFFFFF');lb.position.set(0,.8,1.9);today.add(lb);
  var l2=label('PLANNED',.16,'#8B8B93'),l3=label('ACTUAL',.16,'#FFFFFF'),l4=label('SPONSOR PLEDGES',.16,'#8B8B93');l2.position.set(-2.4,.3,2);l3.position.set(-.7,.3,2);l4.position.set(4.9,1.7,-.7);[l2,l3,l4].forEach(function(l){sc.add(l)});
  sc.add(grid(-.02,12,48));
  var tgt=[3.5,3.0,4.2,2.3].map(function(x){return x*.33});
  function reset(){ac.forEach(function(a){a.scale.x=.001});tw.forEach(function(t){t.scale.y=.001});today.position.x=-3}
  var tl=tlLoop(v,reset);
  tl.add({targets:pl.map(function(p){return p.scale}),x:[.001,1],delay:A.stagger(120),duration:700,easing:'easeOutExpo'})
    .add({targets:ac.map(function(a){return a.scale}),x:[.001,1],delay:A.stagger(160),duration:900,easing:'easeInOutCubic'},'-=300')
    .add({targets:today.position,x:[-3,3.2],duration:2600,easing:'easeInOutSine'},'-=1100')
    .add({targets:tw.map(function(t){return t.scale}),y:[.001,1.2],delay:A.stagger(140),duration:900,easing:'easeOutBack'},'-=1800')
    .add({targets:{x:0},x:1,duration:1500})
    .add({targets:ac.map(function(a){return a.scale}).concat(tw.map(function(t){return t.scale})),x:.001,duration:500,easing:'easeInQuad'});
  v.api={ac:ac,tw:tw,today:today,rows:rows};
  sc.position.x=-.95;v.tick=function(t){sc.rotation.y=Math.sin(t*.28)*.25-.15+v.dy;sc.rotation.x=v.dp};
}

/* ---- Scrub: four boards, a display, a wheel that really spins ---- */
function sceneSC(v){
  var sc=v.root;v.cam.position.set(0,1.1,3.9);v.cam.lookAt(0,.2,0);
  var W=1.16,D=1,H=.03,plates=[];
  [0x8b8b93,0x8b8b93,0x8b8b93,0xffffff].forEach(function(col,i){var p=solid(new T3.BoxGeometry(W,H,D),col,0x050506,i===3);sc.add(p);plates.push(p)});
  var top=plates[3];
  var scr=solid(new T3.BoxGeometry(W*.88,.004,D*.46),0xffffff,0x0a0a0c);scr.position.set(0,H/2+.004,-D*.24);top.add(scr);
  var pr=new T3.Mesh(new T3.BoxGeometry(W*.6,.003,.012),new T3.MeshBasicMaterial({color:0x3f3f46}));pr.position.set(0,H/2+.012,-D*.09);top.add(pr);
  var bar2=new T3.Mesh(new T3.BoxGeometry(.3,.004,.016),new T3.MeshBasicMaterial({color:0xffffff}));bar2.position.set(-W*.15,H/2+.014,-D*.09);top.add(bar2);
  var wheel=new T3.Group();wheel.position.set(0,H/2+.02,D*.25);top.add(wheel);
  wheel.add(solid(new T3.CylinderGeometry(.21,.21,.04,48),0x8b8b93,0x050506));
  wheel.add(solid(new T3.CylinderGeometry(.08,.08,.046,32),0x8b8b93,0x0a0a0c));
  var mk=solid(new T3.BoxGeometry(.035,.046,.1),0xffffff,0xffffff);mk.position.set(0,0,-.165);wheel.add(mk);
  var lb=label('HAPTIC WHEEL',.09,'#D4D4D8');lb.position.set(.55,.12,.45);top.add(lb);
  sc.add(grid(-.16,3,18));
  var ex={v:0},wh={a:0};
  function lay(){plates.forEach(function(p,i){p.position.y=i*(.07+.2*ex.v)})}lay();
  var tl=A.timeline({autoplay:false,loop:true});v.anims.push(tl);
  tl.add({targets:ex,v:[0,1],duration:2200,easing:'easeInOutQuart',update:lay},0).add({targets:ex,v:[1,0],duration:2200,easing:'easeInOutQuart',update:lay},'+=1800');
  v.anims.push(A({targets:wh,a:[{value:Math.PI*6,duration:2800,easing:'easeOutExpo'},{value:Math.PI*2,duration:2200,easing:'easeInOutQuart',delay:500},{value:Math.PI*8,duration:2400,easing:'easeInOutCubic',delay:300}],loop:true,autoplay:false}));
  var yaw=-.7;
  v.api={plates:plates,wheel:wheel,wh:wh,ex:ex};
  v.tick=function(t,dt){yaw+=dt*.32;sc.rotation.y=yaw+v.dy;sc.rotation.x=.12+v.dp;wheel.rotation.y=wh.a;bar2.scale.x=.4+.6*((Math.sin(t*1.2)+1)/2)};
}

/* ---- Why me: three small objects ---- */
function iconShip(v){
  var sc=v.root;v.cam.position.set(0,.9,4.2);v.cam.lookAt(0,.1,0);
  var box=solid(new T3.BoxGeometry(1,.7,1),0xffffff,0x050506);box.position.y=-.2;sc.add(box);
  var ar=new T3.Group(),cone=solid(new T3.ConeGeometry(.28,.45,4),0xffffff,0x050506);cone.position.y=.35;ar.add(cone);
  var sh=solid(new T3.CylinderGeometry(.07,.07,.6,8),0xffffff,0x050506);ar.add(sh);ar.position.y=.7;sc.add(ar);
  var st={y:0};v.anims.push(A({targets:st,y:[0,.5],duration:900,direction:'alternate',loop:true,easing:'easeInOutQuad',autoplay:false}));
  v.tick=function(t){ar.position.y=.6+st.y;box.rotation.y=t*.8;ar.rotation.y=t*.8;sc.rotation.x=.12};
}
function iconLayers(v){
  var sc=v.root;v.cam.position.set(0,1.5,4.2);v.cam.lookAt(0,0,0);
  var ps=[0,1,2].map(function(i){var p=solid(new T3.CylinderGeometry(.9,.9,.06,4),i===2?0xffffff:0x8b8b93,0x050506);p.rotation.y=Math.PI/4;sc.add(p);return p});
  var st={s:0};v.anims.push(A({targets:st,s:[0,1],duration:1400,direction:'alternate',loop:true,easing:'easeInOutBack',autoplay:false}));
  v.tick=function(t){ps.forEach(function(p,i){p.position.y=(i-1)*(.18+.38*st.s)});sc.rotation.y=t*.6};
}
function iconFlag(v){
  var sc=v.root;v.cam.position.set(0,.4,4.4);v.cam.lookAt(0,0,0);
  var pole=solid(new T3.CylinderGeometry(.04,.04,1.9,8),0xffffff,0x050506);pole.position.set(-.55,0,0);sc.add(pole);
  var base=solid(new T3.CylinderGeometry(.3,.3,.06,16),0x8b8b93,0x050506);base.position.set(-.55,-.95,0);sc.add(base);
  var geo=new T3.PlaneGeometry(1.2,.75,14,6),pos=geo.attributes.position;
  var fl=new T3.Mesh(geo,new T3.MeshBasicMaterial({color:0x050506,side:T3.DoubleSide,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1}));
  var wf=new T3.Mesh(geo,new T3.MeshBasicMaterial({color:0xffffff,wireframe:true,side:T3.DoubleSide}));
  var fg=new T3.Group();fg.add(fl);fg.add(wf);fg.position.set(.07,.5,0);sc.add(fg);
  v.tick=function(t){for(var i=0;i<pos.count;i++){var x=pos.getX(i)+.6;pos.setZ(i,Math.sin(x*4-t*5)*.09*x)}pos.needsUpdate=true;sc.rotation.y=Math.sin(t*.7)*.5};
}

/* ---- small models for a few statements. Same look as the icons: white edges, black faces, slow motion ---- */
function objSystem(v){
  var sc=v.root;v.cam.position.set(2.6,2.2,5);v.cam.lookAt(0,.35,0);
  var P=[[-1.15,0,0],[1.15,0,0],[0,0,1.25],[0,1.05,.4]];
  var lm=new T3.LineBasicMaterial({color:0x8b8b93,transparent:true,opacity:0});
  [[0,2],[1,2],[2,3],[0,3],[1,3]].forEach(function(e){sc.add(new T3.Line(new T3.BufferGeometry().setFromPoints([new T3.Vector3().fromArray(P[e[0]]),new T3.Vector3().fromArray(P[e[1]])]),lm))});
  var bs=P.map(function(p,i){var b=solid(new T3.BoxGeometry(.95,.56,.95),i===3?0xffffff:0x8b8b93,0x050506);b.userData.p=p;sc.add(b);return b});
  v.tick=function(t){var c=(t%6)/6,ks=0;bs.forEach(function(b,i){var k=eo(clamp((c-.03-i*.06)/.14,0,1))*(1-clamp((c-.92)/.07,0,1)),p=b.userData.p;b.position.set(p[0],p[1]+(1-k)*1.1,p[2]);b.rotation.y=(1-k)*1.6;b.visible=k>.01;ks+=k});lm.opacity=clamp(ks/4,0,1)*.9;sc.rotation.y=t*.22};
}
function objKeys(v){
  var sc=v.root;v.cam.position.set(0,3.4,5.3);v.cam.lookAt(0,0,0);
  var base=solid(new T3.BoxGeometry(3.3,.16,1.25),0x8b8b93,0x050506);sc.add(base);
  var ks=[];
  for(var r=0;r<3;r++)for(var c=0;c<10;c++){var k=solid(new T3.BoxGeometry(.24,.12,.24),0xffffff,0x050506);k.position.set(-1.4+c*.3+(r%2)*.12,.15,-.38+r*.34);k.userData.h=k.position.clone();k.userData.d=c*.08+r*.03;sc.add(k);ks.push(k)}
  var sp=solid(new T3.BoxGeometry(1.4,.12,.22),0xffffff,0x050506);sp.position.set(0,.15,.6);sp.userData.h=sp.position.clone();sp.userData.d=.5;sc.add(sp);ks.push(sp);
  v.tick=function(t){var c=(t%3.2)/3.2;ks.forEach(function(k){var u=clamp((c-k.userData.d)/.18,0,1),h=k.userData.h;k.position.y=h.y-Math.sin(u*Math.PI)*.07});sc.rotation.y=Math.sin(t*.4)*.3;sc.rotation.x=.05};
}
function objJoy(v){
  var sc=v.root;v.cam.position.set(0,1.8,4.5);v.cam.lookAt(0,.4,0);
  var base=solid(new T3.BoxGeometry(1.9,.36,1.2),0x8b8b93,0x050506);sc.add(base);
  var st=new T3.Group(),rod=solid(new T3.CylinderGeometry(.06,.06,.9,8),0xffffff,0x050506);rod.position.y=.45;st.add(rod);
  var ball=solid(new T3.SphereGeometry(.24,10,8),0xffffff,0x050506);ball.position.y=.95;st.add(ball);st.position.set(-.45,.18,0);sc.add(st);
  var b1=solid(new T3.CylinderGeometry(.14,.14,.1,12),0xffffff,0x050506),b2=solid(new T3.CylinderGeometry(.14,.14,.1,12),0xffffff,0x050506);b1.position.set(.35,.22,-.18);b2.position.set(.66,.22,.14);sc.add(b1);sc.add(b2);
  v.tick=function(t){st.rotation.z=Math.sin(t*2.1)*.32;st.rotation.x=Math.cos(t*1.6)*.22;b1.position.y=Math.sin(t*5)>.7?.17:.22;b2.position.y=Math.sin(t*5+2)>.7?.17:.22;sc.rotation.y=Math.sin(t*.45)*.45-.2};
}
function objCap(v){
  var sc=v.root;v.cam.position.set(0,1.7,4.8);v.cam.lookAt(0,0,0);
  var cap=new T3.Group();
  var skull=solid(new T3.CylinderGeometry(.55,.62,.45,16,1,true),0x8b8b93,0x050506);cap.add(skull);
  var board=solid(new T3.BoxGeometry(1.7,.06,1.7),0xffffff,0x050506);board.position.y=.25;board.rotation.y=Math.PI/4;cap.add(board);
  var knob=solid(new T3.CylinderGeometry(.07,.07,.05,8),0xffffff,0x050506);knob.position.y=.3;cap.add(knob);
  var tas=new T3.Group();tas.position.set(0,.29,1.18);var cord=solid(new T3.CylinderGeometry(.015,.015,.55,4),0xffffff,0x050506);cord.position.y=-.27;tas.add(cord);
  var end=solid(new T3.BoxGeometry(.1,.16,.1),0xffffff,0x050506);end.position.y=-.6;tas.add(end);cap.add(tas);sc.add(cap);
  v.tick=function(t){var b=Math.abs(Math.sin(t*1.5));cap.position.y=b*.22;cap.rotation.z=Math.sin(t*1.5)*.05;tas.rotation.x=Math.sin(t*3)*.35;cap.rotation.y=t*.35};
}
function objReel(v){
  var sc=v.root;v.cam.position.set(0,.4,5.3);v.cam.lookAt(0,0,0);sc.position.x=-.3;
  var reel=new T3.Group(),disc=solid(new T3.CylinderGeometry(1,1,.12,36),0xffffff,0x050506);disc.rotation.x=Math.PI/2;reel.add(disc);
  for(var i=0;i<5;i++){var h=circ(.22,24,0xffffff),a=i/5*Math.PI*2;h.rotation.x=Math.PI/2;h.position.set(Math.cos(a)*.55,Math.sin(a)*.55,.07);reel.add(h)}
  var hub=circ(.1,16,0xffffff);hub.rotation.x=Math.PI/2;hub.position.z=.07;reel.add(hub);sc.add(reel);
  var strip=solid(new T3.BoxGeometry(1.5,.34,.02),0x8b8b93,0x050506);strip.position.set(.95,-.85,0);strip.rotation.z=-.22;sc.add(strip);
  v.tick=function(t){reel.rotation.z=-t*1.2;sc.rotation.y=Math.sin(t*.5)*.35};
}

/* ---- models that replace the stamps: one small object each, saying the joke instead of a label ---- */
function objLaptop(v){
  var sc=v.root;v.cam.position.set(0,1.8,5);v.cam.lookAt(0,.4,0);
  var base=solid(new T3.BoxGeometry(2.2,.1,1.5),0x8b8b93,0x050506);sc.add(base);
  var hinge=new T3.Group();hinge.position.set(0,.05,-.75);sc.add(hinge);
  var scr=solid(new T3.BoxGeometry(2.2,1.45,.06),0xffffff,0x050506);scr.position.set(0,.72,0);hinge.add(scr);hinge.rotation.x=-.22;
  var ring=circ(.42,40,0xffffff);ring.rotation.x=Math.PI/2;ring.position.set(0,.74,.04);hinge.add(ring);
  var hg=new T3.BoxGeometry(.03,.36,.02);hg.translate(0,.16,0);var hand=solid(hg,0xffffff,0xffffff);hand.position.set(0,.74,.05);hinge.add(hand);
  var keys=[];for(var r=0;r<3;r++)for(var c=0;c<8;c++){var k=solid(new T3.BoxGeometry(.2,.04,.2),0x52525b,0x050506);k.position.set(-.84+c*.24,.08,-.35+r*.26);sc.add(k);keys.push(k)}
  v.tick=function(t){hand.rotation.z=-Math.floor(t*2)/2*Math.PI/6;sc.rotation.y=Math.sin(t*.45)*.4};
}
function objMic(v){
  var sc=v.root;v.cam.position.set(0,.6,5);v.cam.lookAt(0,.3,0);
  var head=solid(new T3.SphereGeometry(.5,14,10),0xffffff,0x050506);head.position.y=1.1;sc.add(head);
  var body=solid(new T3.CylinderGeometry(.32,.2,1.1,12),0x8b8b93,0x050506);body.position.y=.35;sc.add(body);
  var foot=solid(new T3.CylinderGeometry(.6,.6,.08,20),0x8b8b93,0x050506);foot.position.y=-.3;sc.add(foot);
  var rings=[0,1,2].map(function(){var r=circ(.6,40,0xffffff,.8);r.position.y=1.1;sc.add(r);return r});
  var nope=new T3.Group();[1,-1].forEach(function(s){var b=solid(new T3.BoxGeometry(1.5,.08,.08),0xffffff,0xffffff);b.rotation.z=s*.8;nope.add(b)});nope.position.set(1.35,1.15,0);sc.add(nope);
  v.tick=function(t){rings.forEach(function(r,i){var u=((t*.7+i/3)%1);r.scale.setScalar(1+u*1.6);r.material.opacity=(1-u)*.8;r.rotation.x=Math.PI/2});var on=(t%2.4)>1.6;nope.visible=on;nope.scale.setScalar(on?1:.01);sc.rotation.y=Math.sin(t*.5)*.35};
}
function objLock(v){
  var sc=v.root;v.cam.position.set(0,.8,5.2);v.cam.lookAt(0,.4,0);
  var body=solid(new T3.BoxGeometry(1.5,1.2,.55),0xffffff,0x050506);body.position.y=-.1;sc.add(body);
  var hole=circ(.14,20,0xffffff);hole.rotation.x=Math.PI/2;hole.position.set(0,0,.29);sc.add(hole);
  var sh=new T3.Group();var arc=solid(new T3.TorusGeometry(.48,.08,8,24,Math.PI),0x8b8b93,0x050506);sh.add(arc);
  var l1=solid(new T3.CylinderGeometry(.08,.08,.5,8),0x8b8b93,0x050506);l1.position.set(-.48,-.25,0);sh.add(l1);var l2=l1.clone();l2.position.x=.48;sh.add(l2);
  sh.position.y=.75;sc.add(sh);
  v.tick=function(t){var c=(t%3.2)/3.2,u=eo(clamp((c-.3)/.2,0,1))*(1-eo(clamp((c-.82)/.15,0,1)));sh.position.y=.75+u*.38;sh.position.x=u*.48;sh.rotation.y=u*Math.PI*.9;sc.rotation.y=Math.sin(t*.5)*.4};
}
function objBoard(v){
  var sc=v.root;v.cam.position.set(0,3.2,4.4);v.cam.lookAt(0,0,0);
  var board=solid(new T3.BoxGeometry(2.6,.08,1.8),0xffffff,0x050506,true);sc.add(board);
  [[-.7,-.3,.6,.5],[.5,-.4,.5,.5],[.1,.45,1,.3],[-.85,.5,.3,.3]].forEach(function(c){var b=solid(new T3.BoxGeometry(c[2],.12,c[3]),0x8b8b93,0x050506,true);b.position.set(c[0],.1,c[1]);sc.add(b)});
  var pen=new T3.Group(),stick=solid(new T3.CylinderGeometry(.07,.07,1.2,8),0xffffff,0x050506);stick.position.y=.75;pen.add(stick);
  var tip=solid(new T3.ConeGeometry(.07,.2,8),0xffffff,0x050506);tip.rotation.x=Math.PI;tip.position.y=.05;pen.add(tip);pen.rotation.z=.35;sc.add(pen);
  v.tick=function(t){pen.position.set(Math.cos(t*1.3)*.9,.05,Math.sin(t*2.1)*.55);sc.rotation.y=Math.sin(t*.35)*.3};
}
function objCar(v){
  var sc=v.root;v.cam.position.set(2.6,1.9,4.6);v.cam.lookAt(0,.2,0);
  var car=new T3.Group();
  var body=solid(new T3.BoxGeometry(2.6,.32,.9),0x52525b,0x050506);body.position.y=.25;car.add(body);
  var nose=solid(new T3.BoxGeometry(.9,.16,.36),0x52525b,0x050506);nose.position.set(1.65,.2,0);car.add(nose);
  var wing=solid(new T3.BoxGeometry(.2,.06,1.3),0x52525b,0x050506);wing.position.set(-1.3,.62,0);car.add(wing);
  var ws=[[-.9,.45],[-.9,-.45],[.9,.45],[.9,-.45]].map(function(p){var w=solid(new T3.CylinderGeometry(.24,.24,.16,14),0x52525b,0x050506);w.rotation.x=Math.PI/2;w.position.set(p[0],.24,p[1]);car.add(w);return w});
  sc.add(car);
  var web=new T3.Group(),win=solid(new T3.BoxGeometry(1.7,1.1,.04),0xffffff,0x050506);web.add(win);
  var bar=solid(new T3.BoxGeometry(1.7,.14,.05),0xffffff,0xffffff);bar.position.y=.48;web.add(bar);
  [[-.35,.12,.8,.14],[-.35,-.1,.8,.08],[.45,-.05,.5,.5]].forEach(function(c){var b=solid(new T3.BoxGeometry(c[2],c[3],.05),0xffffff,0x050506);b.position.set(c[0],c[1],.02);web.add(b)});
  web.position.set(.2,1.55,.4);sc.add(web);
  v.tick=function(t){ws.forEach(function(w){w.rotation.y=t*6});car.rotation.y=Math.sin(t*.5)*.25;web.position.y=1.55+Math.sin(t*1.6)*.08;web.rotation.y=Math.sin(t*.5)*.3-.3};
}
function objChat(v){
  var sc=v.root;v.cam.position.set(0,.5,5.4);v.cam.lookAt(0,.4,0);
  var bub=new T3.Group(),box=solid(new T3.BoxGeometry(2.2,1.2,.3),0xffffff,0x050506);bub.add(box);
  var tail=solid(new T3.ConeGeometry(.2,.4,4),0xffffff,0x050506);tail.rotation.z=Math.PI*.8;tail.position.set(-.7,-.72,0);bub.add(tail);
  var dots=[-.5,0,.5].map(function(x){var d=solid(new T3.SphereGeometry(.13,10,8),0xffffff,0x050506);d.position.set(x,0,.2);bub.add(d);return d});
  bub.position.y=1;sc.add(bub);
  var sw=solid(new T3.BoxGeometry(1.2,.5,.3),0x8b8b93,0x050506);sw.position.set(.5,-.6,0);sc.add(sw);
  var knob=solid(new T3.BoxGeometry(.46,.4,.36),0xffffff,0x050506);knob.position.set(.5,-.6,.02);sc.add(knob);
  v.tick=function(t){var c=(t%4)/4,on=c<.45,k=eo(clamp((c-.45)/.1,0,1))*(1-eo(clamp((c-.9)/.1,0,1)));knob.position.x=.75-.5*k;
    dots.forEach(function(d,i){var b=on?Math.max(0,Math.sin(t*6-i*.9)):0;d.position.y=b*.14;d.scale.setScalar(1-k*.7)});bub.rotation.y=Math.sin(t*.5)*.25;sw.rotation.y=bub.rotation.y;knob.rotation.y=bub.rotation.y};
}
function objCrown(v){
  var sc=v.root;v.cam.position.set(0,1.4,5);v.cam.lookAt(0,.4,0);
  var crown=new T3.Group(),band=solid(new T3.CylinderGeometry(.9,.9,.36,8,1,true),0xffffff,0x050506);crown.add(band);
  for(var i=0;i<8;i++){var a=i/8*Math.PI*2,sp=solid(new T3.ConeGeometry(.17,.5,4),0xffffff,0x050506);sp.position.set(Math.cos(a)*.86,.42,Math.sin(a)*.86);crown.add(sp)}
  crown.scale.setScalar(.72);crown.position.y=.36;sc.add(crown);
  /* Clawd, Claude Code's little blocky mascot, wearing the crown: a wide body, two tall eyes, stubby arms, four legs */
  var clawd=new T3.Group(),body=solid(new T3.BoxGeometry(1.7,.95,.75),0xffffff,0x050506);clawd.add(body);
  var eyes=[-.38,.38].map(function(x){var e=new T3.Mesh(new T3.BoxGeometry(.14,.3,.02),new T3.MeshBasicMaterial({color:0xffffff}));e.position.set(x,.08,.39);clawd.add(e);return e});
  [-1,1].forEach(function(s){var arm=solid(new T3.BoxGeometry(.3,.26,.5),0xffffff,0x050506);arm.position.set(s*1,-.05,0);clawd.add(arm)});
  var legs=[-.62,-.22,.22,.62].map(function(x){var l=solid(new T3.BoxGeometry(.16,.34,.3),0xffffff,0x050506);l.position.set(x,-.64,0);clawd.add(l);return l});
  clawd.position.y=-.25;sc.add(clawd);
  v.tick=function(t){crown.rotation.y=t*.6;var hop=Math.abs(Math.sin(t*1.8));clawd.position.y=-.25+hop*.12;crown.position.y=.36+hop*.12+Math.max(0,Math.sin(t*3.6))*.08;crown.rotation.z=Math.sin(t*1.8)*.06;
    legs.forEach(function(l,i){l.position.y=-.64+(i%2?1:-1)*Math.sin(t*7)*.04});var blink=(t%3.4)<.12;eyes.forEach(function(e){e.scale.y=blink?.12:1});clawd.rotation.y=Math.sin(t*.6)*.35};
}

/* ---- certified: a certificate with a ribbon seal, and a thumbs up pumping beside it ---- */
function objThumb(v){
  var sc=v.root;v.cam.position.set(.4,.9,6);v.cam.lookAt(.2,.2,0);
  var cert=new T3.Group(),paper=solid(new T3.BoxGeometry(2.3,1.6,.05),0xffffff,0x050506);cert.add(paper);
  var inner=solid(new T3.BoxGeometry(2.05,1.35,.06),0x52525b,null);cert.add(inner);
  [[0,.38,1.3],[0,.12,1.6],[0,-.06,1.2],[-.45,-.42,.7]].forEach(function(l){var b=solid(new T3.BoxGeometry(l[2],.035,.07),0x8b8b93,0x8b8b93);b.position.set(l[0],l[1],0);cert.add(b)});
  var seal=new T3.Group(),disc=solid(new T3.CylinderGeometry(.24,.24,.06,16),0xffffff,0x050506);disc.rotation.x=Math.PI/2;seal.add(disc);
  var ring=circ(.16,20,0xffffff);ring.rotation.x=Math.PI/2;ring.position.z=.04;seal.add(ring);
  [-1,1].forEach(function(s){var t=solid(new T3.BoxGeometry(.12,.38,.03),0xffffff,0x050506);t.position.set(s*.08,-.3,-.01);t.rotation.z=s*.25;seal.add(t)});
  seal.position.set(.62,-.42,.06);cert.add(seal);
  cert.position.set(-.55,.15,0);cert.rotation.y=.25;sc.add(cert);
  /* the hand, seen from the front: four curled knuckles stacked toward you, and a thick thumb on top that pumps */
  var hand=new T3.Group(),palm=solid(new T3.BoxGeometry(.78,.82,.46),0x8b8b93,0x050506);hand.add(palm);
  for(var i=0;i<4;i++){var f=solid(new T3.CylinderGeometry(.115,.115,.74,12),0xffffff,0x050506);f.rotation.z=Math.PI/2;f.position.set(.04,.28-i*.19,.26);hand.add(f)}
  var thumb=new T3.Group(),tb=solid(new T3.CylinderGeometry(.13,.15,.62,12),0xffffff,0x050506);tb.position.y=.31;thumb.add(tb);
  var tip=solid(new T3.SphereGeometry(.13,12,10),0xffffff,0x050506);tip.position.y=.62;thumb.add(tip);
  var nail=solid(new T3.BoxGeometry(.13,.16,.02),0xffffff,0x050506);nail.position.set(0,.6,.12);thumb.add(nail);
  thumb.position.set(-.2,.4,.1);thumb.rotation.z=.12;hand.add(thumb);
  var cuff=solid(new T3.BoxGeometry(.82,.34,.5),0x52525b,0x050506);cuff.position.y=-.6;hand.add(cuff);
  hand.scale.setScalar(1.2);hand.position.set(1.55,-.1,.5);hand.rotation.y=-.35;sc.add(hand);
  v.tick=function(t){var p=Math.max(0,Math.sin(t*3.2));hand.position.y=-.1+p*.18;thumb.rotation.z=.12-p*.1;seal.rotation.z=Math.sin(t*1.4)*.12;sc.rotation.y=Math.sin(t*.45)*.18};
}

/* ---- Process: the manager, two workers, a gate that checks, and me ---- */
function sceneOrch(v){
  var sc=v.root;v.cam.position.set(0,2.2,7.2);v.cam.lookAt(0,0,0);
  var man=solid(new T3.BoxGeometry(.9,.9,.9),0xffffff,0x050506);man.position.set(-3.4,0,0);sc.add(man);
  var w1=solid(new T3.OctahedronGeometry(.42),0xffffff,0x050506),w2=solid(new T3.OctahedronGeometry(.42),0xffffff,0x050506);w1.position.set(-1.5,.9,.5);w2.position.set(-1.5,-.9,-.4);sc.add(w1);sc.add(w2);
  var gate=new T3.Group();gate.position.set(.6,0,0);gate.rotation.y=Math.PI/2;
  gate.add(new T3.LineLoop(new T3.BufferGeometry().setFromPoints(Array.from({length:48},function(_,i){var a=i/48*Math.PI*2;return new T3.Vector3(Math.cos(a)*.95,Math.sin(a)*.95,0)})),new T3.LineBasicMaterial({color:0xffffff})));
  var scan=new T3.Mesh(new T3.PlaneGeometry(1.8,.04),new T3.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.0}));gate.add(scan);sc.add(gate);
  var me=solid(new T3.DodecahedronGeometry(.55),0xffffff,0x050506);me.position.set(3.2,0,0);sc.add(me);
  var tags=[['MANAGER',man,-1.15],['WORKER',w1,.75],['WORKER',w2,-.75],['CHECK',gate,1.15],['ME',me,1.0]];
  tags.forEach(function(t){var l=label(t[0],.19,'#D4D4D8');l.position.copy(t[1].position);l.position.y+=t[2];sc.add(l)});
  sc.add(grid(-1.4,12,36));
  function mkpk(){var m=solid(new T3.BoxGeometry(.13,.13,.13),0xffffff,0xffffff);m.visible=false;sc.add(m);return m}
  var p1=mkpk(),p2=mkpk(),p3=mkpk(),p4=mkpk(),p5=mkpk(),bad=mkpk(),o={a:{t:0},b:{t:0},c:{t:0},d:{t:0},e:{t:0},f:{t:0}};
  var V=function(x,y,z){return new T3.Vector3(x,y,z)};
  var cA=new T3.QuadraticBezierCurve3(man.position.clone(),V(-2.5,1.3,.6),w1.position.clone()),cB=new T3.QuadraticBezierCurve3(man.position.clone(),V(-2.5,-1.3,-.5),w2.position.clone()),
      cC=new T3.QuadraticBezierCurve3(w1.position.clone(),V(-.3,.8,.3),V(.6,0,0)),cD=new T3.QuadraticBezierCurve3(w2.position.clone(),V(-.3,-.8,-.2),V(.6,0,0)),
      cE=new T3.LineCurve3(V(.6,0,0),me.position.clone()),cF=new T3.QuadraticBezierCurve3(V(.6,0,0),V(-1.4,2.2,.2),man.position.clone());
  function run(m,c,k,d,e){return {targets:o[k],t:[0,1],duration:d||800,easing:e||'easeInOutQuad',begin:function(){m.visible=true},update:function(){m.position.copy(c.getPoint(o[k].t))},complete:function(){m.visible=false}}}
  function pulse(g){return {targets:g.scale,x:[1,1.35],y:[1,1.35],z:[1,1.35],duration:240,direction:'alternate',easing:'easeOutQuad'}}
  function reset(){[p1,p2,p3,p4,p5,bad].forEach(function(m){m.visible=false});scan.material.opacity=0;me.userData.fill.material.color.set(0x050506)}
  var tl=tlLoop(v,reset);
  tl.add(pulse(man)).add(run(p1,cA,'a'),'+=0').add(run(p2,cB,'b'),'-=800').add(pulse(w1),'-=60').add(pulse(w2),'-=240')
    .add(run(p3,cC,'c'),'+=100').add(run(p4,cD,'d'),'-=800')
    .add({targets:scan.material,opacity:[0,.9],duration:260,direction:'alternate',easing:'linear'},'-=300')
    .add({targets:scan.position,y:[.9,-.9],duration:520,easing:'linear'},'-=520')
    .add(run(p5,cE,'e',700),'+=0')
    .add({targets:me.userData.fill.material.color,r:[.02,1],g:[.02,1],b:[.02,1],duration:240,easing:'linear'},'-=100')
    .add(pulse(me),'-=240')
    .add({targets:{x:0},x:1,duration:500})
    .add(run(bad,cF,'f',1100,'easeInOutSine'),'+=0')
    .add({targets:{x:0},x:1,duration:900});
  v.post=function(){[[p1,'a'],[p2,'b'],[p3,'c'],[p4,'d'],[p5,'e'],[bad,'f']].forEach(function(a){var q=o[a[1]].t;a[0].visible=q>.001&&q<.999})};
  v.api={pk:[p1,p2,p3,p4,p5,bad],gate:gate,scan:scan,man:man,me:me};
  v.tick=function(t){sc.rotation.y=Math.sin(t*.3)*.28+v.dy;sc.rotation.x=.05+v.dp;w1.rotation.y=t;w2.rotation.y=-t;me.rotation.y=t*.6;man.rotation.y=t*.3};
}



