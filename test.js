const ROKID = require('./index')

var devices = [];
for(let i = 0; i< 3; i++) {
    devices.push({
        name: 'Device' + i,
        deviceId: i.toString(),
        actions: {
            switch: ['on', 'off']
        },
        state: {
            switch: null
        },
        type: 'light'
    })
}

function exeCommand(args) {
    console.log('test args:',JSON.stringify(args));
    return true;
}

var main = new ROKID(exeCommand);
main.start('192.168.0.109','9999',devices,'wlp3s0');