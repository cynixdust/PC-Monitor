const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('pcMonitor', {
  getStaticInfo: () => ipcRenderer.invoke('get-static-info'),
  getDynamicStats: () => ipcRenderer.invoke('get-dynamic-stats'),
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close')
});
