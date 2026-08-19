# ☀️ Solarist — Solar IoT Energy Intelligence Dashboard

A real-time solar energy monitoring and optimization dashboard built with **React + Vite**, connected to an **ESP8266 IoT device** via **Firebase Realtime Database**.

![Solarist Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=flat-square)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-Realtime%20DB-orange?style=flat-square&logo=firebase)
![Vite](https://img.shields.io/badge/Vite-8-purple?style=flat-square&logo=vite)

---

## 📋 Project Overview

Solarist is a full-stack IoT dashboard for a solar energy management system. An ESP8266 microcontroller reads live sensor data (voltage, current, temperature, humidity) and writes it to Firebase Realtime Database. The React dashboard subscribes to those paths in real time and renders live charts, sensor cards, relay status, and an energy optimization history.

**This repo contains only the frontend (web dashboard).** The ESP8266 firmware is a separate component.

---

## ✨ Features

| Feature | Details |
|---|---|
| 📡 **Live Data** | Firebase `onValue` listeners — zero-polling, push-based updates |
| 🔋 **Battery Monitoring** | Live battery percentage with progress bar |
| ⚡ **Solar Power Metrics** | Voltage, current, power, computed efficiency |
| 🌡️ **Environmental Sensors** | Temperature + humidity dual-axis chart |
| 🔀 **Source Switching** | Relay ON/OFF status, source history table |
| 🚨 **Smart Alerts** | Loading / offline / error / stale-data banners |
| 📊 **Historical Charts** | Multi-range Chart.js charts (Today / This Week / This Month) |
| ⚙️ **Settings** | Configurable thresholds and display preferences |
| 📱 **Fully Responsive** | 1920px → 375px (desktop, tablet, mobile) |

---

## 🏗️ Tech Stack

- **Frontend:** React 18, React Router v6, Vite 8
- **Charts:** Chart.js + react-chartjs-2
- **Icons:** Lucide React
- **Database:** Firebase Realtime Database (Asia Southeast 1 region)
- **Styling:** Vanilla CSS with CSS custom properties (no Tailwind)
- **Hardware:** ESP8266 + Firebase-ESP8266 Arduino library

---

## 📁 Project Structure

```
solar-iot-project/
├── src/
│   ├── components/
│   │   ├── Header/             # Sticky nav with logo + NavLinks
│   │   ├── MetricCard/         # Sensor value card with trend
│   │   ├── ChartCard/          # Chart wrapper with range toggles
│   │   ├── StatusBadge/        # success / warning / error / neutral pill
│   │   ├── ProgressBar/        # Labelled horizontal progress bar
│   │   ├── SectionHeader/      # Page title + subtitle
│   │   └── SystemStateBanner/  # Loading / offline / error / stale banners
│   ├── pages/
│   │   ├── Overview/           # Hero card, sensor grid, battery, source
│   │   ├── Performance/        # Energy + environmental Chart.js charts
│   │   ├── Monitoring/         # Raw sensor data + system diagnostics
│   │   ├── Optimization/       # Relay status + source switching history
│   │   └── Settings/           # Threshold config form
│   ├── hooks/
│   │   └── useFirebaseData.js  # Central hook — subscribes to all paths, returns { data, loading, error }
│   ├── services/
│   │   └── firebaseService.js  # onValue listeners + type-safe parsers + timestamp formatter
│   └── config/
│       └── firebase.js         # Firebase app init (reads from env vars)
├── database.rules.json         # Firebase security rules (read-only for browser)
├── .env.example                # Required environment variable names
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project with Realtime Database enabled
- (For live data) An ESP8266 device running compatible firmware

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/solarist-dashboard.git
cd solarist-dashboard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your Firebase project credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.asia-southeast1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### 5. Build for production

```bash
npm run build
```

---

## 🔥 Firebase Setup

### Database Structure

Your Firebase Realtime Database must use this exact node structure:

```
solarSystem/
  sensors/
    voltage       → float (e.g. 12.4)
    current       → float (e.g. 1.25)
    temperature   → float (e.g. 29.5)
    humidity      → float (e.g. 62.0)
  energy/
    solarPower    → float (e.g. 15.5)
    batteryLevel  → float (e.g. 78.0)  — percentage 0–100
    activeSource  → string ("Solar" | "Battery" | "Grid")
  system/
    relayStatus   → string ("ON" | "OFF")  — case-insensitive
    status        → string ("Online" | "Offline")  — case-insensitive
    lastUpdate    → string (ISO 8601) or number (epoch ms)
  history/
    <push_key>/
      time        → string (e.g. "10:42 AM")
      prev        → string (e.g. "Battery")
      next        → string (e.g. "Solar")
      reason      → string
      status      → string ("Success" | "Warning")
```

### Security Rules

Apply the included [`database.rules.json`](./database.rules.json) in the Firebase Console under **Realtime Database → Rules**:

- The **browser dashboard** has **read-only** access
- Your **ESP8266 device** must authenticate with a **Database Secret** to write

Get your secret: Firebase Console → Project Settings → Service Accounts → Database Secrets.

---

## 🔌 ESP8266 Firmware Notes

In your Arduino sketch, use this configuration:

```cpp
#include <FirebaseESP8266.h>

FirebaseConfig config;
FirebaseAuth auth;

config.host = "your-project-default-rtdb.asia-southeast1.firebasedatabase.app";
config.signer.tokens.legacy_token = "YOUR_DATABASE_SECRET";

Firebase.begin(&config, &auth);
```

> ⚠️ **Critical:** The database URL region suffix (`.asia-southeast1`) must exactly match what's in your `.env` file.

**Recommended — add `onDisconnect` so the dashboard detects hardware crashes:**

```cpp
// After connecting, set an automatic "Offline" write for when device disconnects
Firebase.RTDB.setString(&fbdo, "/solarSystem/system/status", "Online");
// onDisconnect: write "Offline" automatically when ESP loses connection
fbdo.to<FirebaseData>().ref("/solarSystem/system/status").onDisconnect().setValue("Offline");
```

---

## 📡 Data Flow

```
ESP8266 Sensors
      │
      │  reads V, I, T, H
      ▼
ESP8266 Firmware
      │
      │  Firebase-ESP8266 library (authenticated write)
      ▼
Firebase Realtime Database
      │
      │  onValue push listeners (WebSocket)
      ▼
useFirebaseData Hook
      │
      │  type-safe parsed { data, loading, error }
      ▼
React Pages (Overview, Performance, Monitoring, Optimization)
```

---

## 🛡️ Security Notes

- Firebase credentials in `.env` are **client-side visible** by design — this is normal for Firebase Web SDK
- `.env` is in `.gitignore` — never commit it
- The database is **read-only from the browser** — no one can write via the dashboard
- The only write path is your authenticated ESP8266 device

---

## 🗺️ Roadmap

- [ ] ESP8266 firmware write with auth token integration
- [ ] Firebase Authentication for dashboard login
- [ ] Real history time-series data stored per sensor reading
- [ ] PWA support (offline mode, install to home screen)
- [ ] Push notifications for threshold alerts

---

## 📄 License

MIT — free to use for educational and personal projects.

---

## 🙏 Acknowledgements

Built as a final-year IoT project. Dashboard designed with a focus on real hardware readiness, not just prototype appearance.
