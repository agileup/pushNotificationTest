var _ = require('lodash');
var path = require('path');
var baidu = require(path.resolve('libs/baidu/client'));

/**
 * Push to Single Device with Baidu Server
 *
 * @param {string} channel_id
 * @param {object} payload
 */
var pushSingle = function(channel_id, payload) {
    var options = {
        msg_type: 1,
        msg_expires: 18000
    };

    baiduSender().pushMsgToSingleDevice(channel_id, payload, options, function(err, data) {
        console.log("error>", err);
        console.log("data>", data);
    });
};

var baiduSender = _.once(function() {
    var options = {
        apiKey: 'apiKey',
        secretKey: 'secretKey',
        timeout: 2000,
        maxSockets: 18
    };

    return new baidu(options);
});

module.exports = {
    push: pushSingle
};
