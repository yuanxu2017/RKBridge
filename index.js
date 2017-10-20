const bridgeServer = require('./bridge-server');
const ssdpServer = require('./ssdp-server');
const PORT = 9999;
const uuid = require('node-uuid');

let cmdFunc = undefined;

function Rokid(func) {
    cmdFunc = func;
}
// Start Bridge first
Rokid.prototype.start = function(ip,port,devs,networkEquipment){
    bridgeServer.start(port || PORT, null,devs,this.executeCmd, (err, iPort) => {
        console.log(`tcp://${ip}:${iPort}`)

        ssdpServer.start({location:`tcp://${ip}:${iPort}`,UUID:uuid.v4(),networkEquipment:networkEquipment});
    });
}

Rokid.prototype.executeCmd = function (args,onBind) {

    if(cmdFunc != undefined){
        if(cmdFunc(args)){
            onBind(true);
        }else{
            onBind(false);
        }
    }else {
        onBind(false);
    }

}

module.exports = Rokid;