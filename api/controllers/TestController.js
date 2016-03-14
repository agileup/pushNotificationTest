'use strict';

var _ = require('lodash');
var async = require('async');
var path = require('path');
var request = require('request');
var gcmPusher = require(path.resolve('api/pushers/gcmPusher'));
var baiduPusher = require(path.resolve('api/pushers/baiduPusher'));

var SLEEP_TIME = 30000;

var _sleep = function(duration, cb) {
    // sails.log.info("test.start> sleep for " + duration/1000 + "s");
    setTimeout(function() {
        cb();
    }, duration);
};

var _pusher = function(device, idx, num, callback) {
    num++;

    var interval = (idx == 6) ? 100 : 1000;
    sails.log.info("test.push> { id: '" + device.id + "', title: '" + idx + "', body: '" + num + "' }");

    async.auto({
        sendGCM: function(cb) {
            var message = {
                collapseKey: 'demo',
                delayWhileIdle: true,
                timeToLive: 3,
                data: {
                    title: idx,
                    message: num,
                    custom_content: {}
                }
            };

            var payload = gcmPusher.buildPayload(message);
            var registrationTokens = {
                registrationTokens: [device.gcm]
            };

            gcmPusher.push(registrationTokens, payload);
            cb();
        },
        sendBaidu: function(cb) {
            var msg = {
                title: idx,
                description: num,
                custom_content: {}
            };

            baiduPusher.push(device.baidu, msg, function() {});
            cb();
        },
        sleep: ['sendGCM', 'sendBaidu', _.partial(_sleep, interval)]
    }, callback);
};

var _builder = function(device, idx, count, callback) {
    async.auto({
        pusher: function(cb) {
            var start = _.now();
            sails.log.info("test.start> test#" + idx + " start");
            sails.sockets.broadcast(device.id, { log: 'test#' + idx + ' in progress' });
            var arr = _.range(count);
            async.eachSeries(arr, function(i, cb2) {
                _pusher(device, idx, i, cb2);
            }, function(err) {
                var cost = _.now() - start;
                sails.sockets.broadcast(device.id, { log: 'test#' + idx + ' finished in ' + cost + 'ms'});
                sails.log.info("test.start> test#" + idx + " done");
                cb(err);
            });
        },
        sleep: ['pusher', _.partial(_sleep, SLEEP_TIME)]
    }, function(err) {
        callback(err);
    });
};

var host = process.env.HOST || 'localhost:1337'
module.exports = {
    connect: function(req, res) {
        if (!req.isSocket) {
            return res.badRequest();
        }

        var socketId = sails.sockets.getId(req);
        sails.sockets.join(req, req.body.id, function(err) {
            sails.log.info("test.connect> " + socketId + ' connected on device#' + req.body.id);
            res.json({
                error: err
            });
        });
    },
    start: function(req, res) {
        if (!req.body.gcm || !req.body.baidu) {
            return res.badRequest();
        }

        var countSet = [1, 10, 10, 10, 10, 50];
        var idx = 0;
        sails.sockets.broadcast(req.body.id, { log: '>>> start(' + _.now() + ')'});
        sails.log.info("test.start> device#" + req.body.id + " start");
        async.eachSeries(countSet, function(count, cb) {
            idx++;
            request({
                url: 'http://' + host + '/test/push',
                method: 'GET',
                qs: {
                    id: req.body.id,
                    gcm: req.body.gcm,
                    baidu: req.body.baidu,
                    idx: idx,
                    count: count
                }
            }, function(err, response, body) {
                if (err) {
                    sails.log.error(err);
                }

                cb(err, body);
            });
        }, function(err) {
            if (err) {
                sails.log.error("/start", err);
            }

            sails.sockets.broadcast(req.body.id, { log: '>>> complete(' + _.now() + ')'});
            sails.log.info("test.start> device#" + req.body.id + " complete");
        });

        res.json({
            id: req.body.id
        });
    },
    push: function(req, res) {
        var device = {
            id: req.query.id,
            gcm: req.query.gcm,
            baidu: req.query.baidu
        };

        _builder(device, req.query.idx, req.query.count, function(err, data) {
            if (err) {
                sails.log.error("/push", err);
                return res.serverError();
            }

            res.json();
        });
    },
    receive: function(req, res) {
        sails.log.info("test.ok>", req.query);
        res.json({});
    }
};
