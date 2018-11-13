"use strict";var esprima=require("esprima"),estraverse=require("estraverse"),escope=require("escope"),_=require("lodash"),config=require("./config"),UserError=require("./error/UserError");function parse(e){var r;try{r=esprima.parse(e)}catch(e){throw new UserError("Source file is not valid.",e)}var t=escope.analyze(r),n=t.acquire(r),i=[];estraverse.traverse(r,{enter:function(e){if("CallExpression"===e.type){var r=_.get(e,"callee.property",{});_.contains(config.units.process,r.name)&&i.push({node:e,scope:n})}/Function/.test(e.type)&&(n=t.acquire(e))},leave:function(e){/Function/.test(e.type)&&(n=n.upper)}});var a=[];return _.forEach(i,function(e){var r=findName(e.node,e.scope);if(!_.isUndefined(r)){var t=findType(e.node,e.scope);if(!_.isUndefined(t)){var n=findModule(e.node,e.scope);if(!_.isUndefined(n.name)){var i=findDeps(e.node,e.scope,t);if(_.findWhere(i,{name:r}))throw new UserError("Circular dependency for "+t+' "'+r+'".');var o={name:r,type:t,module:n,deps:i};a.unshift(o)}}}}),a}function findName(e){var r,t=_.get(e,"arguments[0]",{});return"Literal"===t.type&&(r=t.value),r}function findType(e){return _.get(e,"callee.property.name")}function findModule(e,r){var t={},n=_.get(e,"callee.object",{});if("CallExpression"===n.type)return findModule(n,r);if("Identifier"===n.type)if("module"===calleeProp.name&&"angular"===n.name)t.name=_.get(e,"arguments[0].value");else if(_.contains(config.units.process,calleeProp.name)){var i=findVariable(n.name,r);i&&(t.name=_.get(i,"init.arguments[0].value"))}return t}function findDeps(e,r,t){if(_.contains(["filter","value","constant"],t))return[];var n=_.get(e,"arguments[1]",{});if("component"===t)return findComponentDeps(n,r);if("ArrayExpression"===n.type){var i=_.last(n.elements)||{};if("FunctionExpression"===i.type)return extractDeps(i.params)}return"Identifier"===n.type?extractVariableDeps(n.name,r):"FunctionExpression"===n.type?"provider"!==t?extractDeps(n.params):findProviderDeps(n):[]}function findComponentDeps(e,r){return"Identifier"===e.type&&(e=_.get(findVariable(e.name,r),"init",{})),"ObjectExpression"!==e.type?[]:extractObjectPropertyDeps(e,"controller",r)}function findProviderDeps(e){var r=_.get(e,"body",{});if("BlockStatement"!==r.type)return[];var t=findScope(e),n=[],i=_.get(r,"body");return _.some(i,function(e){var r=_.get(e,"type"),i=_.get(e,"expression",{}),a=_.get(i,"left.property",{}),o=_.get(i,"right",{});if("ExpressionStatement"===r&&"$get"===a.name){if("FunctionExpression"===o.type)return n=extractDeps(o.params),!0;if("Identifier"===o.type)return n=extractVariableDeps(o.name,t),!0}var s=_.get(e,"argument",{});if("ReturnStatement"===r){if("ObjectExpression"===s.type)return n=extractObjectPropertyDeps(s,"$get",t),!0;if("Identifier"===s.type){var p=findVariable(s.name,t);if(p&&"ObjectExpression"===_.get(p,"init.type"))return n=extractObjectPropertyDeps(p.init,"$get",t),!0}}}),n}function extractDeps(e){if(!_.isArray(e))return[];var r=[];return _.forEach(e,function(e){if("Identifier"===e.type){var t={name:e.name};r.push(t)}}),r}function findVariable(e,r){for(var t,n=r;!t&&n;)t=_.findWhere(n.variables,{name:e}),n=n.upper;return _.isUndefined(t)?t:_.get(t,"defs[0].node")}function extractVariableDeps(e,r){var t=findVariable(e,r);if(!t)return[];var n=[],i=_.get(t,"type");return"FunctionDeclaration"===i&&(n=_.get(t,"params",[])),"VariableDeclarator"===i&&(n=_.get(t,"init.params",[])),extractDeps(n)}function extractObjectPropertyDeps(e,r,t){var n=_.find(e.properties,function(e){return _.get(e,"key.name")===r});if(!n)return[];var i=_.get(n,"value",{}),a=[];return"FunctionExpression"===i.type&&(a=extractDeps(i.params)),"Identifier"===i.type&&(a=extractVariableDeps(i.name,t)),a}function findScope(e){return escope.analyze(e).acquire(e)}module.exports=parse;