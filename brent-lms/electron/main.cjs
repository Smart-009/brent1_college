// ============================================================
// Eclat Institute — Native Desktop Application Main Process
// ============================================================

const { app, BrowserWindow, Menu, shell, ipcMain, globalShortcut, clipboard } = require('electron')
const path = require('path')

const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production'
const institutionName = process.env.VITE_INSTITUTION_NAME || 'Éclat Institute'
const websiteUrl = process.env.VITE_WEBSITE_URL || 'https://eclat.institute'

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1024,
    minHeight: 700,
    title: `${institutionName} — Enterprise College Management System`,
    icon: path.join(__dirname, '../public/logo.png'),
    backgroundColor: '#0c0e12',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  })

  // Create Native College Menu
  const menuTemplate = [
    {
      label: institutionName,
      submenu: [
        { label: `About ${institutionName}`, click: () => shell.openExternal(websiteUrl) },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Campus Desks',
      submenu: [
        { label: '🎓 Students SIS Directory', click: () => mainWindow.loadURL(getUrl('/students')) },
        { label: '💼 Bursar & Finance Desk', click: () => mainWindow.loadURL(getUrl('/bursar')) },
        { label: '📋 Secretary & Admissions Desk', click: () => mainWindow.loadURL(getUrl('/secretary')) },
        { label: '📅 Master Timetable', click: () => mainWindow.loadURL(getUrl('/timetable')) },
        { label: '📜 Exams & Transcripts', click: () => mainWindow.loadURL(getUrl('/exams')) },
        { label: '💳 Fees & Paybill', click: () => mainWindow.loadURL(getUrl('/fees')) },
        { label: '📢 Noticeboard & Circulars', click: () => mainWindow.loadURL(getUrl('/noticeboard')) },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Print',
      submenu: [
        {
          label: 'Print Document (Transcripts / Receipts)',
          accelerator: 'CmdOrCtrl+P',
          click: () => mainWindow.webContents.print(),
        },
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)

  function getUrl(routePath = '') {
    const base = isDev
      ? (process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173')
      : 'https://www.eclat.institute'
    const connector = routePath.includes('?') ? '&' : '?'
    return `${base}${routePath}${connector}platform=desktop`
  }

  // Hardware Screen Capture Protection Active by Default
  try {
    mainWindow.setContentProtection(true)
  } catch (e) {}

  mainWindow.once('ready-to-show', () => {
    try {
      mainWindow.setContentProtection(true)
    } catch (e) {}
  })

  mainWindow.on('focus', () => {
    try {
      mainWindow.setContentProtection(true)
    } catch (e) {}
  })

  mainWindow.webContents.on('did-finish-load', () => {
    try {
      mainWindow.setContentProtection(true)
    } catch (e) {}
  })

  // Set Workstation User Agent
  try {
    const defaultUA = mainWindow.webContents.getUserAgent()
    mainWindow.webContents.setUserAgent(`${defaultUA} Electron ÉclatDesktopWorkstation/1.0.0`)
  } catch (e) {}

  // Load workstation directly into portal / login
  mainWindow.loadURL(getUrl('/login'))

  // Open external links in default system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://localhost') || url.includes('eclat.institute')) {
      return { action: 'allow' }
    }
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // Hardware Screen Capture Protection & Native Desktop Utilities
  ipcMain.on('enable-screen-protection', () => {
    try {
      mainWindow.setContentProtection(true)
    } catch (e) {}
  })

  ipcMain.on('disable-screen-protection', () => {
    // Hardware screen capture protection is maintained permanently for enterprise academic copyright
    try {
      mainWindow.setContentProtection(true)
    } catch (e) {}
  })

  ipcMain.on('print-page', () => {
    try {
      mainWindow.webContents.print()
    } catch (e) {}
  })
}

app.whenReady().then(() => {
  createWindow()

  // Register native global screenshot interceptors
  try {
    globalShortcut.register('PrintScreen', () => {
      clipboard.clear()
    })
    globalShortcut.register('CommandOrControl+Shift+S', () => {
      clipboard.clear()
    })
    globalShortcut.register('Alt+PrintScreen', () => {
      clipboard.clear()
    })
  } catch (e) {}

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('will-quit', () => {
  try {
    globalShortcut.unregisterAll()
  } catch (e) {}
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
