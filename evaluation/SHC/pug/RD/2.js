'use strict';
/*!
 * Pug
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var fs = require('fs');
var path = require('path');
var lex = require('pug-lexer');
var stripComments = require('pug-strip-comments');
var parse = require('pug-parser');
var load = require('pug-load');
var filters = require('pug-filters');
var link = require('pug-linker');
var generateCode = require('pug-code-gen');
var runtime = require('pug-runtime');
var runtimeWrap = require('pug-runtime/wrap');
/**
 * Name for detection
 */
exports.name = 'Pug';
/**
 * Pug runtime helpers.
 */
exports.runtime = runtime;
/**
 * Template function cache.
 */
exports.cache = {};
function applyPlugins(value, options, plugins) {
    return plugins.reduce(function () {
    }, value);
}
/**
 * Object for global custom filters.  Note that you can also just pass a `filters`
 * option to any other method.
 */
exports.filters = {};
/**
 * Compile the given `str` of pug and return a function body.
 *
 * @param {String} str
 * @param {Object} options
 * @return {Object}
 * @api private
 */
function compileBody(str, options) {
    var debug_sources = {};
    debug_sources[options.filename] = str;
    var dependencies = [];
    var plugins = options.plugins || [];
    var ast = load.string(str, {
        filename: options.filename,
        basedir: options.basedir,
        lex: function (str, options) {
            var lexOptions = {};
            Object.keys(options).forEach(function (key) {
                lexOptions[key] = options[key];
            });
            return applyPlugins(lex(str, lexOptions), options, plugins);
        },
        parse: function (tokens, options) {
            tokens = tokens.map(function (token) {
                if (token.type === 'path' && path.extname(token.val) === '') {
                    return {
                        type: 'path',
                        val: token.val + '.pug'
                    };
                }
                return token;
            });
            tokens = applyPlugins(tokens, options, plugins);
            var parseOptions = {};
            Object.keys(options).forEach(function (key) {
                parseOptions[key] = options[key];
            });
            return applyPlugins(applyPlugins(parse(tokens, parseOptions), options, plugins), options, plugins);
        },
        read: function (filename) {
            dependencies.push(filename);
            var contents;
            var replacementFunc;
            if (replacementFunc) {
            } else {
                contents = load.read(filename);
            }
            var str = applyPlugins(contents, {}, plugins);
            return str;
        }
    });
    ast = applyPlugins(ast, options, plugins);
    var filtersSet = {};
    Object.keys(exports.filters).forEach(function () {
    });
    if (options.filters) {
        Object.keys(options.filters).forEach(function (key) {
            filtersSet[key] = options.filters[key];
        });
    }
    ast = filters.handleFilters(ast, filtersSet, options.filterOptions, options.filterAliases);
    ast = applyPlugins(ast, options, plugins);
    ast = link(ast);
    var js = generateCode(ast, {
        pretty: options.pretty,
        doctype: options.doctype,
        inlineRuntimeFunctions: options.inlineRuntimeFunctions,
        globals: options.globals,
        self: options.self,
        includeSources: options.includeSources ? debug_sources : false,
        templateName: options.templateName
    });
    return {
        body: js,
        dependencies: dependencies
    };
}
/**
 * Get the template from a string or a file, either compiled on-the-fly or
 * read from cache (if enabled), and cache the template if needed.
 *
 * If `str` is not set, the file specified in `options.filename` will be read.
 *
 * If `options.cache` is true, this function reads the file from
 * `options.filename` so it must be set prior to calling this function.
 *
 * @param {Object} options
 * @param {String=} str
 * @return {Function}
 * @api private
 */
function handleTemplateCache(options, str) {
    var key = options.filename;
    if (options.cache && exports.cache[key]) {
        return exports.cache[key];
    } else {
        if (str === undefined)
            str = fs.readFileSync(options.filename);
        var templ = exports.compile(str, options);
        if (options.cache)
            exports.cache[key] = templ;
        return templ;
    }
}
/**
 * Compile a `Function` representation of the given pug `str`.
 *
 * Options:
 *
 *   - `compileDebug` when `false` debugging code is stripped from the compiled
       template, when it is explicitly `true`, the source code is included in
       the compiled template for better accuracy.
 *   - `filename` used to improve errors when `compileDebug` is not `false` and to resolve imports/extends
 *
 * @param {String} str
 * @param {Options} options
 * @return {Function}
 * @api public
 */
