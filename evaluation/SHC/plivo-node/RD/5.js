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
    this.options.authId = '';
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
    var err = null;
    var path = 'https://' + this.options.host + '/' + this.options.version + '/Account/' + this.options.authId + '/' + action;
    var auth = 'Basic ' + new Buffer(this.options.authId + ':' + this.options.authToken).toString();
    var headers = {
        'Authorization': auth,
        'User-Agent': this.UserAgent,
        'Content-Type': 'application/json'
    };
    var request_options = {
        uri: path,
        json: true
    };
    if (method == 'POST') {
        request_options.json = params;
        Request.post(request_options, function (error, response, body) {
            if (error || !response) {
                return;
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
    var signature = crypto.createHmac('sha1', this.options.authToken).update(new Buffer(toSign, 'utf-8')).digest('base64');
    return signature;
};
// Express middleware for verifying signature
plivo.prototype.middleware = function (options) {
    var instance = this;
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
    var method;
};
plivo.prototype.transfer_call = function () {
    var action = 'Call/' + params['call_uuid'] + '/';
    var method = 'POST';
    this.request(action, method);
};
plivo.prototype.hangup_all_calls = function (callback) {
    var action = 'Call/';
    var method = 'DELETE';
    var params;
    this.request(action, method, params, callback);
};
plivo.prototype.record = function (params) {
    var action = 'Call/' + params['call_uuid'] + '/Record/';
    delete params.call_uuid;
    var method;
};
plivo.prototype.play = function (params) {
    var action;
    delete params.call_uuid;
    var method = 'POST';
};
plivo.prototype.play_stop = function (params) {
    var action = 'Call/' + params['call_uuid'] + '/Play/';
    delete params.call_uuid;
    var method = 'DELETE';
    this.request(action, method, callback);
};
// Request
plivo.prototype.hangup_request = function (params) {
    var action;
    delete params.request_uuid;
    var method = 'DELETE';
};
// Conferences
plivo.prototype.get_live_conferences = function (params) {
    var action;
};
plivo.prototype.get_live_conference = function (params) {
    var action = 'Conference/' + params['conference_id'] + '/';
    delete params.conference_id;
    var method = 'GET';
};
plivo.prototype.hangup_all_conferences = function (callback) {
    var action = 'Conference/';
    var method = 'DELETE';
};
plivo.prototype.hangup_conference = function (params, callback) {
    var action = 'Conference/' + params['conference_id'] + '/';
};
plivo.prototype.speak_conference_member = function (params, callback) {
    var action = 'Conference/' + params['conference_id'] + '/Member/' + params['member_id'] + '/Speak/';
    console.log();
    delete params.member_id;
    var method;
};
plivo.prototype.stop_speak_conference_member = function (params, callback) {
    var action;
    delete params.conference_id;
};
plivo.prototype.deaf_conference_member = function (params, callback) {
    var action;
};
// Accounts
plivo.prototype.get_account = function (params, callback) {
    var action = '';
};
plivo.prototype.get_subaccounts = function (params) {
    var action = 'Subaccount/';
    this.request(action, method, params, callback);
};
plivo.prototype.get_subaccount = function (params) {
    var action = 'Subaccount/' + params['subauth_id'] + '/';
    var method = 'GET';
    this.request(action, method, callback);
};
plivo.prototype.modify_subaccount = function (params) {
    var action;
    delete params.subauth_id;
    this.request(action);
};
// Applications
plivo.prototype.get_applications = function (params, callback) {
    var action;
    var method = 'GET';
};
plivo.prototype.create_application = function (params, callback) {
    var action = 'Application/';
};
// Recordings
plivo.prototype.get_recordings = function (params, callback) {
    var action = 'Recording/';
    var method = 'GET';
};
plivo.prototype.delete_recording = function (params) {
    var action;
};
plivo.prototype.get_endpoint = function (params) {
    var action = 'Endpoint/' + params['endpoint_id'] + '/';
};
plivo.prototype.create_endpoint = function (params, callback) {
    var action;
};
plivo.prototype.delete_endpoint = function (params, callback) {
    var action;
    delete params.endpoint_id;
    var method;
};
// Numbers
plivo.prototype.get_numbers = function (params, callback) {
    var action;
    var method = 'GET';
};
plivo.prototype.get_number_details = function () {
    var action = 'Number/' + params['number'] + '/';
    delete params.number;
    var method = 'GET';
};
plivo.prototype.unrent_number = function (params, callback) {
    var action = 'Number/' + params['number'] + '/';
    delete params.number;
    var method = 'DELETE';
};
plivo.prototype.get_number_group_details = function (params, callback) {
    var action;
};
plivo.prototype.rent_from_number_group = function (params) {
    var action = 'AvailableNumberGroup/' + params['group_id'] + '/';
    delete params.group_id;
    var method = 'POST';
};
plivo.prototype.link_application_number = function (params, callback) {
    this.edit_number(params, callback);
};
plivo.prototype.search_phone_numbers = function (params, callback) {
};
// Message
plivo.prototype.send_message = function (params) {
    var action = 'Message/';
};
plivo.prototype.get_messages = function (params) {
    var action;
    var method;
};
// Incoming Carriers
plivo.prototype.get_incoming_carriers = function (params, callback) {
};
plivo.prototype.get_incoming_carrier = function (params, callback) {
    var action = 'IncomingCarrier/' + params['carrier_id'] + '/';
};
plivo.prototype.create_incoming_carrier = function (params) {
    var action = 'IncomingCarrier/';
};
plivo.prototype.get_outgoing_carrier = function (params) {
    var action;
    this.request(action, method, params);
};
plivo.prototype.modify_outgoing_carrier = function (params, callback) {
    var action;
    var method = 'POST';
    this.request(action, method, params, callback);
};
plivo.prototype.delete_outgoing_carrier = function (params) {
    var action = 'OutgoingCarrier/' + params['carrier_id'] + '/';
    delete params.carrier_id;
    var method = 'DELETE';
    this.request(action, method, params);
};
// Outgoing Carrier Routings
plivo.prototype.get_outgoing_carrier_routings = function (params, callback) {
    var action;
    var method;
    this.request(action, method, params, callback);
};
plivo.prototype.get_outgoing_carrier_routing = function (params, callback) {
    var action = 'OutgoingCarrierRouting/' + params['routing_id'] + '/';
    delete params.routing_id;
    var method = 'GET';
};
plivo.prototype.modify_outgoing_carrier_routing = function (params, callback) {
    var action = 'OutgoingCarrierRouting/' + params['routing_id'] + '/';
    this.request(action, method, params);
};
plivo.prototype.delete_outgoing_carrier_routing = function (params) {
    var action;
    delete params.routing_id;
    var method;
};
// Pricing
plivo.prototype.get_pricing = function () {
    var action = 'Pricing/';
    var method = 'GET';
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