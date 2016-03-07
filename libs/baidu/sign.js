/**
 * Signature generation request and uri coding
 * http://push.baidu.com/doc/restapi/sdk_developer
 */
var crypto = require('crypto');

function fullEncodeURIComponent (str) {
    var rv = encodeURIComponent(str).replace(/[!'()*~]/g, function(c) {
        return '%' + c.charCodeAt(0).toString(16).toUpperCase();
    });
    return rv.replace(/\%20/g,'+');
}

var signKey = function(url, param, secretKey) {
    var paramStr = '';
    var keys = Object.keys(param).sort();
    keys.forEach(function(key) {
        paramStr += key + '=' + param[key];
    });

    var basekey = 'POST' + url + paramStr + secretKey;

    var md5 = crypto.createHash('md5');
    basekey = fullEncodeURIComponent(basekey);
    md5.update(basekey);

    return md5.digest('hex');
};

module.exports = signKey;
