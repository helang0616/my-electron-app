function init() {
    if (!window.electronAPI) {
        document.body.innerHTML = '<h1>请在 Electron 中运行此应用</h1>';
        return;
    }

    const outputTextArea = document.getElementById('output');
    const btn = document.getElementById('btn');
    const filePathElement = document.getElementById('filePath');
    const runRccBtn = document.getElementById('runRccBtn');
    const clearOutputBtn = document.getElementById('clearOutputBtn');
    const stopBtn = document.getElementById('stopBtn');

    runRccBtn.addEventListener('click', () => {
        var robotFilePath = filePathElement.innerText;
        if (!robotFilePath || robotFilePath == '') {
            window.electronAPI.showDialog("请选择要执行的robot");
            return;
        }
        window.electronAPI.callRcc(null, ["run", "-r", robotFilePath]);
    });

    btn.addEventListener('click', async () => {
        const filePath = await window.electronAPI.openFile()
        if (!filePath || filePath == '') {
            return;
        }
        filePathElement.innerText = filePath
    })

    clearOutputBtn.addEventListener('click', () => {
        outputTextArea.value = "";
    });

    stopBtn.addEventListener('click', () => {
        window.electronAPI.stopRcc();
    });


    window.electronAPI.registerEventListener('command-output', (sender, data) => {
        outputTextArea.value += data;
    });

    window.electronAPI.registerEventListener('command-closed', (sender, code) => {
        outputTextArea.value += `命令执行完毕，退出码: ${code}\n`;
    });


}

init();