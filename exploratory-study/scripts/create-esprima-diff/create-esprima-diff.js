/*
 * Calculates the JSON DIFF between the program variant produced by an optimization
 * round and the original program. Saves the diff in the ESPRIMA-DIFF directory.
 */

var fs = require('fs');
var esprima = require('esprima');

var libs_inicial = 
[
	'exectimer', 
	'jade', 
	'jquery', 
	'lodash', 
	'minimist', 
	'node-browserify', 
	'plivo-node', 
	'tleaf', 
	'underscore', 
	'uuid', 
	'xml2js'
];

var libs = libs_inicial;
var rounds = 60;

function handleFile(item, index) {
	var baseDir = item;
	var targetDir = baseDir + "\\esprima-diff";

	if (!fs.existsSync(targetDir)) {
		fs.mkdirSync(targetDir);
	}

	var contents = fs.readFileSync(baseDir + "\\RD\\original.js", "utf8");
	var jsonOriginal = esprima.parse(contents, {loc:true});
	filter(jsonOriginal, "loc");
	
	for (var i = 0; i < rounds; i++) {
		console.log(item + "-" + i + " ...");	

		var variant = fs.readFileSync(baseDir + "\\RD\\" + i + ".js", "utf8");
		var jsonVariant = esprima.parse(variant, {loc:true});
		filter(jsonVariant, "loc");
		
		var jsonDiff = diff(jsonOriginal, jsonVariant)
		fs.writeFileSync(targetDir + "\\ediff-" + i + ".json", JSON.stringify(jsonDiff, null, '\t'), 'utf8');
	}
}

function diff(original, variant) {
	if (!variant)
		return original;
	
    var result = {};
	
	if (!original)
		return result;
		
	for (var key in original) {
		if (typeof original[key] == 'object') { 

			if (variant[key] && typeof variant[key] == 'object') {
				var obj = diff(original[key], variant[key]);
				
				if (obj && Object.keys(obj).length > 0) {
					result[key] = obj;
				}
			}
			else {
				var obj = original[key];
				
				if (obj && Object.keys(obj).length > 0) {
					result[key] = obj;
				}
			}
		}
		else {
			if (variant[key] && variant[key] != original[key]) {
				result[key] = original[key];
			}
		}
    }
    
	return result;
}

function filter(original, name) {
	if (original) {
		if (typeof original == 'object') { 
			delete original[name]; 
			
			for (var key in original)
				filter(original[key], name);
		}
		else if (typeof original == 'array') { 
			delete original[name]; 
			
			for (var i = 0; i < original.length; i++)
				filter(original[i], name);
		}
	}
}

libs.forEach(handleFile);
