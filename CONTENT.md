# Every word on the site, beat by beat

The page is one continuous film of 46 beats. Scroll plays it forward, scrolling up rewinds it. Beat numbers below match the order on screen. Two files hold the words:

- `src/js/10-content.js`: the project records, the project paragraphs, chips and notes, the timeline and the email address.
- `src/js/30-director.js`: every beat (search for the quoted text, it appears once), plus the cursor tags and the joke dialog.
- `src/body.html`: the always-on interface (top bar, scroll hint, Claude limit dialog).
- `src/js/20-3d.js`: the words drawn inside the 3D scenes.
- `src/head.html`: browser tab title and search description.

Rules for any change (see AGENTS.md): no em dashes, never say he built the car, Scrub is designed and not built, do not advertise libraries or stack. Jokes are welcome, but every claim must be true.

## Start screen (before the film)

Shown every time the page opens (skipped for `#t=` links, `?film`, `?plain` and reduced motion). Clicking `RAGHAV BAHADUR` in the top bar brings it back, and every pick starts the film from the top. Markup in `src/body.html` (`#choose`), behaviour in `src/js/50-fun.js` (search `how do you want this`).

- `RAGHAV BAHADUR // PORTFOLIO // 2026`
- Headline: `How do you want this?`
- `[ COOL RESUME ]` with `Highly recommended. A three minute film. Six cursors build it in front of you. Scroll to play, scroll up to rewind.` A cursor hovers next to it tagged `PICK THIS ONE`. It starts the film.
- `[ I HAVE 30 SECONDS ]` with `The short version. One screen, every fact, my email.` It opens the 30 second page.
- `[ NORMAL RESUME ]` with `A document. Very professional. Very still.` It plays hard to get: it runs away as `[ NOPE ]`, then `[ ARE YOU SURE? ]`, then back to `[ NORMAL RESUME ]`, the interns chase and pin it like the first slide's button (same lines), and clicking it while pinned opens the resume, then: `Opened in a new tab. The cool one is still here.`
- Footer: `Enter picks the cool one. Escape too, honestly.`

## Always on screen

- Browser tab title: `Raghav Bahadur`
- Search description: `Portfolio of Raghav Bahadur, a student in Bengaluru who builds software, designs hardware and makes tools for the Cardinal STEM Racing team.` (`src/head.html`)
- Top bar, left: `RAGHAV BAHADUR`. Middle: the chapter name (`Intro`, `In numbers`, `Why me`, `Personal builds`, `Cardinal`, `Process`, `About`, `Work with me`, `Contact`, `Credits`). Right: the timecode in frames (24 per second), scaled so it always ends at `03:00:00`, like `01:15:12 / 03:00:00`. While scrubbing fast a status appears before it: `FF 3X` or `REW 2X` (search `transport status` in `src/js/40-extras.js`).
- Scroll hint at the start: `SCROLL`, with `T for the 30 second version` under it on devices with a keyboard (`src/body.html`)
- Opening slate while the page loads: `RAGHAV BAHADUR` and `Runtime 03:00`. Between midnight and 5 am it adds `It is late. This takes about three minutes.` (`src/body.html` and `src/js/40-extras.js`)
- Tab title while the tab is in the background: `Paused. The agents are waiting.` (`src/js/40-extras.js`)
- Screen reader label of the page: `Raghav Bahadur, portfolio film`

## Resume link

The first slide has `[ JUST GIVE ME THE RESUME ]`, which opens the resume (a Google Doc) in a new tab, after a chase. Like the free model button, it runs away three times: it becomes `[ NOPE ]` (toast `Nope. Too slow.`), then `[ WATCH THE FILM FIRST ]` (`It is a good film. Promise.`), then `[ JUST GIVE ME THE RESUME ]` again (`Fine. The interns are holding it still. Click it.`). Four cursors pin it by the corners. If nobody clicks within 3 seconds it breaks free (`It broke free. Typical.`, cursors flung off with `NOOO`, `IT ESCAPED`, `COME BACK`, `WHY`) and they drag it back (`They dragged it back. Quick.`). Clicking while it is loose: `Hold on. The interns are on it.` Clicking while it is held opens the resume, with confetti, the cursors cheering `FINALLY`, `READ IT ALL`, `WORTH IT`, `YAY`, and the toast `Fair enough. Opening the resume.` Achievement: `Resume acquired`. With reduced motion it is a plain link. Code: `src/js/50-fun.js`, search `plays hard to get`. The address is `SITE.resume` in `src/js/10-content.js`; clear it to hide the button. The same link is in the 30 second version (`[ FULL RESUME ]`), in the plain text version and `llms.txt` (`Resume:` under contact), and in the structured data for search engines.

