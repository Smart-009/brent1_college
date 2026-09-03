// ============================================================
// Eclat Institute — Native Desktop Application Main Process
// ============================================================

const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron')
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
      sandbox: true,
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
    if (isDev && process.env.VITE_DEV_SERVER_URL) {
      return `${process.env.VITE_DEV_SERVER_URL}${routePath}`
    }
    if (isDev) {
      return `http://localhost:5173${routePath}`
    }
    return `file://${path.join(__dirname, '../dist/index.html')}#${routePath}`
  }

  // Load app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Open links in external browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
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
    try {
      mainWindow.setContentProtection(false)
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

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
