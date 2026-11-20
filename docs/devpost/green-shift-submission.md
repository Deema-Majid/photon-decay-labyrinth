# Green Shift Hacks — submission draft

> **ملاحظة لديما (لا تُنسخ في Devpost):** هذا نص جاهز للنسخ في صفحة المشروع على Devpost. عدّلي أي جملة لا تعبّر عنك، واكتبي اسمك الكامل في قسم الفريق. آخر موعد: **11 ديسمبر الساعة 1:00 فجرًا بتوقيت السعودية**. قسم «AI use» صادق عن استخدام أداة الذكاء الاصطناعي في البناء، والحكام قد يسألونك عن تفاصيل المشروع، فراجعي ملف الـ PDF قبل التقديم.

---

## Project name
**Photon Decay Labyrinth** (متاهة الذاكرة الضوئية)

## Tagline (short pitch)
A cinematic 3D light puzzle that teaches why dirty solar panels waste energy, then turns that lesson into a calculator that tells you when to clean a real panel and how much energy and CO₂ it saves.

## Links
- **Play in the browser:** https://deema-majid.github.io/photon-decay-labyrinth/
- **Source code (public):** https://github.com/Deema-Majid/photon-decay-labyrinth
- **Project dossier (PDF):** in the repository at `docs/Photon-Decay-Labyrinth.pdf`

---

## Inspiration
Solar is one of the fastest ways to cut emissions in sunny countries like Saudi Arabia, but panels in deserts, on coasts and in cities get coated in dust, salt and soot. Field measurements in Saudi Arabia show this soiling costs a few percent of output every month, sometimes much more in dusty seasons. The fix is cheap and simple (clean at the right time, with little water), yet most people who own or use a rooftop system never think about it. I wanted to make that invisible loss something you can see, feel and act on.

## What it does
**1. The game.** You dive inside a dirty silicon solar cell and guide a photon beam to the receivers that generate power. Prisms reflect the beam; you rotate them. Each obstacle needs the right kind of light, which mirrors real physics:
- **Infrared** vaporizes desert dust clouds.
- **Ultraviolet** shatters coastal salt crystals.
- **Visible light** is the only band that charges receivers.

There are three cells, matching the three soiling environments: the **Desert Crust** (Rub al Khali dust), the **Saline Barrier** (coastal salt spray) and the **Urban Smog** (industrial soot). As you clean a cell, the whole scene recovers: the fog clears, the music opens up, and a clean-energy city rises in the background.

**2. The practical layer: Panel Care Calculator.** From the main menu or the finale you can apply what you learned to a real system at home or school. Choose the environment (desert, coast, city), the system size and the days since the last cleaning. The calculator estimates:
- the output lost right now (%),
- the energy lost since the last cleaning (kWh) and the matching grid CO₂,
- how much energy and CO₂ you save over the next 30 days by cleaning today,
- when to clean and a suggested cleaning interval.

It also gives safe, low-water cleaning tips, and every number is labelled as an estimate with its source.

**Example (from the calculator):** a 5 kWp home system in a dusty inland area, 14 days after cleaning, is losing about **4.2 %** of its output. Cleaning today recovers about **32.6 kWh** over the next 30 days, roughly **22.5 kg of CO₂** from the Saudi grid. A 50 kWp school roof in the same conditions would recover about ten times that.

## Intended users
- **Students and families** with (or thinking about) rooftop solar, who learn through play first and then use the calculator.
- **Schools** with solar installations, as a short lesson on light, energy and maintenance.
- Arabic and English speakers: the whole experience is fully bilingual and works on phones.

## Expected environmental benefit
The behavior we target is **cleaning solar panels at the right time instead of never (or too often)**:
- Cleaning when the loss reaches a set threshold recovers energy that would otherwise be lost, and every recovered kWh displaces grid electricity (about 0.69 kg CO₂ per kWh in Saudi Arabia in 2024).
- Recommending a **cleaning interval** rather than "clean as often as possible" avoids wasting water, which matters in arid regions.
- The game builds the understanding (different contaminants, different effects, the panel recovering) that makes people more likely to follow through.

## How I built it
- **3D and rendering:** Three.js through React Three Fiber, with drei and postprocessing: refractive glass prisms and crystals, a reflective floor, volumetric light, god rays, filmic ACES tone mapping and a custom color grade.
- **Game logic:** a grid beam tracer (reflection, wavelength conversion, blocking) and a breadth-first **solver** that finds the shortest solution from the player's current board. "Lumen", the in-game assistant, uses it to suggest only the next move.
- **Calculator:** a small, tested TypeScript module using published averages (sources below), with sanity checks in `scripts/soiling-check.ts`.
- **App:** React 19, TypeScript, Zustand for state, Tailwind for the UI, Web Audio for a generated soundtrack (no audio files), local player profiles, achievements and a photo mode.
- **Delivery:** Vite build deployed automatically to GitHub Pages with GitHub Actions. Everything runs in the browser; no player data leaves the device.

## Challenges I ran into
- **Brief black screens during play** on an integrated GPU. I traced them by measurement to two causes: a shadow component leaking GPU textures every time the board changed, and every lit shader recompiling whenever an obstacle's light disappeared (one frame took 19.7 s in testing). After the fix, texture count stays flat and the worst frame is about 65 ms.
- **Phones:** the board disappeared into the fog in portrait mode. The camera now turns to look along the board on tall screens and thins the fog with distance.
- **Honest numbers:** soiling rates vary a lot between studies and seasons, so the calculator uses conservative defaults, shows the published range, and lets the player change the rate.

