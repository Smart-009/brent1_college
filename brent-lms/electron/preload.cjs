const { contextBridge, ipcRenderer } = require('electron')

try {
  window.sessionStorage?.setItem('eclat_platform', 'desktop')
  window.localStorage?.setItem('eclat_platform', 'desktop')
} catch (e) {}

contextBridge.exposeInMainWorld('desktopAPI', {
  isDesktop: true,
  platform: process.platform,
  version: process.versions.electron,
  enableScreenProtection: () => ipcRenderer.send('enable-screen-protection'),
  disableScreenProtection: () => ipcRenderer.send('disable-screen-protection'),
  printCurrentPage: () => ipcRenderer.send('print-page'),
})
