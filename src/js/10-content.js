/* ===========================================================
   CONTENT: edit the words here.
   SITE: email address and links.
   P1 / P2: project records (name, line, status, metric are shown on screen).
           The fields what / caps / ai / plain are notes and are not shown.
   COPY: the paragraph, chips and note shown for each project scene.
   AI / TL: timeline entries (TL is drawn as the Gantt chart).
   The rest of the on-screen text is in 30-director.js, see CONTENT.md.
   =========================================================== */
var SITE={
  email:'pacmanraghav@gmail.com',
  resume:'https://docs.google.com/document/d/1KN2Gm19eoezm2LR0HEIW7hIzbJcofz6Zb1UhqGpIdPg/edit?usp=sharing',
  links:[] /* example: {label:'GITHUB',href:'https://github.com/yourname'} */
};

/* ---------- content ---------- */
var P1=[
{id:'blackbook',name:'Blackbook',line:'Offline Digital SAT practice simulator',sq:'full',status:'Released, v1.0.0',metric:'About 3,700 questions, 241 recorded changes',
 what:'A desktop app, with installers for Windows and Mac, that recreates the real Digital SAT test screen on your own computer.',
 caps:['Test room with timer, question navigator, formula sheet, line reader, answer eliminator, highlighter and a built-in Desmos graphing calculator','Full-length adaptive tests where the second half responds to the first, targeted practice by skill and difficulty, and a 20-question quick mode','Mistake notebook that sorts errors into categories','Analytics: accuracy by skill, time per question and projected score ranges','Optional AI explanations and coaching, using the student\'s own free Groq key','Backup and sharing of the question bank'],
 ai:'Optional. The AI only chooses and words things from numbers that ordinary code already worked out. It never touches the timer or the scoring, and the app works fully without it.',
 plain:'No accounts and no tracking, and a written list of the only four things that ever use the internet. It ships no copyrighted questions: each user downloads the public question bank to their own computer. Limits: desktop only, and it relies on that public bank staying available.'},
{id:'takt',name:'Takt',line:'Voice dictation that works in every application',sq:'full',status:'Released, with installer',metric:'0.6 to 1.1 s from key release to text',
 what:'Hold a key, talk, release, and clean written text is typed into whichever app is in front of you. It runs on Windows and on Linux (Wayland and Hyprland, which my own computer uses).',
 caps:['Push-to-talk, or a toggle mode','Removes filler words such as "um" and "uh" and understands the spoken command "scratch that"','Formats text to suit the app: code, chat or ordinary writing','Removes background noise before turning speech into text','Optional Privacy Shield that hides secret keys and card numbers before text is inserted','Short phrases never leave the computer. Online clean-up is optional and used only for long, rambling speech'],
 ai:'It is the core of the product. Speech, noise removal, filler-word and sensitive-data models all run on your own computer. The speech and noise models come from other people (Whisper and Desert Ant Labs). I built the application around them.',
 plain:'The microphone opens only while the key is held, and nothing leaves the computer by default. Limits: no Mac version, and a heavier install (about 670 MB to download on Windows) because the models are inside.'},
{id:'relay',name:'relay',line:'Your home computer, from anywhere',sq:'full',status:'Done',metric:'Starts a powered-off PC, then runs whatever you email it',
 what:'From any web browser, even a locked-down school computer, enter a password and my home computer switches on, the disk password is typed in automatically, and the desktop streams to you.',
 caps:['An ESP32-S3 chip stays on at home. It sends the wake signal, presses the power button through a small circuit, and acts as a USB keyboard to type the disk password','Login uses a one-time challenge, so the password is never sent over the internet','A private network link gets past my internet provider\'s shared addresses, and a game-streaming tool shows the desktop','Email bot: send an email and a Claude conductor can wake the computer, run coding agents, run jobs and email back a report'],
 ai:'The email bot is an AI agent with written limits: allowed senders only, checks against forged addresses (SPF and DKIM), attachments treated as untrusted data, and a cap on messages. I built it with Claude Code and handoff documents.',
 plain:'It gets around real obstacles: shared internet addresses and an encrypted disk. Limits: complicated to set up, and stream quality depends on home upload speed.'},
{id:'scrub',name:'Scrub',line:'Handheld music player with a haptic wheel',sq:'empty',status:'Designed, not yet built',metric:'4-layer board, 100 x 86 mm. 39 recorded changes',
 what:'A handheld lossless music player and macro deck, designed from scratch as a circuit board. The wheel is driven by a motor, so it can give you adjustable clicks. This one is hardware.',
 caps:['Lossless FLAC playback up to 24-bit from a memory card, through a 32-bit DAC and headphone amplifier to a 3.5 mm socket','Bluetooth output through a second dedicated chip','Haptic scroll wheel: a brushless motor with a magnetic angle sensor','3.5-inch colour display, USB-C charging with battery protection, and a macro deck mode over USB','In the project folder: a routed four-layer board that passes the design-rule checks, JLCPCB manufacturing files, 3D case models, firmware with a simulator, a cost estimate for India, a ranked risk list and a staged bench-test plan'],
 ai:'Used only to design it, never inside the device. A written team of models with Claude Opus as manager and free models for reading datasheets and first drafts. A PROVENANCE.md file records which decisions were mine and which work was done by which model.',
 plain:'Not built, not ordered and not powered on. The firmware has never run on real hardware. My own risk list ranks this first: a first-time four-layer board routed with scripts. Finishing it is my next test.'}
];
var P2=[
{id:'cardsite',name:'Cardinal website',line:'Public home of the STEM Racing team',sq:'full',status:'Published, Jun 2026',metric:'Deployed automatically to GitHub Pages',
 what:'A single-page public site that presents the team to visitors and sponsors. It deploys automatically to GitHub Pages.',
 caps:['Full-screen hero with a two-tone headline and thin corner marks','Systems section where a visitor switches between the team\'s cars, each shown as an interactive 3D model','Competition explainer, team page with portraits and roles, partners with sponsor logos','Prospectus section that shows the sponsorship document inside the page','All wording lives in one config.json file, so the team can change headlines, specs, members and sponsors without touching code'],
 ai:'None in the product. It is the visual origin of the Cardinal design language.',
 plain:'The cars are the team\'s work. I built the site. It was published before the national final, so it still describes the team as competing there.'},
{id:'overture',name:'Overture',line:'The team\'s management portal',sq:'full',status:'Built',metric:'Built 6 Jul to 30 Aug 2026',
 what:'A private web app for running the whole team: schedule, engineering work, budget and sponsors in one place. It began as a Google AI Studio template and grew into a custom system with a 12-section capabilities document.',
 caps:['Command Center: tasks with owners, status and dependencies beside a hand-drawn SVG Gantt chart with planned and actual bars and a today line','Engineering hub: every version of every car part, with an interactive 3D viewer, weight change and a status from Draft to Milled or Rejected','Sponsor portal: every item the team must buy, the amount pledged, the gap and a progress bar. Sponsors can log in and pledge an item','Access control: four roles, three department roles and a greenlight switch, so a correct password without approval is signed out','Works offline from browser storage, or syncs to a database with live updates for everyone'],
 ai:'A chat assistant that could create and update tasks was started, then switched off by the administrator, and the screen says so. It is a planned feature, not a working one. The security rules were written by a person, not left to a model.',
 plain:'The best-documented project I have. Limits: the sponsor portal is over 1,300 lines in one file and would be hard to maintain, and password handling for custom sessions should be reviewed by a security expert before the app holds sensitive data.'}
];
var AI=[
['Blackbook','Optional coaching, explanations and practice generation (Groq)','Built with Claude Code and instruction files for agents'],
['Takt','Speech, noise, filler-word and data-hiding models on the computer, plus optional language-model clean-up','Built with Claude Code'],
['relay','An email-controlled Claude assistant that runs my computer','Handoff documents between AI sessions'],
['Scrub','None','A team of several models, with Claude Opus as manager'],
['Cardinal website','None','Not recorded'],
['Overture','A chat assistant exists but is switched off','Started from a Google AI Studio template']
];
var TL=[
{n:'Game development',d:'Lead developer at Isha Home School. More than five games in Godot. 2nd place (South Zone), Game Design, Design Championship 2025.',a:[2022,5,1],b:null,l:'Jun 2022 to now'},
{n:'Logistics supervisor',d:'Co-curricular operations. Scheduling across 200+ student activities over two years.',a:[2023,5,1],b:null,l:'Jun 2023 to now'},
{n:'IHS Vibes podcast',d:'Committee member. Guest research, outreach, video editing and YouTube publishing.',a:[2025,5,1],b:null,l:'Jun 2025 to now'},
{n:'Team Cardinal',d:'Co-founder and Enterprise Director. Brand, sponsors and budget. Qualifiers champions, 2nd at the India national final.',a:[2025,11,1],b:null,l:'Dec 2025 to now'},
{n:'Isha eMedia internship',d:'Data analytics. 69,466 customer records, Python and SQL, and a Random Forest conversion model.',a:[2026,2,1],b:[2026,3,30],l:'Mar to Apr 2026'},
{n:'Cardinal website and Overture',d:'Website published in June 2026. Overture built 6 Jul to 30 Aug 2026.',a:[2026,5,1],b:[2026,7,30],l:'Jun to Aug 2026'},
{n:'Four personal projects',d:'Blackbook, Takt, relay, Scrub.',a:[2026,8,28],b:[2026,10,2],l:'28 Sep to 2 Nov 2026'}
];


