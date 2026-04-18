const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const si = require('systeminformation');

let mainWindow, tray;

let staticCache = null;
let driveCache = null;
let driveTimer = 0;
const DRIVE_INTERVAL = 30000;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 860,
    minHeight: 560,
    frame: false,
    backgroundColor: '#0a0d14',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '..', 'assets', 'icon.ico'),
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('closed', () => { mainWindow = null; });
}

function createTray() {
  let icon;
  try { icon = nativeImage.createFromPath(path.join(__dirname, '..', 'assets', 'icon.ico')); }
  catch { icon = nativeImage.createEmpty(); }
  tray = new Tray(icon);
  tray.setToolTip('PC Monitor');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Show', click: () => mainWindow && mainWindow.show() },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ]));
  tray.on('double-click', () => mainWindow && mainWindow.show());
}

ipcMain.on('win-min',   () => mainWindow?.minimize());
ipcMain.on('win-max',   () => mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize());
ipcMain.on('win-close', () => mainWindow?.hide());

// Static — queried once
ipcMain.handle('get-static', async () => {
  if (staticCache) return staticCache;
  const [cpu, mem, os, gpu] = await Promise.all([
    si.cpu(), si.mem(), si.osInfo(), si.graphics()
  ]);
  staticCache = {
    cpu:     `${cpu.manufacturer} ${cpu.brand}`,
    threads: cpu.cores,
    ram:     `${Math.round(mem.total / 1073741824)} GB`,
    os:      `${os.distro} ${os.release}`,
    gpu:     gpu.controllers[0]?.model || 'N/A'
  };
  return staticCache;
});

// Fast tick — CPU + RAM
ipcMain.handle('get-fast', async () => {
  const [load, mem] = await Promise.all([si.currentLoad(), si.mem()]);
  return {
    cpuPct:   Math.round(load.currentLoad),
    cores:    load.cpus.map(c => Math.round(c.load)),
    ramPct:   Math.round((mem.active / mem.total) * 100),
    ramUsed:  (mem.active / 1073741824).toFixed(1),
    ramTotal: (mem.total / 1073741824).toFixed(0)
  };
});

// Slow tick — GPU, temps, net, procs, battery, drives
ipcMain.handle('get-slow', async () => {
  const now = Date.now();
  if (!driveCache || now - driveTimer > DRIVE_INTERVAL) {
    driveCache = await si.fsSize();
    driveTimer = now;
  }

  const [gpuData, cpuTemp, netStats, procs, bat] = await Promise.all([
    si.graphics(), si.cpuTemperature(), si.networkStats(), si.processes(), si.battery()
  ]);

  const gpu = gpuData.controllers[0] || {};
  const net = netStats[0] || {};

  return {
    gpuLoad:  gpu.utilizationGpu || 0,
    gpuVram:  gpu.memoryUsed ? Math.round((gpu.memoryUsed / gpu.memoryTotal) * 100) : 0,
    cpuTemp:  Math.round(cpuTemp.main) || null,
    gpuTemp:  Math.round(gpu.temperatureGpu) || null,
    dlMbps:   ((net.rx_sec || 0) / 125000).toFixed(1),
    ulMbps:   ((net.tx_sec || 0) / 125000).toFixed(1),
    drives:   driveCache.filter(d => d.size > 0).map(d => ({
      mount: d.mount,
      used:  Math.round(d.used / 1073741824),
      size:  Math.round(d.size / 1073741824),
      pct:   Math.round(d.use)
    })),
    topProcs: (procs.list || [])
      .sort((a, b) => b.cpu - a.cpu)
      .slice(0, 5)
      .map(p => ({ name: p.name, cpu: p.cpu.toFixed(1), mem: p.memRss ? Math.round(p.memRss / 1048576) : 0 })),
    battery: bat.hasBattery
      ? { has: true, pct: bat.percent, charging: bat.isCharging, timeLeft: bat.timeRemaining }
      : { has: false }
  };
});

app.whenReady().then(() => {
  app.commandLine.appendSwitch('js-flags', '--max-old-space-size=128');
  createWindow();
  createTray();
});

app.on('window-all-closed', () => {});
app.on('activate', () => { if (!mainWindow) createWindow(); });
