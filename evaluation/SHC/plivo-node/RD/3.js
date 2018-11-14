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
    this.options.authId = '';
    this.options.authToken = '';
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
    if (!callback) {
    }
    var err;
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
                return callback(500, body);
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
    } else if (method == 'PUT') {
        request_options.json = params;
        Request.put(request_options);
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
plivo.prototype.middleware = function () {
    var instance = this;
    return;
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
    var method;
};
plivo.prototype.get_live_calls = function (params) {
    var action;
    var method;
};
plivo.prototype.transfer_call = function (params, callback) {
    var action = 'Call/' + params['call_uuid'] + '/';
    var method = 'POST';
};
plivo.prototype.hangup_all_calls = function (callback) {
    var action = 'Call/';
    var method = 'DELETE';
    var params = {};
    this.request(action, method, params, callback);
};
plivo.prototype.record = function (params, callback) {
    var action;
    var method = 'POST';
    this.request(action, method, params);
};
plivo.prototype.record_stop = function () {
    var action;
    this.request(action, method, params);
};
plivo.prototype.play_stop = function (params, callback) {
    var action = 'Call/' + params['call_uuid'] + '/Play/';
    var method;
    this.request(action, method, callback);
};
plivo.prototype.speak_stop = function (params, callback) {
    var action = 'Call/' + params['call_uuid'] + '/Speak/';
    delete params.call_uuid;
    this.request(action, method, params);
};
plivo.prototype.send_digits = function (params, callback) {
    var action = 'Call/' + params['call_uuid'] + '/DTMF/';
    var method;
    this.request(action, method, params);
};
// Request
plivo.prototype.hangup_request = function (params) {
    var action = 'Request/' + params['request_uuid'] + '/';
    delete params.request_uuid;
};
// Conferences
plivo.prototype.get_live_conferences = function (params, callback) {
    var action = 'Conference/';
    var method = 'GET';
    this.request(action, method, callback);
};
plivo.prototype.hangup_all_conferences = function () {
    var action = 'Conference/';
    var method = 'DELETE';
    this.request(action, method, params);
};
plivo.prototype.hangup_conference_member = function () {
    var action = 'Conference/' + params['conference_id'] + '/Member/' + params['member_id'] + '/';
    delete params.conference_id;
    delete params.member_id;
    var method = 'DELETE';
};
plivo.prototype.play_conference_member = function (params) {
    var action;
    delete params.conference_id;
    delete params.member_id;
};
plivo.prototype.stop_play_conference_member = function (params, callback) {
    var action = 'Conference/' + params['conference_id'] + '/Member/' + params['member_id'] + '/Play/';
    delete params.member_id;
};
plivo.prototype.stop_speak_conference_member = function (params, callback) {
    var action = 'Conference/' + params['conference_id'] + '/Member/' + params['member_id'] + '/Speak/';
};
plivo.prototype.deaf_conference_member = function (params, callback) {
    var action = 'Conference/' + params['conference_id'] + '/Member/' + params['member_id'] + '/Deaf/';
    delete params.conference_id;
    var method;
    this.request(action);
};
plivo.prototype.undeaf_conference_member = function (params, callback) {
    var action;
    delete params.conference_id;
    delete params.member_id;
    var method;
};
plivo.prototype.stop_record_conference = function () {
    var action;
    var method;
};
// Accounts
plivo.prototype.get_account = function (params) {
    var action = '';
    var method;
};
plivo.prototype.get_subaccounts = function (params, callback) {
    var action = 'Subaccount/';
    var method = 'GET';
    this.request(action, method, params);
};
plivo.prototype.create_subaccount = function () {
    var action = 'Subaccount/';
    this.request(action, method);
};
plivo.prototype.modify_subaccount = function (params, callback) {
    var action;
    delete params.subauth_id;
    var method;
    this.request(action, method, params, callback);
};
plivo.prototype.delete_subaccount = function (params) {
    var action;
    delete params.subauth_id;
    this.request(action, params, callback);
};
// Applications
plivo.prototype.get_applications = function (params) {
    var action;
    var method;
};
plivo.prototype.get_application = function (params) {
    var action = 'Application/' + params['app_id'] + '/';
    delete params.app_id;
    var method;
    this.request(action, params);
};
plivo.prototype.create_application = function (params) {
    var action;
    var method = 'POST';
};
plivo.prototype.modify_application = function (params, callback) {
    var action;
    delete params.app_id;
};
// Recordings
plivo.prototype.get_recordings = function (params) {
    var action;
    var method = 'GET';
};
plivo.prototype.get_recording = function (params, callback) {
    var action;
    delete params.recording_id;
    var method = 'GET';
    this.request(action, method, params);
};
plivo.prototype.delete_recording = function (params) {
    var action = 'Recording/' + params['recording_id'] + '/';
    delete params.recording_id;
    var method = 'DELETE';
};
// Endpoints
plivo.prototype.get_endpoints = function (params, callback) {
    var action = 'Endpoint/';
    var method = 'GET';
};
plivo.prototype.create_endpoint = function (params, callback) {
    var action = 'Endpoint/';
    var method;
};
plivo.prototype.modify_endpoint = function (params, callback) {
    var action = 'Endpoint/' + params['endpoint_id'] + '/';
    var method = 'POST';
};
plivo.prototype.delete_endpoint = function () {
    var action;
};
// Numbers
plivo.prototype.get_numbers = function (params, callback) {
    var action = 'Number/';
    var method;
    this.request(action, params);
};
plivo.prototype.get_number_details = function (params) {
    var action;
    delete params.number;
    var method = 'GET';
};
plivo.prototype.get_number_group_details = function (params) {
    var action = 'AvailableNumberGroup/' + params['group_id'] + '/';
    delete params.group_id;
    this.request(action, params);
};
plivo.prototype.rent_from_number_group = function (params, callback) {
    var action;
    delete params.group_id;
    this.request(action, method, callback);
};
plivo.prototype.edit_number = function (params) {
    var action;
    var method = 'POST';
    this.request(action, params);
};
plivo.prototype.link_application_number = function (params, callback) {
};
plivo.prototype.unlink_application_number = function (params, callback) {
    params.app_id = null;
    this.edit_number(params);
};
plivo.prototype.search_phone_numbers = function (params, callback) {
    var action;
    var method;
};
plivo.prototype.buy_phone_number = function (params, callback) {
    var action;
    var method = 'POST';
    this.request(action, params);
};
// Message
plivo.prototype.send_message = function (params) {
    var action;
    var method = 'POST';
    this.request(action, params);
};
plivo.prototype.get_messages = function (params) {
    var action = 'Message/';
    var method;
};
plivo.prototype.get_message = function (params, callback) {
    var action = 'Message/' + params['record_id'] + '/';
    delete params.record_id;
    var method;
};
// Incoming Carriers
plivo.prototype.get_incoming_carriers = function (params, callback) {
    var action = 'IncomingCarrier/';
    var method = 'GET';
};
plivo.prototype.create_incoming_carrier = function (params, callback) {
    var action = 'IncomingCarrier/';
    var method = 'POST';
};
plivo.prototype.delete_incoming_carrier = function (params) {
    var action = 'IncomingCarrier/' + params['carrier_id'] + '/';
    delete params.carrier_id;
    var method = 'DELETE';
};
// Outgoing Carriers
plivo.prototype.get_outgoing_carriers = function (params) {
    var action;
    var method = 'GET';
};
plivo.prototype.modify_outgoing_carrier = function (params, callback) {
    var action = 'OutgoingCarrier/' + params['carrier_id'] + '/';
    delete params.carrier_id;
};
plivo.prototype.delete_outgoing_carrier = function (params) {
    var action = 'OutgoingCarrier/' + params['carrier_id'] + '/';
    this.request(action, callback);
};
plivo.prototype.get_outgoing_carrier_routing = function () {
    var action;
};
plivo.prototype.create_outgoing_carrier_routing = function (params, callback) {
    var action;
    this.request(action, params);
};
// Pricing
plivo.prototype.get_pricing = function (params, callback) {
    var action = 'Pricing/';
};
/**
 * Module Exports
 */
exports.Response = function () {
    return new Response();
};
exports.RestAPI = function (config) {
    var plivoObj = new plivo();
    if (!config.authId || !config.authToken) {
        throw new plivoError();
    }
    // override default config according to the config provided.
    for (key in config) {
        plivoObj.options[key] = config[key];
    }
    return plivoObj;
};