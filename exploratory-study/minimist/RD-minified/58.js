function hasKey(n,t){var o=n;return t.slice(0,-1).forEach(function(n){o=o[n]||{}}),t[t.length-1]in o}function isNumber(n){return"number"==typeof n||(!!/^0x[0-9a-f]+$/i.test(n)||/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(n))}module.exports=function(n,t){t||(t={});var o={bools:{},strings:{},unknownFn:null};"function"==typeof t.unknown&&(o.unknownFn=t.unknown),"boolean"==typeof t.boolean&&t.boolean?o.allBools=!0:[].concat(t.boolean).filter(Boolean).forEach(function(n){o.bools[n]=!0});var e={};Object.keys(t.alias||{}).forEach(function(n){e[n]=[].concat(t.alias[n]),e[n].forEach(function(t){e[t]=[n].concat(e[n].filter(function(n){return t!==n}))})}),[].concat(t.string).filter(Boolean).forEach(function(n){o.strings[n]=!0,e[n]&&(o.strings[e[n]]=!0)});var s=t.default||{},i={_:[]};Object.keys(o.bools).forEach(function(n){l(n,void 0!==s[n]&&s[n])});var r=[];function a(n){return o.allBools&&/^--[^=]+$/.test(b)||o.strings[n]||o.bools[n]||e[n]}function l(n,t,s){if(!s||!o.unknownFn||a(n)||!1!==o.unknownFn(s)){var r=!o.strings[n]&&isNumber(t)?Number(t):t;f(i,n.split("."),r),(e[n]||[]).forEach(function(n){f(i,n.split("."),r)})}}function f(n,t,e){var s=n;t.slice(0,-1).forEach(function(n){void 0===s[n]&&(s[n]={}),s=s[n]});var i=t[t.length-1];void 0===s[i]||o.bools[i]||"boolean"==typeof s[i]?s[i]=e:Array.isArray(s[i])?s[i].push(e):s[i]=[s[i],e]}function c(){return e[p].some(function(n){return o.bools[n]})}-1!==n.indexOf("--")&&(r=n.slice(n.indexOf("--")+1),n=n.slice(0,n.indexOf("--")));for(var u=0;u<n.length;u++){var b=n[u];if(/^--.+=/.test(b)){var h=b.match(/^--([^=]+)=([\s\S]*)$/),p=h[1],v=h[2];o.bools[p]&&(v="false"!==v),l(p,v,b)}else if(/^--no-.+/.test(b)){l(p=b.match(/^--no-(.+)/)[1],!1,b)}else if(/^--.+/.test(b)){p=b.match(/^--(.+)/)[1];void 0===(y=n[u+1])||/^-/.test(y)||o.bools[p]||o.allBools||e[p]&&c()?/^(true|false)$/.test(y)?(l(p,"true"===y,b),u++):l(p,!o.strings[p]||"",b):(l(p,y,b),u++)}else if(/^-[^-]+/.test(b)){for(var d=b.slice(1,-1).split(""),k=!1,g=0;g<d.length;g++){var y;if("-"!==(y=b.slice(g+2))){if(/[A-Za-z]/.test(d[g])&&/=/.test(y)){l(d[g],y.split("=")[1],b),k=!0;break}if(/[A-Za-z]/.test(d[g])&&/-?\d+(\.\d*)?(e-?\d+)?$/.test(y)){l(d[g],y,b),k=!0;break}if(d[g+1]&&d[g+1].match(/\W/)){l(d[g],b.slice(g+2),b),k=!0;break}l(d[g],!o.strings[d[g]]||"")}else l(d[g],y,b)}p=b.slice(-1)[0];k||"-"===p||(!n[u+1]||/^(-|--)[^-]/.test(n[u+1])||o.bools[p]||e[p]&&c()?n[u+1]&&/true|false/.test(n[u+1])?(l(p,"true"===n[u+1],b),u++):l(p,!o.strings[p]||"",b):(l(p,n[u+1],b),u++))}else if(o.unknownFn&&!1===o.unknownFn(b)||i._.push(o.strings._||!isNumber(b)?b:Number(b)),t.stopEarly){i._.push.apply(i._,n.slice(u+1));break}}return Object.keys(s).forEach(function(n){hasKey(i,n.split("."))||(f(i,n.split("."),s[n]),(e[n]||[]).forEach(function(t){f(i,t.split("."),s[n])}))}),t["--"]?(i["--"]=new Array,r.forEach(function(n){i["--"].push(n)})):r.forEach(function(n){i._.push(n)}),i};