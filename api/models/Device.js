/**
 * Device.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    attributes: {
        gcm: {
            type: 'string',
            required: true
        },
        baidu: {
            type: 'string',
            required: true
        }
    }
};
