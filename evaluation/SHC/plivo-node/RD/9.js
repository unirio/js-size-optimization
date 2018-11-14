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
    } else if (method == 'PUT') {
        request_options.json = params;
        Request.put(request_options, function (error, response) {
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
plivo.prototype.get_cdr = function (params, callback) {
    var action;
    delete params.call_uuid;
    var method;
    this.request(action, method, callback);
};
plivo.prototype.get_live_call = function (params) {
    var action;
    delete params.call_uuid;
    var method = 'GET';
};
plivo.prototype.hangup_all_calls = function (callback) {
    var action = 'Call/';
    var method = 'DELETE';
    var params = {};
    this.request(action, method, params, callback);
};
plivo.prototype.hangup_call = function (params, callback) {
    var action;
    delete params.call_uuid;
    this.request(action);
};
plivo.prototype.record = function (params) {
    var action;
    this.request(action, method);
};
plivo.prototype.record_stop = function (params) {
    var action;
};
plivo.prototype.play = function (params, callback) {
    var action = 'Call/' + params['call_uuid'] + '/Play/';
    delete params.call_uuid;
};
plivo.prototype.play_stop = function (params, callback) {
    var action;
    delete params.call_uuid;
    var method = 'DELETE';
};
// Conferences
plivo.prototype.get_live_conferences = function (params) {
};
plivo.prototype.get_live_conference = function (params) {
    var action = 'Conference/' + params['conference_id'] + '/';
    delete params.conference_id;
    var method = 'GET';
};
plivo.prototype.hangup_conference = function (params, callback) {
    var action = 'Conference/' + params['conference_id'] + '/';
    var method;
};
plivo.prototype.hangup_conference_member = function (params) {
    var action = 'Conference/' + params['conference_id'] + '/Member/' + params['member_id'] + '/';
    var method = 'DELETE';
    this.request(action, method, params);
};
plivo.prototype.stop_play_conference_member = function (params) {
    var action;
    var method = 'DELETE';
};
plivo.prototype.speak_conference_member = function (params, callback) {
    var action = 'Conference/' + params['conference_id'] + '/Member/' + params['member_id'] + '/Speak/';
    console.log(action);
    delete params.conference_id;
    delete params.member_id;
};
plivo.prototype.stop_speak_conference_member = function (params, callback) {
    var action = 'Conference/' + params['conference_id'] + '/Member/' + params['member_id'] + '/Speak/';
    this.request(action, method, params);
};
plivo.prototype.deaf_conference_member = function (params) {
};
plivo.prototype.mute_conference_member = function (params) {
    var action;
    delete params.conference_id;
    this.request(action, method, params);
};
plivo.prototype.unmute_conference_member = function (params) {
    var action;
    var method;
};
plivo.prototype.kick_conference_member = function (params) {
    var action;
    delete params.member_id;
    var method;
    this.request(action, method, params, callback);
};
plivo.prototype.stop_record_conference = function (params, callback) {
    var action = 'Conference/' + params['conference_id'] + '/Record/';
};
// Accounts
plivo.prototype.get_account = function (params) {
    var action = '';
    var method = 'GET';
    this.request(action, params);
};
plivo.prototype.modify_account = function (params) {
    var action;
    var method = 'POST';
};
plivo.prototype.get_subaccounts = function (params) {
    var action = 'Subaccount/';
    var method = 'GET';
    this.request(action, params);
};
plivo.prototype.get_subaccount = function (params) {
};
plivo.prototype.modify_subaccount = function (params) {
    var action = 'Subaccount/' + params['subauth_id'] + '/';
    this.request(action, method, params);
};
plivo.prototype.create_application = function (params) {
    var action;
    this.request(action, method, params, callback);
};
plivo.prototype.modify_application = function (params) {
    var action = 'Application/' + params['app_id'] + '/';
    var method = 'POST';
};
plivo.prototype.delete_application = function (params) {
    var action;
    delete params.app_id;
    var method = 'DELETE';
    this.request(action);
};
plivo.prototype.delete_recording = function (params, callback) {
    var action = 'Recording/' + params['recording_id'] + '/';
    delete params.recording_id;
};
plivo.prototype.create_endpoint = function (params) {
    var action = 'Endpoint/';
    var method;
};
plivo.prototype.modify_endpoint = function (params, callback) {
    var action;
};
plivo.prototype.get_number_details = function (params, callback) {
    var action = 'Number/' + params['number'] + '/';
    delete params.number;
    var method = 'GET';
    this.request(action, method, params);
};
plivo.prototype.unrent_number = function (params) {
    var action = 'Number/' + params['number'] + '/';
    delete params.number;
};
plivo.prototype.get_number_group = function (params) {
    var action;
};
plivo.prototype.get_number_group_details = function () {
    var action = 'AvailableNumberGroup/' + params['group_id'] + '/';
    var method = 'GET';
};
plivo.prototype.edit_number = function (params) {
    var action = 'Number/' + params['number'] + '/';
    var method;
};
plivo.prototype.link_application_number = function () {
    this.edit_number(params, callback);
};
plivo.prototype.unlink_application_number = function (params) {
    params.app_id = null;
};
plivo.prototype.buy_phone_number = function () {
    var action;
    delete params.number;
    var method = 'POST';
    this.request(action, method, params);
};
// Message
plivo.prototype.send_message = function (params) {
    var action = 'Message/';
    this.request(action, method, params);
};
plivo.prototype.get_message = function (params) {
    var action;
    delete params.record_id;
    var method = 'GET';
    this.request(action, params, callback);
};
plivo.prototype.modify_incoming_carrier = function (params) {
    var action;
    delete params.carrier_id;
    var method = 'POST';
};
// Outgoing Carriers
plivo.prototype.get_outgoing_carriers = function () {
    var action;
};
plivo.prototype.get_outgoing_carrier = function (params) {
    var action = 'OutgoingCarrier/' + params['carrier_id'] + '/';
};
plivo.prototype.create_outgoing_carrier = function (params) {
    var action = 'OutgoingCarrier/';
    this.request(action, params);
};
plivo.prototype.modify_outgoing_carrier = function (params) {
    var action = 'OutgoingCarrier/' + params['carrier_id'] + '/';
    delete params.carrier_id;
    this.request(action, method, params, callback);
};
plivo.prototype.delete_outgoing_carrier = function (params) {
    var action = 'OutgoingCarrier/' + params['carrier_id'] + '/';
    delete params.carrier_id;
    var method;
    this.request(action, params, callback);
};
// Outgoing Carrier Routings
plivo.prototype.get_outgoing_carrier_routings = function (params, callback) {
    var action = 'OutgoingCarrierRouting/';
    var method = 'GET';
};
plivo.prototype.get_outgoing_carrier_routing = function (params) {
    var action = 'OutgoingCarrierRouting/' + params['routing_id'] + '/';
    delete params.routing_id;
    var method = 'GET';
};
plivo.prototype.modify_outgoing_carrier_routing = function (params, callback) {
    var action;
    delete params.routing_id;
    var method = 'POST';
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