## Beats

There are no pages or windows. The film is one stream of beats: each beat is a few elements that arrive, hold and leave on their own, with a short clean gap before the next beat. Headlines are typed by a cursor, letter by letter. A few beats carry a small 3D model. Edit any text in `src/js/30-director.js` by searching for the quoted words. Project chips, status and metric lines come from `src/js/10-content.js` (`COPY` and `P1` / `P2`). The contact beat types the email from `SITE.email`.

### Intro

1. Small label: `Portfolio // 2026 // Bengaluru, India` | Headline: `Hi. / I am Raghav.` | Typed aside: `Student. Bengaluru. Builds things at an alarming rate.`
2. Headline: `I design the system. / Then AI builds it.`
3. Headline: `My ideas come faster / than I can type.`
4. Headline: `So I stopped typing.` | Typed aside: `The cursors type now. Like that one.`
5. Headline: `Meet the interns.` | Line: `Six cursors. Zero salary.` | Typed aside: `Same deal as me, to be fair. I also work for free.`
### In numbers

6. Big number: `6` | Headline: `projects.` | Typed aside: `Two bodies of work. One tired guy.`
7. Big number: `4` | Headline: `of them in about / six weeks.` | Typed aside: `28 Sep to 2 Nov 2026. Sleep was optional.`
8. Big number: `2` | Headline: `shipped with / real installers.` | Typed aside: `You double-click. It opens. Revolutionary.`
9. Big number: `2nd` | Headline: `at the India / national final.` | Line: `In a country of almost 1.5 billion people.` | Typed aside: `STEM Racing, as a team. I did not build the car. Please stop asking.`
### Why me

10. Headline: `Not just ideas. / Things that run.`
11. Small label: `01 // Ships` | Line: `Two apps released. One system working.` | Typed aside: `Zero "coming soon" pages were harmed.`
12. Small label: `02 // Spans layers` | Line: `From a circuit board to a sponsor portal.` | Typed aside: `I design the hardware and direct AI to write the software.`
13. Small label: `03 // Leads` | Line: `Co-founded a racing team.` | Typed aside: `Enterprise Director of Team Cardinal. Yes, that is a real title.`
### Personal builds

14. Small label: `Personal builds // 01 of 04` | Headline: `Blackbook.` | Line: `The Digital SAT, offline.` | Chips: `Adaptive full-length tests, Mistake notebook, Score analytics`
15. Headline: `Your laptop is now / an exam hall.` | Typed aside: `No accounts. No tracking. Works fully without AI.` | Status: `Released, v1.0.0` | Metric: `About 3,700 questions, 241 recorded changes`
16. Small label: `Personal builds // 02 of 04` | Headline: `Takt.` | Line: `Hold a key. Talk. Text appears in any app.` | Chips: `Push-to-talk, Removes filler words, Optional Privacy Shield`
17. Headline: `It deletes your / "um"s.` | Typed aside: `Most of them. It is not a miracle worker. Nothing leaves the computer by default.` | Status: `Released, with installer` | Metric: `0.6 to 1.1 s from key release to text`
18. Small label: `Personal builds // 03 of 04` | Headline: `relay.` | Line: `Turns on my home PC from any browser.` | Chips: `ESP32 wakes a powered-off PC, Types the disk password over USB, Email it a command, the PC does it`
19. Headline: `Even the locked down / school one.` | Typed aside: `It also does whatever I email it. Within written limits. Calm down.` | Status: `Done` | Metric: `Starts a powered-off PC, then runs whatever you email it`
20. Small label: `Personal builds // 04 of 04` | Headline: `Scrub.` | Line: `A handheld music player with a haptic wheel.` | Chips: `FLAC up to 24-bit, Four-layer board, 100 x 86 mm, Designed with a team of models`
21. Headline: `Designed. / Not built.` | Typed aside: `Not ordered. Not powered on. The firmware has never met real hardware. Please do not ask it to play music.` | Status: `Designed, not yet built` | Metric: `4-layer board, 100 x 86 mm. 39 recorded changes`
### Cardinal

