'use strict';

/*
 MIT License

 Copyright (c) 2016 Ilya Shaisultanov

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

const SSDP = require('./ssdp')
  , util = require('util')
  , c = require('./const');

/**
 *
 * @param opts
 * @constructor
 */
function SsdpClient(opts) {
  this._subclass = 'ssdp-client'
  SSDP.call(this, opts)
}



util.inherits(SsdpClient, SSDP);


/**
 * Start the listener for multicast notifications from SSDP devices
 * @param {function} cb
 */
SsdpClient.prototype.start = function (cb) {
  const self = this;
  return new Promise(function(success, failure) { 
    function onBind(err) {
      if (cb) cb.apply(self, arguments);
      if (err) return failure(err);
      success()
    }
    self._start(onBind)
  })
};


/**
 *Close UDP socket.
 */
SsdpClient.prototype.stop = function () {
  this._stop();
};


/**
 *
 * @param {String} serviceType
 * @returns {*}
 */
SsdpClient.prototype.search = function search(serviceType) {
  const self = this;

  if (!this._started) {
    return this.start(function () {
      self.search(serviceType)
    })
  }

  const pkt = self._getSSDPHeader(
    c.M_SEARCH,
    {
      'HOST': self._ssdpServerHost,
      'ST': serviceType,
      'MAN': '"ssdp:discover"',
      'MX': 3
    }
  );

  self._logger('Sending an M-SEARCH request');

  var message = new Buffer(pkt)

  self._send(message, function (err, bytes) {
    self._logger('Sent M-SEARCH request: %o', {'message': pkt})
      // console.log('Sent M-SEARCH request: %o', {'message': pkt});
  })
};



module.exports = SsdpClient;
