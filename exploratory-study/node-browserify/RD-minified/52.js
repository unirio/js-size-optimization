var mdeps=require("module-deps"),depsSort=require("deps-sort"),bpack=require("browser-pack"),insertGlobals=require("insert-module-globals"),syntaxError=require("syntax-error"),builtins=require("./lib/builtins.js"),splicer=require("labeled-stream-splicer"),through=require("through2"),concat=require("concat-stream"),inherits=require("inherits"),EventEmitter=require("events").EventEmitter,xtend=require("xtend"),isArray=Array.isArray,defined=require("defined"),has=require("has"),sanitize=require("htmlescape").sanitize,shasum=require("shasum"),bresolve=require("browser-resolve"),resolve=require("resolve"),readonly=require("read-only-stream");module.exports=Browserify,inherits(Browserify,EventEmitter);var fs=require("fs"),path=require("path"),paths={empty:path.join(__dirname,"lib/_empty.js")};function Browserify(e,r){var t=this;if(!(this instanceof Browserify))return new Browserify(e,r);if(r||(r={}),r="string"==typeof e||isArray(e)||isStream(e)?xtend(r,{entries:[].concat(r.entries||[],e)}):xtend(e,r),t._options=r,r.noparse&&(r.noParse=r.noparse),void 0!==r.basedir&&"string"!=typeof r.basedir)throw new Error("opts.basedir must be either undefined or a string.");t._external=[],t._exclude=[],t._ignore=[],t._expose={},t._hashes={},t._pending=0,t._transformOrder=0,t._transformPending=0,t._transforms=[],t._entryOrder=0,t._ticked=!1,t._bresolve=!1===r.browserField?function(e,r,t){r.basedir||(r.basedir=path.dirname(r.filename)),resolve(e,r,t)}:bresolve,t._syntaxCache={};var i=[].concat(r.ignoreTransform).filter(Boolean);t._filterTransform=function(e){return isArray(e)?-1===i.indexOf(e[0]):-1===i.indexOf(e)},t.pipeline=t._createPipeline(r),[].concat(r.transform).filter(Boolean).filter(t._filterTransform).forEach(function(e){t.transform(e)}),[].concat(r.entries).filter(Boolean).forEach(function(e){t.add(e,{basedir:r.basedir})}),[].concat(r.require).filter(Boolean).forEach(function(e){t.require(e,{basedir:r.basedir})}),[].concat(r.plugin).filter(Boolean).forEach(function(e){t.plugin(e,{basedir:r.basedir})})}function isStream(e){return e&&"function"==typeof e.pipe}function isAbsolutePath(e){return("win32"===process.platform?/^\w:/:/^\//).test(e)}function isExternalModule(e){return!("win32"===process.platform?/^(\.|\w:)/:/^[\/.]/).test(e)}Browserify.prototype.require=function(e,r){var t=this;if(isArray(e))return e.forEach(function(e){"object"==typeof e?t.require(e.file,xtend(r,e)):t.require(e,r)}),this;r||(r={});var i,n=defined(r.basedir,t._options.basedir,process.cwd()),s=r.expose;if(e===s&&/^[\.]/.test(s)&&(s=(s="/"+path.relative(n,s)).replace(/\\/g,"/")),void 0===s&&this._options.exposeAll&&(s=!0),!0===s&&(s=(s="/"+path.relative(n,e)).replace(/\\/g,"/")),isStream(e)){t._pending++;var o=t._entryOrder++;return e.pipe(concat(function(i){var a=r.file||e.file||path.join(n,"_stream_"+o+".js"),u=e.id||s||a;(s||!1===r.entry)&&(t._expose[u]=a),r.entry||void 0!==t._options.exports||(t._bpack.hasExports=!0);var p={source:i.toString("utf8"),entry:defined(r.entry,!1),file:a,id:u};p.entry&&(p.order=o),!1===p.transform&&(p.transform=!1),t.pipeline.write(p),0==--t._pending&&t.emit("_ready")})),this}return(i="object"==typeof e?xtend(e,r):!r.entry&&isExternalModule(e)?xtend(r,{id:s||e,file:e}):xtend(r,{file:path.resolve(n,e)})).id||(i.id=s||i.file),!s&&i.entry||(i.expose=i.id),r.external?t.external(e,r):(void 0===i.entry&&(i.entry=!1),i.entry||void 0!==t._options.exports||(t._bpack.hasExports=!0),i.entry&&(i.order=t._entryOrder++),!1===r.transform&&(i.transform=!1),t.pipeline.write(i),t)},Browserify.prototype.add=function(e,r){var t=this;return r||(r={}),isArray(e)?(e.forEach(function(e){t.add(e,r)}),this):this.require(e,xtend({entry:!0,expose:!1},r))},Browserify.prototype.external=function(e,r){var t=this;if(isArray(e))return e.forEach(function(e){"object"==typeof e?t.external(e,xtend(r,e)):t.external(e,r)}),this;if(e&&"object"==typeof e&&"function"==typeof e.bundle){var i=e;t._pending++;var n={},s={};return i.on("label",function(e,r){t._external.push(r),e!==r&&(s[e]=r,t._external.push(e))}),i.pipeline.get("deps").push(through.obj(function(e,r,t){n=xtend(n,e.deps),this.push(e),t()})),t.on("dep",function(e){Object.keys(e.deps).forEach(function(r){var t=n[r];if(t){var i=s[t];i&&(e.indexDeps[r]=i)}})}),i.pipeline.get("label").once("end",function(){0==--t._pending&&t.emit("_ready")}),this}r||(r={});var o=defined(r.basedir,process.cwd());return this._external.push(e),this._external.push("/"+path.relative(o,e)),this},Browserify.prototype.exclude=function(e,r){r||(r={});var t=defined(r.basedir,process.cwd());return this._exclude.push(e),this._exclude.push("/"+path.relative(t,e)),this},Browserify.prototype.ignore=function(e,r){r||(r={});var t=defined(r.basedir,process.cwd());return"."===e[0]?this._ignore.push(path.resolve(t,e)):this._ignore.push(e),this},Browserify.prototype.transform=function(e,r){var t=this;if("function"!=typeof r&&"string"!=typeof r||(e=[r,e]),isArray(e)&&(r=e[1],e=e[0]),"string"==typeof e&&!t._filterTransform(e))return this;function i(){t._transforms[s]=o,--t._pending,0==--t._transformPending&&(t._transforms.forEach(function(e){t.pipeline.write(e)}),0===t._pending&&t.emit("_ready"))}r||(r={}),r._flags="_flags"in r?r._flags:t._options;var n=defined(r.basedir,this._options.basedir,process.cwd()),s=t._transformOrder++;t._pending++,t._transformPending++;var o={transform:e,options:r,global:r.global};if("string"==typeof e){var a={basedir:n,paths:(t._options.paths||[]).map(function(e){return path.resolve(n,e)})};resolve(e,a,function(e,r){if(e)return t.emit("error",e);o.transform=r,i()})}else process.nextTick(i);return this},Browserify.prototype.plugin=function(e,r){isArray(e)&&(r=e[1],e=e[0]),r||(r={});var t=defined(r.basedir,this._options.basedir,process.cwd());if("function"==typeof e)e(this,r);else{var i=resolve.sync(String(e),{basedir:t}),n=require(i);if("function"!=typeof n)throw new Error("plugin "+e+" should export a function");n(this,r)}return this},Browserify.prototype._createPipeline=function(e){var r=this;e||(e={}),this._mdeps=this._createDeps(e),this._mdeps.on("file",function(e,t){i.emit("file",e,t),r.emit("file",e,t)}),this._mdeps.on("package",function(e){i.emit("package",e),r.emit("package",e)}),this._mdeps.on("transform",function(e,t){i.emit("transform",e,t),r.emit("transform",e,t)});var t={index:!e.fullPaths&&!e.exposeAll,dedupe:!0,expose:this._expose};this._bpack=bpack(xtend(e,{raw:!0}));var i=splicer.obj(["record",[this._recorder()],"deps",[this._mdeps],"json",[this._json()],"unbom",[this._unbom()],"unshebang",[this._unshebang()],"syntax",[this._syntax()],"sort",[depsSort(t)],"dedupe",[this._dedupe()],"label",[this._label(e)],"emit-deps",[this._emitDeps()],"debug",[this._debug(e)],"pack",[this._bpack],"wrap",[]]);if(e.exposeAll){var n=defined(e.basedir,process.cwd());i.get("deps").push(through.obj(function(e,t,i){if(r._external.indexOf(e.id)>=0)return i();isAbsolutePath(e.id)&&(e.id="/"+path.relative(n,e.file)),Object.keys(e.deps||{}).forEach(function(r){e.deps[r]="/"+path.relative(n,e.deps[r])}),this.push(e),i()}))}return i},Browserify.prototype._createDeps=function(e){var r=this,t=xtend(e),i=defined(e.basedir,process.cwd());t.expose=this._expose,t.extensions=[".js",".json"].concat(t.extensions||[]),r._extensions=t.extensions,t.transform=[],t.transformKey=["browserify","transform"],t.postFilter=function(t,i,n){return!(e.postFilter&&!e.postFilter(t,i,n))&&(!(r._external.indexOf(i)>=0)&&(!(r._exclude.indexOf(i)>=0)&&(n&&n.browserify&&n.browserify.transform&&(n.browserify.transform=[].concat(n.browserify.transform).filter(Boolean).filter(r._filterTransform)),!0)))},t.filter=function(t){return!(e.filter&&!e.filter(t))&&(!(r._external.indexOf(t)>=0)&&(!(r._exclude.indexOf(t)>=0)&&(!1!==e.bundleExternal||!isExternalModule(t))))},t.resolve=function(e,t,n){if(r._ignore.indexOf(e)>=0)return n(null,paths.empty,{});r._bresolve(e,t,function(e,t,s){if(t&&r._ignore.indexOf(t)>=0)return n(null,paths.empty,{});if(t&&r._ignore.length){var o=t.split("/node_modules/")[1];if(o&&(o=o.split()[0],r._ignore.indexOf(o)>=0))return n(null,paths.empty,{})}if(t){var a="/"+path.relative(i,t);if(r._external.indexOf(a)>=0)return n(null,a);if(r._exclude.indexOf(a)>=0)return n(null,a);if(r._ignore.indexOf(a)>=0)return n(null,paths.empty,{})}e?n(e,t,s):t?fs.realpath(t,function(e,r){n(e,r,s,t)}):n(e,null,s)})},!1===e.builtins?(t.modules={},r._exclude.push.apply(r._exclude,Object.keys(builtins))):e.builtins&&isArray(e.builtins)?(t.modules={},e.builtins.forEach(function(e){t.modules[e]=builtins[e]})):e.builtins&&"object"==typeof e.builtins?t.modules=e.builtins:t.modules=xtend(builtins),Object.keys(builtins).forEach(function(e){has(t.modules,e)||r._exclude.push(e)}),t.globalTransform=[],this._bundled||this.once("bundle",function(){r.pipeline.write({transform:o,global:!0,options:{}})});var n=[].concat(e.noParse).filter(Boolean),s=n.filter(function(e){return"string"==typeof e}).map(function(e){return path.resolve(i,e)});function o(r){if(!1===e.detectGlobals)return through();if(!0===e.noParse)return through();if(n.indexOf(r)>=0)return through();if(s.indexOf(r)>=0)return through();for(var t=r.split("/node_modules/"),i=0;i<n.length;i++){if("function"==typeof n[i]&&n[i](r))return through();if(n[i]===t[t.length-1].split("/")[0])return through();if(n[i]===t[t.length-1])return through()}var o=xtend({process:function(){return"require('_process')"}},e.insertGlobalVars);return!1===e.bundleExternal&&(o.process=void 0),insertGlobals(r,xtend(e,{debug:e.debug,always:e.insertGlobals,basedir:!1===e.commondir?"/":e.basedir||process.cwd(),vars:o}))}return mdeps(t)},Browserify.prototype._recorder=function(e){var r=this,t=!1;this._recorded=[],this._ticked||process.nextTick(function(){r._ticked=!0,r._recorded.forEach(function(e){i.push(e)}),t&&i.push()});var i=through.obj(function(e,t,i){r._recorded.push(e),r._ticked&&this.push(e);i()},function(){t=!0,r._ticked&&this.push(null)});return i},Browserify.prototype._json=function(){return through.obj(function(e,r,t){/\.json$/.test(e.file)&&(e.source="module.exports="+sanitize(e.source)),this.push(e),t()})},Browserify.prototype._unbom=function(){return through.obj(function(e,r,t){/^\ufeff/.test(e.source),this.push(e),t()})},Browserify.prototype._unshebang=function(){return through.obj(function(e,r,t){/^#!/.test(e.source)&&(e.source=e.source.replace(/^#![^\n]*\n/,"")),this.push(e),t()})},Browserify.prototype._syntax=function(){var e=this;return through.obj(function(r,t,i){var n=shasum(r.source);if(void 0===e._syntaxCache[n]){var s=syntaxError(r.source,r.file||r.id);if(s)return this.emit("error",s);e._syntaxCache[n]=!0}this.push(r),i()})},Browserify.prototype._dedupe=function(){return through.obj(function(e,r,t){!e.dedupeIndex&&e.dedupe?(e.source="arguments[4]["+JSON.stringify(e.dedupe)+"][0].apply(exports,arguments)",e.nomap=!0):e.dedupeIndex&&(e.source="arguments[4]["+JSON.stringify(e.dedupeIndex)+"][0].apply(exports,arguments)",e.nomap=!0),e.dedupeIndex&&e.indexDeps&&(e.indexDeps.dup=e.dedupeIndex),this.push(e),t()})},Browserify.prototype._label=function(e){var r=this,t=defined(e.basedir,process.cwd());return through.obj(function(e,i,n){var s=e.id;return r._external.indexOf(e.id)>=0?n():r._external.indexOf("/"+path.relative(t,e.id))>=0?n():r._external.indexOf(e.file)>=0?n():(e.index&&(e.id=e.index),r.emit("label",s,e.id),e.indexDeps&&(e.deps=e.indexDeps||{}),Object.keys(e.deps).forEach(function(i){if(r._expose[i])e.deps[i]=i;else{var n=path.resolve(path.dirname(e.file),i),s="/"+path.relative(t,n);if(r._external.indexOf(s)>=0&&(e.deps[i]=s),r._external.indexOf(n)>=0&&(e.deps[i]=s),r._external.indexOf(i)>=0)e.deps[i]=i;else for(var o=0;o<r._extensions.length;o++){var a=r._extensions[o];if(r._external.indexOf(s+a)>=0){e.deps[i]=s+a;break}}}}),(e.entry||e.expose)&&(r._bpack.standaloneModule=e.id),this.push(e),void n())})},Browserify.prototype._emitDeps=function(){var e=this;return through.obj(function(r,t,i){e.emit("dep",r),this.push(r),i()})},Browserify.prototype._debug=function(e){var r=defined(e.basedir,process.cwd());return through.obj(function(t,i,n){e.debug&&(t.sourceRoot="file://localhost",t.sourceFile=path.relative(r,t.file).replace(/\\/g)),this.push(t),n()})},Browserify.prototype.reset=function(e){e||(e={});var r=this._bpack.hasExports;this.pipeline=this._createPipeline(xtend(e,this._options)),this._bpack.hasExports=r,this._entryOrder=0,this._bundled=!1,this.emit("reset")},Browserify.prototype.bundle=function(e){var r=this;if(e&&"object"==typeof e)throw new Error("bundle() no longer accepts option arguments.\nMove all option arguments to the browserify() constructor.");if(this._bundled){var t=this._recorded;this.reset(),t.forEach(function(e){r.pipeline.write(e)})}var i=readonly(this.pipeline);function n(){r.emit("bundle",i),r.pipeline.end()}return e&&(i.on("error",e),i.pipe(concat(function(r){e(null,r)}))),0===this._pending?n():this.once("_ready",n),this._bundled=!0,i};