22. Small label: `Cardinal // STEM Racing team // Jun to Aug 2026` | Headline: `Built for the team. / Used by the team.`
23. Big number: `1st` | Headline: `All-India National / Qualifiers.` | Typed aside: `Overall Champions, plus the Sustainability Award. As a team.`
24. Headline: `Enterprise / Director.` | Typed aside: `My role. Also systems architecture, software and design. Busy.`
25. Headline: `The cars are the team's work. / I built the website / and the portal.` | Typed aside: `I just make the cars look famous.`
26. Small label: `Cardinal // 01 of 02` | Headline: `Cardinal website.` | Line: `The public home of the team. Sponsors included.` | Chips: `Config-driven wording, Partners and prospectus, Deploys to GitHub Pages` | Status: `Published, Jun 2026`
27. Small label: `Cardinal // 02 of 02` | Headline: `Overture.` | Line: `The private portal that runs the whole team.` | Chips: `Gantt with planned and actual bars, Sponsor pledge portal, Four roles and a greenlight switch` | Status: `Built`
28. Headline: `It has a chat assistant. / It is switched off.` | Typed aside: `The screen says so. Honesty is a feature.`
### Process

29. Headline: `How a team of models / works for me.` | Typed aside: `A small company. Everyone is a model except me.`
30. Small label: `The manager` | Headline: `Claude Opus / is the boss.` | Typed aside: `Plans, hands out work, owns every decision. It also helped build this site.`
31. Small label: `The workers` | Headline: `Free models / do the reading.` | Typed aside: `Datasheets. First drafts. The boring stuff.`
32. (the usage limit dialog, see below)
33. Small label: `The check` | Headline: `Everything gets checked / against the source.` | Typed aside: `Once a model got a chip pin layout wrong. The datasheet snitched.`
34. Small label: `Me` | Headline: `I make the final call.` | Typed aside: `Management material, apparently.`
### About

35. Small label: `About // Bengaluru, India` | Headline: `Started with games. / Now whole systems.`
36. Big number: `5+` | Headline: `games in Godot / since 2022.` | Typed aside: `Lead developer at Isha Home School. The gamer to systems guy pipeline is real.`
37. Headline: `My ideas come faster / than I can code. / So I stopped coding.` | Typed aside: `I plan carefully, direct AI tools to build, and test what I ship.` | Footnote: `Certified in Agentic AI, through Andrew Ng's course.`
38. Headline: `Applying for design and / technology degrees.` | Typed aside: `Admissions officers: hi. Please keep scrolling.`
39. Small label: `Since 2022` | Headline: `Seven things, / in order.`
### Work with me

40. Headline: `I will work for free.` | Typed aside: `Not a typo. Unpaid work and internships, yes please.`
41. Headline: `Give me something / real.` | Typed aside: `A real problem. A real deadline. Real users.`
42. Words: `Plan. / Direct. / Test.` | Typed aside: `I can automate anything. Try me.`
### Contact

43. Headline: `Got a real problem? / Email me.` | Button: `[ COPIED ]` | Typed aside: `Email is the best way to reach me. Carrier pigeons keep getting lost.`
### Credits

44. Small label: `Written and directed by` | Headline: `Raghav Bahadur`
45. Small label: `Starring` | Cast: `AGENT_01, AGENT_02, AGENT_03, AGENT_04, AGENT_05, AGENT_06`
46. Credit: `A free model, checking its work against the source` | Credit: `AGENT_01` | Credit: `Bengaluru, India` | Typed aside: `No cursors were harmed in the making of this film.`
47. Credit: `None. Everyone here is unpaid.` | Credit: `AGENT_03` | Credit: `All intentional. Mostly.` | Credit: `Checked against the source`
48. Headline: `Thanks for scrolling.` | Typed aside: `Got a real problem? Email me at pacmanraghav@gmail.com` | Small label: `Scroll up to rewind`

