# Solarist Dashboard — Step-by-Step Build Prompts

Your master prompt is complete but it's written as one giant spec. Feeding a huge spec to a coding assistant in one shot usually produces a bloated first draft with skipped pieces. Below is the same spec broken into **11 sequential prompts**, ordered so each one produces a working, runnable app before the next adds complexity — matching (and expanding) the Phase 1–9 plan already in your Section 35.

**How to use this:** Paste each prompt into your coding assistant (Claude Code, Cursor, etc.) one at a time, in order. Run the app after each step before moving to the next. Don't paste multiple prompts at once.

---

## Prompt 1 — Project Scaffold

```
Set up a new Vite + React project for a dashboard called "Solarist" (Smart Energy Intelligence — a solar IoT monitoring product).

Requirements:
- React + Vite, JavaScript (not TypeScript)
- Install: react-router-dom, chart.js, react-chartjs-2, firebase, lucide-react
- Create this folder structure under src/ (empty placeholder files are fine for now):

src/
  components/
  pages/
  services/
  config/
  hooks/
  styles/
  App.jsx
  main.jsx

- Set up a global stylesheet with CSS variables for:
  - a light neutral background (not pure white)
  - white card surface color
  - subtle border color
  - soft shadow value
  - border-radius scale (14px, 20px)
  - color tokens: solar blue, energy green, warning amber, error red, neutral gray shades
  - a modern sans-serif font stack

- Set up React Router in App.jsx with placeholder routes for: Overview, Performance, Monitoring, Optimization, Settings — each rendering a simple "Page: X" placeholder for now.

Do not build any dashboard UI yet. This step is only the scaffold. Confirm the app runs with `npm run dev` before finishing.
```

---

## Prompt 2 — Header & Navigation Shell

```
Build the header/navigation for the Solarist dashboard (the scaffold from the previous step already exists — extend it, don't recreate it).

Header requirements:
- Left: an original CSS/SVG solar-energy logo mark (do not use an image file) + product name "Solarist" + small secondary label "Energy Intelligence"
- Center: pill-style navigation with 4 items — Overview, Performance, Monitoring, Optimization — using React Router NavLink so the active route gets a highlighted pill state
- Right: notification bell icon (lucide-react), a system status indicator dot, and a user/settings icon that links to the Settings page
- Style it like a modern SaaS dashboard header: white surface, subtle bottom border, comfortable horizontal padding, sticky to top

Make this a reusable `Header` component in src/components/Header/, imported once in App.jsx above the routed page content.

Verify it renders correctly and navigation switches the active pill on click.
```

---

## Prompt 3 — Reusable Primitive Components

```
Before building full pages, create the reusable low-level components every page will share. Put each in its own folder under src/components/:

1. MetricCard — props: icon, label, value, unit, trend (e.g. "+2.4%"), trendDirection ("up"/"down"/"neutral"). Shows icon + label on top, large bold value, small trend indicator below (green for up, red for down unless the metric is inverted-good like temperature).

2. ChartCard — props: title, subtitle, children (the chart), and an optional array of range-toggle buttons (e.g. ["Today","7 Days","30 Days"]) with an onChange callback and an active state.

3. StatusBadge — props: status text, and a variant ("success"/"warning"/"error"/"neutral") that controls dot color + text color. Used for things like "System Active", "Online", "Charging".

4. ProgressBar — props: label, percentage, color. A horizontal bar with rounded ends and a label + percentage shown above or beside it.

5. SectionHeader — props: title, optional subtitle/action button on the right.

Style all five using the CSS variables from Prompt 1 (card surface, subtle border, soft shadow, border-radius). Keep them dependency-free besides lucide-react for icons.

Do not wire these into any page yet — just make sure each renders correctly in isolation (temporarily drop one of each onto the Overview placeholder page to sanity-check, then remove that test code).
```

---

## Prompt 4 — Overview Page (Mock Data)

