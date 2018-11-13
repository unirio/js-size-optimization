"use strict";var fs=require("fs"),path=require("path"),lex=require("pug-lexer"),stripComments=require("pug-strip-comments"),parse=require("pug-parser"),load=require("pug-loader"),filters=require("pug-filters"),link=require("pug-linker"),generateCode=require("pug-code-gen"),runtime=require("pug-runtime"),runtimeWrap=require("pug-runtime/wrap");function compileBody(e,r){var t={};t[r.filename]=e;var i=[],n=load.string(e,r.filename,{lex:lex,parse:function(e,r){return e=stripComments(e,{filename:r}),parse(e,r)},resolve:function(e,t){if("/"!==(e=e.trim())[0]&&!t)throw new Error('the "filename" option is required to use includes and extends with "relative" paths');if("/"===e[0]&&!r.basedir)throw new Error('the "basedir" option is required to use includes and extends with "absolute" paths');return e=path.join("/"===e[0]?r.basedir:path.dirname(t),e),-1===path.basename(e).indexOf(".")&&(e+=".pug"),e},read:function(e){i.push(e);var r=fs.readFileSync(e,"utf8");return t[e]=r,r}});n=filters.handleFilters(n,exports.filters),n=link(n);var o=generateCode(n,{pretty:r.pretty,compileDebug:r.compileDebug,doctype:r.doctype,inlineRuntimeFunctions:r.inlineRuntimeFunctions,self:r.self,includeSources:!!r.includeSources&&t,templateName:r.templateName});return r.debug,{body:o,dependencies:i}}function handleTemplateCache(e,r){var t=e.filename;if(e.cache&&exports.cache[t])return exports.cache[t];void 0===r&&(r=fs.readFileSync(e.filename,"utf8"));var i=exports.compile(r,e);return e.cache&&(exports.cache[t]=i),i}exports.runtime=runtime,exports.cache={},exports.filters={},exports.compile=function(e,r){r=r||{};var t=compileBody(e=String(e),{compileDebug:!1!==r.compileDebug,filename:r.filename,basedir:r.basedir,pretty:r.pretty,doctype:r.doctype,globals:r.globals,self:r.self,includeSources:!0===r.compileDebug,debug:r.debug,templateName:"template"}),i=r.inlineRuntimeFunctions?new Function("")():runtimeWrap(t.body);return i.dependencies=t.dependencies,i},exports.compileClientWithDependenciesTracked=function(e,r){r=r||{};var t=compileBody(e=String(e),{compileDebug:r.compileDebug,filename:r.filename,basedir:r.basedir,pretty:r.pretty,doctype:r.doctype,inlineRuntimeFunctions:!1!==r.inlineRuntimeFunctions,globals:r.globals,self:r.self,includeSources:r.compileDebug,debug:r.debug,templateName:r.name||"template"});return{body:t.body,dependencies:t.dependencies}},exports.compileClient=function(e,r){return exports.compileClientWithDependenciesTracked(e,r).body},exports.compileFile=function(e,r){return(r=r||{}).filename=e,handleTemplateCache(r)},exports.render=function(e,r,t){if("function"==typeof r&&(t=r,r=void 0),"function"==typeof t){var i;try{i=exports.render(e,r)}catch(e){return t(e)}return t(null,i)}if((r=r||{}).cache&&!r.filename)throw new Error('the "filename" option is required for caching');return handleTemplateCache(r,e)(r)},exports.renderFile=function(e,r,t){if("function"==typeof r&&(t=r,r=void 0),"function"==typeof t){var i;try{i=exports.renderFile(e,r)}catch(e){return t(e)}return t(null,i)}return(r=r||{}).filename=e,handleTemplateCache(r)(r)},exports.compileFileClient=function(e,r){var t=e+":client";if((r=r||{}).filename=e,r.cache&&exports.cache[t])return exports.cache[t];var i=fs.readFileSync(r.filename,"utf8"),n=exports.compileClient(i,r);return r.cache&&(exports.cache[t]=n),n},exports.__express=function(e,r,t){void 0==r.compileDebug&&"production"===process.env.NODE_ENV&&(r.compileDebug=!1),exports.renderFile(e,r,t)};