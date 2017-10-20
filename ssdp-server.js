exports.start = function(parameters) {

  const Server = require('./lib/server');

  const server = new Server({
    udn: 'uuid:'+parameters.uuid,//'uuid:f40c2981-7329-40b7-8b04-27f187aecfb8',
    location: parameters.location,
    headers: {
      DEVICE_TYPE: 'bridge'
    },
      networkEquipment:parameters.networkEquipment
  });

  server.addUSN('homebase:device');
  server.start();

  // const Client = require('./lib/client');
  //
  // const client = new Client({
  //     udn: 'uuid:f40c2981-7329-40b7-8b04-27f187aecfb8',
  //     location: location,
  //     headers: {
  //         DEVICE_TYPE: 'SINGLE'
  //     },
  //     networkEquipment:'wlp3s0'
  //
  // });
  //
  // setInterval(function () {
  //     client.search('homebase:device');
  // },5000);

  process.on('exit', function(){
    server.stop();
    // client.stop();
  });
};
