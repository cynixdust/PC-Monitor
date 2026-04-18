# PC Monitor — Real-time Windows Health Dashboard

A native Windows desktop app built with Electron that shows live CPU, RAM,
GPU, storage, temperatures, network, and process data from your actual hardware.

---

## Requirements

- Windows 10 or 11 (64-bit)
- [Node.js LTS](https://nodejs.org) — download and install before anything else
- Internet connection for the first `npm install` only

---

## Quick Start (Preview / Dev mode)

1. Extract this folder anywhere on your PC
2. Double-click `RUN_DEV.bat`
3. The app launches immediately with live data

---

## Build a Standalone .exe (for both PCs)

1. Open this folder
2. Double-click `BUILD.bat`
3. Wait ~2 minutes for the build to complete
4. Open the `dist/` folder — you'll find:
   - **`PC Monitor Setup.exe`** — installer (recommended, creates Start Menu shortcut)
   - **`PC Monitor.exe`** — portable, just copy and double-click, no install

Copy either file to your other PC — no Node.js needed on the target machine.

---

## Features

| Feature | Details |
|---|---|
| CPU | Overall % load + per-core bars |
| RAM | Usage %, GB used / total |
| GPU | Load % + VRAM % (NVIDIA/AMD) |
| Storage | All drives — used/total GB with bar |
| Temperatures | CPU + GPU °C with heat-coded bars |
| Network | Real-time download/upload Mbps |
| Processes | Top 5 CPU-hungry processes |
| Battery | % + charging status (laptops) |
| System tray | Closes to tray, double-click to restore |

---

## Temperature Sensors

Windows requires elevated privileges for hardware sensor access.

**If temps show "unavailable":**
Right-click the app → Run as Administrator

Or create a shortcut and enable "Run as administrator" in its Properties → Compatibility tab.

---

## Folder Structure

```
pc-monitor/
├── src/
│   ├── main.js        ← Electron main process
│   ├── preload.js     ← Secure IPC bridge
│   └── index.html     ← Dashboard UI
├── assets/
│   └── icon.ico       ← App icon (replace with your own if you like)
├── package.json
├── BUILD.bat          ← Build standalone .exe
└── RUN_DEV.bat        ← Launch in dev/preview mode
```

---

## Update Interval

Stats refresh every **2 seconds**. To change this, open `src/index.html`
and find `setInterval(update, 2000)` near the bottom — change `2000` to
any millisecond value you like (e.g. `1000` for 1 second).

---

## Troubleshooting

| Problem | Fix |
|---|---|
| GPU shows 0% | NVIDIA users: install GeForce Experience; AMD: Radeon Software |
| Temps not showing | Run as Administrator |
| Build fails | Make sure Node.js is installed and you have internet access |
| App won't launch | Right-click → Run as Administrator |