var COPY={
 blackbook:{blurb:'A desktop app for Windows and Mac that recreates the real Digital SAT test screen on your own computer.',note:'No accounts and no tracking. Works fully without AI.',chips:['Adaptive full-length tests','Mistake notebook','Score analytics']},
 takt:{blurb:'Hold a key, talk, release, and clean written text is typed into whichever app is in front of you.',note:'Nothing leaves the computer by default. Windows and Linux, no Mac version.',chips:['Push-to-talk','Removes filler words','Optional Privacy Shield']},
 relay:{blurb:'From any web browser, even a locked-down school computer, enter a password and my home computer switches on and the desktop streams to you. Or just email it a command and it does the job.',note:'Complicated to set up, and stream quality depends on home upload speed.',chips:['ESP32 wakes a powered-off PC','Types the disk password over USB','Email it a command, the PC does it']},
 scrub:{blurb:'A handheld lossless music player and macro deck, designed from scratch as a circuit board, with a motor-driven haptic wheel.',note:'Not built, not ordered and not powered on. The firmware has never run on real hardware.',chips:['FLAC up to 24-bit','Four-layer board, 100 x 86 mm','Designed with a team of models']},
 cardsite:{blurb:'A single-page public site that presents the team to visitors and sponsors, with an interactive 3D viewer for each car.',note:'The cars are the team\'s work. I built the site.',chips:['Config-driven wording','Partners and prospectus','Deploys to GitHub Pages']},
 overture:{blurb:'A private web app for running the whole team: schedule, engineering work, budget and sponsors in one place.',note:'The chat assistant was started and is switched off. The screen says so.',chips:['Gantt with planned and actual bars','Sponsor pledge portal','Four roles and a greenlight switch']}
};
