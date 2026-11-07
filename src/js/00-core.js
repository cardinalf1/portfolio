var A=window.anime,T3=window.THREE,reduce=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
function $(s,r){return (r||document).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function pad(n){return n<10?'0'+n:''+n}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function mmss(s){return pad(Math.floor(s/60))+':'+pad(s%60)}
var HAS=!!A;
/* ?plain in the address shows the plain text version only, and the film never starts */
var PLAIN=/[?&]plain\b/.test(location.search)||location.hash==='#plain';
if(PLAIN){document.documentElement.classList.add('plainview');return}
