# ProtoSchedule — Prototype Test Drive Scheduler
**Connected Fleet Services · Prototype Validation Hub**

ProtoSchedule is a real-time web application built to centralise prototype vehicle scheduling, surface vehicle availability across test depots (Hällered Proving Ground, Kiruna Arctic Test Facility, Gothenburg HQ, Arizona Proving Ground), automate conflict detection, and track test coverage matrix completion.

---

## 🚀 Key Features

1. **Role-Based Persona Cockpits**:
   - **R&D Lead (Maria Lindqvist)**: 2D Test Coverage Matrix, Utilisation Analytics (targeting 85%+), Proactive Conflict Resolution Hub, Test Sign-Offs.
   - **Test Driver (Arjun Mehta)**: Rapid <3-click vehicle slot booking, Driver Cockpit with live track session tracker, speed/temperature telemetry simulator, post-session anomaly reporting.
   - **Workshop Technician (Lars Hedlund)**: Pre-drive safety preparation checklists (ISO-26262), Workshop Bay capacity planner, post-drive vehicle intake & inspection release.

2. **Zero-Conflict Guarantee Engine**:
   - Real-time double-booking prevention.
   - Workshop maintenance collision soft alerts.
   - 1-click resolution actions: **Auto-Reassign to peer prototype**, **Reschedule slot**, **Cancel & free**, or **Lead Override**.

3. **2D Interactive Test Coverage Matrix (PRD US-04)**:
   - 8 Standard validation test scenarios (Arctic Cold, 15% Gradient, Highway Aero, Rough Terrain, Wet Skidpad, High Altitude, Battery MCS Stress, Autonomous L3 Sensors) mapped across all prototype models.
   - Milestone sign-offs and one-click CSV export.

4. **Interactive 7-Step Workflow Simulator**:
   - End-to-end walkthrough demonstrating PRD Section 6.2 (Lead plans -> Workshop preps -> Driver drives -> Driver reports -> Tech inspects -> Lead signs off).

5. **Nordic Precision Industrial Design System**:
   - Crisp, high-contrast dark theme with Oceanic Blue accents, responsive UI, glassmorphic headers, and live proving ground time clock.

---

## 🛠️ Deploying to Vercel

ProtoSchedule is built with Next.js 14 (App Router) and is 100% Vercel-ready with zero external database dependencies for the MVP review.

### Option A: Deploy via GitHub / Vercel Dashboard
1. Push this repository to GitHub or GitLab.
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Import the `ProtoSchedule` repository.
4. Framework Preset: **Next.js**.
5. Click **Deploy**.

### Option B: Deploy via Vercel CLI
```bash
npm install -g vercel
vercel
```

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```
Open [http://localhost:3000](http://localhost:3000) to view the application.