## Accomplishments I'm proud of
- A game that teaches real physics (different wavelengths carry different energy) without a single paragraph of lecture.
- A solver-powered hint system that was tested by solving all three cells using hints alone.
- A fully bilingual (Arabic/English) experience with mobile support, saved progress and achievements.
- A practical calculator that connects the game to a real action with measurable energy and CO₂ outcomes.

## What I learned
How light interacts with surfaces and why panels lose output when soiled, how to profile and fix GPU problems by measuring instead of guessing, how to design for right-to-left and left-to-right languages at the same time, and how to present estimates honestly with sources and limits.

## Limitations
- The calculator gives **estimates**: it uses the Saudi national average solar yield, a linear soiling model with a 30 % cap, and published soiling ranges that vary by site and season. Real systems should be checked against their inverter readings.
- The **urban soot** preset is an assumption: I did not find a published Saudi measurement for that setting.
- The finale's "impact" numbers inside the game are illustrative storytelling, not measurements; the calculator is where the real estimates live.
- Tested on desktop (Intel Iris Xe) and with mobile emulation; not yet on a wide range of physical phones.

## Data sources
- Global Solar Atlas, Saudi Arabia average PV output: 5.17 kWh/kWp per day.
- Ember (2024), Saudi Arabia grid emission factor: 0.692 kg CO₂/kWh.
- K.A.CARE three-year soiling campaign at Rumah: soiling loss of 3–10 % per month.
- Rabigh 30-day study: soiling losses of 2–18 % across PV technologies.
- Reviews of Saudi and Qatari sites reporting 0.5–1 % per day in dusty conditions.

## What's next
- Let users enter their inverter's real daily output to calibrate the soiling rate for their own roof.
- A classroom mode that pairs each cell with a short lesson on solar energy and light.
- More cells and a daily challenge generated and verified by the same solver.

## Built with
`three.js` · `react-three-fiber` · `drei` · `postprocessing` · `react` · `typescript` · `zustand` · `tailwindcss` · `vite` · `web-audio` · `github-pages` · `github-actions`

## AI use
> **ملاحظة لديما:** اكتبي اسم أداة الذكاء الاصطناعي التي استخدمتِها مكان [AI tool] عند التقديم في Devpost. الإفصاح الصادق يحمي مشاركتك إذا سأل الحكام.

I built this project with an AI coding assistant ([AI tool]) that wrote most of the code from my direction. I chose the idea and theme, set the requirements, tested the game, reported problems such as the black screens, and decided on the features and the hackathon framing. All design and technical decisions are documented in the repository's `docs/` folder and in the PDF dossier.

## Pre-existing work
None. Development started on November 16, 2026, inside the event period. Open-source libraries are credited above; fonts are Tajawal and Orbitron from Google Fonts.

## Team
- [اكتبي اسمك الكامل هنا]

---

## Demo video script (2–3 minutes)

| Time | On screen | Voice-over |
|---|---|---|
| 0:00–0:15 | Title screen, sun shot over the dusty solar farm | "In Saudi Arabia, dust, salt and soot quietly steal energy from solar panels every day. This is Photon Decay Labyrinth." |
| 0:15–0:30 | Press Start, the dive into the cell | "You dive inside a dirty solar cell, and your job is to get light back to where it makes power." |
| 0:30–1:10 | Cell 1: rotate prisms, switch to infrared, dust burns, switch to visible, receiver locks | "Prisms redirect the beam. Desert dust only clears with infrared, and receivers only charge with visible light. Different light, different energy, just like real physics." |
| 1:10–1:35 | Cell 2 quick montage: ultraviolet shatters salt, a ring changes the beam color; press Hint to show the glowing prism | "Coastal salt needs ultraviolet. If you get stuck, Lumen solves the puzzle from where you are and shows only the next step." |
| 1:35–1:50 | Finale: the city rises | "As you clean, the whole world recovers." |
| 1:50–2:35 | Panel Care Calculator: pick Desert dust, 5 kWp, 14 days, show results; switch to Coastal salt, 30 days | "Then you apply it to a real panel. A typical home system two weeks after cleaning is losing about four percent. Cleaning today saves around 33 kilowatt hours this month, about 22 kilograms of CO₂, and the calculator tells you when to clean next, without wasting water." |
| 2:35–2:50 | Language switch to Arabic; phone view | "It's fully bilingual and works on phones." |
| 2:50–3:00 | Live link and GitHub on screen | "Play it free in your browser at the link below." |

**Recording tips:** record in a full browser window on Cinematic quality, use Windows + Alt + R (Xbox Game Bar) or OBS, and upload to YouTube as Unlisted.

## Screenshot checklist for the Devpost gallery
- `docs/report/img/intro-sun.jpg` — title shot
- `docs/report/img/level1-ir.jpg` — infrared burning dust
- `docs/report/img/level3-hint.jpg` — hint beacon in the urban cell
- `docs/report/img/photo-mode.jpg` — photo mode
- `docs/report/img/mobile.jpg` — phone
- `docs/devpost/calculator-inputs.jpg` and `docs/devpost/calculator-results.jpg` — calculator