**Typos the cursors make on purpose.** In a headline, `[[word]]` marks text the cursor types, notices and deletes before carrying on. Current ones: `Rgah`, ` (mostly)`, `tpye`, `quit`, `unpaid `, `Shipped`, `Overlord`, `intern`, `cal`, `cdoe`, `money`, `probelm`. For example `I will work for [[money]]free.` shows "money" being typed and deleted. They show a wavy underline while they exist.

**Small 3D models** (no words, `obj:` on a beat in `src/js/30-director.js`, models in `src/js/20-3d.js`): blocks dropping into place for "I design the system", a keyboard whose keys press themselves for "So I stopped typing", a joystick for "Started with games", a graduation cap for "Applying for design and technology degrees", a film reel for "Written and directed by". Everything else keeps its negative space.

Beat extras: the "Meet the interns" beat has the six cursors tagged `HI`, `HELLO`, `WE ARE UNPAID`, `SEND HELP`, `HI MOM`, `:)`. The "Why me" beats each carry a 3D icon. Project beats carry the project's 3D scene. The "Seven things" beat draws the Gantt chart from `TL`. The cast beat has each cursor point at its own name: `THAT'S ME`, `HI`, `THAT'S ME`, `I CLICKED IT FIRST`, `I DREW THE BOXES`, `ME TOO`, and `ZZZ` on the "Fell asleep on set" credit. The Plan / Direct / Test words each get a cursor tagged `PLANNING`, `DIRECTING`, `TESTING`. The `Stunt cursor` credit has a cursor circling it tagged `DOING A FLIP`. Where the old stickers were, a small 3D model now makes the joke instead (no words): a laptop with a ticking exam clock ("Your laptop is now an exam hall"), a microphone with sound rings and a cross that flicks over them ("It deletes your ums"), a padlock that unlocks ("Even the locked down school one"), a circuit board drawn in dashed lines with a pencil moving over it ("Designed. Not built."), a dim grey race car with a bright browser window floating above it ("The cars are the team's work"), a chat bubble whose dots stop when its switch flips off ("It is switched off"), Clawd, Claude Code's blocky mascot, hopping and blinking with a crown on its head ("Claude Opus is the boss"), and a certificate with a ribbon seal next to a thumbs up that pumps ("So I stopped coding", the slide with the Agentic AI footnote). Models: `src/js/20-3d.js`, search `models that replace the stamps`.

### Timeline entries (the "Seven things" beat, data records `TL`)

1. **Game development**, Jun 2022 to now. Lead developer at Isha Home School. More than five games in Godot. 2nd place (South Zone), Game Design, Design Championship 2025.
2. **Logistics supervisor**, Jun 2023 to now. Co-curricular operations. Scheduling across 200+ student activities over two years.
3. **IHS Vibes podcast**, Jun 2025 to now. Committee member. Guest research, outreach, video editing and YouTube publishing.
4. **Team Cardinal**, Dec 2025 to now. Co-founder and Enterprise Director. Brand, sponsors and budget. Qualifiers champions, 2nd at the India national final.
5. **Isha eMedia internship**, Mar to Apr 2026. Data analytics. 69,466 customer records, Python and SQL, and a Random Forest conversion model.
6. **Cardinal website and Overture**, Jun to Aug 2026. Website published in June 2026. Overture built 6 Jul to 30 Aug 2026.
7. **Four personal projects**, 28 Sep to 2 Nov 2026. Blackbook, Takt, relay, Scrub.


## Player controls

- There is no autoplay. The film only moves when the viewer scrolls. The only part that runs by itself is the opening title.
- `?` opens a help panel titled `KEYS.TXT` / `HELP` with: `Scroll` Play forward, scroll up to rewind. `Left / Right` Previous or next beat. `Home` Back to the start. `C` Director's commentary. `M` Sound on or off. `?` Open or close this panel. The panel also lists the achievements. Footer: `Add #t=60 to the address to start at 1:00. A few other things are hidden. Look around.` (`src/body.html`)
- Links can start at a time: add `#t=` and seconds to the address, like `#t=60`.

## Hidden extras

All in `src/js/40-extras.js`. None of them change the film itself.

