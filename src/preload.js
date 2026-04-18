const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('pc', {
  getStatic: () => ipcRenderer.invoke('get-static'),
  getFast:   () => ipcRenderer.invoke('get-fast'),
  getSlow:   () => ipcRenderer.invoke('get-slow'),
  minimize:  () => ipcRenderer.send('win-min'),
  maximize:  () => ipcRenderer.send('win-max'),
  close:     () => ipcRenderer.send('win-close')
});
