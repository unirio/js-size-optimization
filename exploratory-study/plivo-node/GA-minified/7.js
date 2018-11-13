var util=require("util"),crypto=require("crypto"),Request=require("request"),qs=require("querystring"),xmlBuilder=require("xmlbuilder"),doc=xmlBuilder.create(),plivo={options:{}};plivo.options.host="api.plivo.com",plivo.options.version="v1",plivo.options.authId="",plivo.options.authToken="";var UserAgent="NodePlivo";function PlivoError(e){Error.call(this),Error.captureStackTrace(this,arguments.callee),this.message=(e||"")+"\n",this.name="PlivoError"}PlivoError.prototype=Error.prototype;var request=function(e,i,t,n,r){if(r&&"object"!=typeof t){if("function"==typeof t)n=t;t={}}if(!n)n=function(){};var o={uri:"https://"+plivo.options.host+"/"+plivo.options.version+"/Account/"+plivo.options.authId+"/"+e,headers:{Authorization:"Basic "+new Buffer(plivo.options.authId+":"+plivo.options.authToken).toString("base64"),"User-Agent":UserAgent,"Content-Type":"application/json"},json:!0};if("POST"==i){var u=JSON.stringify(t);o.json=!0,o.body=u,Request.post(o,function(e,i,t){if(e||!i)return n(500,t);201!=i.statusCode&&new PlivoError(e),n(i.statusCode,t)})}else if("GET"==i)o.qs=t,Request.get(o,function(e,i,t){n(i.statusCode,t)});else if("DELETE"==i)Request.del(o,function(e,i,t){n(i.statusCode,t)});else if("PUT"==i){u=JSON.stringify(t);o.json=!0,o.body=u,Request.put(o,function(e,i,t){n(i.statusCode,t)})}};function Response(){this.element="Response",this.nestables=["Speak","Play","GetDigits","Record","Dial","Message","Redirect","Wait","Hangup","PreAnswer","Conference","DTMF"],this.valid_attributes=[],this.elem=doc.begin(this.element)}function Conference(e){this.element="Conference",this.valid_attributes=["muted","beep","startConferenceOnEnter","endConferenceOnExit","waitSound","enterSound","exitSound","timeLimit","hangupOnStar","maxMembers","record","recordWhenAlone","recordFileFormat","action","method","redirect","digitsMatch","callbackUrl","callbackMethod","stayAlone","floorEvent","transcriptionType","transcriptionUrl","transcriptionMethod","relayDTMF"],this.nestables=[]}function Number(e){this.element="Number",this.valid_attributes=["sendDigits","sendOnPreanswer","sendDigitsMode"],this.nestables=[]}function User(e){this.element="User",this.nestables=[],this.valid_attributes=["sendDigits","sendOnPreanswer","sipHeaders"]}function Dial(e){this.element="Dial",this.valid_attributes=["action","method","timeout","hangupOnStar","timeLimit","callerId","callerName","confirmSound","dialMusic","confirmKey","redirect","callbackUrl","callbackMethod","digitsMatch","digitsMatchBLeg","sipHeaders"],this.nestables=["Number","User"]}function GetDigits(e){this.element="GetDigits",this.valid_attributes=["action","method","timeout","digitTimeout","finishOnKey","numDigits","retries","invalidDigitsSound","validDigits","playBeep","redirect","log"],this.nestables=["Speak","Play","Wait"]}function Hangup(e){this.element="Hangup",this.valid_attributes=["schedule","reason"],this.nestables=[]}function Message(e){this.element="Message",this.nestables=[],this.valid_attributes=["src","dst","type","callbackUrl","callbackMethod"]}function Play(e){this.element="Play",this.valid_attributes=["loop"],this.nestables=[]}function PreAnswer(e){this.element="PreAnswer",this.valid_attributes=[],this.nestables=["Play","Speak","GetDigits","Wait","Redirect","Message","DTMF"]}function Record(e){this.element="Record",this.nestables=[],this.valid_attributes=["action","method","timeout","finishOnKey","maxLength","playBeep","recordSession","startOnDialAnswer","redirect","fileFormat","callbackUrl","callbackMethod","transcriptionType","transcriptionUrl","transcriptionMethod"]}function Redirect(e){this.element="Redirect",this.valid_attributes=["method"],this.nestables=[]}function Speak(e){this.element="Speak",this.valid_attributes=["voice","language","loop"],this.nestables=[]}function Wait(e){this.element="Wait",this.valid_attributes=["length","silence","min_silence","minSilence","beep"],this.nestables=[]}function DTMF(e){this.element="DTMF",this.nestables=[],this.valid_attributes=["digits","async"]}plivo.request=request,plivo.create_signature=function(e,i){var t=e;return Object.keys(i).sort().forEach(function(e){t+=e+i[e]}),crypto.createHmac("sha1",plivo.options.authToken).update(new Buffer(t,"utf-8")).digest("base64")},plivo.middleware=function(e){return function(i,t,n){if("test"===process.env.NODE_ENV)return n();var r;r=e&&e.host?e.host:i.protocol+"://"+i.host,r+=i.originalUrl;var o=plivo.create_signature(r,i.body);if(o===i.header("X-Plivo-Signature"))n();else{var u="Invalid Plivo Signature toSign="+r+", expected="+o+", actual="+i.header("X-Plivo-Signature");n(new Error(u))}}},plivo.make_call=function(e,i){request("Call/","POST",e,i)},plivo.get_cdrs=function(e,i){request("Call/","GET",e,i,!0)},plivo.get_cdr=function(e,i){var t="Call/"+e.call_uuid+"/";delete e.call_uuid;request(t,"GET",e,i)},plivo.get_live_calls=function(e,i){e.status="live",request("Call/","GET",e,i,!0)},plivo.get_live_call=function(e,i){var t="Call/"+e.call_uuid+"/";delete e.call_uuid;e.status="live",request(t,"GET",e,i)},plivo.transfer_call=function(e,i){var t="Call/"+e.call_uuid+"/";delete e.call_uuid;request(t,"POST",e,i)},plivo.hangup_all_calls=function(e){request("Call/","DELETE",{},e)},plivo.hangup_call=function(e,i){var t="Call/"+e.call_uuid+"/";delete e.call_uuid;request(t,"DELETE",e,i)},plivo.record=function(e,i){var t="Call/"+e.call_uuid+"/Record/";delete e.call_uuid;request(t,"POST",e,i)},plivo.record_stop=function(e,i){var t="Call/"+e.call_uuid+"/Record/";delete e.call_uuid;request(t,"DELETE",e,i)},plivo.play=function(e,i){var t="Call/"+e.call_uuid+"/Play/";delete e.call_uuid;request(t,"POST",e,i)},plivo.play_stop=function(e,i){var t="Call/"+e.call_uuid+"/Play/";delete e.call_uuid;request(t,"DELETE",e,i)},plivo.speak=function(e,i){var t="Call/"+e.call_uuid+"/Speak/";delete e.call_uuid;request(t,"POST",e,i)},plivo.speak_stop=function(e,i){var t="Call/"+e.call_uuid+"/Speak/";delete e.call_uuid;request(t,"DELETE",e,i)},plivo.send_digits=function(e,i){var t="Call/"+e.call_uuid+"/DTMF/";delete e.call_uuid;request(t,"POST",e,i)},plivo.hangup_request=function(e,i){var t="Request/"+e.request_uuid+"/";delete e.request_uuid;request(t,"DELETE",e,i)},plivo.get_live_conferences=function(e,i){request("Conference/","GET",e,i,!0)},plivo.get_live_conference=function(e,i){var t="Conference/"+e.conference_id+"/";delete e.conference_id;request(t,"GET",e,i)},plivo.hangup_all_conferences=function(e){request("Conference/","DELETE",params,e)},plivo.hangup_conference=function(e,i){var t="Conference/"+e.conference_id+"/";delete e.conference_id;request(t,"DELETE",e,i)},plivo.hangup_conference_member=function(e,i){var t="Conference/"+e.conference_id+"/Member/"+e.member_id+"/";delete e.conference_id,delete e.member_id;request(t,"DELETE",e,i)},plivo.play_conference_member=function(e,i){var t="Conference/"+e.conference_id+"/Member/"+e.member_id+"/Play/";delete e.conference_id,delete e.member_id;request(t,"POST",e,i)},plivo.stop_play_conference_member=function(e,i){var t="Conference/"+e.conference_id+"/Member/"+e.member_id+"/Play/";delete e.conference_id,delete e.member_id;request(t,"DELETE",e,i)},plivo.speak_conference_member=function(e,i){var t="Conference/"+e.conference_id+"/Member/"+e.member_id+"/Speak/";delete e.conference_id,delete e.member_id;request(t,"POST",e,i)},plivo.stop_speak_conference_member=function(e,i){var t="Conference/"+e.conference_id+"/Member/"+e.member_id+"/Speak/";delete e.conference_id,delete e.member_id;request(t,"DELETE",e,i)},plivo.deaf_conference_member=function(e,i){var t="Conference/"+e.conference_id+"/Member/"+e.member_id+"/Deaf/";delete e.conference_id,delete e.member_id;request(t,"POST",e,i)},plivo.undeaf_conference_member=function(e,i){var t="Conference/"+e.conference_id+"/Member/"+e.member_id+"/Deaf/";delete e.conference_id,delete e.member_id;request(t,"DELETE",e,i)},plivo.mute_conference_member=function(e,i){var t="Conference/"+e.conference_id+"/Member/"+e.member_id+"/Mute/";delete e.conference_id,delete e.member_id;request(t,"POST",e,i)},plivo.unmute_conference_member=function(e,i){var t="Conference/"+e.conference_id+"/Member/"+e.member_id+"/Mute/";delete e.conference_id,delete e.member_id;request(t,"DELETE",e,i)},plivo.kick_conference_member=function(e,i){var t="Conference/"+e.conference_id+"/Member/"+e.member_id+"/Kick/";delete e.conference_id,delete e.member_id;request(t,"POST",e,i)},plivo.record_conference=function(e,i){var t="Conference/"+e.conference_id+"/Record/";delete e.conference_id;request(t,"POST",e,i)},plivo.stop_record_conference=function(e,i){var t="Conference/"+e.conference_id+"/Record/";delete e.conference_id;request(t,"DELETE",e,i)},plivo.get_account=function(e,i){request("","GET",e,i,!0)},plivo.modify_account=function(e,i){request("","POST",e,i)},plivo.get_subaccounts=function(e,i){request("Subaccount/","GET",e,i)},plivo.get_subaccount=function(e,i){var t="Subaccount/"+e.subauth_id+"/";delete e.subauth_id;request(t,"GET",e,i)},plivo.create_subaccount=function(e,i){request("Subaccount/","POST",e,i)},plivo.modify_subaccount=function(e,i){var t="Subaccount/"+e.subauth_id+"/";delete e.subauth_id;request(t,"POST",e,i)},plivo.delete_subaccount=function(e,i){var t="Subaccount/"+e.subauth_id+"/";delete e.subauth_id;request(t,"DELETE",e,i)},plivo.get_applications=function(e,i){request("Application/","GET",e,i)},plivo.get_application=function(e,i){var t="Application/"+e.app_id+"/";delete e.app_id;request(t,"GET",e,i)},plivo.create_application=function(e,i){request("Application/","POST",e,i)},plivo.modify_application=function(e,i){var t="Application/"+e.app_id+"/";delete e.app_id;request(t,"POST",e,i)},plivo.delete_application=function(e,i){var t="Application/"+e.app_id+"/";delete e.app_id;request(t,"DELETE",e,i)},plivo.get_recordings=function(e,i){request("Recording/","GET",e,i)},plivo.get_recording=function(e,i){var t="Recording/"+e.recording_id+"/";delete e.recording_id;request(t,"GET",e,i)},plivo.delete_recording=function(e,i){var t="Recording/"+e.recording_id+"/";delete e.recording_id;request(t,"DELETE",e,i)},plivo.get_endpoints=function(e,i){request("Endpoint/","GET",e,i)},plivo.get_endpoint=function(e,i){var t="Endpoint/"+e.endpoint_id+"/";delete e.endpoint_id;request(t,"GET",e,i)},plivo.create_endpoint=function(e,i){request("Endpoint/","POST",e,i)},plivo.modify_endpoint=function(e,i){var t="Endpoint/"+e.endpoint_id+"/";delete e.endpoint_id;request(t,"POST",e,i)},plivo.delete_endpoint=function(e,i){var t="Endpoint/"+e.endpoint_id+"/";delete e.endpoint_id;request(t,"DELETE",e,i)},plivo.get_numbers=function(e,i){request("Number/","GET",e,i)},plivo.get_number_details=function(e,i){var t="Number/"+e.number+"/";delete e.number;request(t,"GET",e,i)},plivo.unrent_number=function(e,i){var t="Number/"+e.number+"/";delete e.number;request(t,"DELETE",e,i)},plivo.get_number_group=function(e,i){request("AvailableNumberGroup/","GET",e,i)},plivo.get_number_group_details=function(e,i){var t="AvailableNumberGroup/"+e.group_id+"/";delete e.group_id;request(t,"GET",e,i)},plivo.rent_from_number_group=function(e,i){var t="AvailableNumberGroup/"+e.group_id+"/";delete e.group_id;request(t,"POST",e,i,!0)},plivo.edit_number=function(e,i){var t="Number/"+e.number+"/";delete e.number;request(t,"POST",e,i)},plivo.link_application_number=function(e,i){this.edit_number(e,i)},plivo.unlink_application_number=function(e,i){e.app_id=null,this.edit_number(e,i)},plivo.search_phone_numbers=function(e,i){request("PhoneNumber/","GET",e,i)},plivo.buy_phone_number=function(e,i){var t="PhoneNumber/"+e.number+"/";delete e.number;request(t,"POST",e,i,!0)},plivo.send_message=function(e,i){request("Message/","POST",e,i)},plivo.get_messages=function(e,i){request("Message/","GET",e,i)},plivo.get_message=function(e,i){var t="Message/"+e.record_id+"/";delete e.record_id;request(t,"GET",e,i)},plivo.get_incoming_carriers=function(e,i){request("IncomingCarrier/","GET",e,i)},plivo.get_incoming_carrier=function(e,i){var t="IncomingCarrier/"+e.carrier_id+"/";delete e.carrier_id;request(t,"GET",e,i)},plivo.create_incoming_carrier=function(e,i){request("IncomingCarrier/","POST",e,i)},plivo.modify_incoming_carrier=function(e,i){var t="IncomingCarrier/"+e.carrier_id+"/";delete e.carrier_id;request(t,"POST",e,i)},plivo.delete_incoming_carrier=function(e,i){var t="IncomingCarrier/"+e.carrier_id+"/";delete e.carrier_id;request(t,"DELETE",e,i)},plivo.get_outgoing_carriers=function(e,i){request("OutgoingCarrier/","GET",e,i)},plivo.get_outgoing_carrier=function(e,i){var t="OutgoingCarrier/"+e.carrier_id+"/";delete e.carrier_id;request(t,"GET",e,i)},plivo.create_outgoing_carrier=function(e,i){request("OutgoingCarrier/","POST",e,i)},plivo.modify_outgoing_carrier=function(e,i){var t="OutgoingCarrier/"+e.carrier_id+"/";delete e.carrier_id;request(t,"POST",e,i)},plivo.delete_outgoing_carrier=function(e,i){var t="OutgoingCarrier/"+e.carrier_id+"/";delete e.carrier_id;request(t,"DELETE",e,i)},plivo.get_outgoing_carrier_routings=function(e,i){request("OutgoingCarrierRouting/","GET",e,i)},plivo.get_outgoing_carrier_routing=function(e,i){var t="OutgoingCarrierRouting/"+e.routing_id+"/";delete e.routing_id;request(t,"GET",e,i)},plivo.undefined=function(e,i){request("OutgoingCarrierRouting/","POST",e,i)},plivo.modify_outgoing_carrier_routing=function(e,i){var t="OutgoingCarrierRouting/"+e.routing_id+"/";delete e.routing_id;request(t,"POST",e,i)},plivo.delete_outgoing_carrier_routing=function(e,i){var t="OutgoingCarrierRouting/"+e.routing_id+"/";delete e.routing_id;request(t,"DELETE",e,i)},plivo.get_pricing=function(e,i){request("Pricing/","GET",e,i)},Response.prototype={init:function(e,i,t,n){if(this.name=e,this.body=i,this.elem="","Response"!=this.element?(this.elem.parent=n,this.elem=n.ele(this.name)):this.elem=this.elem.ele(this.name),!t)t={};for(var r=Object.keys(t),o=0;o<r.length;o++){if(-1==this.valid_attributes.indexOf(r[o]))throw new PlivoError('Not a valid attribute : "'+r[o]+'" for "'+this.name+'" Element');this.elem.att(r[o],t[r[o]])}i&&this.elem.text(i)},add:function(e,i,t){if(void 0===i)throw new PlivoError("No text set for "+e.element+".");if(!(this.nestables.indexOf(e.element)>-1))throw new PlivoError(e.element+" cannot be nested in "+this.element+".");var n=this.elem;return e.init(e.element,i,t,n),e},addConference:function(e,i){return this.add(new Conference(Response),e,i)},addNumber:function(e,i){return this.add(new Number(Response),e,i)},addUser:function(e){return this.add(new User(Response),e,{})},addDial:function(e){return this.add(new Dial(Response),"",e)},addGetDigits:function(e){return this.add(new GetDigits(Response),"",e)},addHangup:function(e){return this.add(new Hangup(Response),"",e)},addMessage:function(e,i){return this.add(new Message(Response),e,i)},addPlay:function(e,i){return this.add(new Play(Response),e,i)},addPreAnswer:function(){return this.add(new PreAnswer(Response),"",{})},addRecord:function(e){return this.add(new Record(Response),"",e)},addRedirect:function(e,i){return this.add(new Redirect(Response),e,i)},addSpeak:function(e,i){return this.add(new Speak(Response),e,i)},addWait:function(e){return this.add(new Wait(Response),"",e)},addDTMF:function(e,i){return this.add(new DTMF(Response),e,i)},toXML:function(){return this.elem.toString()}},util.inherits(Conference,Response),util.inherits(Number,Response),util.inherits(User,Response),util.inherits(Dial,Response),util.inherits(GetDigits,Response),util.inherits(Hangup,Response),util.inherits(Message,Response),util.inherits(Play,Response),util.inherits(PreAnswer,Response),util.inherits(Record,Response),util.inherits(Redirect,Response),util.inherits(Speak,Response),util.inherits(Wait,Response),util.inherits(DTMF,Response),exports.Response=function(){return new Response},exports.RestAPI=function(e){if(!e)throw new PlivoError("Auth ID and Auth Token must be provided.");if("object"!=typeof e)throw new PlivoError("Config for RestAPI must be provided as an object.");if(!e.authId||!e.authToken)throw new PlivoError("Auth ID and Auth Token must be provided.");for(key in e)plivo.options[key]=e[key];return plivo};