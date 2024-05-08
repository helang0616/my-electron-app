const { contextBridge, ipcRenderer } = require('electron/renderer');

contextBridge.exposeInMainWorld('electronAPI', {
    openFile: () => ipcRenderer.invoke('dialog:openFile'),
    callRcc: (sender, args) => ipcRenderer.send('rcc:run', sender, args),
    stopRcc: () => ipcRenderer.send('rcc:stop'),
    registerEventListener: (eventType, callback) => {
        ipcRenderer.on(eventType, (event, ...data) => {
            callback(...data);
        });
    },
    showDialog: (message) => ipcRenderer.invoke('dialog:showMessageBox', message)
})
