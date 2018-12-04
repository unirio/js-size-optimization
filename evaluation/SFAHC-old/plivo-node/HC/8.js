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
    var path = 'https://' + this.options.host + '/' + this.options.version + '/Account/' + this.options.authId + '/' + action;
    var auth = 'Basic ' + new Buffer(this.options.authId + ':' + this.options.authToken).toString('base64');
    var headers = {
        'Authorization': auth,
        'User-Agent': this.UserAgent,
        'Content-Type': 'application/json'
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
                return callback(500);
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
    } else if (method == 'PUT') {
        request_options.json = params;
        Request.put(function (error) {
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
    var signature = crypto.createHmac('sha1', this.options.authToken).update(new Buffer(toSign, 'utf-8')).digest('base64');
    return signature;
};
// Express middleware for verifying signature
plivo.prototype.middleware = function (options) {
    return function (req, res, next) {
        if (process.env.NODE_ENV === 'test')
            return next();
        if (options && options.host) {
            toSign = options.host;
        } else {
            toSign = req.protocol + '://' + req.host;
        }
        toSign += req.originalUrl;
        if (expectedSignature === req.header('X-Plivo-Signature')) {
            next();
        } else {
            next(new Error(msg));
        }
    };
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
    this.request(action, method, params, callback);
};
plivo.prototype.get_live_calls = function (params, callback) {
    params.status = 'live';
    this.request(action, method, params, callback, true);
};
plivo.prototype.get_live_call = function (params, callback) {
    delete params.call_uuid;
    params.status = 'live';
    this.request(action, method, params, callback);
};
plivo.prototype.transfer_call = function (params, callback) {
    delete params.call_uuid;
    this.request(action, method, params, callback);
};
plivo.prototype.hangup_all_calls = function (callback) {
    var action = 'Call/';
    var method = 'DELETE';
    var params = {};
    this.request(action, method, params, callback);
};
plivo.prototype.hangup_call = function (params, callback) {
    delete params.call_uuid;
    this.request(action, method, params, callback);
};
plivo.prototype.record = function (params, callback) {
    delete params.call_uuid;
    this.request(action, method, params, callback);
};
plivo.prototype.record_stop = function (params, callback) {
    delete params.call_uuid;
    this.request(action, method, params, callback);
};
plivo.prototype.play = function (params, callback) {
    delete params.call_uuid;
    this.request(action, method, params, callback);
};
plivo.prototype.play_stop = function (params, callback) {
    delete params.call_uuid;
    this.request(action, method, params, callback);
};
plivo.prototype.speak = function (params, callback) {
    delete params.call_uuid;
    this.request(action, method, params, callback);
};
plivo.prototype.speak_stop = function (params, callback) {
    delete params.call_uuid;
    this.request(action, method, params, callback);
};
plivo.prototype.send_digits = function (params, callback) {
    delete params.call_uuid;
    this.request(action, method, params, callback);
};
// Request
plivo.prototype.hangup_request = function (params, callback) {
    delete params.request_uuid;
    this.request(action, method, params, callback);
};
// Conferences
plivo.prototype.get_live_conferences = function (params, callback) {
    this.request(action, method, params, callback, true);
};
plivo.prototype.get_live_conference = function (params, callback) {
    delete params.conference_id;
    this.request(action, method, params, callback);
};
plivo.prototype.hangup_all_conferences = function (callback) {
    this.request(action, method, params, callback);
};
plivo.prototype.hangup_conference = function (params, callback) {
    delete params.conference_id;
    this.request(action, method, params, callback);
};
plivo.prototype.hangup_conference_member = function (params, callback) {
    delete params.conference_id;
    delete params.member_id;
    this.request(action, method, params, callback);
};
plivo.prototype.play_conference_member = function (params, callback) {
    delete params.conference_id;
    delete params.member_id;
    this.request(action, method, params, callback);
};
plivo.prototype.stop_play_conference_member = function (params, callback) {
    delete params.conference_id;
    delete params.member_id;
    this.request(action, method, params, callback);
};
plivo.prototype.speak_conference_member = function (params, callback) {
    console.log(action);
    delete params.conference_id;
    delete params.member_id;
    this.request(action, method, params, callback);
};
plivo.prototype.stop_speak_conference_member = function (params, callback) {
    delete params.conference_id;
    delete params.member_id;
    this.request(action, method, params, callback);
};
plivo.prototype.deaf_conference_member = function (params, callback) {
    delete params.conference_id;
    delete params.member_id;
    this.request(action, method, params, callback);
};
plivo.prototype.undeaf_conference_member = function (params, callback) {
    delete params.conference_id;
    delete params.member_id;
    var method = 'DELETE';
    this.request(action, method, params, callback);
};
plivo.prototype.mute_conference_member = function (params, callback) {
    delete params.conference_id;
    delete params.member_id;
    this.request(action, method, params, callback);
};
plivo.prototype.unmute_conference_member = function (params, callback) {
    delete params.conference_id;
    delete params.member_id;
    this.request(action, method, params, callback);
};
plivo.prototype.kick_conference_member = function (params, callback) {
    delete params.conference_id;
    delete params.member_id;
    this.request(action, method, params, callback);
};
plivo.prototype.record_conference = function (params, callback) {
    delete params.conference_id;
    var method = 'POST';
    this.request(action, method, params, callback);
};
plivo.prototype.stop_record_conference = function (params, callback) {
    delete params.conference_id;
    this.request(action, method, params, callback);
};
// Accounts
plivo.prototype.get_account = function (params, callback) {
    this.request(action, method, params, callback, true);
};
plivo.prototype.modify_account = function (params, callback) {
    var action = '';
    this.request(action, method, params, callback);
};
plivo.prototype.get_subaccounts = function (params, callback) {
    this.request(action, method, params, callback);
};
plivo.prototype.get_subaccount = function (params, callback) {
    delete params.subauth_id;
    this.request(action, method, params, callback);
};
plivo.prototype.create_subaccount = function (params, callback) {
    this.request(action, method, params, callback);
};
plivo.prototype.modify_subaccount = function (params, callback) {
    delete params.subauth_id;
    this.request(action, method, params, callback);
};
plivo.prototype.delete_subaccount = function (params, callback) {
    delete params.subauth_id;
    this.request(action, method, params, callback);
};
// Applications
plivo.prototype.get_applications = function (params, callback) {
    this.request(action, method, params, callback);
};
plivo.prototype.get_application = function (params, callback) {
    delete params.app_id;
    var method = 'GET';
    this.request(action, method, params, callback);
};
plivo.prototype.create_application = function (params, callback) {
    this.request(action, method, params, callback);
};
plivo.prototype.modify_application = function (params, callback) {
    delete params.app_id;
    this.request(action, method, params, callback);
};
plivo.prototype.delete_application = function (params, callback) {
    delete params.app_id;
    var method = 'DELETE';
    this.request(action, method, params, callback);
};
// Recordings
plivo.prototype.get_recordings = function (params, callback) {
    this.request(action, method, params, callback);
};
plivo.prototype.get_recording = function (params, callback) {
    var action = 'Recording/' + params['recording_id'] + '/';
    delete params.recording_id;
    this.request(action, method, params, callback);
};
plivo.prototype.delete_recording = function (params, callback) {
    delete params.recording_id;
    this.request(action, method, params, callback);
};
// Endpoints
plivo.prototype.get_endpoints = function (params, callback) {
    var action = 'Endpoint/';
    var method = 'GET';
    this.request(action, method, params, callback);
};
plivo.prototype.get_endpoint = function (params, callback) {
    delete params.endpoint_id;
    var method = 'GET';
    this.request(action, method, params, callback);
};
plivo.prototype.create_endpoint = function (params, callback) {
    var action = 'Endpoint/';
    this.request(action, method, params, callback);
};
plivo.prototype.modify_endpoint = function (params, callback) {
    var action = 'Endpoint/' + params['endpoint_id'] + '/';
    delete params.endpoint_id;
    this.request(action, method, params, callback);
};
plivo.prototype.delete_endpoint = function (params, callback) {
    var action = 'Endpoint/' + params['endpoint_id'] + '/';
    delete params.endpoint_id;
    var method = 'DELETE';
    this.request(action, method, params, callback);
};
// Numbers
plivo.prototype.get_numbers = function (params, callback) {
    var method = 'GET';
    this.request(action, method, params, callback);
};
plivo.prototype.get_number_details = function (params, callback) {
    var action = 'Number/' + params['number'] + '/';
    delete params.number;
    var method = 'GET';
    this.request(action, method, params, callback);
};
plivo.prototype.unrent_number = function (params, callback) {
    var action = 'Number/' + params['number'] + '/';
    delete params.number;
    var method = 'DELETE';
    this.request(action, method, params, callback);
};
plivo.prototype.get_number_group = function (params, callback) {
    var action = 'AvailableNumberGroup/';
    var method = 'GET';
    this.request(action, method, params, callback);
};
plivo.prototype.get_number_group_details = function (params, callback) {
    var action = 'AvailableNumberGroup/' + params['group_id'] + '/';
    delete params.group_id;
    var method = 'GET';
    this.request(action, method, params, callback);
};
plivo.prototype.rent_from_number_group = function (params, callback) {
    var action = 'AvailableNumberGroup/' + params['group_id'] + '/';
    delete params.group_id;
    var method = 'POST';
    this.request(action, method, params, callback, true);
};
plivo.prototype.edit_number = function (params, callback) {
    delete params.number;
    var method = 'POST';
    this.request(action, method, params, callback);
};
plivo.prototype.link_application_number = function (params, callback) {
    this.edit_number(params, callback);
};
plivo.prototype.unlink_application_number = function (params, callback) {
    params.app_id = null;
    this.edit_number(params, callback);
};
plivo.prototype.search_phone_numbers = function (params, callback) {
    var action = 'PhoneNumber/';
    var method = 'GET';
    this.request(action, method, params, callback);
};
plivo.prototype.buy_phone_number = function (params, callback) {
    var action = 'PhoneNumber/' + params['number'] + '/';
    delete params.number;
    var method = 'POST';
    this.request(action, method, params, callback, true);
};
// Message
plivo.prototype.send_message = function (params, callback) {
    var action = 'Message/';
    var method = 'POST';
    this.request(action, method, params, callback);
};
plivo.prototype.get_messages = function (params, callback) {
    var method = 'GET';
    this.request(action, method, params, callback);
};
plivo.prototype.get_message = function (params, callback) {
    var action = 'Message/' + params['record_id'] + '/';
    delete params.record_id;
    this.request(action, method, params, callback);
};
// Incoming Carriers
plivo.prototype.get_incoming_carriers = function (params, callback) {
    var action = 'IncomingCarrier/';
    this.request(action, method, params, callback);
};
plivo.prototype.get_incoming_carrier = function (params, callback) {
    delete params.carrier_id;
    this.request(action, method, params, callback);
};
plivo.prototype.create_incoming_carrier = function (params, callback) {
    this.request(action, method, params, callback);
};
plivo.prototype.modify_incoming_carrier = function (params, callback) {
    var action = 'IncomingCarrier/' + params['carrier_id'] + '/';
    delete params.carrier_id;
    this.request(action, method, params, callback);
};
plivo.prototype.delete_incoming_carrier = function (params, callback) {
    delete params.carrier_id;
    var method = 'DELETE';
    this.request(action, method, params, callback);
};
// Outgoing Carriers
plivo.prototype.get_outgoing_carriers = function (params, callback) {
    var method = 'GET';
    this.request(action, method, params, callback);
};
plivo.prototype.get_outgoing_carrier = function (params, callback) {
    var action = 'OutgoingCarrier/' + params['carrier_id'] + '/';
    delete params.carrier_id;
    this.request(action, method, params, callback);
};
plivo.prototype.create_outgoing_carrier = function (params, callback) {
    var action = 'OutgoingCarrier/';
    this.request(action, method, params, callback);
};
plivo.prototype.modify_outgoing_carrier = function (params, callback) {
    var action = 'OutgoingCarrier/' + params['carrier_id'] + '/';
    delete params.carrier_id;
    var method = 'POST';
    this.request(action, method, params, callback);
};
plivo.prototype.delete_outgoing_carrier = function (params, callback) {
    var action = 'OutgoingCarrier/' + params['carrier_id'] + '/';
    delete params.carrier_id;
    var method = 'DELETE';
    this.request(action, method, params, callback);
};
// Outgoing Carrier Routings
plivo.prototype.get_outgoing_carrier_routings = function (params, callback) {
    this.request(action, method, params, callback);
};
plivo.prototype.get_outgoing_carrier_routing = function (params, callback) {
    delete params.routing_id;
    var method = 'GET';
    this.request(action, method, params, callback);
};
plivo.prototype.create_outgoing_carrier_routing = function (params, callback) {
    this.request(action, method, params, callback);
};
plivo.prototype.modify_outgoing_carrier_routing = function (params, callback) {
    delete params.routing_id;
    this.request(action, method, params, callback);
};
plivo.prototype.delete_outgoing_carrier_routing = function (params, callback) {
    delete params.routing_id;
    var method = 'DELETE';
    this.request(action, method, params, callback);
};
// Pricing
plivo.prototype.get_pricing = function (params, callback) {
    this.request(action, method, params, callback);
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
        throw new plivoError('Config for RestAPI must be provided as an object.');
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