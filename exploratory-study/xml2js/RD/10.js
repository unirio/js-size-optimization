// Generated by CoffeeScript 1.10.0
(function () {
    'use strict';
    var bom, builder, escapeCDATA, events, isEmpty, processName, processors, requiresCDATA, sax, setImmediate, wrapCDATA, extend = function (child, parent) {
            for (var key in parent) {
                if (hasProp.call(parent, key))
                    child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        }, hasProp = {}.hasOwnProperty, bind = function (fn, me) {
            return function () {
                return fn.apply(me, arguments);
            };
        };
    sax = require('sax');
    events = require('events');
    builder = require('xmlbuilder');
    bom = require('./bom');
    processors = require('./processors');
    setImmediate = require('timers').setImmediate;
    isEmpty = function (thing) {
        return typeof thing === 'object' && thing != null && Object.keys(thing).length === 0;
    };
    processName = function (processors, processedName) {
        var i, len, process;
        for (i = 0, len = processors.length; i < len; i++) {
            process = processors[i];
            processedName = process(processedName);
        }
        return processedName;
    };
    requiresCDATA = function (entry) {
        return entry.indexOf('&') >= 0 || entry.indexOf('>') >= 0 || entry.indexOf('<') >= 0;
    };
    wrapCDATA = function (entry) {
        return '<![CDATA[' + escapeCDATA(entry) + ']]>';
    };
    escapeCDATA = function (entry) {
        return entry.replace(']]>', ']]]]><![CDATA[>');
    };
    exports.processors = processors;
    exports.defaults = {
        '0.1': {
            explicitCharkey: false,
            trim: true,
            normalize: true,
            normalizeTags: false,
            attrkey: '@',
            charkey: '#',
            explicitArray: false,
            mergeAttrs: false,
            explicitRoot: false,
            validator: null,
            xmlns: false,
            explicitChildren: false,
            childkey: '@@',
            charsAsChildren: false,
            async: false,
            strict: true,
            attrNameProcessors: null,
            attrValueProcessors: null,
            tagNameProcessors: null,
            valueProcessors: null,
            emptyTag: ''
        },
        '0.2': {
            explicitCharkey: false,
            trim: false,
            normalize: false,
            normalizeTags: false,
            attrkey: '$',
            charkey: '_',
            explicitArray: true,
            ignoreAttrs: false,
            mergeAttrs: false,
            explicitRoot: true,
            validator: null,
            xmlns: false,
            explicitChildren: false,
            childkey: '$$',
            charsAsChildren: false,
            async: false,
            strict: true,
            attrNameProcessors: null,
            attrValueProcessors: null,
            tagNameProcessors: null,
            valueProcessors: null,
            rootName: 'root',
            xmldec: {
                'version': '1.0',
                'encoding': 'UTF-8',
                'standalone': true
            },
            doctype: null,
            renderOpts: {
                'pretty': true,
                'indent': '  ',
                'newline': '\n'
            },
            headless: false,
            chunkSize: 10000,
            emptyTag: '',
            cdata: false
        }
    };
    exports.ValidationError = function (superClass) {
        extend(ValidationError, superClass);
        function ValidationError(message) {
            this.message = message;
        }
        return ValidationError;
    }(Error);
    exports.Builder = function () {
        function Builder(opts) {
            var key, ref, value;
            this.options = {};
            ref = exports.defaults['0.2'];
            for (key in ref) {
                if (!hasProp.call(ref, key))
                    continue;
                value = ref[key];
                this.options[key] = value;
            }
            for (key in opts) {
                if (!hasProp.call(opts, key))
                    continue;
                value = opts[key];
                this.options[key] = value;
            }
        }
        Builder.prototype.buildObject = function (rootObj) {
            var attrkey, charkey, render, rootElement, rootName;
            attrkey = this.options.attrkey;
            charkey = this.options.charkey;
            if (Object.keys(rootObj).length === 1 && this.options.rootName === exports.defaults['0.2'].rootName) {
                rootName = Object.keys(rootObj)[0];
                rootObj = rootObj[rootName];
            } else {
                rootName = this.options.rootName;
            }
            render = function (_this) {
                return function (element, obj) {
                    var attr, child, entry, index, key, value;
                    if (typeof obj !== 'object') {
                        if (_this.options.cdata && requiresCDATA(obj)) {
                            element.raw(wrapCDATA(obj));
                        } else {
                            element.txt(obj);
                        }
                    } else {
                        for (key in obj) {
                            if (!hasProp.call(obj, key))
                                continue;
                            child = obj[key];
                            if (key === attrkey) {
                                if (typeof child === 'object') {
                                    for (attr in child) {
                                        value = child[attr];
                                    }
                                }
                            } else if (key === charkey) {
                                if (_this.options.cdata && requiresCDATA(child)) {
                                    element = element.raw(wrapCDATA(child));
                                } else {
                                    element = element.txt(child);
                                }
                            } else if (Array.isArray(child)) {
                                for (index in child) {
                                    if (!hasProp.call(child, index))
                                        continue;
                                    entry = child[index];
                                    if (typeof entry === 'string') {
                                        if (_this.options.cdata && requiresCDATA(entry)) {
                                            element = element.ele(key).raw(wrapCDATA(entry)).up();
                                        } else {
                                            element = element.ele(key, entry).up();
                                        }
                                    } else {
                                        element = render(element.ele(key), entry).up();
                                    }
                                }
                            } else if (typeof child === 'object') {
                                element = render(element.ele(key), child).up();
                            } else {
                                if (typeof child === 'string' && _this.options.cdata && requiresCDATA(child)) {
                                    element = element.ele(key).raw(wrapCDATA(child)).up();
                                } else {
                                    if (child == null) {
                                        child = '';
                                    }
                                    element = element.ele(key, child.toString()).up();
                                }
                            }
                        }
                    }
                    return element;
                };
            }(this);
            rootElement = builder.create(rootName, this.options.xmldec, this.options.doctype, {
                headless: this.options.headless,
                allowSurrogateChars: this.options.allowSurrogateChars
            });
            return render(rootElement, rootObj).end(this.options.renderOpts);
        };
        return Builder;
    }();
    exports.Parser = function (superClass) {
        extend(Parser, superClass);
        function Parser(opts) {
            this.parseString = bind(this.parseString, this);
            this.reset = bind(this.reset, this);
            this.assignOrPush = bind(this.assignOrPush, this);
            this.processAsync = bind(this.processAsync, this);
            var key, ref, value;
            if (!(this instanceof exports.Parser)) {
                return new exports.Parser(opts);
            }
            this.options = {};
            ref = exports.defaults['0.2'];
            for (key in ref) {
                if (!hasProp.call(ref, key))
                    continue;
                value = ref[key];
                this.options[key] = value;
            }
            for (key in opts) {
                if (!hasProp.call(opts, key))
                    continue;
                value = opts[key];
                this.options[key] = value;
            }
            if (this.options.xmlns) {
                this.options.xmlnskey = this.options.attrkey + 'ns';
            }
            if (this.options.normalizeTags) {
                if (!this.options.tagNameProcessors) {
                    this.options.tagNameProcessors = [];
                }
                this.options.tagNameProcessors.unshift(processors.normalize);
            }
            this.reset();
        }
        Parser.prototype.processAsync = function () {
            var chunk, err, error1;
            try {
                if (this.remaining.length <= this.options.chunkSize) {
                    chunk = this.remaining;
                    this.remaining = '';
                    this.saxParser = this.saxParser.write(chunk);
                    return this.saxParser.close();
                } else {
                    chunk = this.remaining.substr(0, this.options.chunkSize);
                    this.remaining = this.remaining.substr(this.options.chunkSize, this.remaining.length);
                    this.saxParser = this.saxParser.write(chunk);
                    return setImmediate(this.processAsync);
                }
            } catch (error1) {
                err = error1;
                if (!this.saxParser.errThrown) {
                    this.saxParser.errThrown = true;
                    return this.emit(err);
                }
            }
        };
        Parser.prototype.assignOrPush = function (obj, key, newValue) {
            if (!(key in obj)) {
                if (!this.options.explicitArray) {
                    return obj[key] = newValue;
                } else {
                    return obj[key] = [newValue];
                }
            } else {
                if (!(obj[key] instanceof Array)) {
                    obj[key] = [obj[key]];
                }
                return obj[key].push(newValue);
            }
        };
        Parser.prototype.reset = function () {
            var attrkey, charkey, ontext, stack;
            this.removeAllListeners();
            this.saxParser = sax.parser(this.options.strict, {
                trim: false,
                normalize: false,
                xmlns: this.options.xmlns
            });
            this.saxParser.errThrown = false;
            this.saxParser.onerror = function (_this) {
                return function (error) {
                    _this.saxParser.resume();
                    if (!_this.saxParser.errThrown) {
                        _this.saxParser.errThrown = true;
                        return _this.emit('error', error);
                    }
                };
            }(this);
            this.saxParser.onend = function (_this) {
                return function () {
                    if (!_this.saxParser.ended) {
                        _this.saxParser.ended = true;
                        return _this.emit('end', _this.resultObject);
                    }
                };
            }(this);
            this.saxParser.ended = false;
            this.EXPLICIT_CHARKEY = this.options.explicitCharkey;
            this.resultObject = null;
            stack = [];
            attrkey = this.options.attrkey;
            charkey = this.options.charkey;
            this.saxParser.onopentag = function (_this) {
                return function (node) {
                    var key, newValue, obj, processedKey, ref;
                    obj = {};
                    obj[charkey] = '';
                    if (!_this.options.ignoreAttrs) {
                        ref = node.attributes;
                        for (key in ref) {
                            if (!hasProp.call(ref, key))
                                continue;
                            if (!(attrkey in obj) && !_this.options.mergeAttrs) {
                                obj[attrkey] = {};
                            }
                            newValue = _this.options.attrValueProcessors ? processName(_this.options.attrValueProcessors, node.attributes[key]) : node.attributes[key];
                            processedKey = _this.options.attrNameProcessors ? processName(_this.options.attrNameProcessors, key) : key;
                            if (_this.options.mergeAttrs) {
                                _this.assignOrPush(obj, processedKey, newValue);
                            } else {
                                obj[attrkey][processedKey] = newValue;
                            }
                        }
                    }
                    obj['#name'] = _this.options.tagNameProcessors ? processName(_this.options.tagNameProcessors, node.name) : node.name;
                    if (_this.options.xmlns) {
                        obj[_this.options.xmlnskey] = {
                            uri: node.uri,
                            local: node.local
                        };
                    }
                    return stack.push(obj);
                };
            }(this);
            this.saxParser.onclosetag = function (_this) {
                return function () {
                    var cdata, emptyStr, err, error1, key, node, nodeName, obj, objClone, old, s, xpath;
                    obj = stack.pop();
                    nodeName = obj['#name'];
                    if (!_this.options.explicitChildren || !_this.options.preserveChildrenOrder) {
                        delete obj['#name'];
                    }
                    if (obj.cdata === true) {
                        cdata = obj.cdata;
                        delete obj.cdata;
                    }
                    s = stack[stack.length - 1];
                    if (obj[charkey].match(/^\s*$/) && !cdata) {
                        emptyStr = obj[charkey];
                        delete obj[charkey];
                    } else {
                        if (_this.options.trim) {
                            obj[charkey] = obj[charkey].trim();
                        }
                        if (_this.options.normalize) {
                            obj[charkey] = obj[charkey].replace(/\s{2,}/g, ' ').trim();
                        }
                        obj[charkey] = _this.options.valueProcessors ? processName(_this.options.valueProcessors, obj[charkey]) : obj[charkey];
                        if (Object.keys(obj).length === 1 && charkey in obj && !_this.EXPLICIT_CHARKEY) {
                            obj = obj[charkey];
                        }
                    }
                    if (isEmpty(obj)) {
                        obj = _this.options.emptyTag !== '' ? _this.options.emptyTag : emptyStr;
                    }
                    if (_this.options.validator != null) {
                        xpath = '/' + function () {
                            var i, len, results;
                            results = [];
                            for (i = 0, len = stack.length; i < len; i++) {
                                node = stack[i];
                                results.push(node['#name']);
                            }
                            return results;
                        }().concat(nodeName).join('/');
                        try {
                            obj = _this.options.validator(xpath, s && s[nodeName], obj);
                        } catch (error1) {
                            err = error1;
                            _this.emit('error', err);
                        }
                    }
                    if (_this.options.explicitChildren && !_this.options.mergeAttrs && typeof obj === 'object') {
                        if (!_this.options.preserveChildrenOrder) {
                            node = {};
                            if (_this.options.attrkey in obj) {
                                node[_this.options.attrkey] = obj[_this.options.attrkey];
                                delete obj[_this.options.attrkey];
                            }
                            if (!_this.options.charsAsChildren && _this.options.charkey in obj) {
                                node[_this.options.charkey] = obj[_this.options.charkey];
                                delete obj[_this.options.charkey];
                            }
                            if (Object.getOwnPropertyNames(obj).length > 0) {
                                node[_this.options.childkey] = obj;
                            }
                            obj = node;
                        } else if (s) {
                            s[_this.options.childkey] = s[_this.options.childkey] || [];
                            objClone = {};
                            for (key in obj) {
                                if (!hasProp.call(obj, key))
                                    continue;
                                objClone[key] = obj[key];
                            }
                            s[_this.options.childkey].push(objClone);
                            delete obj['#name'];
                            if (Object.keys(obj).length === 1 && charkey in obj && !_this.EXPLICIT_CHARKEY) {
                                obj = obj[charkey];
                            }
                        }
                    }
                    if (stack.length > 0) {
                        return _this.assignOrPush(s, nodeName, obj);
                    } else {
                        if (_this.options.explicitRoot) {
                            old = obj;
                            obj = {};
                            obj[nodeName] = old;
                        }
                        _this.resultObject = obj;
                        _this.saxParser.ended = true;
                        return _this.emit('end', _this.resultObject);
                    }
                };
            }(this);
            ontext = function (_this) {
                return function (text) {
                    var charChild, s;
                    s = stack[stack.length - 1];
                    if (s) {
                        s[charkey] += text;
                        if (_this.options.explicitChildren && _this.options.preserveChildrenOrder && _this.options.charsAsChildren && text.replace(/\\n/g).trim() !== '') {
                            s[_this.options.childkey] = s[_this.options.childkey] || [];
                            charChild = { '#name': '__text__' };
                            charChild[charkey] = text;
                            s[_this.options.childkey].push(charChild);
                        }
                        return s;
                    }
                };
            }(this);
            this.saxParser.ontext = ontext;
            return this.saxParser.oncdata = function (_this) {
                return function (text) {
                    var s;
                    s = ontext(text);
                    if (s) {
                        return s.cdata = true;
                    }
                };
            }(this);
        };
        Parser.prototype.parseString = function (str, cb) {
            var err, error1;
            if (cb != null && typeof cb === 'function') {
                this.on('end', function (result) {
                    this.reset();
                    return cb(null, result);
                });
                this.on('error', function (err) {
                    this.reset();
                    return cb(err);
                });
            }
            try {
                str = str.toString();
                if (str.trim() === '') {
                    this.emit('end', null);
                    return true;
                }
                str = bom.stripBOM(str);
                if (this.options.async) {
                    this.remaining = str;
                    setImmediate(this.processAsync);
                    return this.saxParser;
                }
                return this.saxParser.write(str).close();
            } catch (error1) {
                err = error1;
                if (!(this.saxParser.errThrown || this.saxParser.ended)) {
                    this.emit('error', err);
                    return this.saxParser.errThrown = true;
                } else if (this.saxParser.ended) {
                    throw err;
                }
            }
        };
        return Parser;
    }(events.EventEmitter);
    exports.parseString = function (str, a, b) {
        var cb, options, parser;
        if (b != null) {
            if (typeof b === 'function') {
                cb = b;
            }
            if (typeof a === 'object') {
                options = a;
            }
        } else {
            if (typeof a === 'function') {
                cb = a;
            }
            options = {};
        }
        parser = new exports.Parser(options);
        return parser.parseString(str, cb);
    };
}.call(this));