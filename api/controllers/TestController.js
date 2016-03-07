var _ = require('lodash');
var async = require('async');
var path = require('path');
var request = require('request');
var gcmPusher = require(path.resolve('api/pushers/gcmPusher'));
var baiduPusher = require(path.resolve('api/pushers/baiduPusher'));

var _sleep = function(idx, cb) {
    sails.log("sleep", idx);
    setTimeout(function() {
        cb();
    }, 10000);
};

var _pusher = function(device, idx, num, callback) {
    num++;
    async.auto({
        sendGCM: function(cb) {
            if (idx === 3) {
                return cb();
            }

            // var message = new gcm.Message({
            //     collapseKey: 'demo',
            //     priority: 'high',
            //     contentAvailable: true,
            //     delayWhileIdle: true,
            //     timeToLive: 3,
            //     restrictedPackageName: "somePackageName",
            //     dryRun: true,
            //     data: {
            //         key1: 'message1',
            //         key2: 'message2'
            //     },
            //     notification: {
            //         title: "Hello, World",
            //         icon: "ic_launcher",
            //         body: "This is a notification that will be displayed ASAP."
            //     }
            // });
            cb();
        },
        sendBaidu: function(cb) {
            if (idx === 3) {
                return cb();
            }

            var msg = {
                title: idx,
                description: num, //必选
                custom_content: {}
            };

            baiduPusher.push(device.baidu, msg, function() {});
            cb();
        },
        sendBaidu2: function(cb) {
            if (idx != 3) {
                return cb();
            }

            var msg = {
                title: idx,
                description: num, //必选
                custom_content: {}
            };

            baiduPusher.push(device.baidu, msg, cb);
        }
    }, callback);
};

var _builder = function(device, idx, count, callback) {
    async.auto({
        pusher: function(cb) {
            var start = _.now();
            sails.sockets.broadcast(device.id, { log: 'test#' + idx + ' set' });
            var arr = _.range(count);
            async.eachSeries(arr, function(i, cb2) {
                _pusher(device, idx, i, cb2);
            }, function(err) {
                var cost = _.now() - start;
                sails.sockets.broadcast(device.id, { log: 'test#' + idx + ' finished in ' + cost + 'ms'});
                cb(err);
            });
        },
        sleep: ['pusher', _.partial(_sleep, idx)]
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
            res.json({
                error: err,
                message: socketId + ' connected on ' + req.body.id
            });
        });
    },
    start: function(req, res) {
        if (!req.body.gcm || !req.body.baidu) {
            return res.badRequest();
        }

        var countSet = [1, 10, 100, 100];
        var idx = 0;
        sails.sockets.broadcast(req.body.id, { log: '>>> start(' + _.now() + ')'});
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
                return res.serverError();
            }

            sails.sockets.broadcast(req.body.id, { log: '>>> complete(' + _.now() + ')'});
            sails.log.info("test completed!");

            res.json({
                id: req.body.id
            });
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
        sails.log(req.query);
        res.json({});
    }
};
