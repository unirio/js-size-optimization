"use strict";const co=require("co"),timers={},timer=function(t){return void 0===timers[t]&&(timers[t]={ticks:[],median:function(){if(this.ticks.length>1){this.ticks.sort(function(t,i){return t&&i&&t.getDiff()-i.getDiff()||0});const t=this.ticks.length,i=Math.floor(t/2);return t%2?this.ticks[i].getDiff():(this.ticks[i-1].getDiff()+this.ticks[i].getDiff())/2}return this.ticks[0].getDiff()},mean:function(){return this.duration()/this.ticks.length},duration:function(){let t=0;for(let i=0,n=this.ticks.length;i<n;i++)t+=this.ticks[i].getDiff();return t},min:function(){let t=this.ticks[0].getDiff();return this.ticks.forEach(function(i){i.getDiff()<t&&(t=i.getDiff())}),t},max:function(){let t=0;return this.ticks.forEach(function(i){i.getDiff()>t&&(t=i.getDiff())}),t},count:function(){return Object.keys(this.ticks).length},parse:function(t){return t<1e3?t+"ns":t>=1e3&&t<1e6?t/1e3+ret:t>=1e6&&t<1e9?t/1e6+"ms":t>=1e9?t/1e9+"s":void 0}}),timers[t]};function isGeneratorFunction(t){var i=t.constructor;return!!i&&("GeneratorFunction"===i.name||"GeneratorFunction"===i.displayName||"function"==typeof i.prototype.next&&"function"==typeof i.prototype.throw)}function Tick(t){return this.name=t,this}function functionName(t){let i=t.toString();return i=(i=i.substr("function ".length)).substr(0,i.indexOf("("))}Tick.wrap=function(t,i){"function"==typeof t&&(t=functionName(i=t)),""===t&&(t="anon");const n=new Tick(t);n.start();const e=function(){n.stop()};return isGeneratorFunction(i)?co(i).then(e,e):i.toString().match(/^function.*\(.*\)/)?i(e):(i(),n.stop()),n},Tick.prototype.start=function(){this.hrstart=process.hrtime()},Tick.prototype.stop=function(){this.hrend=process.hrtime(this.hrstart),timer(this.name).ticks.push(this)},Tick.prototype.getDiff=function(){return 1e9*this.hrend[0]+this.hrend[1]},module.exports={timer:timer,timers:timers,Tick:Tick};