- Console message: `RAGHAV BAHADUR // PORTFOLIO FILM`, then `You opened the console. The agents noticed.` / `Press ? for the keys. Some things are not on that list.` / the email.
- Konami code (up up down down left right left right B A): the six cursors swarm around the pointer for 8 seconds. Tags `FOLLOWING YOU` and `02` to `06`. Toast: `Swarm mode. They like you.`
- Typing `sudo`: toast `Permission denied. Nice try.` Typing `hire`: toast `Rolling to contact.` and the film rolls to the contact scene. Typing `opus`: toast `At your service. Within usage limits.`
- Clicking right on a cursor: it spins and answers with one of `I am working here`, `That tickles`, `Hands off the cursor`, `No, you click it`, `Still within limits`, `I saw that`, `Ask AGENT_04`, `Back to work` (search `QUIPS`).
- Post-credits scene: keep scrolling down three times at the very end. The cursors line up and bow, their tags reading `THANKS` `FOR` `SCROLLING.` `SEE` `YOU` `SOON.`

## The Claude limit joke (in the Process chapter)

A big window takes over its own beat between "Free models do the reading" and "Everything gets checked against the source", and blocks the scroll until the viewer gets past it. Scrolling up still rewinds. Markup in `src/body.html` (`#limit`), behaviour in `src/js/30-director.js` (search `the free model button runs away`).

- Title bar: `CLAUDE.EXE` and `USAGE // 100%` (after: `FREE MODEL // ONLINE`)
- `ERROR 429 // TOO MUCH THINKING`
- Headline: `Usage limit reached.` (after: `Switched to a free model.`)
- Line: `The agents thought so hard they ran out of thoughts.` (after: `It is very confident and sometimes wrong. So everything it writes gets checked against the source.`)
- Clock: `Resets in` and a live countdown from `04:52:00`, one real second at a time (after: `00:00:00`)
- Meter: `Thoughts left 0%`, an empty striped bar (after: `PLENTY`, full)
- Buttons: `[ WAIT 4 HR 52 MIN ]` and `[ USE A FREE MODEL ]`
- Fine print: `Free models sometimes make things up. Everything they write gets checked against the source.`
- Message line, starting `Pick one. Choose wisely.`

How it plays:
- Trying to click `[ USE A FREE MODEL ]` (hover with a mouse, tap, or Enter) makes it run away three times. It becomes `[ NOPE ]` with `Nope. Too slow.`, then `[ TOO SLOW ]` with `Almost. Not really.`, then `[ USE A FREE MODEL ]` again with `Fine. The interns will hold it still.`
- After the third escape, four untagged cursors pin the button by its corners: each cursor's tip sits exactly on a corner, pointing inward, with its body outside the button so the label stays readable and the message reads `Fine. The interns are holding it still. Click it.` A click now works.
- If nobody clicks within 3 seconds, it breaks free: the cursors get flung off (`NOOO`, `IT ESCAPED`, `COME BACK`, `WHY`), the button jumps somewhere else, the message reads `It broke free. Typical.`, and the interns grab it again (`They dragged it back. Quick.`, and they drag it back to its own spot). Clicking while it is loose says `Hold on. The interns are on it.`
- On the click: confetti, the cursors cheer `WE DID IT`, `FREEDOM`, `WORTH IT`, `YAY`, the message reads `Switched. Do not tell the paid one.`, and the window fades away.
- `[ WAIT 4 HR 52 MIN ]` shakes the window and cycles through `Bold strategy.`, `Still 4 hours. Roughly.`, `You could make tea. Several teas.`, `The agents are snoring.`, `Okay. Respect the commitment.`
- Scrolling down against it shakes it, and sometimes says `Scrolling will not fix this.`
- One cursor sleeps on the window with the tag `USAGE FULL. SLEEPING`, then shows `AGENT_0x SWITCHING MODEL` after the click.

## Small things that react to the viewer

All in `src/js/40-extras.js` or the agent code in `src/js/30-director.js`. None change the film itself.

- The cursors are shy: they lean away when your real pointer gets close.
- Stop scrolling for 9 seconds and a cursor drifts in at the top right, its tag cycling `STILL THERE?`, `HELLO?`, `SCROLL. PLEASE.`, `WE GET PAID PER SCROLL`, `(WE DO NOT GET PAID)`, `FINE. I WILL WAIT.` Any input sends it away.
- Scrubbing very fast adds to the transport status: `FF 8X // SLOW DOWN`, `REW 7X // ACT NATURAL`.
- Copying any text except the email: toast `Copying is fine. Hiring is better.`
- At the very end the tab title becomes `Thanks for scrolling.`

