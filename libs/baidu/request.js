var _ = require('lodash');
var os = require('os');
var process = require('process');
var request = require('request');

var signKey = require('./sign');
var BaiduPushError = require('./error');

module.exports = function(url, data, callback) {
    var options = {
        headers: {
            'User-Agent': 'BCCS_SDK/3.0 (' + os.type() + ') node/' + process.version + ' (Baidu Push Server SDK V3.0.0)',
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        }
    };

    options.method = 'POST';
    options.url = this.protocol + this.host + url;
    options.gzip = true;
    options.json = true;

    for (var key in data) {
        if (_.isArray(data[key])) {
            data[key] = JSON.stringify(data[key]);
        }
    }

    options.form = data;
    _.extend(options.form, {
        apikey: this.pair.apiKey,
        timestamp: Math.floor(Date.now() / 1000)
    });

    options.form.sign = signKey(options.url, data, this.pair.secretKey);

    request(options, function(err, res, data) {
        if (!err && data.error_code) {
            err = new BaiduPushError(data.error_msg);
            err.code = data.error_code;
            err.requestId = data.request_id;
        }

        if (err) {
            callback(err);
        } else {
            callback(null, data.response_params);
        }
    });
};
