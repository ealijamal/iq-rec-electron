// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog, nativeTheme, Tray, Menu, } = require('electron')
const path = require('path')

let darkmod = false
let tray = null


const gotTheLock = app.requestSingleInstanceLock()



app.on('ready', () => {



    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {

            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        }
    })
    mainWindow.setIcon(path.join(__dirname, 'app/imag/iconb.png'))
    mainWindow.setMenu(null)
    mainWindow.loadFile(path.join(__dirname, 'app/app.html'))
    if (!gotTheLock) {
        app.quit()
    } else {
        app.on('second-instance', (event, commandLine, workingDirectory) => {
            // Someone tried to run a second instance, we should focus our window.
            if (mainWindow) {
                if (mainWindow.isMinimized()) mainWindow.restore()
                mainWindow.focus()
            }
        })
    }


    //================================================open folder to play video from storg
    ipcMain.on("play", (ev) => {

        dialog.showOpenDialog({ properties: ['openFile'] }, (filename) => {
            console.log(filename)
            return filename
        }).then(re => {
            ev.reply('re_play', (ev, re.filePaths[0]))
        })
    })

    //=========================================== save event state
    ipcMain.on("save", (ev, url) => {

        dialog.showSaveDialog([mainWindow, ], { title: 'sali' })
    })
    mainWindow.webContents.session.on('will-download', (event, item, webContents) => {


            item.once('done', (event, state) => {
                if (state === 'completed') {

                    mainWindow.webContents.send('st', 'successfully')
                } else {

                    mainWindow.webContents.send('st', 'cancelled')
                }
            })
        })
        //================================= handl exit event
    ipcMain.on('exit', (ev) => {
            tray.destroy()
            tray = null
            app.exit()
        })
        //================================= get dark mode state event
    ipcMain.on('darkmode', (ev, data) => {

            if (data == "dark") {
                darkmod = true
            } else {
                darkmod = false


            }
        })
        //================================= send dark state  event
    ipcMain.on("dark_s", (ev) => {
        mainWindow.webContents.send('ver', app.getVersion())
        ev.reply('re_dark_s', darkmod)
    })


    //================================= build tray
    function send_control(command) {
        mainWindow.webContents.send('control', command)
    }

    tray = new Tray(path.join(__dirname, 'app/imag/icon.png'))

    const contextMenu = Menu.buildFromTemplate([

        {
            label: 'start',
            type: 'normal',
            icon: path.join(__dirname, 'app/imag/rec.png'),
            click() {
                mainWindow.webContents.send('chack_record')
                ipcMain.on("state", (ev, state) => {
                    if (state) {
                        send_control('record')
                        mainWindow.minimize()
                        tray.setImage(path.join(__dirname, 'app/imag/iconb.png'))
                    }

                })

            }
        },
        {
            label: 'pause',
            type: 'normal',
            icon: path.join(__dirname, 'app/imag/pause.png'),
            click() {
                send_control('pause')
                tray.setImage(path.join(__dirname, 'app/imag/pause.png'))
            }
        }, {
            label: 'continuo',
            type: 'normal',
            icon: path.join(__dirname, 'app/imag/play.png'),
            click() {
                send_control('play')
                tray.setImage(path.join(__dirname, 'app/imag/iconb.png'))
            }
        }, {
            label: 'stop',
            type: 'normal',
            icon: path.join(__dirname, 'app/imag/stop.png'),
            click() {
                mainWindow.restore()
                send_control('stop')
                tray.setImage(path.join(__dirname, 'app/imag/icon.png'))
            }
        }, {
            label: 'exit ',
            type: 'normal',
            icon: path.join(__dirname, 'app/imag/exit.png'),
            click() {
                tray = null
                app.exit()
            }
        }
    ])
    tray.setToolTip('IQ-REC.')
    tray.setContextMenu(contextMenu)
    tray.on('click', (event) => {

        mainWindow.isMinimized() ? mainWindow.restore() : mainWindow.minimize()

    })


})

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') app.quit()
})