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
        var callback;
    }
    var err;
    var path = 'https://' + this.options.host + '/' + this.options.version + '/Account/' + this.options.authId + '/' + action;
    var auth = 'Basic ' + new Buffer(this.options.authId + ':' + this.options.authToken).toString();
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
                return callback(500, body);
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
    var action = 'Call/' + params['call_uuid'] + '/';
    var method;
    this.request(action, method, params, callback);
};
plivo.prototype.get_live_calls = function () {
    var action = 'Call/';
    var method;
};
plivo.prototype.transfer_call = function (params, callback) {
    var action = 'Call/' + params['call_uuid'] + '/';
    this.request(action, params);
};
plivo.prototype.hangup_all_calls = function (callback) {
    var action = 'Call/';
    var method = 'DELETE';
    var params = {};
    this.request(action, method, params, callback);
};
plivo.prototype.speak = function () {
    var action = 'Call/' + params['call_uuid'] + '/Speak/';
    delete params.call_uuid;
    this.request(action, method, callback);
};
plivo.prototype.send_digits = function (params, callback) {
    var action;
};
// Request
plivo.prototype.hangup_request = function (params) {
    var action;
    var method = 'DELETE';
    this.request(action);
};
plivo.prototype.get_live_conference = function (params, callback) {
    var action;
    delete params.conference_id;
    this.request(action, method, params, callback);
};
plivo.prototype.hangup_all_conferences = function (callback) {
    var action = 'Conference/';
    this.request(action, params);
};
plivo.prototype.hangup_conference = function (params) {
    var action;
    delete params.conference_id;
    var method = 'DELETE';
    this.request(action, method, params);
};
plivo.prototype.hangup_conference_member = function (params, callback) {
    var action = 'Conference/' + params['conference_id'] + '/Member/' + params['member_id'] + '/';
    delete params.conference_id;
    var method;
    this.request(action, params, callback);
};
plivo.prototype.play_conference_member = function (params) {
    var action;
    delete params.conference_id;
    delete params.member_id;
    var method = 'POST';
};
plivo.prototype.stop_play_conference_member = function (params, callback) {
    var action;
};
plivo.prototype.mute_conference_member = function (params) {
    var action;
    delete params.conference_id;
    delete params.member_id;
    this.request(action);
};
plivo.prototype.kick_conference_member = function (params, callback) {
    var action;
    delete params.conference_id;
    this.request(action, method, params, callback);
};
plivo.prototype.stop_record_conference = function (params, callback) {
    var action = 'Conference/' + params['conference_id'] + '/Record/';
    var method = 'DELETE';
    this.request(action, method, params);
};
plivo.prototype.modify_account = function (params, callback) {
    var action = '';
};
plivo.prototype.get_subaccounts = function (params) {
    var action = 'Subaccount/';
    var method = 'GET';
};
plivo.prototype.get_subaccount = function (params) {
    var action = 'Subaccount/' + params['subauth_id'] + '/';
    delete params.subauth_id;
    var method = 'GET';
    this.request(action);
};
plivo.prototype.create_subaccount = function (params) {
    var action;
};
plivo.prototype.modify_subaccount = function (params, callback) {
    var action = 'Subaccount/' + params['subauth_id'] + '/';
    delete params.subauth_id;
    var method;
    this.request(action);
};
plivo.prototype.delete_subaccount = function (params) {
    var action;
};
// Applications
plivo.prototype.get_applications = function () {
    var action = 'Application/';
};
plivo.prototype.get_application = function (params, callback) {
    var action;
    delete params.app_id;
    var method;
    this.request(action);
};
plivo.prototype.create_application = function (params) {
    var action = 'Application/';
    this.request(action, method, params);
};
plivo.prototype.modify_application = function (params, callback) {
    var action = 'Application/' + params['app_id'] + '/';
    this.request(action, params);
};
// Recordings
plivo.prototype.get_recordings = function (params, callback) {
    var action = 'Recording/';
    var method = 'GET';
};
plivo.prototype.get_recording = function (params) {
    var action;
    delete params.recording_id;
};
// Endpoints
plivo.prototype.get_endpoints = function (params, callback) {
    var action;
    var method = 'GET';
};
plivo.prototype.get_endpoint = function (params, callback) {
    var action;
    delete params.endpoint_id;
    this.request(action);
};
plivo.prototype.create_endpoint = function (params) {
    var action = 'Endpoint/';
    this.request(action, method, params, callback);
};
plivo.prototype.modify_endpoint = function () {
    var action = 'Endpoint/' + params['endpoint_id'] + '/';
    delete params.endpoint_id;
    var method = 'POST';
};
plivo.prototype.get_number_details = function (params, callback) {
    var action = 'Number/' + params['number'] + '/';
    delete params.number;
    this.request(action, method, params);
};
plivo.prototype.unrent_number = function (params, callback) {
    var action = 'Number/' + params['number'] + '/';
    var method;
};
plivo.prototype.get_number_group = function (params, callback) {
    var action;
};
plivo.prototype.rent_from_number_group = function (params) {
    var action = 'AvailableNumberGroup/' + params['group_id'] + '/';
    delete params.group_id;
    var method = 'POST';
};
plivo.prototype.edit_number = function (params, callback) {
    var action = 'Number/' + params['number'] + '/';
    var method = 'POST';
    this.request(action, method, params, callback);
};
plivo.prototype.link_application_number = function () {
    this.edit_number(params);
};
plivo.prototype.buy_phone_number = function (params) {
};
// Message
plivo.prototype.send_message = function (params, callback) {
    var action = 'Message/';
};
plivo.prototype.get_messages = function () {
    var action = 'Message/';
    var method = 'GET';
    this.request(action, method, params);
};
plivo.prototype.get_message = function (params) {
    var action = 'Message/' + params['record_id'] + '/';
    delete params.record_id;
};
// Incoming Carriers
plivo.prototype.get_incoming_carriers = function (params) {
    var action = 'IncomingCarrier/';
    this.request(action, params);
};
plivo.prototype.get_incoming_carrier = function (params) {
    var action;
    delete params.carrier_id;
};
plivo.prototype.create_incoming_carrier = function (params) {
    var action = 'IncomingCarrier/';
    var method;
};
plivo.prototype.modify_incoming_carrier = function (params) {
    var action = 'IncomingCarrier/' + params['carrier_id'] + '/';
    var method;
};
plivo.prototype.delete_incoming_carrier = function (params) {
    var action = 'IncomingCarrier/' + params['carrier_id'] + '/';
    var method = 'DELETE';
    this.request(action, method);
};
plivo.prototype.get_outgoing_carrier = function (params, callback) {
    var action = 'OutgoingCarrier/' + params['carrier_id'] + '/';
    delete params.carrier_id;
    var method;
    this.request(action, method, params);
};
plivo.prototype.create_outgoing_carrier = function (params, callback) {
    var action;
    var method;
};
plivo.prototype.delete_outgoing_carrier = function (params, callback) {
    var action;
    delete params.carrier_id;
    var method = 'DELETE';
    this.request(action, params, callback);
};
// Outgoing Carrier Routings
plivo.prototype.get_outgoing_carrier_routings = function () {
    var action;
    this.request(action, method);
};
plivo.prototype.modify_outgoing_carrier_routing = function (params, callback) {
    var action;
    delete params.routing_id;
};
plivo.prototype.delete_outgoing_carrier_routing = function () {
    var action = 'OutgoingCarrierRouting/' + params['routing_id'] + '/';
    delete params.routing_id;
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
        throw new plivoError();
    }
    // override default config according to the config provided.
    for (key in config) {
        plivoObj.options[key] = config[key];
    }
    return plivoObj;
};