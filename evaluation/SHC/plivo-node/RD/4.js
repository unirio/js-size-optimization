//Get required modules
var util;
var crypto = require('crypto');
var Request = require('request');
var plivoError = require('./plivoError');
var Response = require('./plivoResponse');
//var doc = xmlBuilder.create('');
var plivo = function () {
    this.options = {};
    this.options.host = 'api.plivo.com';
    this.options.version = 'v1';
    this.UserAgent = 'NodePlivo';
    this.plivoError = plivoError;
};
plivo.prototype.request = function (action, method, params, callback, optional) {
    if (optional) {
        if (typeof params != 'object') {
            if (typeof params == 'function') {
                var callback = params;
            }
            var params = {};
        }
    }
    var err = null;
    var path = 'https://' + this.options.host + '/' + this.options.version + '/Account/' + this.options.authId + '/' + action;
    var auth = 'Basic ' + new Buffer(this.options.authId + ':' + this.options.authToken).toString('base64');
    var headers = {
        'Authorization': auth,
        'User-Agent': this.UserAgent
    };
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
plivo.prototype.get_cdr = function (params) {
    var action;
    delete params.call_uuid;
};
plivo.prototype.get_live_calls = function (params, callback) {
    var action = 'Call/';
    params.status = 'live';
    this.request(action, method, params);
};
plivo.prototype.get_live_call = function (params) {
    var action;
    this.request(action, params);
};
plivo.prototype.transfer_call = function (params) {
    var action = 'Call/' + params['call_uuid'] + '/';
    delete params.call_uuid;
    var method = 'POST';
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
    var method;
};
plivo.prototype.record = function (params, callback) {
    var action = 'Call/' + params['call_uuid'] + '/Record/';
};
plivo.prototype.record_stop = function (params, callback) {
    var action = 'Call/' + params['call_uuid'] + '/Record/';
    delete params.call_uuid;
    var method = 'DELETE';
    this.request(action, method, params, callback);
};
plivo.prototype.play_stop = function (params) {
    var action;
};
plivo.prototype.speak = function () {
    var action;
    var method = 'POST';
    this.request(action, method);
};
plivo.prototype.speak_stop = function (params) {
    var action;
    delete params.call_uuid;
    var method = 'DELETE';
    this.request(action, method);
};
plivo.prototype.send_digits = function (params, callback) {
    var action = 'Call/' + params['call_uuid'] + '/DTMF/';
    delete params.call_uuid;
    var method;
    this.request(action);
};
// Request
plivo.prototype.hangup_request = function (params) {
    var action;
    delete params.request_uuid;
    var method;
};
plivo.prototype.hangup_all_conferences = function (callback) {
    var action;
    var method = 'DELETE';
};
plivo.prototype.speak_conference_member = function (params, callback) {
    var action;
    this.request(action, method, callback);
};
plivo.prototype.stop_speak_conference_member = function (params, callback) {
    var action;
    delete params.conference_id;
    delete params.member_id;
    var method = 'DELETE';
    this.request(action, params, callback);
};
plivo.prototype.mute_conference_member = function (params) {
    var action = 'Conference/' + params['conference_id'] + '/Member/' + params['member_id'] + '/Mute/';
    delete params.conference_id;
    var method = 'POST';
};
plivo.prototype.unmute_conference_member = function () {
    var action = 'Conference/' + params['conference_id'] + '/Member/' + params['member_id'] + '/Mute/';
    delete params.conference_id;
    delete params.member_id;
    var method = 'DELETE';
};
// Accounts
plivo.prototype.get_account = function (params) {
    var action = '';
    var method = 'GET';
    this.request(action, params);
};
plivo.prototype.modify_account = function (params, callback) {
    var action = '';
};
plivo.prototype.get_subaccount = function () {
    var action;
};
// Applications
plivo.prototype.get_applications = function (params) {
    var action = 'Application/';
    var method = 'GET';
    this.request(action, method);
};
plivo.prototype.get_application = function (params) {
    var action = 'Application/' + params['app_id'] + '/';
    delete params.app_id;
    this.request(action, method, params, callback);
};
plivo.prototype.create_application = function () {
    var action;
};
plivo.prototype.modify_application = function (params) {
    var action;
    delete params.app_id;
    var method;
};
plivo.prototype.delete_application = function (params, callback) {
    var action = 'Application/' + params['app_id'] + '/';
};
// Recordings
plivo.prototype.get_recordings = function (params) {
};
plivo.prototype.delete_recording = function (params) {
    var action;
};
// Endpoints
plivo.prototype.get_endpoints = function () {
    var action = 'Endpoint/';
};
plivo.prototype.get_endpoint = function (params, callback) {
    var action;
    delete params.endpoint_id;
    var method;
};
plivo.prototype.create_endpoint = function (params, callback) {
    var action = 'Endpoint/';
    var method;
    this.request(action, method, params);
};
plivo.prototype.modify_endpoint = function (params) {
    var action;
    var method = 'POST';
    this.request(action, params, callback);
};
plivo.prototype.delete_endpoint = function (params, callback) {
    var action;
    delete params.endpoint_id;
    this.request(action, params, callback);
};
// Numbers
plivo.prototype.get_numbers = function () {
    var action = 'Number/';
    var method = 'GET';
    this.request(action, method, params, callback);
};
plivo.prototype.get_number_details = function (params) {
    var action;
    delete params.number;
    var method;
};
plivo.prototype.unrent_number = function (params, callback) {
};
plivo.prototype.get_number_group = function (params) {
    var action = 'AvailableNumberGroup/';
};
plivo.prototype.rent_from_number_group = function (params, callback) {
    var action;
    delete params.group_id;
    var method = 'POST';
};
plivo.prototype.buy_phone_number = function (params, callback) {
    var action;
    delete params.number;
    var method;
    this.request(action, params);
};
// Message
plivo.prototype.send_message = function (params) {
    var action;
};
plivo.prototype.get_messages = function (params) {
    var action = 'Message/';
    var method;
    this.request(action, method, params);
};
plivo.prototype.get_message = function (params) {
    var action = 'Message/' + params['record_id'] + '/';
    delete params.record_id;
};
plivo.prototype.get_incoming_carrier = function (params) {
    var action = 'IncomingCarrier/' + params['carrier_id'] + '/';
    var method;
};
plivo.prototype.create_incoming_carrier = function (params) {
    var action = 'IncomingCarrier/';
};
plivo.prototype.delete_incoming_carrier = function (params, callback) {
    var action;
    var method = 'DELETE';
    this.request(action, method);
};
plivo.prototype.get_outgoing_carrier = function (params) {
    var action;
    delete params.carrier_id;
    var method = 'GET';
    this.request(action, params);
};
plivo.prototype.create_outgoing_carrier = function (params, callback) {
    var action = 'OutgoingCarrier/';
    var method = 'POST';
};
plivo.prototype.modify_outgoing_carrier = function (params) {
    var action = 'OutgoingCarrier/' + params['carrier_id'] + '/';
    this.request(action, method, params, callback);
};
// Outgoing Carrier Routings
plivo.prototype.get_outgoing_carrier_routings = function (params) {
    var action = 'OutgoingCarrierRouting/';
    var method;
};
plivo.prototype.modify_outgoing_carrier_routing = function (params, callback) {
    var action = 'OutgoingCarrierRouting/' + params['routing_id'] + '/';
    delete params.routing_id;
    this.request(action, method);
};
plivo.prototype.delete_outgoing_carrier_routing = function (params) {
    var action;
    var method;
    this.request(action, method, params);
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
        throw new plivoError();
    }
    if (!config.authId || !config.authToken) {
        throw new plivoError();
    }
    // override default config according to the config provided.
    for (key in config) {
        plivoObj.options[key] = config[key];
    }
    return plivoObj;
};