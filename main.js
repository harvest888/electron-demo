/* ready: 当 Electron 完成初始化时被触发。
window-all-closed: 所有窗口被关闭
before-quit：在应用程序开始关闭窗口之前触发
will-quit：当所有窗口都已关闭并且应用程序将退出时发出。
quit：在应用程序退出时发出。 */


//  因为主进程运行着Node.js，您可以在文件头部将他们导入作为公共JS模块
const {app, BrowserView,BrowserWindow, globalShortcut, ipcMain, Menu } = require('electron')
const path = require('path')
function createWindow () {
  // 添加一个createWindow()方法来将index.html加载进一个新的BrowserWindow实例
  const mainWindow = new BrowserWindow({
    width: 1800,
    height: 1600,
    show: false,
    webPreferences: {
      nodeIntegration: true, //是否集成 node
      contextIsolation: false, //这两个很重要，使用requrie和process等变量要事先设定这个属性
      webviewTag: true, //默认情况下，Electron >= 5禁用 webview 标签。 在构造 BrowserWindow 时，需要通过设置 webviewTag webPreferences选项来启用标签
      enableRemoteModule:true,　　//添加即可解决模块引用问题
    } 
  })

  // require('@electron/remote/main').initialize()
  // 并加载应用程序的index.html。
  mainWindow.loadFile('index.html')

  // 打开开发者工具
  mainWindow.webContents.openDevTools();
  // did-finish-load
  mainWindow.webContents.on('did-finish-load',() => {
    console.log('***did-finish-load***');
  })
  // dom-ready
  mainWindow.webContents.on('dom-ready',() => {
    console.log('***dom-ready***');
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()//防止页面闪烁使用
  })

  //  BrowserView类似于绝对定位，插入页面
  const view = new BrowserView()
  view.setBounds({ x: 0, y: 0, width: 300, height: 300 })
  view.webContents.loadURL('https://electronjs.org')
  mainWindow.setBrowserView(view)


  setTimeout(() => {
    // 主进程主动发消息
    mainWindow.webContents.send('asynchronous-reply', '主进程主动发消息')
  },5000)
  

  // 创建一个子窗口
  const child = new BrowserWindow({ 
    parent: mainWindow,
    modal: true //模态窗口
  })
}

//   只有在 app 模块的 ready 事件被激发后才能创建浏览器窗口。 您可以通过使用 app.whenReady() API来监听此事件。 
// 在whenReady()成功后调用createWindow()。
app.whenReady().then(() => {
  // require('devtron').install()
  // 创建窗口
  createWindow()

  // 快捷键
  globalShortcut.register('CommandOrControl+I', () => {
    console.log('***你按了快捷键***');
    // Do stuff when Y and either Command/Control is pressed.
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

/* 关闭所有窗口时退出，macOS上除外。在那里，这很常见
使应用程序及其菜单栏保持活动状态，直到用户退出
显式地使用Cmd+Q。 */
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
  console.log('***window-all-closed***');
  // 取消快捷键
  globalShortcut.unregister();
})


/* 主进程向渲染进程通信 */
ipcMain.on('asynchronous-message', (event, arg) => {
  console.log(arg) // prints "ping"
  event.reply('asynchronous-reply', '这是来自主进程的问候')
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
