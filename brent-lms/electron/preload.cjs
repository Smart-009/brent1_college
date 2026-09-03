// ============================================================
// Eclat Institute — Native Desktop Preload Bridge
// ============================================================

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('desktopAPI', {
  isDesktop: true,
  platform: process.platform,
  version: process.versions.electron,
  enableScreenProtection: () => ipcRenderer.send('enable-screen-protection'),
  disableScreenProtection: () => ipcRenderer.send('disable-screen-protection'),
  printCurrentPage: () => ipcRenderer.send('print-page'),
})
