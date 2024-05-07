const outputTextArea = document.getElementById('output');
const btn = document.getElementById('btn')
const filePathElement = document.getElementById('filePath')

document.getElementById('runExeBtn').addEventListener('click', () => {
    var robotFilePath = filePathElement.innerText;
    if (!robotFilePath || robotFilePath == '') {
        alert("请选择要执行的robot");
        return;
    }
    window.electronAPI.callRcc(null, ["run", "-r", robotFilePath]);
});


window.electronAPI.registerEventListener('command-output', (sender, data) => {
    outputTextArea.value += data;
});

window.electronAPI.registerEventListener('command-closed', (sender, code) => {
    outputTextArea.value += `命令执行完毕，退出码: ${code}\n`;
});



btn.addEventListener('click', async () => {
    const filePath = await window.electronAPI.openFile()
    if (!filePath || filePath == '') {
        return;
    }
    filePathElement.innerText = filePath
})

document.getElementById('clearOutputBtn').addEventListener('click', () => {
    outputTextArea.value = "";
});

document.getElementById('stopBtn').addEventListener('click', () => {
    window.electronAPI.stopRcc();
});