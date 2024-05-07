const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { spawn, exec } = require('child_process');

const path = require('path');

let rccParentDir = __dirname;
if (app.isPackaged) {
    rccParentDir = process.resourcesPath;
}

const rccPath = path.join(rccParentDir, 'rcc');
const rccExecutionPath = path.join(rccPath, 'rcc.js');

const configurationName = 'boss'
const configurationFilePath = path.join(rccPath, 'config', `${configurationName}.yaml`);

let processList = [];

function createWindow() {
    const win = new BrowserWindow({
        width: 1600,
        height: 900,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.loadFile('index.html');
    setRccConfiguration();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// 监听渲染进程发送的消息
ipcMain.on('rcc:run', (event, sender, args) => {
    // 执行 rcc 命令
    var execCommand = rccExecutionPath;
    for (const arg of args) {
        execCommand += ` ${arg}`;
    }
    event.sender.send('command-output', sender, execCommand + "\n");
    // 执行命令
    args.unshift(rccExecutionPath);
    const commandProcess = spawn('node', args);
    processList.push(commandProcess);

    commandProcess.on('error', (error) => {
        console.error(`Error occurred while trying to start the process: ${error}`);
    });

    commandProcess.stdout.on('data', (data) => {
        event.sender.send('command-output', sender, data.toString('utf8'));
    });

    commandProcess.stderr.on('data', (data) => {
        event.sender.send('command-output', sender, data.toString('utf8'));
    });

    commandProcess.on('close', (code) => {
        event.sender.send('command-closed', sender, code);
    });

    // 监听子进程的 exit 事件
    commandProcess.on('exit', (code, signal) => {
        if (signal === 'SIGTERM') {
            console.log('子进程已被 SIGTERM 终止');
        } else {
            console.log(`子进程已退出，退出码：${code}, signal: ${signal}`);
        }
    });

});

ipcMain.on('rcc:stop', (event) => {
    while (processList && processList.length > 0) {
        let process = processList.pop();
        console.log("stop process");
        process.kill('SIGTERM');
    }
});



async function handleFileOpen() {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        title: '选择 ROBOT YAML 文件',
        filters: [
            { name: 'YAML 文件', extensions: ['yaml', 'yml'] }
        ],
        properties: ['openFile']
    })
    if (!canceled) {
        return filePaths[0]
    }
}
ipcMain.handle('dialog:openFile', handleFileOpen);




async function setRccConfiguration() {
    const command1 = `node ${rccExecutionPath} configuration import --filename ${configurationFilePath}`
    const command2 = `node ${rccExecutionPath} configuration switch --profile ${configurationName}`

    // 执行第一条命令
    const process1 = exec(command1);
    console.log(command1);
    process1.on('exit', (code1) => {
        console.log(`第一条命令退出码: ${code1}`);

        // 执行第二条命令
        console.log(command2);
        const process2 = exec(command2);

        process2.on('exit', (code2) => {
            console.log(`第二条命令退出码: ${code2}`);
        });
    });


}

