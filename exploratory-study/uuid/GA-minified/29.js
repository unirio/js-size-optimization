function UUIDjs(){}function getRandomInt(U,t){return Math.floor(Math.random()*(t-U+1))+U}UUIDjs.maxFromBits=function(U){return Math.pow(2,U)},UUIDjs.limitUI04=UUIDjs.maxFromBits(4),UUIDjs.limitUI06=UUIDjs.maxFromBits(6),UUIDjs.limitUI08=UUIDjs.maxFromBits(8),UUIDjs.limitUI12=UUIDjs.maxFromBits(12),UUIDjs.limitUI14=UUIDjs.maxFromBits(14),UUIDjs.limitUI16=UUIDjs.maxFromBits(16),UUIDjs.limitUI32=UUIDjs.maxFromBits(32),UUIDjs.limitUI40=UUIDjs.maxFromBits(40),UUIDjs.limitUI48=UUIDjs.maxFromBits(48),UUIDjs.randomUI04=function(){return getRandomInt(0,UUIDjs.limitUI04-1)},UUIDjs.randomUI06=function(){return getRandomInt(0,UUIDjs.limitUI06-1)},UUIDjs.randomUI08=function(){return getRandomInt(0,UUIDjs.limitUI08-1)},UUIDjs.randomUI12=function(){return getRandomInt(0,UUIDjs.limitUI12-1)},UUIDjs.randomUI14=function(){return getRandomInt(0,UUIDjs.limitUI14-1)},UUIDjs.randomUI16=function(){return getRandomInt(0,UUIDjs.limitUI16-1)},UUIDjs.randomUI32=function(){return getRandomInt(0,UUIDjs.limitUI32-1)},UUIDjs.randomUI40=function(){return(0|Math.random()*(1<<30))+(0|1024*Math.random())*(1<<30)},UUIDjs.randomUI48=function(){return(0|Math.random()*(1<<30))+(0|Math.random()*(1<<18))*(1<<30)},UUIDjs.paddedString=function(U,t,n){U=String(U),n=n||"0";for(var r=t-U.length;r>0;r>>>=1,n+=n)1&r&&(U=n+U);return U},UUIDjs.prototype.fromParts=function(U,t,n,r,I,i){return this.version=n>>12&15,this.hex=UUIDjs.paddedString(U.toString(16),8)+"-"+UUIDjs.paddedString(t.toString(16),4)+"-"+UUIDjs.paddedString(n.toString(16),4)+"-"+UUIDjs.paddedString(r.toString(16),2)+UUIDjs.paddedString(I.toString(16),2)+"-"+UUIDjs.paddedString(i.toString(16),12),this},UUIDjs.prototype.toString=function(){return this.hex},UUIDjs.prototype.toURN=function(){return"urn:uuid:"+this.hex},UUIDjs.prototype.toBytes=function(){for(var U=this.hex.split("-"),t=[],n=0,r=0;r<U.length;r++)for(var I=0;I<U[r].length;I+=2)t[n++]=parseInt(U[r].substr(I,2),16);return t},UUIDjs.prototype.equals=function(U){return U instanceof UUID&&this.hex===U.hex},UUIDjs.getTimeFieldValues=function(U){var t=U-Date.UTC(1582,9,15),n=t/4294967296*1e4&268435455;return{low:1e4*(268435455&t)%4294967296,mid:65535&n,hi:n>>>16,timestamp:t}},UUIDjs._create4=function(){return(new UUIDjs).fromParts(UUIDjs.randomUI32(),UUIDjs.randomUI16(),16384|UUIDjs.randomUI12(),128|UUIDjs.randomUI06(),UUIDjs.randomUI08(),UUIDjs.randomUI48())},UUIDjs._create1=function(){var U=(new Date).getTime(),t=UUIDjs.randomUI14(),n=1099511627776*(1|UUIDjs.randomUI08())+UUIDjs.randomUI40(),r=UUIDjs.randomUI04(),I=0;U!=I?(U<I&&t++,I=U,r=UUIDjs.randomUI04()):Math.random()<.25&&r<9984?r+=1+UUIDjs.undefined():t++;var i=UUIDjs.getTimeFieldValues(I),s=i.low+r,e=4095&i.hi|4096,o=(t&=16383)>>>8|128,a=255&t;return(new UUIDjs).fromParts(s,i.mid,e,o,a,n)},UUIDjs.create=function(U){return this["_create"+(U=U||4)]()},UUIDjs.fromTime=function(U,t){t=t||!1;var n=UUIDjs.getTimeFieldValues(U),r=n.low,I=4095&n.hi|4096;return!1===t?(new UUIDjs).fromParts(r,n.mid,I,0,0,0):(new UUIDjs).fromParts(r,n.mid,I,128|UUIDjs.limitUI06,UUIDjs.limitUI08-1,UUIDjs.limitUI48-1)},UUIDjs.firstFromTime=function(U){return UUIDjs.fromTime(U,!1)},UUIDjs.lastFromTime=function(U){return UUIDjs.fromTime(U,!0)},UUIDjs.fromURN=function(U){var t;return(t=/^(?:urn:uuid:|\{)?([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{2})([0-9a-f]{2})-([0-9a-f]{12})(?:\})?$/i.exec(U))?(new UUIDjs).fromParts(parseInt(t[1],16),parseInt(t[2],16),parseInt(t[3],16),parseInt(t[4],16),parseInt(t[5],16),parseInt(t[6],16)):null},UUIDjs.fromBytes=function(U){if(U.length<5)return null;for(var t="",n=0,r=[4,2,2,2,6],I=0;I<r.length;I++){for(var i=0;i<r[I];i++){var s=U[n++].toString(16);1==s.length&&(s="0"+s),t+=s}6!==r[I]&&(t+="-")}return UUIDjs.fromURN(t)},UUIDjs.fromBinary=function(U){for(var t=[],n=0;n<U.length;n++)if(t[n]=U.charCodeAt(n),t[n]>255||t[n]<0)throw new Error("Unexpected byte in binary data.");return UUIDjs.fromBytes(t)},UUIDjs.new=function(){return this.create(4)},UUIDjs.newTS=function(){return this.create(1)},module.exports=UUIDjs;