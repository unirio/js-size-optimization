(function(){var n=this,r=n._,t=Array.prototype,e=Object.prototype,u=Function.prototype,i=t.push,o=t.slice,a=e.toString,c=e.hasOwnProperty,f=Array.isArray,l=Object.keys,s=u.bind,p=Object.create,h=function(){},v=function(n){return n instanceof v?n:this instanceof v?void(this._wrapped=n):new v(n)};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=v),exports._=v):n._=v,v.VERSION="1.8.3";var y=function(n,r,t){if(void 0===r)return n;switch(null==t?3:t){case 1:return function(t){return n.call(r,t)};case 2:return function(t,e){return n.call(r,t,e)};case 3:return function(t,e,u){return n.call(r,t,e,u)};case 4:return function(t,e,u,i){return n.call(r,t,e,u,i)}}return function(){return n.apply(r,arguments)}},d=function(n,r,t){return null==n?v.identity:v.isFunction(n)?y(n,r,t):v.isObject(n)?v.matcher(n):v.property(n)};v.iteratee=function(n,r){return d(n,r,1/0)};var g=function(n,r){return function(t){var e=arguments.length;if(e<2||null==t)return t;for(var u=1;u<e;u++)for(var i=arguments[u],o=n(i),a=o.length,c=0;c<a;c++){var f=o[c];r&&void 0!==t[f]||(t[f]=i[f])}return t}},m=function(n){if(!v.isObject(n))return{};if(p)return p(n);h.prototype=n;var r=new h;return h.prototype=null,r},b=function(n){return function(r){return null==r?void 0:r[n]}},x=Math.pow(2,53)-1,_=b("length"),j=function(n){var r=_(n);return"number"==typeof r&&r>=0&&r<=x};function w(n){return function(r,t,e,u){t=y(t,u,4);var i=!j(r)&&v.keys(r),o=(i||r).length,a=n>0?0:o-1;return arguments.length<3&&(e=r[i?i[a]:a],a+=n),function(r,t,e,u,i,o){for(;i>=0&&i<o;i+=n){var a=u?u[i]:i;e=t(e,r[a],a,r)}return e}(r,t,e,i,a,o)}}v.each=v.forEach=function(n,r,t){var e,u;if(r=y(r,t),j(n))for(e=0,u=n.length;e<u;e++)r(n[e],e,n);else{var i=v.keys(n);for(e=0,u=i.length;e<u;e++)r(n[i[e]],i[e],n)}return n},v.map=v.collect=function(n,r,t){r=d(r,t);for(var e=!j(n)&&v.keys(n),u=(e||n).length,i=Array(u),o=0;o<u;o++){var a=e?e[o]:o;i[o]=r(n[a],a,n)}return i},v.reduce=v.foldl=v.inject=w(1),v.reduceRight=v.foldr=w(-1),v.find=v.detect=function(n,r,t){var e;if(void 0!==(e=j(n)?v.findIndex(n,r,t):v.findKey(n,r,t))&&-1!==e)return n[e]},v.filter=v.select=function(n,r,t){var e=[];return r=d(r,t),v.each(n,function(n,t,u){r(n,t,u)&&e.push(n)}),e},v.reject=function(n,r,t){return v.filter(n,v.negate(d(r)),t)},v.every=v.all=function(n,r,t){r=d(r,t);for(var e=!j(n)&&v.keys(n),u=(e||n).length,i=0;i<u;i++){var o=e?e[i]:i;if(!r(n[o],o,n))return!1}return!0},v.some=v.any=function(n,r,t){r=d(r,t);for(var e=!j(n)&&v.keys(n),u=(e||n).length,i=0;i<u;i++){var o=e?e[i]:i;if(r(n[o],o,n))return!0}return!1},v.contains=v.includes=v.include=function(n,r,t,e){return j(n)||(n=v.values(n)),("number"!=typeof t||e)&&(t=0),v.indexOf(n,r,t)>=0},v.invoke=function(n,r){var t=o.call(arguments,2),e=v.isFunction(r);return v.map(n,function(n){var u=e?r:n[r];return null==u?u:u.apply(n,t)})},v.pluck=function(n,r){return v.map(n,v.property(r))},v.where=function(n,r){return v.filter(n,v.matcher(r))},v.findWhere=function(n,r){return v.find(n,v.matcher(r))},v.max=function(n,r,t){var e,u,i=-1/0,o=-1/0;if(null==r&&null!=n)for(var a=0,c=(n=j(n)?n:v.values(n)).length;a<c;a++)(e=n[a])>i&&(i=e);else r=d(r,t),v.each(n,function(n,t,e){((u=r(n,t,e))>o||u===-1/0&&i===-1/0)&&(i=n,o=u)});return i},v.min=function(n,r,t){var e,u,i=1/0,o=1/0;if(null==r&&null!=n)for(var a=0,c=(n=j(n)?n:v.values(n)).length;a<c;a++)(e=n[a])<i&&(i=e);else r=d(r,t),v.each(n,function(n,t,e){((u=r(n,t,e))<o||u===1/0&&i===1/0)&&(i=n,o=u)});return i},v.shuffle=function(n){for(var r,t=j(n)?n:v.values(n),e=t.length,u=Array(e),i=0;i<e;i++)(r=v.random(0,i))!==i&&(u[i]=u[r]),u[r]=t[i];return u},v.sample=function(n,r,t){return null==r||t?(j(n)||(n=v.values(n)),n[v.random(n.length-1)]):v.shuffle(n).slice(0,Math.max(0,r))},v.sortBy=function(n,r,t){return r=d(r,t),v.pluck(v.map(n,function(n,t,e){return{value:n,index:t,criteria:r(n,t,e)}}).sort(function(n,r){var t=n.criteria,e=r.criteria;if(t!==e){if(t>e||void 0===t)return 1;if(t<e||void 0===e)return-1}return n.index-r.index}),"value")};var A=function(n){return function(r,t,e){var u={};return t=d(t,e),v.each(r,function(e,i){var o=t(e,i,r);n(u,e,o)}),u}};v.groupBy=A(function(n,r,t){v.has(n,t)?n[t].push(r):n[t]=[r]}),v.indexBy=A(function(n,r,t){n[t]=r}),v.countBy=A(function(n,r,t){v.has(n,t)?n[t]++:n[t]=1}),v.toArray=function(n){return n?v.isArray(n)?o.call(n):j(n)?v.map(n,v.identity):v.values(n):[]},v.size=function(n){return null==n?0:j(n)?n.length:v.keys(n).length},v.partition=function(n,r,t){r=d(r,t);var e=[],u=[];return v.each(n,function(n,t,i){(r(n,t,i)?e:u).push(n)}),[e,u]},v.first=v.head=v.take=function(n,r,t){if(null!=n)return null==r||t?n[0]:v.initial(n,n.length-r)},v.initial=function(n,r,t){return o.call(n,0,Math.max(0,n.length-(null==r||t?1:r)))},v.last=function(n,r,t){if(null!=n)return null==r||t?n[n.length-1]:v.rest(n,Math.max(0,n.length-r))},v.rest=v.tail=v.drop=function(n,r,t){return o.call(n,null==r||t?1:r)},v.compact=function(n){return v.filter(n,v.identity)};var O=function(n,r,t,e){for(var u=[],i=0,o=e||0,a=_(n);o<a;o++){var c=n[o];if(j(c)&&(v.isArray(c)||v.isArguments(c))){r||(c=O(c,r,t));var f=0,l=c.length;for(u.length+=l;f<l;)u[i++]=c[f++]}else t||(u[i++]=c)}return u};function k(n){return function(r,t,e){t=d(t,e);for(var u=_(r),i=n>0?0:u-1;i>=0&&i<u;i+=n)if(t(r[i],i,r))return i;return-1}}function F(n,r,t){return function(e,u,i){var a=0,c=_(e);if("number"==typeof i)n>0?a=i>=0?i:Math.max(i+c,a):c=i>=0?Math.min(i+1,c):i+c+1;else if(t&&i&&c)return e[i=t(e,u)]===u?i:-1;if(u!=u)return(i=r(o.call(e,a,c),v.isNaN))>=0?i+a:-1;for(i=n>0?a:c-1;i>=0&&i<c;i+=n)if(e[i]===u)return i;return-1}}v.flatten=function(n,r){return O(n,r,!1)},v.without=function(n){return v.difference(n,o.call(arguments,1))},v.uniq=v.unique=function(n,r,t,e){v.isBoolean(r)||(e=t,t=r,r=!1),null!=t&&(t=d(t,e));for(var u=[],i=[],o=0,a=_(n);o<a;o++){var c=n[o],f=t?t(c,o,n):c;r?(o&&i===f||u.push(c),i=f):t?v.contains(i,f)||(i.push(f),u.push(c)):v.contains(u,c)||u.push(c)}return u},v.union=function(){return v.uniq(O(arguments,!0,!0))},v.intersection=function(n){for(var r=[],t=arguments.length,e=0,u=_(n);e<u;e++){var i=n[e];if(!v.contains(r,i)){for(var o=1;o<t&&v.contains(arguments[o],i);o++);o===t&&r.push(i)}}return r},v.difference=function(n){var r=O(arguments,!0,!0,1);return v.filter(n,function(n){return!v.contains(r,n)})},v.zip=function(){return v.unzip(arguments)},v.unzip=function(n){for(var r=n&&v.max(n,_).length||0,t=Array(r),e=0;e<r;e++)t[e]=v.pluck(n,e);return t},v.object=function(n,r){for(var t={},e=0,u=_(n);e<u;e++)r?t[n[e]]=r[e]:t[n[e][0]]=n[e][1];return t},v.findIndex=k(1),v.findLastIndex=k(-1),v.sortedIndex=function(n,r,t,e){for(var u=(t=d(t,e,1))(r),i=0,o=_(n);i<o;){var a=Math.floor((i+o)/2);t(n[a])<u?i=a+1:o=a}return i},v.indexOf=F(1,v.findIndex,v.sortedIndex),v.lastIndexOf=F(-1,v.findLastIndex),v.range=function(n,r,t){null==r&&(r=n||0,n=0),t=t||1;for(var e=Math.max(Math.ceil((r-n)/t),0),u=Array(e),i=0;i<e;i++,n+=t)u[i]=n;return u};var S=function(n,r,t,e,u){if(!(e instanceof r))return n.apply(t,u);var i=m(n.prototype),o=n.apply(i,u);return v.isObject(o)?o:i};v.bind=function(n,r){if(s&&n.bind===s)return s.apply(n,o.call(arguments,1));if(!v.isFunction(n))throw new TypeError("Bind must be called on a function");var t=o.call(arguments,2),e=function(){return S(n,e,r,this,t.concat(o.call(arguments)))};return e},v.partial=function(n){var r=o.call(arguments,1),t=function(){for(var e=0,u=r.length,i=Array(u),o=0;o<u;o++)i[o]=r[o]===v?arguments[e++]:r[o];for(;e<arguments.length;)i.push(arguments[e++]);return S(n,t,this,this,i)};return t},v.bindAll=function(n){var r,t,e=arguments.length;if(e<=1)throw new Error("bindAll must be passed function names");for(r=1;r<e;r++)n[t=arguments[r]]=v.bind(n[t],n);return n},v.memoize=function(n,r){var t=function(e){var u=t.cache,i=""+(r?r.apply(this,arguments):e);return v.has(u,i)||(u[i]=n.apply(this,arguments)),u[i]};return t.cache={},t},v.delay=function(n,r){var t=o.call(arguments,2);return setTimeout(function(){return n.apply(null,t)},r)},v.defer=v.partial(v.delay,v,1),v.throttle=function(n,r,t){var e,u,i,o=null,a=0;t||(t={});var c=function(){a=!1===t.leading?0:v.now(),o=null,i=n.apply(e,u),o||(e=u=null)};return function(){var f=v.now();a||!1!==t.leading||(a=f);var l=r-(f-a);return e=this,u=arguments,l<=0||l>r?(o&&(clearTimeout(o),o=null),a=f,i=n.apply(e,u),o||(e=u=null)):o||!1===t.trailing||(o=setTimeout(c,l)),i}},v.debounce=function(n,r,t){var e,u,i,o,a,c=function(){var f=v.now()-o;f<r&&f>=0?e=setTimeout(c,r-f):(e=null,t||(a=n.apply(i,u),e||(i=u=null)))};return function(){i=this,u=arguments,o=v.now();var f=t&&!e;return e||(e=setTimeout(c,r)),f&&(a=n.apply(i,u),i=u=null),a}},v.wrap=function(n,r){return v.partial(r,n)},v.negate=function(n){return function(){return!n.apply(this,arguments)}},v.compose=function(){var n=arguments,r=n.length-1;return function(){for(var t=r,e=n[r].apply(this,arguments);t--;)e=n[t].call(this,e);return e}},v.after=function(n,r){return function(){if(--n<1)return r.apply(this,arguments)}},v.before=function(n,r){var t;return function(){return--n>0&&(t=r.apply(this,arguments)),n<=1&&(r=null),t}},v.once=v.partial(v.before,2);var E=!{toString:null}.propertyIsEnumerable("toString"),M=["valueOf","isPrototypeOf","toString","propertyIsEnumerable","hasOwnProperty","toLocaleString"];function I(n,r){var t=M.length,u=n.constructor,i=v.isFunction(u)&&u.prototype||e,o="constructor";for(v.has(n,o)&&!v.contains(r,o)&&r.push(o);t--;)(o=M[t])in n&&n[o]!==i[o]&&!v.contains(r,o)&&r.push(o)}v.keys=function(n){if(!v.isObject(n))return[];if(l)return l(n);var r=[];for(var t in n)v.has(n,t)&&r.push(t);return E&&I(n,r),r},v.allKeys=function(n){if(!v.isObject(n))return[];var r=[];for(var t in n)r.push(t);return E&&I(n,r),r},v.values=function(n){for(var r=v.keys(n),t=r.length,e=Array(t),u=0;u<t;u++)e[u]=n[r[u]];return e},v.mapObject=function(n,r,t){r=d(r,t);for(var e,u=v.keys(n),i=u.length,o={},a=0;a<i;a++)o[e=u[a]]=r(n[e],e,n);return o},v.pairs=function(n){for(var r=v.keys(n),t=r.length,e=Array(t),u=0;u<t;u++)e[u]=[r[u],n[r[u]]];return e},v.invert=function(n){for(var r={},t=v.keys(n),e=0,u=t.length;e<u;e++)r[n[t[e]]]=t[e];return r},v.functions=v.methods=function(n){var r=[];for(var t in n)v.isFunction(n[t])&&r.push(t);return r.sort()},v.extend=g(v.allKeys),v.extendOwn=v.assign=g(v.keys),v.findKey=function(n,r,t){r=d(r,t);for(var e,u=v.keys(n),i=0,o=u.length;i<o;i++)if(r(n[e=u[i]],e,n))return e},v.pick=function(n,r,t){var e,u,i={},o=n;if(null==o)return i;v.isFunction(r)?(u=v.allKeys(o),e=y(r,t)):(u=O(arguments,!1,!1,1),e=function(n,r,t){return r in t},o=Object(o));for(var a=0,c=u.length;a<c;a++){var f=u[a],l=o[f];e(l,f,o)&&(i[f]=l)}return i},v.omit=function(n,r,t){if(v.isFunction(r))r=v.negate(r);else{var e=v.map(O(arguments,!1,!1,1),String);r=function(n,r){return!v.contains(e,r)}}return v.pick(n,r,t)},v.defaults=g(v.allKeys,!0),v.create=function(n,r){var t=m(n);return r&&v.extendOwn(t,r),t},v.clone=function(n){return v.isObject(n)?v.isArray(n)?n.slice():v.extend({},n):n},v.tap=function(n,r){return r(n),n},v.isMatch=function(n,r){var t=v.keys(r),e=t.length;if(null==n)return!e;for(var u=Object(n),i=0;i<e;i++){var o=t[i];if(r[o]!==u[o]||!(o in u))return!1}return!0};var N=function(n,r,t,e){if(n===r)return 0!==n||1/n==1/r;if(null==n||null==r)return n===r;n instanceof v&&(n=n._wrapped),r instanceof v&&(r=r._wrapped);var u=a.call(n);if(u!==a.call(r))return!1;switch(u){case"[object RegExp]":case"[object String]":return""+n==""+r;case"[object Number]":return+n!=+n?+r!=+r:0==+n?1/+n==1/r:+n==+r;case"[object Date]":case"[object Boolean]":return+n==+r}var i="[object Array]"===u;if(!i){if("object"!=typeof n||"object"!=typeof r)return!1;var o=n.constructor,c=r.constructor;if(o!==c&&!(v.isFunction(o)&&o instanceof o&&v.isFunction(c)&&c instanceof c)&&"constructor"in n&&"constructor"in r)return!1}t=t||[],e=e||[];for(var f=t.length;f--;)if(t[f]===n)return e[f]===r;if(t.push(n),e.push(r),i){if((f=n.length)!==r.length)return!1;for(;f--;)if(!N(n[f],r[f],t,e))return!1}else{var l,s=v.keys(n);if(f=s.length,v.keys(r).length!==f)return!1;for(;f--;)if(l=s[f],!v.has(r,l)||!N(n[l],r[l],t,e))return!1}return t.pop(),e.pop(),!0};v.isEqual=function(n,r){return N(n,r)},v.isEmpty=function(n){return null==n||(j(n)&&(v.isArray(n)||v.isString(n)||v.isArguments(n))?0===n.length:0===v.keys(n).length)},v.isElement=function(n){return!(!n||1!==n.nodeType)},v.isArray=f||function(n){return"[object Array]"===a.call(n)},v.isObject=function(n){var r=typeof n;return"function"===r||"object"===r&&!!n},v.each(["Arguments","Function","String","Number","Date","RegExp","Error"],function(n){v["is"+n]=function(r){return a.call(r)==="[object "+n+"]"}}),v.isArguments(arguments)||(v.isArguments=function(n){return v.has(n,"callee")}),"function"!=typeof/./&&"object"!=typeof Int8Array&&(v.isFunction=function(n){return"function"==typeof n||!1}),v.isFinite=function(n){return isFinite(n)&&!isNaN(parseFloat(n))},v.isNaN=function(n){return v.isNumber(n)&&n!==+n},v.isBoolean=function(n){return!0===n||!1===n||"[object Boolean]"===a.call(n)},v.isNull=function(n){return null===n},v.isUndefined=function(n){return void 0===n},v.has=function(n,r){return null!=n&&c.call(n,r)},v.noConflict=function(){return n._=r,this},v.identity=function(n){return n},v.constant=function(n){return function(){return n}},v.noop=function(){},v.property=b,v.propertyOf=function(n){return null==n?function(){}:function(r){return n[r]}},v.matcher=v.matches=function(n){return n=v.extendOwn({},n),function(r){return v.isMatch(r,n)}},v.times=function(n,r,t){var e=Array(Math.max(0,n));r=y(r,t,1);for(var u=0;u<n;u++)e[u]=r(u);return e},v.random=function(n,r){return null==r&&(r=n,n=0),n+Math.floor(Math.random()*(r-n+1))},v.now=Date.now||function(){return(new Date).getTime()};var B={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"},T=v.invert(B),R=function(n){var r=function(r){return n[r]},t="(?:"+v.keys(n).join("|")+")",e=RegExp(t),u=RegExp(t,"g");return function(n){return n=null==n?"":""+n,e.test(n)?n.replace(u,r):n}};v.escape=R(B),v.unescape=R(T),v.result=function(n,r,t){var e=null==n?void 0:n[r];return void 0===e&&(e=t),v.isFunction(e)?e.call(n):e};var q=0;v.uniqueId=function(n){var r=++q+"";return n?n+r:r},v.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var K=/(.)^/,z={"'":"'","\\":"\\","\r":"r","\n":"n","\u2028":"u2028","\u2029":"u2029"},D=/\\|'|\r|\n|\u2028|\u2029/g,L=function(n){return"\\"+z[n]};v.template=function(n,r,t){!r&&t&&(r=t),r=v.defaults({},r,v.templateSettings);var e=RegExp([(r.escape||K).source,(r.interpolate||K).source,(r.evaluate||K).source].join("|")+"|$","g"),u=0,i="__p+='";n.replace(e,function(r,t,e,o,a){return i+=n.slice(u,a).replace(D,L),u=a+r.length,t?i+="'+\n((__t=("+t+"))==null?'':_.escape(__t))+\n'":e?i+="'+\n((__t=("+e+"))==null?'':__t)+\n'":o&&(i+="';\n"+o+"\n__p+='"),r}),i+="';\n",r.variable||(i="with(obj||{}){\n"+i+"}\n"),i="var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n"+i+"return __p;\n";try{var o=new Function(r.variable||"obj","_",i)}catch(n){throw n.source=i,n}var a=function(n){return o.call(this,n,v)},c=r.variable||"obj";return a.source="function("+c+"){\n"+i+"}",a},v.chain=function(n){var r=v(n);return r._chain=!0,r};var P=function(n,r){return n._chain?v(r).chain():r};v.mixin=function(n){v.each(v.functions(n),function(r){var t=v[r]=n[r];v.prototype[r]=function(){var n=[this._wrapped];return i.apply(n,arguments),P(this,t.apply(v,n))}})},v.mixin(v),v.each(["pop","push","reverse","shift","sort","splice","unshift"],function(n){var r=t[n];v.prototype[n]=function(){var t=this._wrapped;return r.apply(t,arguments),"shift"!==n&&"splice"!==n||0!==t.length||delete t[0],P(this,t)}}),v.each(["concat","join","slice"],function(n){var r=t[n];v.prototype[n]=function(){return P(this,r.apply(this._wrapped,arguments))}}),v.prototype.value=function(){return this._wrapped},v.prototype.valueOf=v.prototype.toJSON=v.prototype.value,v.prototype.toString=function(){return""+this._wrapped},"function"==typeof define&&define.amd&&define("underscore",function(){return v})}).call(this);