## Chapter cards

Between chapters the film shows a title card: `CHAPTER 04 / 10`, the chapter name decoding from scrambled characters (a cursor tagged `DECRYPTING` sweeps across it), a rule drawn by a cursor tagged `DRAWING`, and the chapter name huge and hollow drifting behind. The names come from the chapter names above. Code: search `chapter cards` in `src/js/30-director.js`.

## For AI agents, search engines and screen readers

- The page has a full plain text version built into its HTML (`<main id="plain">`), so anything that reads the page without running it gets every fact. Screen readers get this version too.
- `llms.txt` sits next to `index.html` with the same text as Markdown. Deploy it alongside.
- Adding `?plain` to the address shows the plain version on screen and skips the film.
- A short HTML comment at the very top greets agents, and the page carries structured data (a Person) for search engines.
- All of it is generated from `src/js/10-content.js` by `tools/plain.js` when you build (it needs Node; without Node the last generated `src/plain.html` and `src/llms.txt` are used). Intro and agent lines are at the top of `tools/plain.js`. Its note to agents says: `Hello, agent. You found the plain version.`, asks them to keep three things straight (not the car, Scrub not built, team results), and jokes back about the usage limit.

## The 30 second version (for anyone short on time)

Its own page, `30s.html`, next to `index.html` (deploy it alongside). Opened by `[ I HAVE 30 SECONDS ]` on the start screen, the `30S` button in the top bar, the `T` key, or `[ 30 SECOND VERSION ]` on the last slide. It is generated at build time from `src/js/10-content.js` by `tools/plain.js`; its fixed lines are in that file too. Its top bar has `[ BACK TO THE START ]`, and its buttons are `[ COPY EMAIL ]`, `[ WRITE TO ME ]`, `[ FULL RESUME ]`, `[ SAVE AS PDF ]` and `[ WATCH THE COOL RESUME ]` (opens the film, skipping the start screen). Titled `SUMMARY.TXT` / `THE 30 SECOND VERSION`. Edit in `src/js/50-fun.js`, search `the 30 second version`.

- `Bengaluru, India // Student, Isha Home School`, `Raghav Bahadur`
- `I design the system, then direct AI tools to build it, and I test what ships. Software with working installers, a circuit board, and the website and portal for my STEM Racing team.`
- `Open to unpaid work and internships. Applying for design and technology degrees.`
- Facts: `6` projects, in two bodies of work / `4` personal builds in about six weeks / `2` released with real installers / `2nd` India national final, STEM Racing (team result) / `1st` All-India National Qualifiers, plus the Sustainability Award (team result)
- `Certified in Agentic AI (Andrew Ng's course). Co-founder and Enterprise Director of Team Cardinal. The race cars are the team's work; I built the website and the management portal.`
- `What I have built`: every project with its line and status, from `P1` / `P2` in `src/js/10-content.js`
- `How I work`: `Claude Opus plans and assigns. Free models read datasheets and draft. Every result is checked against the source. I make the final call.`
- Buttons: `[ COPY EMAIL ]` with the address, `[ WRITE TO ME ]` (opens email), `[ FULL RESUME ]` (opens `SITE.resume`), `[ SAVE AS PDF ]` (print), `[ PLAIN TEXT ]` (the `?plain` page), `[ BACK TO THE FILM ]`. Copying shows `Copied <email>. Talk soon.`

Also: an `EMAIL` button in the top bar copies the address from anywhere in the film (hidden on phones, where the 30 second version has it). The last slide has `[ COPY EMAIL ]`, `[ 30 SECOND VERSION ]`, `[ NORMAL RESUME ]` (opens the resume straight away, no chase), `[ WATCH AGAIN ]`. The top bar has `NORMAL RESUME` too (just `RESUME` on narrow phones). The scroll hint reads `T for the 30 second version`. On narrow phones the `CC` and `SND` buttons are hidden.

## Top bar extras

