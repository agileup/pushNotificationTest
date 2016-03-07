var _ = require('lodash');
var constant = require('./constant');
var request = require('./request');

var validHosts = [
    'api.push.baidu.com',
    'api.tuisong.baidu.com',
    'channel.api.duapp.com'
];

/**
 * Baidu Push Client Constructor
 *
 * @param {string} options.apiKey
 * @param {string} options.secretKey
 * @param {number} [options.timeout]
 * @param {number} [options.maxSockets]
 */
var BaiduPushClient = function(options) {
    if (!options.apiKey || typeof options.apiKey !== 'string' || options.apiKey.length <= 0) {
        throw new Error('apiKey must be a string with length > 0');
    }

    if (!options.secretKey || typeof options.secretKey !== 'string' || options.secretKey.length <= 0) {
        throw new Error('secretKey must be a string with length > 0');
    }

    this.pair = {
        apiKey: options.apiKey,
        secretKey: options.secretKey
    };
    this.apiKey = this.pair.apiKey;
    this.secretKey = this.pair.secretKey;
    this.timeout = options.timeout || 5000;
    this.protocol = 'http://';
    this.host = options.host || validHosts[0];
    this.agent = {
        maxSockets: options.maxSockets || 20
    };

    if (!_.includes(validHosts, this.host)) {
        throw new Error('host should in: ' + validHosts);
    }

    return this;
};

var prototype = BaiduPushClient.prototype;

prototype.request = request;

prototype.pushMsgToSingleDevice = function(channel_id, msg, options, callback) {
    if (_.isFunction(options)) {
        callback = options;
        options = {};
    }

    var data = {
        channel_id: channel_id,
        msg: JSON.stringify(msg)
    };

    _.extend(data, options);

    this.request(constant.API.pushMsgToSingleDevice, data, callback);
};

prototype.pushMsgToAll = function(msg, options, callback) {
  if (_.isFunction(options)) {
    callback = options;
    options = {};
  }

  var data = {
    msg: JSON.stringify(msg)
  };
  _.extend(data, options);

  this.request(constant.API.pushMsgToAll, data, callback);
};

prototype.pushMsgToTag = function(tagName, msg, options, callback) {
  if (_.isFunction(options)) {
    callback = options;
    options = {};
  }

  var data = {
    type: 1, // 目前此值固定
    tag: tagName,
    msg: JSON.stringify(msg)
  };
  _.extend(data, options);

  this.request(constant.API.pushMsgToTag, data, callback);
};

prototype.pushBatchUniMsg = function(channel_ids, msg, options, callback) {
  if (_.isFunction(options)) {
    callback = options;
    options = {};
  }

  var data = {
    channel_ids: channel_ids,
    msg: JSON.stringify(msg)
  };
  _.extend(data, options);

  this.request(constant.API.pushBatchUniMsg, data, callback);
};

prototype.queryMsgStatus = function(msg_id, callback) {
  this.request(constant.API.queryMsgStatus, {msg_id: msg_id}, callback);
};

prototype.queryTimerRecords = function(timer_id, options, callback) {
  if (_.isFunction(options)) {
    callback = options;
    options = {};
  }

  var data = {
    timer_id: timer_id
  };
  _.extend(data, options);

  this.request(constant.API.queryTimerRecords, data, callback);
};

prototype.queryTopicRecords = function(topic_id, options, callback) {
  if (_.isFunction(options)) {
    callback = options;
    options = {};
  }

  var data = {
    topic_id: topic_id
  };
  _.extend(data, options);

  this.request(constant.API.queryTopicRecords, data, callback);
};

prototype.queryTimerList = function(options, callback) {
  if (_.isFunction(options)) {
    callback = options;
    options = {};
  }

  this.request(constant.API.queryTimerList, options, callback);
};

prototype.queryTopicList = function(options, callback) {
  if (_.isFunction(options)) {
    callback = options;
    options = {};
  }

  this.request(constant.API.queryTopicList, options, callback);
};

prototype.queryTags = function(options, callback) {
  if (_.isFunction(options)) {
    callback = options;
    options = {};
  }

  var data = {};
  _.extend(data, options);

  this.request(constant.API.queryTags, data, callback);
};

prototype.createTag = function(tag, callback) {
  this.request(constant.API.createTag, {tag: tag}, callback);
};

prototype.deleteTag = function(tag, callback) {
  this.request(constant.API.deleteTag, {tag: tag}, callback);
};

prototype.addDevicesToTag = function(tag, channel_ids, callback) {
  var data = {
    tag: tag,
    channel_ids: channel_ids
  };

  this.request(constant.API.addDevicesToTag, data, callback);
};

prototype.deleteDevicesFromTag = function(tag, channel_ids, callback) {
  var data = {
    tag: tag,
    channel_ids: channel_ids
  };

  this.request(constant.API.deleteDevicesFromTag, data, callback);
};

prototype.queryDeviceNumInTag = function(tag, callback) {
  this.request(constant.API.queryDeviceNumInTag, {tag: tag}, callback);
};

prototype.queryStatisticTopic = function(topic_id, callback) {
  this.request(constant.API.queryStatisticTopic, {topic_id: topic_id}, callback);
};

prototype.queryStatisticDevice = function(callback) {
  this.request(constant.API.queryStatisticDevice, {}, callback);
};

module.exports = BaiduPushClient;
