// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
const fs = require('fs');
const { ipcRenderer} = require('electron');
// const console = require('console');
const {dialog,Menu,MenuItem,net} = require('electron').remote;
// const { dialog } = require('@electron/remote')
/* 渲染进程 */

/*1.进程事件  */ 
function getProcessInfo() {
    console.log('getCPUUsage:', global.process.getCPUUsage());
    console.log('platform:', process.platform);
    console.log('env:', process.env);
    console.log('arch:', process.arch);
}

/* 2.文件系统 */
const fileDrag = document.getElementById('fileDrag');
fileDrag.addEventListener('drop', (e) => {
    console.log(e.dataTransfer);
    e.preventDefault();//阻止默认行为
    e.stopPropagation();

    /* for (const f of e.dataTransfer.files) {
      console.log('File(s) you dragged here: ', f.path)
    } */
    const files = e.dataTransfer.files;
    if(files && files.length > 0) {
        const path = files[0].path
        const content = fs.readFileSync(path)
        console.log(content.toString());
    }
  });
  // 拖拽文件移动到上面触发
  fileDrag.addEventListener('dragover', (e) => {
    console.log(66666666666666666666666)
    e.preventDefault();//阻止默认行为
    e.stopPropagation();
  });

  /* 3.webView 单独的一个进程*/
  const webView = document.getElementById('WB');
  const content = document.querySelector('#content')
  const loadstart = () => {
    console.log('*****开始*****');
    content.innerText = 'loading...';
    // webView.openDevTools() 打开嵌入的开发者工具
  }

  const loadstop = () => {
    console.log('*****结束*****');
    content.innerText = ''
  }

  webView.addEventListener('did-start-loading', loadstart)
  webView.addEventListener('did-stop-loading', loadstop)

  /*  4.window-open */
  let sonWin;
  function openWindow() {
    //   window.open('https://www.bilibili.com','_self')
    sonWin = window.open('son.html','son') //返回的是一个BrowserWindowProxy的对象
  }
//   接受信息
window.addEventListener('message',(msg) => {
    console.log('接收到的消息:',msg)
})
// 关闭子窗口
function closeWindow() {
    sonWin.close();
}

/* 5.dialog对话框 （这个有问题）*/
function openDialog() {
    dialog.showOpenDialogSync({
        title:"请选择你喜欢的文件",
        properties: ['openFile', 'openDirectory'],
        filters: [
            { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
          ]
    })
}

/* 6.主进程向渲染进程通讯 */
function sendMessage() {
  ipcRenderer.sendSync('asynchronous-message', '给我信息')
}
 // 得到主进程回复
 ipcRenderer.on('asynchronous-reply', (event, arg) => {
  console.log(arg) // prints "pong"
})

/* 7.展示自定义菜单 */
function openMenu() {
  const template = [
    {label: '菜单1'},
    {label: '菜单2', click: ()=>{
      console.log('点击测试');
    }},
    {label: '剪切',role: 'undo'},
    {label: '重做',role: 'redo'},
    {label: '刷新',role: 'reload'},
    {label: '菜单4',type:'checkbox',checked:true},
    {label: '菜单5',type:'checkbox',checked:false},
    new MenuItem({label: '这是menuItem生成的菜单', click: ()=>{
      console.log('这是menuItem生成的菜单');
    }},),
    {
      label:'多级菜单',
      submenu: [
        {label: '剪切',role: 'undo'},
        {label: '重做',role: 'redo'},
        {label: '刷新',role: 'reload'},
      ]
    }

  ]
  console.log(Menu)
  const menu = Menu.buildFromTemplate(template)
  // Menu.setApplicationMenu(menu) //会改变头部主菜单
  menu.popup();//弹出菜单
}

/* 网络请求模块 */
function request() {
  const {net} = require('electron').remote
  const request =  net.request('https://www.baidu.com')
  request.on('response',(val)=> {
    console.log(val)
  })
  request.end()
}