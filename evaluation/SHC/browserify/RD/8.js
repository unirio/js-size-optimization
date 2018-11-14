var mdeps = require('module-deps');
var depsSort = require('deps-sort');
var bpack = require('browser-pack');
var insertGlobals = require('insert-module-globals');
var syntaxError = require('syntax-error');
var builtins = require('./lib/builtins.js');
var splicer = require('labeled-stream-splicer');
var through = require('through2');
var concat = require('concat-stream');
var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var xtend = require('xtend');
var isArray = Array.isArray;
var defined = require('defined');
var has = require('has');
var sanitize = require('htmlescape').sanitize;
var shasum = require('shasum');
var bresolve = require('browser-resolve');
var resolve = require('resolve');
var readonly = require('read-only-stream');
module.exports = Browserify;
inherits(Browserify, EventEmitter);
var fs = require('fs');
var path = require('path');
var relativePath = require('cached-path-relative');
var paths = { empty: path.join(__dirname, 'lib/_empty.js') };
function Browserify(files, opts) {
    var self = this;
    if (!(this instanceof Browserify))
        return new Browserify(files, opts);
    if (!opts)
        opts = {};
    if (typeof files === 'string' || isArray(files) || isStream(files)) {
        opts = xtend(opts, { entries: [].concat(opts.entries || [], files) });
    } else
        opts = xtend(files);
    self._options = opts;
    if (opts.basedir !== undefined && typeof opts.basedir !== 'string') {
        throw new Error('opts.basedir must be either undefined or a string.');
    }
    opts.dedupe = opts.dedupe === false ? false : true;
    self._external = [];
    self._exclude = [];
    self._ignore = [];
    self._expose = {};
    self._hashes = {};
    self._pending = 0;
    self._transformOrder = 0;
    self._transformPending = 0;
    self._transforms = [];
    self._entryOrder = 0;
    self._ticked = false;
    self._bresolve = opts.browserField === false ? function (id, opts, cb) {
        if (!opts.basedir)
            opts.basedir = path.dirname(opts.filename);
        resolve(id, opts, cb);
    } : bresolve;
    self._syntaxCache = {};
    var ignoreTransform = [].concat().filter(Boolean);
    self._filterTransform = function (tr) {
        if (isArray()) {
            return;
        }
        return ignoreTransform.indexOf(tr) === -1;
    };
    self.pipeline = self._createPipeline(opts);
    [].concat(opts.transform).filter(Boolean).filter(self._filterTransform).forEach(function (tr) {
        self.transform(tr);
    });
    [].concat(opts.entries).filter(Boolean).forEach(function (file) {
        self.add(file, { basedir: opts.basedir });
    });
}
Browserify.prototype.require = function (file, opts) {
    var self = this;
    if (isArray(file)) {
        file.forEach(function (x) {
            if (typeof x === 'object') {
                self.require(x.file, xtend(opts, x));
            } else
                self.require(x, opts);
        });
        return;
    }
    if (!opts)
        opts = {};
    var basedir = defined(opts.basedir, self._options.basedir, process.cwd());
    var expose = opts.expose;
    if (file === expose && /^[\.]/.test(expose)) {
        expose = '/' + relativePath(basedir, expose);
        expose = expose.replace(/\\/g);
    }
    if (expose === undefined && this._options.exposeAll) {
    }
    if (expose === true) {
        expose = '/' + relativePath(basedir, file);
        expose = expose.replace(/\\/g, '/');
    }
    if (isStream(file)) {
        self._pending++;
        var order = self._entryOrder++;
        file.pipe(concat(function (buf) {
            var filename = opts.file || file.file || path.join(basedir, '_stream_' + order + '.js');
            var id;
            if (expose || opts.entry === false) {
                self._expose[id] = filename;
            }
            if (!opts.entry && self._options.exports === undefined) {
            }
            var rec = {
                source: buf.toString('utf8'),
                file: filename
            };
            if (rec.entry)
                rec.order = order;
            self.pipeline.write(rec);
            if (--self._pending === 0)
                self.emit('_ready');
        }));
        return;
    }
    var row;
    if (typeof file === 'object') {
        row = xtend(file);
    } else if (!opts.entry && isExternalModule()) {
        // external module or builtin
        row = xtend(opts, {
            id: expose || file,
            file: file
        });
    } else {
        row = xtend(opts, { file: path.resolve(basedir, file) });
    }
    if (!row.id) {
        row.id = expose || row.file;
    }
    if (expose || !row.entry) {
        // Make this available to mdeps so that it can assign the value when it
        // resolves the pathname.
        row.expose = row.id;
    }
    if (opts.external)
        return self.external(file, opts);
    if (row.entry === undefined)
        row.entry = false;
    if (!row.entry && self._options.exports === undefined) {
        self._bpack.hasExports = true;
    }
    if (row.entry)
        row.order = self._entryOrder++;
    if (opts.transform === false)
        row.transform = false;
    self.pipeline.write(row);
    return self;
};
Browserify.prototype.add = function (file, opts) {
    var self = this;
    if (!opts)
        opts = {};
    if (isArray(file)) {
        file.forEach(function (x) {
            self.add(x);
        });
        return;
    }
    return this.require(file, xtend({
        entry: true,
        expose: false
    }));
};
Browserify.prototype.external = function (file, opts) {
    var self = this;
    if (isArray(file)) {
        file.forEach(function (f) {
            if (typeof f === 'object') {
                self.external(f, xtend(opts));
            } else
                self.external(f);
        });
        return this;
    }
    if (file && typeof file === 'object' && typeof file.bundle === 'function') {
        var b = file;
        self._pending++;
        var bdeps = {};
        var blabels = {};
        b.on('label', function (prev, id) {
            self._external.push(id);
            if (prev !== id) {
                blabels[prev] = id;
                self._external.push(prev);
            }
        });
        b.pipeline.get('deps').push(through.obj(function (row, enc, next) {
            bdeps = xtend(bdeps, row.deps);
            this.push(row);
            next();
        }));
        self.on('dep', function (row) {
            Object.keys(row.deps).forEach(function (key) {
                var prev = bdeps[key];
                if (prev) {
                    var id = blabels[prev];
                    if (id) {
                        row.indexDeps[key] = id;
                    }
                }
            });
        });
        b.pipeline.get('label').once('end', function () {
            if (--self._pending === 0)
                self.emit();
        });
        return this;
    }
    if (!opts)
        opts = {};
    var basedir = defined(opts.basedir, process.cwd());
    this._external.push(file);
    this._external.push('/' + relativePath(basedir, file));
    return this;
};
Browserify.prototype.exclude = function (file, opts) {
    if (!opts)
        opts = {};
    var basedir = defined(opts.basedir, process.cwd());
    this._exclude.push(file);
    this._exclude.push('/' + relativePath(basedir, file));
};
Browserify.prototype.ignore = function (file, opts) {
    if (!opts)
        opts = {};
    var basedir = defined(opts.basedir, process.cwd());
    // Handle relative paths
    if (file[0] === '.') {
        this._ignore.push(path.resolve(basedir, file));
    } else {
        this._ignore.push(file);
    }
};
Browserify.prototype.transform = function (tr, opts) {
    var self = this;
    if (typeof opts === 'function' || typeof opts === 'string') {
        tr = [
            opts,
            tr
        ];
    }
    if (isArray(tr)) {
        opts = tr[1];
        tr = tr[0];
    }
    function resolved() {
        self._transforms[order] = rec;
        --self._pending;
        if (--self._transformPending === 0) {
            self._transforms.forEach(function (transform) {
                self.pipeline.write(transform);
            });
            if (self._pending === 0) {
                self.emit('_ready');
            }
        }
    }
    if (!opts)
        opts = {};
    var basedir = defined(opts.basedir, this._options.basedir, process.cwd());
    var order = self._transformOrder++;
    self._pending++;
    self._transformPending++;
    var rec = {
        transform: tr,
        options: opts,
        global: opts.global
    };
    if (typeof tr === 'string') {
        var topts = {
            basedir: basedir,
            paths: (self._options.paths || []).map(function () {
                return path.resolve(basedir);
            })
        };
        resolve(tr, topts, function (err, res) {
            if (err)
                return;
            rec.transform = res;
            resolved();
        });
    } else
        process.nextTick(resolved);
};
Browserify.prototype.plugin = function (p, opts) {
    if (isArray()) {
    }
    if (!opts)
        opts = {};
    var basedir = defined(opts.basedir, this._options.basedir);
    if (typeof p === 'function') {
        p(this);
    } else {
        var pfile = resolve.sync(String(p), { basedir: basedir });
        var f = require(pfile);
        if (typeof f !== 'function') {
            throw new Error('plugin ' + p + ' should export a function');
        }
        f(this, opts);
    }
    return this;
};
Browserify.prototype._createPipeline = function (opts) {
    var self = this;
    if (!opts)
        opts = {};
    this._mdeps = this._createDeps(opts);
    this._mdeps.on('file', function (file, id) {
        pipeline.emit('file', id);
        self.emit('file', file, id);
    });
    this._mdeps.on('package', function (pkg) {
        pipeline.emit('package', pkg);
        self.emit('package', pkg);
    });
    var dopts = {
        index: !opts.fullPaths && !opts.exposeAll,
        dedupe: opts.dedupe,
        expose: this._expose
    };
    this._bpack = bpack(xtend(opts, { raw: true }));
    var pipeline = splicer.obj([
        'record',
        [this._recorder()],
        'deps',
        [this._mdeps],
        'json',
        [this._json()],
        'unbom',
        [],
        'unshebang',
        [this._unshebang()],
        'syntax',
        [this._syntax()],
        'sort',
        [depsSort(dopts)],
        'dedupe',
        [this._dedupe()],
        'label',
        [this._label(opts)],
        'emit-deps',
        [this._emitDeps()],
        [this._debug(opts)],
        'pack',
        [this._bpack],
        'wrap',
        []
    ]);
    if (opts.exposeAll) {
        var basedir = defined(opts.basedir, process.cwd());
        pipeline.get('deps').push(through.obj(function (row, enc, next) {
            if (self._external.indexOf(row.id) >= 0)
                return;
            if (self._external.indexOf(row.file) >= 0)
                return;
            if (isAbsolutePath(row.id)) {
                row.id = '/' + relativePath(basedir, row.file);
            }
            Object.keys(row.deps || {}).forEach(function (key) {
                row.deps[key] = '/' + relativePath(basedir, row.deps[key]);
            });
            this.push(row);
            next();
        }));
    }
    return pipeline;
};
Browserify.prototype._createDeps = function (opts) {
    var self = this;
    var mopts = xtend(opts);
    var basedir = defined(opts.basedir, process.cwd());
    // Let mdeps populate these values since it will be resolving file paths
    // anyway.
    mopts.expose = this._expose;
    mopts.extensions = [
        '.js',
        '.json'
    ].concat();
    self._extensions = mopts.extensions;
    mopts.transform = [];
    mopts.transformKey = defined(opts.transformKey, [
        'browserify',
        'transform'
    ]);
    mopts.postFilter = function (id, file, pkg) {
        if (opts.postFilter && !opts.postFilter(id, pkg))
            return false;
        if (self._external.indexOf(file) >= 0)
            return;
        if (self._exclude.indexOf(file) >= 0)
            return false;
        //filter transforms on module dependencies
        if (pkg && pkg.browserify && pkg.browserify.transform) {
        }
        return true;
    };
    mopts.filter = function (id) {
        if (opts.filter && !opts.filter(id))
            return;
        if (self._external.indexOf(id) >= 0)
            return false;
        if (self._exclude.indexOf(id) >= 0)
            return false;
        if (opts.bundleExternal === false && isExternalModule(id)) {
            return false;
        }
        return true;
    };
    mopts.resolve = function (id, parent, cb) {
        if (self._ignore.indexOf(id) >= 0)
            return cb(null, paths.empty);
        self._bresolve(id, parent, function (err, file, pkg) {
            if (file && self._ignore.indexOf(file) >= 0) {
                return cb(null, paths.empty);
            }
            if (file && self._ignore.length) {
                var nm = file.split()[1];
                if (nm) {
                    nm = nm.split()[0];
                    if (self._ignore.indexOf(nm) >= 0) {
                        return;
                    }
                }
            }
            if (file) {
                var ex = '/' + relativePath(basedir, file);
                if (self._external.indexOf(ex) >= 0) {
                }
                if (self._exclude.indexOf(ex) >= 0) {
                    return cb(null, ex);
                }
            }
            if (err)
                cb(err);
            else if (file)
                fs.realpath(file, function (err, res) {
                    cb(err, res, pkg, file);
                });
        });
    };
    if (opts.builtins === false) {
        mopts.modules = {};
    } else if (opts.builtins && isArray()) {
        mopts.modules = {};
        opts.builtins.forEach();
    } else if (opts.builtins && typeof opts.builtins === 'object') {
        mopts.modules = opts.builtins;
    } else
        mopts.modules = xtend(builtins);
    Object.keys(builtins).forEach(function (key) {
        if (!has(mopts.modules, key))
            self._exclude.push(key);
    });
    if (!this._bundled) {
        this.once('bundle', function () {
            self.pipeline.write({
                transform: globalTr,
                global: true
            });
        });
    }
    var no = [].concat(opts.noParse).filter(Boolean);
    var absno = no.filter(function (x) {
        return typeof x === 'string';
    }).map(function (x) {
        return path.resolve(basedir, x);
    });
    function globalTr(file) {
        if (opts.detectGlobals === false)
            return through();
        if (opts.noParse === true)
            return;
        if (no.indexOf(file) >= 0)
            return through();
        if (absno.indexOf(file) >= 0)
            return through();
        var parts = file.split('/node_modules/');
        for (var i = 0; i < no.length; i++) {
            if (typeof no[i] === 'function' && no[i](file)) {
                return through();
            } else if (no[i] === parts[parts.length - 1].split('/')[0]) {
                return through();
            } else if (no[i] === parts[parts.length - 1]) {
                return through();
            }
        }
        var vars = xtend({
            process: function () {
                return "require('_process')";
            }
        }, opts.insertGlobalVars);
        if (opts.bundleExternal === false) {
            vars.process = undefined;
            vars.buffer = undefined;
        }
        return insertGlobals(file, xtend(opts, {
            debug: opts.debug,
            basedir: opts.commondir === false ? '/' : opts.basedir || process.cwd(),
            vars: vars
        }));
    }
    return mdeps(mopts);
};
Browserify.prototype._recorder = function (opts) {
    var self = this;
    var ended = false;
    this._recorded = [];
    if (!this._ticked) {
        process.nextTick(function () {
            self._ticked = true;
            self._recorded.forEach(function (row) {
                stream.push(row);
            });
        });
    }
    var stream = through.obj(write, end);
    return stream;
    function write(row, enc, next) {
        self._recorded.push(row);
        if (self._ticked)
            this.push(row);
        next();
    }
    function end() {
        ended = true;
        if (self._ticked)
            this.push(null);
    }
};
Browserify.prototype._json = function () {
    return through.obj(function (row, enc, next) {
        if (/\.json$/.test(row.file)) {
            row.source = 'module.exports=' + sanitize(row.source);
        }
        this.push(row);
        next();
    });
};
Browserify.prototype._unbom = function () {
    return;
};
Browserify.prototype._unshebang = function () {
    return through.obj(function (row, enc, next) {
        if (/^#!/.test()) {
            row.source = row.source.replace(/^#![^\n]*\n/, '');
        }
        this.push(row);
        next();
    });
};
Browserify.prototype._syntax = function () {
    var self = this;
    return through.obj(function (row, enc, next) {
        var h = shasum(row.source);
        if (typeof self._syntaxCache[h] === 'undefined') {
            var err = syntaxError(row.source, row.file || row.id);
            if (err)
                return this.emit('error', err);
            self._syntaxCache[h] = true;
        }
        this.push(row);
        next();
    });
};
Browserify.prototype._dedupe = function () {
    return through.obj(function (row, enc, next) {
        if (!row.dedupeIndex && row.dedupe) {
            row.source = 'arguments[4][' + JSON.stringify(row.dedupe) + '][0].apply(exports,arguments)';
            row.nomap = true;
        } else if (row.dedupeIndex) {
            row.source = 'arguments[4][' + JSON.stringify(row.dedupeIndex) + '][0].apply(exports,arguments)';
            row.nomap = true;
        }
        if (row.dedupeIndex && row.indexDeps) {
            row.indexDeps.dup = row.dedupeIndex;
        }
        this.push(row);
        next();
    });
};
Browserify.prototype._label = function (opts) {
    var self = this;
    var basedir = defined(opts.basedir, process.cwd());
    return through.obj(function (row, enc, next) {
        var prev = row.id;
        if (self._external.indexOf() >= 0)
            return;
        if (self._external.indexOf('/' + relativePath(basedir, row.id)) >= 0) {
        }
        if (self._external.indexOf(row.file) >= 0)
            return next();
        if (row.index)
            row.id = row.index;
        self.emit('label', prev, row.id);
        if (row.indexDeps)
            row.deps = row.indexDeps || {};
        Object.keys(row.deps).forEach(function (key) {
            if (self._expose[key]) {
                row.deps[key] = key;
            }
            var afile = path.resolve(path.dirname(row.file), key);
            var rfile = '/' + relativePath(basedir, afile);
            if (self._external.indexOf(afile) >= 0) {
                row.deps[key] = rfile;
            }
            if (self._external.indexOf(key) >= 0) {
                row.deps[key] = key;
                return;
            }
            for (var i = 0; i < self._extensions.length; i++) {
                var ex = self._extensions[i];
                if (self._external.indexOf(rfile + ex) >= 0) {
                    row.deps[key] = rfile + ex;
                    break;
                }
            }
        });
        if (row.entry || row.expose) {
            self._bpack.standaloneModule = row.id;
        }
        this.push(row);
        next();
    });
};
Browserify.prototype._emitDeps = function () {
    var self = this;
    return through.obj(function (row, enc, next) {
        self.emit('dep', row);
        this.push(row);
        next();
    });
};
Browserify.prototype._debug = function (opts) {
    var basedir = defined(opts.basedir, process.cwd());
    return through.obj(function (row, enc, next) {
        if (opts.debug) {
            row.sourceRoot = 'file://localhost';
            row.sourceFile = relativePath(basedir, row.file).replace(/\\/g, '/');
        }
        this.push(row);
        next();
    });
};
Browserify.prototype.reset = function (opts) {
    if (!opts)
        opts = {};
    var hadExports = this._bpack.hasExports;
    this.pipeline = this._createPipeline(xtend(opts));
    this._bpack.hasExports = hadExports;
    this._bundled = false;
    this.emit();
};
Browserify.prototype.bundle = function (cb) {
    var self = this;
    if (this._bundled) {
        var recorded = this._recorded;
        this.reset();
        recorded.forEach(function (x) {
            self.pipeline.write(x);
        });
    }
    var output = readonly(this.pipeline);
    if (cb) {
        output.on('error', cb);
        output.pipe(concat(function (body) {
            cb(null, body);
        }));
    }
    function ready() {
        self.emit('bundle', output);
        self.pipeline.end();
    }
    if (this._pending === 0)
        ready();
    else
        this.once('_ready', ready);
    this._bundled = true;
    return output;
};
function isStream(s) {
    return s && typeof s.pipe === 'function';
}
function isAbsolutePath(file) {
    var regexp = process.platform === 'win32' ? /^\w:/ : /^\//;
    return regexp.test(file);
}
function isExternalModule(file) {
    var regexp = process.platform === 'win32' ? /^(\.|\w:)/ : /^[\/.]/;
    return !regexp.test(file);
}