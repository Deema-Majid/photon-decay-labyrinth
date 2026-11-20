## Inspiration
Solar is one of the fastest ways to cut emissions in sunny countries like Saudi Arabia, but panels in deserts, on coasts and in cities get coated in dust, salt and soot. Field measurements in Saudi Arabia show this soiling costs a few percent of output every month, and much more in dusty seasons. The fix is cheap and simple: clean at the right time, with little water. Yet most people who own or use a rooftop system never think about it. I wanted to make that invisible loss something you can **see, feel and act on**.

## What it does
**1. The game.** You dive inside a dirty silicon solar cell and guide a photon beam to the receivers that generate power. Prisms reflect the beam and you rotate them. Each obstacle needs the right kind of light, which mirrors real physics:

- **Infrared** vaporizes desert dust clouds.
- **Ultraviolet** shatters coastal salt crystals.
- **Visible light** is the only band that charges the receivers.

There are three cells, one for each soiling environment: the **Desert Crust** (Rub al Khali dust), the **Saline Barrier** (coastal salt spray) and the **Urban Smog** (industrial soot). As you clean a cell, the whole scene recovers: the fog clears, the music opens up, and a clean-energy city rises in the background. If you get stuck, the in-game assistant **Lumen** solves the puzzle from your current position and shows only the next step.

**2. The practical layer: the Panel Care Calculator.** From the main menu or the finale, you can apply what you learned to a real system at home or at school. Choose the environment (desert, coast or city), the system size and the days since the last cleaning. The calculator estimates:

- the output lost right now (%),
- the energy lost since the last cleaning (kWh) and the matching grid CO₂,
- how much energy and CO₂ you save over the next 30 days by cleaning today,
- when to clean, and a suggested cleaning interval.

It also gives safe, low-water cleaning tips, and every number is labelled as an estimate with its source.

> **Example:** a 5 kWp home system in a dusty inland area, 14 days after cleaning, is losing about **4.2 %** of its output. Cleaning today recovers about **32.6 kWh** over the next 30 days, roughly **22.5 kg of CO₂** from the Saudi grid. A 50 kWp school roof would recover about ten times that.

The core of the estimate is a simple linear soiling model, capped at 30 %:

$$\text{loss}(\%) = \min(r \times d,\ 30) \qquad \text{energy lost per day} = P \times Y \times \frac{\text{loss}}{100}$$

where \\( r \\) is the soiling rate (% per day), \\( d \\) the days since cleaning, \\( P \\) the system size in kWp and \\( Y = 5.17 \\) kWh/kWp/day, the Saudi average PV yield.

## Who it is for
- **Students and families** with rooftop solar (or thinking about it), who learn through play first and then use the calculator.
- **Schools** with solar installations, as a short lesson on light, energy and maintenance.
- **Arabic and English speakers:** the whole experience is fully bilingual and works on phones.

## Environmental impact
The behavior we target is **cleaning solar panels at the right time, instead of never or too often**:

- Cleaning when the loss reaches a threshold recovers energy that would otherwise be lost, and every recovered kWh displaces grid electricity (about 0.69 kg CO₂ per kWh in Saudi Arabia in 2024).
- Recommending a **cleaning interval** rather than "clean as often as possible" avoids wasting water, which matters in arid regions.
- The game builds the understanding (different contaminants, different effects, the panel recovering) that makes people more likely to follow through.

## How I built it
- **3D and rendering:** Three.js through React Three Fiber, with drei and postprocessing: refractive glass prisms and crystals, a reflective floor, volumetric light, god rays, ACES filmic tone mapping and a custom color grade.
- **Game logic:** a grid beam tracer (reflection, wavelength conversion, blocking) and a breadth-first **solver** that finds the shortest solution from the player's current board. Lumen uses it to suggest only the next move.
- **Calculator:** a small, tested TypeScript module that uses published averages (sources below), with sanity checks in `scripts/soiling-check.ts`.
- **App:** React 19, TypeScript, Zustand for state, Tailwind for the UI, Web Audio for a generated soundtrack (no audio files), local player profiles, achievements and a photo mode.
- **Delivery:** a Vite build deployed automatically to GitHub Pages with GitHub Actions. Everything runs in the browser, and no player data leaves the device.

## Challenges I ran into
- **Brief black screens during play** on an integrated GPU. I traced them by measurement to two causes: a shadow component that leaked GPU textures every time the board changed, and every lit shader recompiling whenever an obstacle's light disappeared (one frame took 19.7 s in testing). After the fix, the texture count stays flat and the worst frame is about 65 ms.
- **Phones:** the board disappeared into the fog in portrait mode. The camera now turns to look along the board on tall screens and thins the fog with distance.
- **Honest numbers:** soiling rates vary a lot between studies and seasons, so the calculator uses conservative defaults, shows the published range and lets the player change the rate.

## Accomplishments I'm proud of
- A game that teaches real physics (different wavelengths carry different energy) without a single paragraph of lecture.
- A solver-powered hint system, tested by solving all three cells using hints alone.
- A fully bilingual (Arabic and English) experience with mobile support, saved progress and achievements.
- A practical calculator that connects the game to a real action with measurable energy and CO₂ outcomes.

## What I learned
How light interacts with surfaces and why panels lose output when soiled; how to profile and fix GPU problems by measuring instead of guessing; how to design for right-to-left and left-to-right languages at the same time; and how to present estimates honestly, with sources and limits.

## Limitations
- The calculator gives **estimates**. It uses the Saudi national average solar yield, a linear soiling model with a 30 % cap, and published soiling ranges that vary by site and season. Real systems should be checked against their inverter readings.
- The **urban soot** preset is an assumption: I did not find a published Saudi measurement for that setting.
- The "impact" numbers in the game's finale are illustrative storytelling, not measurements. The calculator is where the real estimates live.
- Tested on desktop (Intel Iris Xe) and with mobile emulation, not yet on a wide range of physical phones.

## Data sources
- Global Solar Atlas, Saudi Arabia average PV output: 5.17 kWh/kWp per day.
- Ember (2024), Saudi Arabia grid emission factor: 0.692 kg CO₂/kWh.
- K.A.CARE three-year soiling campaign at Rumah: soiling loss of 3–10 % per month.
- Rabigh 30-day study: soiling losses of 2–18 % across PV technologies.
- Reviews of Saudi and Qatari sites reporting 0.5–1 % per day in dusty conditions.

## What's next
- Let users enter their inverter's real daily output to calibrate the soiling rate for their own roof.
- A classroom mode that pairs each cell with a short lesson on solar energy and light.
- More cells, and a daily challenge generated and verified by the same solver.

## AI use
I built this project with an AI coding assistant ([AI tool]) that wrote most of the code from my direction. I chose the idea and theme, set the requirements, tested the game, reported problems such as the black screens, and decided on the features and the hackathon framing. The design and technical decisions are documented in the repository's `docs/` folder and in the project dossier (PDF).

## Pre-existing work
None. Development started on November 16, 2026, inside the event period. Open-source libraries are listed under "Built with"; the fonts are Tajawal and Orbitron from Google Fonts.

## Links
- **Play in the browser:** https://deema-majid.github.io/photon-decay-labyrinth/
- **Source code:** https://github.com/Deema-Majid/photon-decay-labyrinth
- **Project dossier (PDF):** https://deema-majid.github.io/photon-decay-labyrinth/Photon-Decay-Labyrinth-EN.pdf
