//Get required modules
var util = require('util');
var crypto = require('crypto');
var Request = require('request');
var plivoError = require('./plivoError');
var Response = require('./plivoResponse');
//var doc = xmlBuilder.create('');
var plivo = function () {
    this.options = {};
    this.options.host = 'api.plivo.com';
    this.options.version = 'v1';
    this.options.authToken = '';
    this.UserAgent = 'NodePlivo';
    this.plivoError = plivoError;
};
plivo.prototype.request = function (action, method, params, callback, optional) {
    if (optional) {
        if (typeof params != 'object') {
            if (typeof params == 'function') {
                var callback = params;
            }
        }
    }
    var err;
    var path = 'https://' + this.options.host + '/' + this.options.version + '/Account/' + this.options.authId + '/' + action;
    var headers;
    var request_options = {
        uri: path,
        headers: headers,
        json: true
    };
    if (method == 'POST') {
        request_options.json = params;
        Request.post(request_options, function (error, response, body) {
            if (error || !response) {
            }
            if (response.statusCode != 201) {
                err = new plivoError(error);
            }
            callback(response.statusCode, body);
        });
    } else if (method == 'GET') {
        request_options.qs = params;
        Request.get(request_options, function (error, response, body) {
            callback(response.statusCode, body);
        });
    } else if (method == 'DELETE') {
        Request.del(request_options, function (error, response, body) {
            callback(response.statusCode, body);
        });
    }
};
// For verifying the plivo server signature
plivo.prototype.create_signature = function (url, params) {
    var toSign = url;
    Object.keys(params).sort().forEach(function (key) {
        toSign += key + params[key];
    });
    var signature = crypto.createHmac('sha1', this.options.authToken).update(new Buffer(toSign)).digest('base64');
    return signature;
};
// Express middleware for verifying signature
plivo.prototype.middleware = function (options) {
};
// Calls
plivo.prototype.make_call = function (params, callback) {
    var action = 'Call/';
    var method = 'POST';
    this.request(action, method, params, callback);
};
plivo.prototype.get_cdrs = function (params, callback) {
    var action = 'Call/';
    var method = 'GET';
    this.request(action, method, params, callback, true);
};
plivo.prototype.get_cdr = function (params, callback) {
    var action;
    delete params.call_uuid;
};
plivo.prototype.get_live_calls = function () {
    var action = 'Call/';
    var method = 'GET';
    params.status = 'live';
    this.request(action, method, true);
};
plivo.prototype.get_live_call = function (params) {
    var action = 'Call/' + params['call_uuid'] + '/';
    delete params.call_uuid;
    params.status = 'live';
};
plivo.prototype.hangup_all_calls = function (callback) {
    var action = 'Call/';
    var method = 'DELETE';
    var params;
    this.request(action, method, params, callback);
};
plivo.prototype.hangup_call = function (params, callback) {
    var action;
    delete params.call_uuid;
    var method = 'DELETE';
};
plivo.prototype.record = function (params) {
    var action = 'Call/' + params['call_uuid'] + '/Record/';
    this.request(action, method);
};
plivo.prototype.record_stop = function (params) {
    var action = 'Call/' + params['call_uuid'] + '/Record/';
};
plivo.prototype.speak = function (params) {
    var action = 'Call/' + params['call_uuid'] + '/Speak/';
    var method;
    this.request(action);
};
plivo.prototype.speak_stop = function (params) {
    var action;
    var method;
    this.request(action, method);
};
plivo.prototype.send_digits = function (params) {
    var action = 'Call/' + params['call_uuid'] + '/DTMF/';
    var method = 'POST';
};
// Request
plivo.prototype.hangup_request = function (params) {
    var action;
    delete params.request_uuid;
    this.request(action, method);
};
plivo.prototype.hangup_conference_member = function (params, callback) {
    var action = 'Conference/' + params['conference_id'] + '/Member/' + params['member_id'] + '/';
    delete params.conference_id;
    delete params.member_id;
    var method = 'DELETE';
    this.request(action, method);
};
plivo.prototype.play_conference_member = function (params) {
    var action;
    var method;
};
plivo.prototype.stop_play_conference_member = function (params) {
    var action = 'Conference/' + params['conference_id'] + '/Member/' + params['member_id'] + '/Play/';
    delete params.conference_id;
    var method;
};
plivo.prototype.stop_speak_conference_member = function (params) {
    var action = 'Conference/' + params['conference_id'] + '/Member/' + params['member_id'] + '/Speak/';
    delete params.conference_id;
    var method;
    this.request(action, params);
};
plivo.prototype.mute_conference_member = function (params) {
    var action = 'Conference/' + params['conference_id'] + '/Member/' + params['member_id'] + '/Mute/';
    delete params.conference_id;
};
plivo.prototype.kick_conference_member = function (params) {
    var action;
    delete params.member_id;
    var method;
    this.request(action, params, callback);
};
plivo.prototype.record_conference = function (params) {
    var action = 'Conference/' + params['conference_id'] + '/Record/';
    this.request(action, params, callback);
};
plivo.prototype.stop_record_conference = function () {
    var action;
    var method;
    this.request(action, method, params);
};
plivo.prototype.modify_account = function (params, callback) {
    var action = '';
};
plivo.prototype.get_subaccount = function (params) {
    var action = 'Subaccount/' + params['subauth_id'] + '/';
    this.request(action, method);
};
plivo.prototype.create_subaccount = function (params) {
    var action = 'Subaccount/';
};
// Applications
plivo.prototype.get_applications = function (params) {
    var action;
    var method = 'GET';
    this.request(action, method);
};
plivo.prototype.get_application = function (params) {
    var action = 'Application/' + params['app_id'] + '/';
    delete params.app_id;
    var method = 'GET';
};
plivo.prototype.create_application = function (params, callback) {
};
plivo.prototype.modify_application = function (params) {
    var action = 'Application/' + params['app_id'] + '/';
    delete params.app_id;
};
// Recordings
plivo.prototype.get_recordings = function (params, callback) {
    var action = 'Recording/';
    var method = 'GET';
    this.request(action, method, params);
};
plivo.prototype.get_recording = function (params) {
    var action = 'Recording/' + params['recording_id'] + '/';
};
// Endpoints
plivo.prototype.get_endpoints = function (params) {
    var action = 'Endpoint/';
};
plivo.prototype.create_endpoint = function (params, callback) {
    var action;
};
// Numbers
plivo.prototype.get_numbers = function (params, callback) {
    var action = 'Number/';
    var method = 'GET';
};
plivo.prototype.get_number_details = function (params, callback) {
    var action = 'Number/' + params['number'] + '/';
    delete params.number;
    var method = 'GET';
    this.request(action, method, callback);
};
plivo.prototype.unrent_number = function (params, callback) {
    var action;
    delete params.number;
    var method;
};
plivo.prototype.get_number_group = function (params) {
    var action;
    this.request(action, callback);
};
plivo.prototype.get_number_group_details = function (params, callback) {
    var action = 'AvailableNumberGroup/' + params['group_id'] + '/';
    delete params.group_id;
    var method = 'GET';
};
plivo.prototype.edit_number = function (params) {
    var action = 'Number/' + params['number'] + '/';
    this.request(action, method, params, callback);
};
plivo.prototype.unlink_application_number = function (params) {
    params.app_id = null;
};
// Message
plivo.prototype.send_message = function (params) {
    var action;
    var method = 'POST';
};
plivo.prototype.get_message = function (params, callback) {
    var action;
    delete params.record_id;
    var method;
};
plivo.prototype.create_incoming_carrier = function (params) {
    var action;
};
plivo.prototype.get_outgoing_carrier = function (params, callback) {
    var action = 'OutgoingCarrier/' + params['carrier_id'] + '/';
    delete params.carrier_id;
    var method = 'GET';
    this.request(action, method, params, callback);
};
plivo.prototype.create_outgoing_carrier = function (params) {
    var action;
    var method;
    this.request(action, method);
};
plivo.prototype.delete_outgoing_carrier = function (params) {
    var action = 'OutgoingCarrier/' + params['carrier_id'] + '/';
    delete params.carrier_id;
    this.request(action);
};
plivo.prototype.get_outgoing_carrier_routing = function (params, callback) {
    var action = 'OutgoingCarrierRouting/' + params['routing_id'] + '/';
    delete params.routing_id;
    var method;
};
plivo.prototype.create_outgoing_carrier_routing = function (params, callback) {
    var action;
    var method = 'POST';
};
plivo.prototype.delete_outgoing_carrier_routing = function () {
    var action;
    var method = 'DELETE';
    this.request(action, method, params, callback);
};
// Pricing
plivo.prototype.get_pricing = function (params, callback) {
    var action = 'Pricing/';
    var method = 'GET';
    this.request(action, params, callback);
};
/**
 * Module Exports
 */
exports.Response = function () {
    return new Response();
};
exports.RestAPI = function (config) {
    var plivoObj = new plivo();
    if (!config) {
        throw new plivoError('Auth ID and Auth Token must be provided.');
    }
    if (typeof config != 'object') {
    }
    if (!config.authId || !config.authToken) {
        throw new plivoError('Auth ID and Auth Token must be provided.');
    }
    // override default config according to the config provided.
    for (key in config) {
        plivoObj.options[key] = config[key];
    }
    return plivoObj;
};