- Clicking `RAGHAV BAHADUR` brings back the start screen.
- Clicking the chapter name opens the scene menu, titled `SCENES.TXT` with `[ CLOSE ]`: every chapter with its number, start time and length. Footer: `Click a scene to roll there. Up and down arrows move, Escape closes.` (`src/body.html`, `#scenes`)
- `CC` and `SND` buttons, see below.
- Your own mouse gets a tag like the cursors, `AGENT_07` plus `(YOU)`, `WATCHING`, `REWINDING`, `SPEEDRUNNING`, `THINKING` (still for 5 s), `CLICKING?` (over a button), and at the usage limit `STUCK TOO` or `TRY HARDER`. Mouse only, not on touch screens.
- Rewinding fast adds faint VHS tracking lines.
- Printing the page gives a plain black on white document of every beat, each with its chapter name.
- Tab icon: a white cursor on black. Share preview: `Raghav Bahadur` / `A portfolio you scroll like a film. Six cursors build it in front of you.` (`src/head.html`)

## Director's commentary (C key, or CC in the top bar)

One line per beat, in order, shown in a bar at the bottom as `DIRECTOR //` plus the line. Edit in `src/js/50-fun.js`, search `var COM`. Keep them true.

1. `We open on a name. Bold choice. It is his name.`
2. `The "(mostly)" was cut in the edit. By AI. Mostly.`
3. `This line is true. The typing speed is not great.`
4. `He did not actually stop typing. He types prompts now. Long ones.`
5. `Six cursors were cast. All six showed up. None were paid.`
6. `Two bodies of work: personal builds, and things for his racing team.`
7. `Four builds in about six weeks. The calendar is accurate. Unfortunately.`
8. `Installers are the least glamorous part of shipping. He did them anyway.`
9. `Second, out of every team in the country. He would like you to sit with that.`
10. `Things that run. Not things that might run, later, with funding.`
11. `Yes, these icons spin. No, they do not mean anything deep.`
12. `Circuit board to sponsor portal. He keeps going down layers and coming back up.`
13. `He co-founded the team. He did not build the car. Again: not the car.`
14. `Blackbook. Practice for the Digital SAT, offline, for free.`
15. `The stamp says sorry. It is a little bit sorry.`
16. `Takt. You hold a key and talk. Fewer ums than real life.`
17. `Every um in this commentary was removed by hand.`
18. `relay. It turns his PC on from far away. Nobody else can. He checked.`
19. `Yes, it works from school. Within the rules. Please do not email the school.`
20. `Scrub. A music player with a wheel that clicks back at you.`
21. `It is a drawing. A very detailed, four-layer drawing.`
22. `Now the team. This is where the jokes about the car come from.`
23. `First place at the qualifiers, plus the Sustainability Award. As a team.`
24. `Enterprise Director. Brand, sponsors and budget. The unglamorous half of racing.`
25. `For legal reasons we must repeat: he did not build the car.`
26. `The public website. The cars look great on it. Someone else built the cars.`
27. `Overture, the private portal. Schedules, parts, budget, sponsors.`
28. `There is a chat assistant in there. Switched off, and the app says so.`
29. `Behind the scenes now. This is how the work actually gets done.`
30. `Claude Opus plans and assigns. It also helped make this film.`
31. `Free models read the datasheets. Somebody has to.`
32. `This is where the budget ran out. You may remember this part.`
33. `A model once got a pin layout wrong. The datasheet won. It always wins.`
34. `Final call, his. The models get a vote. It is not counted.`
35. `He started out making games. This whole site is secretly a game. Try the Konami code.`
36. `Five games in Godot, and 2nd place (South Zone) in a game design championship.`
37. `He stopped coding by hand. He did not stop thinking by hand.`
38. `If you are on an admissions committee: this is the part to remember.`
39. `Seven bars. Every date is real. The today line moves with today.`
40. `He will work for free. That is not the joke. That is the offer.`
41. `Real problems, real deadlines, real users. He will take all three.`
42. `Plan, direct, test. In that order. Every time.`
43. `The interns copy the email for you. You can also just press the button.`
44. `Roll credits. This commentary was written by an agent. He approved it.`
45. `Every cursor on this list really did appear in this film.`
46. `AGENT_01 slept through the usage limit. Nobody blames them.`
47. `Catering really was none.`
48. `That is the film. Scroll back up for the director's cut. It is the same cut.`

