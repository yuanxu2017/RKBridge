const bridgeServer = require('./bridge-server');
const ssdpServer = require('./ssdp-server');
const PORT = 9999;
const uuid = require('node-uuid');

function Rokid() {
    
}
// Start Bridge first
Rokid.prototype.start = function(ip,port,networkEquipment){
    bridgeServer.start(port || PORT, null, (err, iPort) => {
  // then start the ssdp server to broad cast your servcie
    console.log(`tcp://${ip}:${iPort}`)
    
  ssdpServer.start({location:`tcp://${ip}:${iPort}`,UUID:uuid.v4(),networkEquipment:networkEquipment});
 });
}

module.exports = Rokid;