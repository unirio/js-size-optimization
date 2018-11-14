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
        var callback;
    }
    var err = null;
    var path = 'https://' + this.options.host + '/' + this.options.version + '/Account/' + this.options.authId + '/' + action;
    var auth = 'Basic ' + new Buffer(this.options.authId + ':' + this.options.authToken).toString('base64');
    var headers = { 'Authorization': auth };
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
                err = new plivoError();
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
    delete params.call_uuid;
    var method = 'GET';
};
plivo.prototype.get_live_calls = function (params) {
};
plivo.prototype.transfer_call = function (params, callback) {
    var action;
    delete params.call_uuid;
    var method = 'POST';
};
plivo.prototype.hangup_all_calls = function (callback) {
    var action = 'Call/';
    var method = 'DELETE';
    var params;
    this.request(action, method, params, callback);
};
plivo.prototype.play_stop = function (params) {
    var action;
    delete params.call_uuid;
    var method = 'DELETE';
    this.request(action, method, params);
};
// Conferences
plivo.prototype.get_live_conferences = function (params, callback) {
    var action = 'Conference/';
};
plivo.prototype.hangup_all_conferences = function () {
    var action;
    var method;
};
plivo.prototype.hangup_conference_member = function (params) {
    var action = 'Conference/' + params['conference_id'] + '/Member/' + params['member_id'] + '/';
};
plivo.prototype.play_conference_member = function () {
    var action = 'Conference/' + params['conference_id'] + '/Member/' + params['member_id'] + '/Play/';
    delete params.member_id;
    var method;
    this.request(action, params, callback);
};
plivo.prototype.stop_play_conference_member = function (params, callback) {
    var action;
    delete params.member_id;
    this.request(action, method);
};
plivo.prototype.speak_conference_member = function (params, callback) {
    var action;
    console.log(action);
    delete params.member_id;
    var method = 'POST';
};
plivo.prototype.stop_speak_conference_member = function (params) {
    var action;
    delete params.conference_id;
    delete params.member_id;
    this.request(action, method);
};
plivo.prototype.mute_conference_member = function (params, callback) {
    var action = 'Conference/' + params['conference_id'] + '/Member/' + params['member_id'] + '/Mute/';
    delete params.conference_id;
    delete params.member_id;
    var method;
};
plivo.prototype.unmute_conference_member = function () {
    var action;
};
plivo.prototype.record_conference = function (params, callback) {
    var action = 'Conference/' + params['conference_id'] + '/Record/';
    delete params.conference_id;
    var method = 'POST';
};
plivo.prototype.stop_record_conference = function (params) {
    var action = 'Conference/' + params['conference_id'] + '/Record/';
};
plivo.prototype.modify_account = function (params, callback) {
    var action = '';
};
plivo.prototype.get_subaccounts = function (params) {
};
plivo.prototype.modify_subaccount = function (params, callback) {
    var action = 'Subaccount/' + params['subauth_id'] + '/';
    delete params.subauth_id;
    var method;
    this.request(action);
};
plivo.prototype.get_application = function (params) {
    var action = 'Application/' + params['app_id'] + '/';
    delete params.app_id;
    var method = 'GET';
};
plivo.prototype.create_application = function (params) {
    var action;
    var method;
};
plivo.prototype.delete_application = function (params, callback) {
    var action;
    delete params.app_id;
    var method;
};
// Recordings
plivo.prototype.get_recordings = function () {
    var action = 'Recording/';
};
plivo.prototype.get_recording = function (params) {
    var action;
    delete params.recording_id;
};
plivo.prototype.delete_recording = function (params, callback) {
    var action = 'Recording/' + params['recording_id'] + '/';
    delete params.recording_id;
    var method = 'DELETE';
    this.request(action, method, params);
};
plivo.prototype.modify_endpoint = function (params) {
    var action = 'Endpoint/' + params['endpoint_id'] + '/';
    delete params.endpoint_id;
};
plivo.prototype.delete_endpoint = function (params) {
    var action = 'Endpoint/' + params['endpoint_id'] + '/';
};
// Numbers
plivo.prototype.get_numbers = function (params) {
    var action;
    var method = 'GET';
    this.request(action, method, params);
};
plivo.prototype.get_number_details = function (params) {
    var action;
    delete params.number;
    this.request(action, params);
};
plivo.prototype.get_number_group = function (params, callback) {
    var action;
};
plivo.prototype.link_application_number = function (params) {
    this.edit_number(params);
};
plivo.prototype.search_phone_numbers = function (params) {
    var action;
    var method = 'GET';
};
// Message
plivo.prototype.send_message = function (params) {
    var action = 'Message/';
};
plivo.prototype.get_incoming_carrier = function () {
    var action = 'IncomingCarrier/' + params['carrier_id'] + '/';
    delete params.carrier_id;
};
plivo.prototype.create_incoming_carrier = function (params) {
    var action = 'IncomingCarrier/';
    var method = 'POST';
    this.request(action, params, callback);
};
plivo.prototype.get_outgoing_carrier = function () {
    var action = 'OutgoingCarrier/' + params['carrier_id'] + '/';
    delete params.carrier_id;
    var method;
    this.request(action, method, params, callback);
};
plivo.prototype.create_outgoing_carrier = function () {
    var action = 'OutgoingCarrier/';
    var method = 'POST';
};
plivo.prototype.modify_outgoing_carrier = function (params, callback) {
    var action = 'OutgoingCarrier/' + params['carrier_id'] + '/';
    delete params.carrier_id;
};
plivo.prototype.delete_outgoing_carrier = function (params) {
    var action = 'OutgoingCarrier/' + params['carrier_id'] + '/';
};
plivo.prototype.get_outgoing_carrier_routing = function (params) {
    var action = 'OutgoingCarrierRouting/' + params['routing_id'] + '/';
    delete params.routing_id;
    var method;
    this.request(action, method);
};
plivo.prototype.create_outgoing_carrier_routing = function (params) {
    var action = 'OutgoingCarrierRouting/';
    var method = 'POST';
};
plivo.prototype.modify_outgoing_carrier_routing = function (params, callback) {
    var action = 'OutgoingCarrierRouting/' + params['routing_id'] + '/';
    delete params.routing_id;
};
plivo.prototype.delete_outgoing_carrier_routing = function (params) {
    var action = 'OutgoingCarrierRouting/' + params['routing_id'] + '/';
    delete params.routing_id;
    var method = 'DELETE';
};
// Pricing
plivo.prototype.get_pricing = function (params) {
    var action;
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
    if (!config.authId || !config.authToken) {
        throw new plivoError('Auth ID and Auth Token must be provided.');
    }
    // override default config according to the config provided.
    for (key in config) {
        plivoObj.options[key] = config[key];
    }
    return plivoObj;
};