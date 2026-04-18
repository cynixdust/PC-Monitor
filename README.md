# PC Monitor

A real-time PC health dashboard built with Electron. Shows live CPU, RAM, GPU, storage, temperatures, network activity, and running processes in a clean dark interface.

---

## Requirements

- Windows 10 or 11 (64-bit)
- [Node.js LTS](https://nodejs.org) — only needed to build or run in dev mode

---

## Getting Started

**Preview instantly (dev mode)**
Double-click `RUN_DEV.bat`. It installs dependencies and launches the app.

**Build a standalone .exe**
Double-click `BUILD.bat`. When it finishes, open the `dist/` folder:

| File | Description |
|---|---|
| `PC Monitor Setup.exe` | Installer — creates a Start Menu shortcut |
| `PC Monitor.exe` | Portable — just copy and double-click, no install needed |

Either file can be copied to another Windows PC. Node.js is not required on the target machine.

---

## What It Shows

- **CPU** — overall load % and per-core breakdown
- **RAM** — usage % and GB used / total
- **GPU** — load % and VRAM usage %
- **Storage** — all drives with used / total GB
- **Temperatures** — CPU and GPU in °C
- **Network** — live download and upload speed in Mbps
- **Processes** — top 5 CPU-hungry processes
- **Battery** — charge % and status (laptops only)

---

## Notes

**Temperatures not showing?**
Right-click the app → Run as administrator. Windows restricts hardware sensor access by default.

**GPU stats showing 0%?**
Make sure GeForce Experience (NVIDIA) or Radeon Software (AMD) is installed.

**Closing the window** hides the app to the system tray. Right-click the tray icon to quit fully.

**Refresh rate** is every 2 seconds. To change it, open `src/index.html` and find `setInterval(update, 2000)` near the bottom.

---

## Project Structure

```
pc-monitor/
├── assets/
│   └── icon.ico
├── src/
│   ├── main.js       — Electron main process
│   ├── preload.js    — IPC bridge
│   └── index.html    — Dashboard UI
├── BUILD.bat         — Build standalone .exe
├── RUN_DEV.bat       — Launch in dev mode
└── package.json
```
