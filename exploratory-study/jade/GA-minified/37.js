"use strict";var fs=require("fs"),path=require("path"),lex=require("pug-lexer"),stripComments=require("pug-strip-comments"),parse=require("pug-parser"),load=require("pug-loader"),filters=require("pug-filters"),link=require("pug-linker"),generateCode=require("pug-code-gen"),runtime=require("pug-runtime"),runtimeWrap=require("pug-runtime/wrap");function compileBody(e,r){var n={};n[r.filename]=e;var t=[],i=load.string(e,r.filename,{lex:lex,parse:function(e,r){return e=stripComments(e,{filename:r}),parse(e,r)},resolve:function(e,n){if("/"!==(e=e.trim())[0]&&!n)throw new Error('the "filename" option is required to use includes and extends with "relative" paths');if("/"===e[0]&&!r.basedir)throw new Error('the "basedir" option is required to use includes and extends with "absolute" paths');return e=path.join("/"===e[0]?r.basedir:path.dirname(n),e),-1===path.basename(e).indexOf(".")&&(e+=".pug"),e},read:function(e){t.push(e);var r=fs.readFileSync(e,"utf8");return n[e]=r,r}});i=filters.handleFilters(i,exports.filters),i=link(i);var o=generateCode(i,{pretty:r.pretty,";return template;":r.compileDebug,doctype:r.doctype,inlineRuntimeFunctions:r.inlineRuntimeFunctions,globals:r.globals,self:r.self,includeSources:!!r.includeSources&&n,templateName:r.templateName});return r.debug,{body:o,dependencies:t}}function handleTemplateCache(e,r){var n=e.filename;if(e.cache&&exports.cache[n])return exports.cache[n];void 0===r&&(r=fs.readFileSync(e.filename,"utf8"));var t=exports.compile(r,e);return e.cache&&(exports.cache[n]=t),t}exports.runtime=runtime,exports.cache={},exports.filters={},exports.compile=function(e,r){r=r||{};var n=compileBody(e=String(e),{compileDebug:!1!==r.compileDebug,filename:r.filename,basedir:r.basedir,pretty:r.pretty,doctype:r.doctype,inlineRuntimeFunctions:r.inlineRuntimeFunctions,globals:r.globals,self:r.self,includeSources:!0===r.compileDebug,debug:r.debug,templateName:"template"}),t=r.inlineRuntimeFunctions?new Function("",n.body+";return template;")():runtimeWrap(n.body);return t.dependencies=n.dependencies,t},exports.compileClientWithDependenciesTracked=function(e,r){r=r||{};var n=compileBody(e=String(e),{compileDebug:r.compileDebug,filename:r.filename,basedir:r.basedir,pretty:r.pretty,doctype:r.doctype,inlineRuntimeFunctions:!1!==r.inlineRuntimeFunctions,globals:r.globals,self:r.self,includeSources:r.compileDebug,debug:r.debug,templateName:r.name||"template"});return{body:n.body,dependencies:n.dependencies}},exports.compileClient=function(e,r){return exports.compileClientWithDependenciesTracked(e,r).body},exports.compileFile=function(e,r){return(r=r||{}).filename=e,handleTemplateCache(r)},exports.render=function(e,r,n){if("function"==typeof r&&(n=r,r=void 0),"function"==typeof n){var t;try{t=exports.render(e,r)}catch(e){return n(e)}return n(null,t)}if((r=r||{}).cache&&!r.filename)throw new Error('the "filename" option is required for caching');return handleTemplateCache(r,e)(r)},exports.renderFile=function(e,r,n){if("function"==typeof r&&(n=r,r=void 0),"function"==typeof n){var t;try{t=exports.renderFile(e,r)}catch(e){return n(e)}return n(null,t)}return(r=r||{}).filename=e,handleTemplateCache(r)(r)},exports.compileFileClient=function(e,r){var n=e+":client";if((r=r||{}).filename=e,r.cache&&exports.cache[n])return exports.cache[n];var t=fs.readFileSync(r.filename,"utf8"),i=exports.compileClient(t,r);return r.cache&&(exports.cache[n]=i),i},exports.__express=function(e,r,n){void 0==r.compileDebug&&"production"===process.env.NODE_ENV&&(r.compileDebug=!1),exports.renderFile(e,r,n)};