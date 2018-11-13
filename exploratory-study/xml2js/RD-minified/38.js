(function(){"use strict";var t,e,r,s,i,o,n,a,l,p,c,h=function(t,e){for(var r in e)u.call(e,r)&&(t[r]=e[r]);function s(){this.constructor=t}return s.prototype=e.prototype,t.prototype=new s,t.__super__=e.prototype,t},u={}.hasOwnProperty,f=function(t,e){return function(){return t.apply(e,arguments)}};l=require("sax"),s=require("events"),e=require("xmlbuilder"),t=require("./bom"),n=require("./processors"),p=require("timers").setImmediate,i=function(t){return"object"==typeof t&&null!=t&&0===Object.keys(t).length},o=function(t,e){var r,s;for(r=0,s=t.length;r<s;r++)e=(0,t[r])(e);return e},a=function(t){return t.indexOf("&")>=0||t.indexOf(">")>=0||t.indexOf("<")>=0},c=function(t){return"<![CDATA["+r(t)+"]]>"},r=function(t){return t.replace("]]>","]]]]><![CDATA[>")},exports.processors=n,exports.defaults={.1:{explicitCharkey:!1,trim:!0,normalize:!0,normalizeTags:!1,attrkey:"@",charkey:"#",explicitArray:!1,ignoreAttrs:!1,mergeAttrs:!1,explicitRoot:!1,validator:null,xmlns:!1,explicitChildren:!1,childkey:"@@",charsAsChildren:!1,async:!1,strict:!0,attrNameProcessors:null,attrValueProcessors:null,tagNameProcessors:null,valueProcessors:null,emptyTag:""},.2:{explicitCharkey:!1,trim:!1,normalize:!1,normalizeTags:!1,attrkey:"$",charkey:"_",explicitArray:!0,ignoreAttrs:!1,mergeAttrs:!1,explicitRoot:!0,validator:null,xmlns:!1,explicitChildren:!1,preserveChildrenOrder:!1,childkey:"$$",charsAsChildren:!1,async:!1,strict:!0,attrNameProcessors:null,attrValueProcessors:null,tagNameProcessors:null,valueProcessors:null,rootName:"root",xmldec:{version:"1.0",encoding:"UTF-8",standalone:!0},doctype:null,renderOpts:{pretty:!0,indent:"  ",newline:"\n"},headless:!1,chunkSize:1e4,emptyTag:"",cdata:!1}},exports.ValidationError=function(t){function e(t){this.message=t}return h(e,t),e}(Error),exports.Builder=function(){function t(t){var e,r,s;for(e in this.options={},r=exports.defaults[.2])u.call(r,e)&&(s=r[e],this.options[e]=s);for(e in t)u.call(t,e)&&(s=t[e],this.options[e]=s)}return t.prototype.buildObject=function(t){var r,s,i,o,n,l;return r=this.options.attrkey,s=this.options.charkey,1===Object.keys(t).length&&this.options.rootName===exports.defaults[.2].rootName?t=t[n=Object.keys(t)[0]]:n=this.options.rootName,l=this,i=function(t,e){var o,n,p,h,f,d;if("object"!=typeof e)l.options.cdata&&a(e)?t.raw(c(e)):t.txt(e);else for(f in e)if(u.call(e,f))if(n=e[f],f===r){if("object"==typeof n)for(o in n)d=n[o],t=t.att(o,d)}else if(f===s)t=l.options.cdata&&a(n)?t.raw(c(n)):t.txt(n);else if(Array.isArray(n))for(h in n)u.call(n,h)&&(t="string"==typeof(p=n[h])?l.options.cdata&&a(p)?t.ele(f).raw(c(p)).up():t.ele(f,p).up():i(t.ele(f),p).up());else"object"==typeof n?t=i(t.ele(f),n).up():"string"==typeof n&&l.options.cdata&&a(n)?t=t.ele(f).raw(c(n)).up():(null==n&&(n=""),t=t.ele(f,n.toString()).up());return t},o=e.create(n,this.options.xmldec,this.options.doctype,{headless:this.options.headless,allowSurrogateChars:this.options.allowSurrogateChars}),i(o,t).end(this.options.renderOpts)},t}(),exports.Parser=function(e){function r(t){var e,r,s;if(this.parseString=f(this.parseString,this),this.reset=f(this.reset,this),this.assignOrPush=f(this.assignOrPush,this),this.processAsync=f(this.processAsync,this),!(this instanceof exports.Parser))return new exports.Parser(t);for(e in this.options={},r=exports.defaults[.2])u.call(r,e)&&(s=r[e],this.options[e]=s);for(e in t)u.call(t,e)&&(s=t[e],this.options[e]=s);this.options.xmlns&&(this.options.xmlnskey=this.options.attrkey+"ns"),this.options.normalizeTags&&(this.options.tagNameProcessors||(this.options.tagNameProcessors=[]),this.options.tagNameProcessors.unshift(n.normalize)),this.reset()}return h(r,e),r.prototype.processAsync=function(){var t,e,r;try{return this.remaining.length<=this.options.chunkSize?(t=this.remaining,this.remaining="",this.saxParser=this.saxParser.write(t),this.saxParser.close()):(t=this.remaining.substr(0,this.options.chunkSize),this.saxParser=this.saxParser.write(t),p(this.processAsync))}catch(r){if(e=r,!this.saxParser.errThrown)return this.saxParser.errThrown=!0,this.emit(e)}},r.prototype.assignOrPush=function(t,e,r){return e in t?(t[e]instanceof Array||(t[e]=[t[e]]),t[e].push(r)):this.options.explicitArray?t[e]=[r]:t[e]=r},r.prototype.reset=function(){var t,e,r,s,n;return this.removeAllListeners(),this.saxParser=l.parser(this.options.strict,{trim:!1,normalize:!1,xmlns:this.options.xmlns}),this.saxParser.errThrown=!1,this.saxParser.onerror=(n=this,function(t){if(n.saxParser.resume(),!n.saxParser.errThrown)return n.saxParser.errThrown=!0,n.emit("error",t)}),this.saxParser.onend=function(t){return function(){if(!t.saxParser.ended)return t.saxParser.ended=!0,t.emit("end",t.resultObject)}}(this),this.saxParser.ended=!1,this.EXPLICIT_CHARKEY=this.options.explicitCharkey,this.resultObject=null,s=[],t=this.options.attrkey,e=this.options.charkey,this.saxParser.onopentag=function(r){return function(i){var n,a,l,p,c;if((l={})[e]="",!r.options.ignoreAttrs)for(n in c=i.attributes)u.call(c,n)&&(t in l||r.options.mergeAttrs||(l[t]={}),a=r.options.attrValueProcessors?o(r.options.attrValueProcessors,i.attributes[n]):i.attributes[n],p=r.options.attrNameProcessors?o(r.options.attrNameProcessors,n):n,r.options.mergeAttrs?r.assignOrPush(l,p,a):l[t][p]=a);return l["#name"]=r.options.tagNameProcessors?o(r.options.tagNameProcessors,i.name):i.name,r.options.xmlns&&(l[r.options.xmlnskey]={uri:i.uri,local:i.local}),s.push(l)}}(this),this.saxParser.onclosetag=function(t){return function(){var r,n,a,l,p,c,h,f,d,y,m,x;if(h=(f=s.pop())["#name"],t.options.explicitChildren&&t.options.preserveChildrenOrder||delete f["#name"],!0===f.cdata&&(r=f.cdata,delete f.cdata),m=s[s.length-1],f[e].match(/^\s*$/)&&!r?(n=f[e],delete f[e]):(t.options.trim&&(f[e]=f[e].trim()),t.options.normalize&&(f[e]=f[e].replace(/\s{2,}/g," ").trim()),f[e]=t.options.valueProcessors?o(t.options.valueProcessors,f[e]):f[e],1===Object.keys(f).length&&e in f&&!t.EXPLICIT_CHARKEY&&(f=f[e])),i(f)&&(f=""!==t.options.emptyTag?t.options.emptyTag:n),null!=t.options.validator){x="/"+function(){var t,e,r;for(r=[],t=0,e=s.length;t<e;t++)c=s[t],r.push(c["#name"]);return r}().concat(h).join("/");try{f=t.options.validator(x,m&&m[h],f)}catch(l){a=l,t.emit("error",a)}}if(t.options.explicitChildren&&!t.options.mergeAttrs&&"object"==typeof f)if(t.options.preserveChildrenOrder){if(m){for(p in m[t.options.childkey]=m[t.options.childkey]||[],d={},f)u.call(f,p)&&(d[p]=f[p]);m[t.options.childkey].push(d),delete f["#name"],1===Object.keys(f).length&&e in f&&!t.EXPLICIT_CHARKEY&&(f=f[e])}}else c={},t.options.attrkey in f&&(c[t.options.attrkey]=f[t.options.attrkey],delete f[t.options.attrkey]),!t.options.charsAsChildren&&t.options.charkey in f&&(c[t.options.charkey]=f[t.options.charkey],delete f[t.options.charkey]),Object.getOwnPropertyNames(f).length>0&&(c[t.options.childkey]=f),f=c;return s.length>0?t.assignOrPush(m,h,f):(t.options.explicitRoot&&(y=f,(f={})[h]=y),t.resultObject=f,t.saxParser.ended=!0,t.emit("end",t.resultObject))}}(this),r=function(t){return function(r){var i,o;if(o=s[s.length-1])return o[e]+=r,t.options.explicitChildren&&t.options.preserveChildrenOrder&&t.options.charsAsChildren&&""!==r.replace(/\\n/g,"").trim()&&(o[t.options.childkey]=o[t.options.childkey]||[],(i={"#name":"__text__"})[e]=r,o[t.options.childkey].push(i)),o}}(this),this.saxParser.ontext=r,this.saxParser.oncdata=function(t){var e;if(e=r(t))return e.cdata=!0}},r.prototype.parseString=function(e,r){var s,i;null!=r&&"function"==typeof r&&(this.on("end",function(t){return this.reset(),r(null,t)}),this.on("error",function(t){return this.reset(),r(t)}));try{return""===(e=e.toString()).trim()?(this.emit("end",null),!0):(e=t.stripBOM(e),this.options.async?(this.remaining=e,p(this.processAsync),this.saxParser):this.saxParser.write(e).close())}catch(i){if(s=i,!this.saxParser.errThrown&&!this.saxParser.ended)return this.emit("error",s),this.saxParser.errThrown=!0;if(this.saxParser.ended)throw s}},r}(s.EventEmitter),exports.parseString=function(t,e,r){var s,i;return null!=r?("function"==typeof r&&(s=r),"object"==typeof e&&(i=e)):("function"==typeof e&&(s=e),i={}),new exports.Parser(i).parseString(t,s)}}).call(this);