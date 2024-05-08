var currentDomain = "127.0.0.1";
var currentPort = "8080";
var stompClient;
function setConnected(connected) {
    $("#connect").prop("disabled", connected);
    $("#connect").toggleClass("btn-disabled", connected);
    $("#disconnect").prop("disabled", !connected);
    $("#disconnect").toggleClass("btn-disabled", !connected);
}


function connect() {
    var username = $("#username").val();
    if (!username || username.length === 0) {
        window.electronAPI.showDialog("请输入连接用户名");
        return;
    }
    stompClient = new StompJs.Client({
        brokerURL: 'ws://' + currentDomain + ':' + currentPort + '/gs-guide-websocket',
        // 在连接时传递的额外的头信息，比如用户名
        connectHeaders: {
            username: username,
            // 也可以添加其他需要的头信息
        }
    });
    stompClient.onConnect = (frame) => {
        setConnected(true);
        console.log('Connected: ' + frame);

        // 只订阅发给自己的
        stompClient.subscribe('/user/topic/greetings', (message) => {
            var messageBody = JSON.parse(message.body);
            var messageData = decodeURIComponent(messageBody['data']);
            var msgType = messageBody['msgType'];
            var sender = messageBody['sender'];
            if (msgType === 'command') {
                var commandData = JSON.parse(messageData);
                window.electronAPI.callRcc(sender, commandData['args']);
            } else if (msgType === 'stop') {
                window.electronAPI.stopRcc();
            }
            

        });
    };

    stompClient.onWebSocketError = (error) => {
        console.error('Error with websocket', error);
    };

    stompClient.onStompError = (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
    };
    stompClient.activate();
}

function disconnect() {
    stompClient.deactivate();
    setConnected(false);
    console.log("Disconnected");
}

document.getElementById('connect').addEventListener('click', connect);
document.getElementById('disconnect').addEventListener('click', disconnect);

window.electronAPI.registerEventListener('command-output', (sender, data) => {
    if (stompClient && stompClient.state === 0 && sender) {
        stompClient.publish({
            destination: "/app/hello",
            body: JSON.stringify({'content': data, 'receiver': sender, 'msgType': 'log'})
        });
    }
});

window.electronAPI.registerEventListener('command-closed', (sender, code) => {
    if (stompClient && stompClient.state === 0 && sender) {
        stompClient.publish({
            destination: "/app/hello",
            body: JSON.stringify({'content': `命令执行完毕，退出码: ${code}\n`, 'receiver': sender, 'msgType': 'log'})
        });
    }
});