```
Build the full Overview page using the MetricCard, ChartCard, StatusBadge, ProgressBar, and SectionHeader components from the previous step. Use realistic hardcoded mock data for now — no Firebase yet. Structure the mock data as a single object at the top of the page so it's easy to swap for live data later (shape it like the Firebase structure below, even though it's still local):

const mockData = {
  sensors: { voltage: 12.4, current: 1.25, temperature: 29.5, humidity: 62 },
  energy: { solarPower: 15.5, batteryLevel: 78, activeSource: "SOLAR" },
  system: { relayStatus: "OFF", status: "Online", lastUpdate: "10 seconds ago" }
}

Sections to build, in this layout order:

1. Hero card (large, left column): "Solar Energy System" title, StatusBadge "System Active", large "Current Solar Power" value (15.5 W), voltage + current below it, a simple CSS-based solar panel illustration/icon (no image files), plus Today's Energy / Current Source / System Efficiency as smaller stats.

2. Energy Production card (right of hero, chart-weighted): headline "Today's Solar Generation" (15.5 kWh), "Updated just now" subtitle, and an interactive Chart.js line/area chart with two series (Solar Generation, Energy Consumption) and range toggle buttons (Today/7 Days/30 Days, default Today). Use mock time-series data.

3. Sensor Overview row: four MetricCards — Solar Voltage, Solar Current, Temperature, Humidity — each with a small mock trend percentage.

4. Energy Source card: shows active source (SOLAR/BATTERY/GRID/BACKUP) with an icon, one line of description text, and Relay Status.

5. Battery Status card: large percentage, charging/discharging StatusBadge, voltage, and source — with a ProgressBar for the percentage.

6. Energy Consumption card: three ProgressBars — Solar Contribution, Battery Contribution, Grid Contribution — summing to 100%.

Arrange these in a responsive CSS grid roughly matching: hero + production chart on top, then a 3-column row (sensor grid / energy source / battery), then consumption below. Use the layout as a guide, not a rigid pixel spec — prioritize a clean, balanced composition.

Confirm the page renders correctly with mock data and no console errors.
```

---

## Prompt 5 — Performance Page

```
Build the Performance page.

Include:
1. A ChartCard titled "Energy Performance" with a multi-line Chart.js chart showing three series: Solar Power, Load Consumption, Battery Usage. Add range toggle buttons: Today / This Week / This Month (default Today). Use mock time-series data shaped so it's easy to later replace with Firebase history data.

2. A second ChartCard titled "Environmental Conditions" showing Temperature and Humidity. Use a dual-axis chart (temperature on one axis, humidity on the other) since their scales differ — do not force them onto a single shared axis.

Both charts should be clean and minimal: light gridlines, smooth line curves, clear axis labels, no excessive decoration, responsive width.

Confirm both charts render and the range toggles visibly change the displayed mock data (can be simple mock variations, doesn't need to be statistically meaningful yet).
```

---

## Prompt 6 — Monitoring Page

```
Build the Monitoring page. This page focuses on raw sensor/device state rather than energy trends.

Include:
1. The four sensor MetricCards (Solar Voltage, Solar Current, Temperature, Humidity) — reuse the component from Prompt 3, can share a mock-data hook with the Overview page rather than duplicating values.
2. A System Status panel: Device Status, Firebase (Connected/Disconnected), Wi-Fi (Connected/Disconnected), Sensor Status (Normal/Warning/Error), Last Update (e.g. "10 seconds ago") — each row with a StatusBadge.
3. An Alerts/Notifications list: a simple stacked list of alert items (icon + message + timestamp), covering example types like "High temperature detected", "Solar output below threshold", "Battery low", "Energy source switched", "Device offline". Use 2–3 mock alerts for now, not all of them permanently — this list should later be driven by real Firebase data, so structure it as a mapped array, not hardcoded JSX blocks.

Confirm the page renders and the alert list maps over an array (not copy-pasted JSX per alert).
```

---

## Prompt 7 — Optimization Page

```
Build the Optimization page — this is the section that proves the project does energy optimization, not just monitoring, so give it real visual weight.

Include:
1. Optimization Status card: current status (Optimizing / Solar Preferred / Battery Backup / Grid Backup / Normal) shown as a prominent StatusBadge, plus a "Current Decision" text block explaining the current logic in plain language (e.g. "Solar power is sufficient. Load is currently running from solar energy.").
2. Relay Status: ON/OFF indicator, styled clearly (not buried in small text).
3. "Last Switching Event" line: e.g. "Solar → Battery, 10:42 AM".
4. Energy Source History table/timeline below it, with columns: Time, Previous Source, New Source, Reason, Status. Populate with 4–5 mock rows. Build this as a mapped table over an array of event objects, not hardcoded rows, so it's ready for real Firebase history data later.

Confirm the page renders, the table maps over mock event data, and the status/relay indicators use the StatusBadge component consistently with the rest of the app.
```

---

## Prompt 8 — Settings Page

```
Build the Settings page.

Include two sections:

1. System Settings (form-style, not yet wired to save anywhere real — local component state is fine for now):
   - Solar voltage threshold (number input)
   - Battery low threshold (number input, %)
   - Battery full threshold (number input, %)
   - Temperature warning threshold (number input, °C)
   - Auto optimization toggle (ON/OFF switch)

2. Display Settings:
   - Refresh interval (dropdown: 5s / 10s / 30s / 60s)
   - Default chart time range (dropdown: Today / 7 Days / 30 Days)

Use clean form styling consistent with the card design system (labels above inputs, comfortable spacing, a "Save" button that for now just shows a brief success toast/message — no backend write yet). Do not implement any hardware-control actions here, only these configuration values.

Confirm the form renders, inputs are controlled by React state, and the toggle/dropdowns work.
```