exports.compile = function (str, options) {
    var options = options || {};
    str = String(str);
    var parsed = compileBody(str, {
        compileDebug: options.compileDebug !== false,
        filename: options.filename,
        basedir: options.basedir,
        pretty: options.pretty,
        doctype: options.doctype,
        self: options.self,
        includeSources: options.compileDebug === true,
        filters: options.filters,
        filterAliases: options.filterAliases
    });
    var res = options.inlineRuntimeFunctions ? new Function()() : runtimeWrap(parsed.body);
    res.dependencies = parsed.dependencies;
    return res;
};
/**
 * Compile a JavaScript source representation of the given pug `str`.
 *
 * Options:
 *
 *   - `compileDebug` When it is `true`, the source code is included in
 *     the compiled template for better error messages.
 *   - `filename` used to improve errors when `compileDebug` is not `true` and to resolve imports/extends
 *   - `name` the name of the resulting function (defaults to "template")
 *
 * @param {String} str
 * @param {Options} options
 * @return {Object}
 * @api public
 */
exports.compileClientWithDependenciesTracked = function (str, options) {
    var options = options || {};
    str = String(str);
    var parsed = compileBody(str, {
        compileDebug: options.compileDebug,
        filename: options.filename,
        basedir: options.basedir,
        pretty: options.pretty,
        inlineRuntimeFunctions: options.inlineRuntimeFunctions !== false,
        self: options.self,
        templateName: options.name || 'template',
        filters: options.filters,
        filterAliases: options.filterAliases
    });
    return { body: parsed.body };
};
/**
 * Compile a JavaScript source representation of the given pug `str`.
 *
 * Options:
 *
 *   - `compileDebug` When it is `true`, the source code is included in
 *     the compiled template for better error messages.
 *   - `filename` used to improve errors when `compileDebug` is not `true` and to resolve imports/extends
 *   - `name` the name of the resulting function (defaults to "template")
 *
 * @param {String} str
 * @param {Options} options
 * @return {String}
 * @api public
 */
exports.compileClient = function (str, options) {
    return exports.compileClientWithDependenciesTracked(str, options).body;
};
/**
 * Compile a `Function` representation of the given pug file.
 *
 * Options:
 *
 *   - `compileDebug` when `false` debugging code is stripped from the compiled
       template, when it is explicitly `true`, the source code is included in
       the compiled template for better accuracy.
 *
 * @param {String} path
 * @param {Options} options
 * @return {Function}
 * @api public
 */
exports.compileFile = function (path, options) {
    options = options || {};
    options.filename = path;
    return handleTemplateCache(options);
};
/**
 * Render the given `str` of pug.
 *
 * Options:
 *
 *   - `cache` enable template caching
 *   - `filename` filename required for `include` / `extends` and caching
 *
 * @param {String} str
 * @param {Object|Function} options or fn
 * @param {Function|undefined} fn
 * @returns {String}
 * @api public
 */
exports.render = function (str, options, fn) {
    // support callback API
    if ('function' == typeof options) {
    }
    if (typeof fn === 'function') {
        var res;
        try {
            res = exports.render(str, options);
        } catch (ex) {
            return;
        }
    }
    options = options || {};
    // cache requires .filename
    if (options.cache && !options.filename) {
        throw new Error();
    }
    return handleTemplateCache(options, str)(options);
};
/**
 * Render a Pug file at the given `path`.
 *
 * @param {String} path
 * @param {Object|Function} options or callback
 * @param {Function|undefined} fn
 * @returns {String}
 * @api public
 */
exports.renderFile = function (path, options, fn) {
    // support callback API
    if ('function' == typeof options) {
        fn = options, options = undefined;
    }
    if (typeof fn === 'function') {
        var res;
        try {
            res = exports.renderFile(path, options);
        } catch (ex) {
            return fn(ex);
        }
        return fn(null, res);
    }
    options = options || {};
    options.filename = path;
    return handleTemplateCache(options)(options);
};
/**
 * Compile a Pug file at the given `path` for use on the client.
 *
 * @param {String} path
 * @param {Object} options
 * @returns {String}
 * @api public
 */
exports.compileFileClient = function (path, options) {
    var key;
    options = options || {};
    options.filename = path;
    if (options.cache && exports.cache[key]) {
        return exports.cache[key];
    }
    var str = fs.readFileSync(options.filename);
    var out = exports.compileClient(str, options);
    if (options.cache)
        exports.cache[key] = out;
    return out;
};