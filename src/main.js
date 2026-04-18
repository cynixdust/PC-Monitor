const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const si = require('systeminformation');

let mainWindow;
let tray;
let statsInterval;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    transparent: false,
    backgroundColor: '#0a0d14',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '..', 'assets', 'icon.ico'),
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (statsInterval) clearInterval(statsInterval);
  });
}

function createTray() {
  // Use a blank image if icon missing
  let icon;
  try {
    icon = nativeImage.createFromPath(path.join(__dirname, '..', 'assets', 'icon.ico'));
  } catch {
    icon = nativeImage.createEmpty();
  }
  tray = new Tray(icon);
  const menu = Menu.buildFromTemplate([
    { label: 'Show PC Monitor', click: () => { if (mainWindow) mainWindow.show(); } },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ]);
  tray.setToolTip('PC Monitor');
  tray.setContextMenu(menu);
  tray.on('double-click', () => { if (mainWindow) mainWindow.show(); });
}

// ─── IPC: window controls ────────────────────────────────────────────────────
ipcMain.on('window-minimize', () => mainWindow && mainWindow.minimize());
ipcMain.on('window-maximize', () => {
  if (!mainWindow) return;
  mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
});
ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.hide(); // hide to tray
});

// ─── IPC: fetch system stats ─────────────────────────────────────────────────
ipcMain.handle('get-static-info', async () => {
  const [cpu, mem, osInfo, graphics] = await Promise.all([
    si.cpu(),
    si.mem(),
    si.osInfo(),
    si.graphics()
  ]);
  return {
    cpu: `${cpu.manufacturer} ${cpu.brand}`,
    cpuCores: cpu.physicalCores,
    cpuThreads: cpu.cores,
    ram: `${Math.round(mem.total / 1073741824)} GB`,
    os: `${osInfo.distro} ${osInfo.release}`,
    gpu: graphics.controllers[0]?.model || 'N/A'
  };
});

ipcMain.handle('get-dynamic-stats', async () => {
  try {
    const [
      cpuLoad,
      cpuTemp,
      mem,
      fsSize,
      networkStats,
      gpuData,
      processes,
      battery
    ] = await Promise.all([
      si.currentLoad(),
      si.cpuTemperature(),
      si.mem(),
      si.fsSize(),
      si.networkStats(),
      si.graphics(),
      si.processes(),
      si.battery()
    ]);

    // CPU
    const cpuPct = Math.round(cpuLoad.currentLoad);
    const cores = cpuLoad.cpus.map(c => Math.round(c.load));

    // RAM
    const ramPct = Math.round((mem.active / mem.total) * 100);
    const ramUsed = (mem.active / 1073741824).toFixed(1);
    const ramTotal = (mem.total / 1073741824).toFixed(0);

    // Temps
    const cpuTempVal = Math.round(cpuTemp.main) || null;
    const gpuTempVal = Math.round(gpuData.controllers[0]?.temperatureGpu) || null;

    // Storage
    const drives = fsSize
      .filter(d => d.size > 0)
      .map(d => ({
        mount: d.mount,
        type: d.type,
        used: Math.round(d.used / 1073741824),
        size: Math.round(d.size / 1073741824),
        pct: Math.round(d.use)
      }));

    // Network
    const net = networkStats[0] || {};
    const dlMbps = ((net.rx_sec || 0) / 125000).toFixed(1);
    const ulMbps = ((net.tx_sec || 0) / 125000).toFixed(1);

    // GPU
    const gpu = gpuData.controllers[0] || {};
    const gpuLoad = gpu.utilizationGpu || 0;
    const gpuVram = gpu.memoryUsed ? Math.round((gpu.memoryUsed / gpu.memoryTotal) * 100) : 0;

    // Top processes
    const topProcs = (processes.list || [])
      .sort((a, b) => b.cpu - a.cpu)
      .slice(0, 5)
      .map(p => ({ name: p.name, cpu: p.cpu.toFixed(1), mem: p.memRss ? Math.round(p.memRss / 1048576) : 0 }));

    // Battery
    const bat = battery.hasBattery ? {
      has: true,
      pct: battery.percent,
      charging: battery.isCharging,
      timeLeft: battery.timeRemaining
    } : { has: false };

    return {
      cpuPct, cores,
      ramPct, ramUsed, ramTotal,
      cpuTemp: cpuTempVal,
      gpuTemp: gpuTempVal,
      drives,
      dlMbps, ulMbps,
      gpuLoad, gpuVram,
      topProcs,
      battery: bat
    };
  } catch (err) {
    return { error: err.message };
  }
});

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on('window-all-closed', () => {
  // Keep running in tray on Windows
});

app.on('activate', () => {
  if (!mainWindow) createWindow();
});