---

## Prompt 9 — Firebase Integration Layer

```
Now wire up Firebase. Do NOT touch any page UI in this step — only build the data layer.

1. Create src/config/firebase.js — Firebase app initialization using a config object imported from environment variables (do not hardcode keys). Add a .env.example file listing the required VITE_FIREBASE_* variable names.

2. Create src/services/firebaseService.js — functions to read from these Realtime Database paths using onValue listeners (not one-time gets, and not polling):
   solarSystem/sensors/{voltage,current,temperature,humidity}
   solarSystem/energy/{solarPower,batteryLevel,activeSource}
   solarSystem/system/{relayStatus,status,lastUpdate}
   solarSystem/history/

   Each exported function should take a callback and return an unsubscribe function for cleanup.

3. Create src/hooks/useFirebaseData.js — a custom hook that subscribes to the above paths, holds the combined state, and returns { data, loading, error }. It must properly unsubscribe all listeners on unmount (no listener leaks).

Do not connect this to any page yet — that's the next step. Just confirm the hook compiles and, if you have a real Firebase project handy, logs live values to the console when data changes. If no Firebase project is connected yet, that's fine — leave it ready to receive config.
```

---

## Prompt 10 — Connect Pages to Live Data + Loading/Error/Offline States

```
Replace the mock data in the Overview, Performance, Monitoring, and Optimization pages with the useFirebaseData hook from the previous step. Do this page by page, and after each page confirm it still renders without crashing even with no Firebase data present.

For every Firebase-dependent section, handle these four states distinctly:
- Loading: show "Loading system data..."
- No data yet: show "--" for the value and a "Waiting for device data" message — do not fabricate a live-looking number
- Offline (system/status !== "Online"): show a clear "Device Offline" indicator
- Firebase connection error: show "Unable to connect to Firebase"

A missing single value (e.g. humidity not yet written to the DB) must never crash the page — guard every render with optional chaining / fallback values.

Keep the Settings page on local state only (it doesn't need this treatment yet unless you choose to persist thresholds to Firebase — if you do, write to solarSystem/settings/ and note that clearly in the code comments).

Confirm the full app runs cleanly both with an empty/disconnected Firebase database and with sample data manually added to the Realtime Database console.
```

---

## Prompt 11 — Responsive Pass + Final Polish

```
Do a full responsive and polish pass across every page built so far.

Responsive requirements:
- Test/adjust layouts at 1920px, 1440px, 1024px, 768px, 430px, 375px
- Desktop: multi-column dashboard, large charts
- Tablet (~768px): collapse to two columns
- Mobile (~430px and below): single column, cards stack, navigation becomes horizontally scrollable or collapses into a menu, charts stay readable (don't let them overflow horizontally), no horizontal page scroll anywhere

Polish pass — go through this checklist and fix anything failing:
- [ ] No generated/static images used anywhere in the dashboard UI
- [ ] All values are dynamic (from Firebase or clearly-marked mock state), nothing hardcoded inside JSX in the connected pages
- [ ] Firebase listeners are cleaned up on unmount (check with React StrictMode double-mount)
- [ ] Navigation works on every page, active state is correct
- [ ] Loading / no-data / offline / error states all visibly work (temporarily disconnect Firebase to test)
- [ ] No Firebase private/admin credentials anywhere in frontend code
- [ ] Color usage is restrained and semantic (not a rainbow of card colors)
- [ ] Typography hierarchy is consistent across all pages (same heading/value/label sizes reused, not ad-hoc per page)
- [ ] No component duplicates large blocks of near-identical JSX (extract to a shared component if it does)

Fix any issues found, then confirm `npm run build` completes with no errors.
```

---

## Notes on this ordering

- **Prompts 1–3** build the shell and shared components once, so pages 4–8 don't each reinvent cards/badges/bars.
- **Prompts 4–8** build every page against mock data first — this lets you (and your project guide) see and approve the full UI before any Firebase dependency exists, which matches your original Phase 1 intent.
- **Prompts 9–10** are the actual "wiring" step, kept separate from UI-building so a broken Firebase connection never blocks you from demoing the interface.
- **Prompt 11** is the only pass that touches every file again — doing it last avoids re-polishing pages you'll still be restructuring in earlier steps.
