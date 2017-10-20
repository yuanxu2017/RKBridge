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
  , assert = require('assert')
  , async = require('async')
  , extend = require('extend')
  , c = require('./const');

function SSDPServer(opts) {
  this._subclass = 'node-ssdp:server';
  SSDP.call(this, opts)
}

util.inherits(SSDPServer, SSDP);


/**
 * Binds UDP socket to an interface/port
 * and starts advertising.
 *
 * @param {function} cb to socket.bind
 * @returns [Promise] promise when socket.bind is ready
 */
SSDPServer.prototype.start = function (cb) {
  const self = this;

  if (self._socketBound) {
    self._logger('Server already running.');
    return
  }

  self._socketBound = true;

  if (!self._suppressRootDeviceAdvertisements) {
    this._usns[this._udn] = this._udn;
  }

  return new Promise(function (success, failure) {
    function onBind(err) {
      self._initAdLoop.apply(self, arguments);
      if (cb) cb.apply(self, arguments);
      if (err) return failure(err);
      success();
    }

    self._start(onBind)
  })
};


/**
 * Binds UDP socket
 *
 * @param ipAddress
 * @private
 */
SSDPServer.prototype._initAdLoop = function () {
  const self = this;

  // Wake up.
  setTimeout(self.advertise.bind(self), 3000);

  self._startAdLoop()
};


/**
 * Advertise shutdown and close UDP socket.
 */
SSDPServer.prototype.stop = function () {
  if (!this._started) {
    this._logger('Already stopped.');
    return
  }

  this.advertise(false, () => {
    this._stopAdLoop();
    this._stop()
  });
};


SSDPServer.prototype._startAdLoop = function () {
  assert.equal(this._adLoopInterval, null, 'Attempting to start a parallel ad loop')

  this._adLoopInterval = setInterval(this.advertise.bind(this), this._adInterval)
};


SSDPServer.prototype._stopAdLoop = function () {
  assert.notEqual(this._adLoopInterval, null, 'Attempting to clear a non-existing interval')

  clearInterval(this._adLoopInterval)
  this._adLoopInterval = null
};


/**
 *
 * @param alive
 */
SSDPServer.prototype.advertise = function (alive, cb) {
  const self = this;

  if (!this._socketBound) return cb && cb();

  if (alive === undefined) alive = true;

  async.series(Object.keys(self._usns).map(usn => {
    return function (cb) {
      const udn = self._usns[usn];
      const nts = alive ? c.SSDP_ALIVE : c.SSDP_BYE; // notification sub-type

      const heads = {
        'HOST': self._ssdpServerHost,
        'NT': usn, // notification type, in this case same as ST
        'NTS': nts,
        'USN': udn
      };

      if (alive) {
        heads.LOCATION = self._location;
        heads['CACHE-CONTROL'] = 'max-age=1800';
        heads.SERVER = self._ssdpSig // why not include this?
      }

      extend(heads, self._extraHeaders);

      self._logger('Sending an advertisement event');

      const message = self._getSSDPHeader(c.NOTIFY, heads);

      self._send(new Buffer(message), function (err, bytes) {
        if (err) {
          return cb(err);
        }
        self._logger('Outgoing server message: %o', {'message': message});
        cb();
      })
    }
  }), cb || function () {
    });
};

module.exports = SSDPServer;