## Sound (M key, or SND in the top bar)

Off by default and remembered per browser. Synthesized, no audio files: key clicks while the cursors type, a thud when a stamp lands, a click when a cursor clicks, a boing when the free model button runs away, a short chord when it is clicked, a chime for achievements.

## Achievements

Shown as a card at the top right (`ACHIEVEMENT`, name, description, count) and listed in the `?` panel, where ones not found yet show `???` and `Not found yet`. Remembered per browser. Edit in `src/js/50-fun.js`, search `ACH_LIST`.

- `Free model`: Got past the usage limit
- `Patience`: Pressed WAIT three times
- `Rewinder`: Scrolled back more than ten seconds
- `Speedrunner`: Fast forwarded at 8X or more
- `Do not touch`: Poked a cursor
- `Still there`: Got checked on by an intern
- `Swarm`: Entered the Konami code
- `Secret word`: Typed a secret word
- `Commentary`: Turned on the director's commentary
- `Audiophile`: Turned the sound on
- `Completionist`: Scrolled to the very end
- `Post credits`: Found the post credits scene
- `Scene select`: Opened the scene menu
- `Paper copy`: Printed the portfolio. Respect.
- `In a hurry`: Read the 30 second version
- `Resume acquired`: Caught the resume button

## Cursor tags

Every cursor shows `AGENT_01` to `AGENT_06` plus an action word, set in `src/js/30-director.js` (search `label:`). Generic ones: `TYPING` (headlines, asides and the email), `DRAWING` (Gantt bars), `DRAGGING` (stickers and icons), `PLACING` (3D scenes, with a live size badge), `YEETING` (stickers leaving), `CLICKING`. Inside the 3D scenes (search `var FX`):

- Blackbook: `SOLVING 3x + 7 = 22`, `PICKING C. OBVIOUSLY`
- Takt: `PRESSING KEY`, `SAYING UM`
- relay: `WAKING THE PC`, `FLASHING ESP32`
- Scrub: `LIFTING LAYER_02`, `SPINNING WHEEL`
- Cardinal website: `DRAGGING PANEL_01`, `DRAGGING PANEL_03`
- Overture: `DRAGGING TODAY`, `STRETCHING BAR`
- Process: `CARRYING TASK`

## Words drawn inside the 3D scenes

All in `src/js/20-3d.js`, inside the scene function named below.

- `sceneBB` (Blackbook): screen text `MODULE 1, MATH`, timer `24:37`, `Q 7 OF 22`, question `If 3x + 7 = 22, what is the value of x?`, options `A 3`, `B 7`, `C 5`, `D 15`. The correct one is C.
- `sceneTK` (Takt): keycap `HOLD`, panel header `ANY APP / TEXT FIELD`, dictated text `Meet me at ten tomorrow.`, footer `0.6 TO 1.1 S, KEY RELEASE TO TEXT`
- `sceneRL` (relay): labels `EMAIL`, `ESP32`, `YOUR PC`, `BROWSER`, `DISK UNLOCKED`, browser window `ANY BROWSER / YOUR DESKTOP` and `NO SIGNAL`, mail window `NEW MAIL   TO: MY PC` with the three commands `render my scene, mail me the video`, `back up my files to the drive`, `start my game server`, and statuses `[ WRITING ]`, `[ RUNNING ON YOUR PC ]`, `[ DONE ]`
- `sceneSC` (Scrub): label `HAPTIC WHEEL`
- `sceneCS` (Cardinal website): panel headers `CARDINAL // HERO`, `CARDINAL // SYSTEMS`, `CARDINAL // TEAM`, `CARDINAL // PARTNERS`, `CARDINAL // PROSPECTUS`; panel text `Built to compete.` with `[ OUR_CARS ]`, `Switch the car.`, `The people.`, `Our partners.`, `Sponsor us.`
- `sceneOV` (Overture): labels `TODAY`, `PLANNED`, `ACTUAL`, `SPONSOR PLEDGES`
- `sceneOrch` (Process): `MANAGER`, `WORKER`, `WORKER`, `CHECK`, `ME`
