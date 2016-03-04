var _ = require('lodash');
var gcm = require('node-gcm');
var path = require('path');

var push = function(tokens, message) {
    gcmSender().send(message, tokens, 4, function(err, res) {
        if (err) {
            logger.error(err);
        }

        if (res && res.failure > 0) {
            var mappedResults = _.map(_.zip(tokens, res.results), function(arr) {
                return _.merge({ token: arr[0] }, arr[1]);
            });

            handleResults(mappedResults);
        }
    });
};

var handleResults = function(results) {
    var idsToUpdate = []
      , idsToDelete = [];

    results.forEach(function(result) {
        if (!!result.registration_id) {
            idsToUpdate.push({
                from: result.token,
                to: result.registration_id
            });
        } else if (result.error === 'InvalidRegistration' || result.error === 'NotRegistered') {
            idsToDelete.push(result.token);
        }
    });

    if (idsToUpdate.length > 0) {
        // TODO: 토큰 업데이트
        //pushAssociations.updateTokens(idsToUpdate);
    }
    if (idsToDelete.length > 0) {
        // TODO: 토큰 삭제
        //pushAssociations.removeDevices(idsToDelete);
    }
};

var buildPayload = function(options) {
    return new gcm.Message(options);
};

var gcmSender = _.once(function() {
    return new gcm.Sender('apiKey');
});

module.exports = {
    push: push,
    buildPayload: buildPayload
};
