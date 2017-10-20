// const exec = require('child_process').exec;

//mock devices
const devices = [];


exports.start = function(PORT, ADDRESS,devs,executeFunc, cb) {
    if(devs){
        devs.forEach(function (dev) {
            devices.push(dev);
        });
    }

    ADDRESS = ADDRESS || '0.0.0.0';
    // jayson is json-rpc server
    const jayson = require('jayson');

    const server = jayson.server({
        list: function(args, callback) {
            console.log(JSON.stringify(args, null, 4));
            callback(null, devices);
        },
        get: function(args, callback) {
            console.log(JSON.stringify(args, null, 4));
            const devices = [];
            callback(null, devices.find(dev => dev.deviceId === args.device.deviceId));
        },
        execute: function(args, callback) {
            const s = args.action.name;
            // console.log('args:',JSON.stringify(args));
            console.log('action:',s);
            return new Promise(function(success, failure) {
                function onBind(result) {
                    if (result){
                        console.log('return true')
                        callback(null, {
                            switch: s === 'on' ? 'off' : 'on'
                        });
                        return success();
                    }else {
                        console.log('return false')
                        callback(null, {
                            switch: s
                        });
                        return failure('err');
                    }
                };
                executeFunc(args,onBind);
            })


        }
    });

    server.tcp().listen(PORT, ADDRESS);
    console.log('server listen on port %s:%s', ADDRESS, PORT);
    cb(null, PORT);
};
