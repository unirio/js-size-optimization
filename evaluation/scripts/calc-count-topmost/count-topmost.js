/*
 * Calculates the JSON DIFF between the program variant produced by an optimization
 * round and the original program. Saves the diff in the ESPRIMA-DIFF directory.
 */

var fs = require('fs');
var esprima = require('esprima');

var libs = 
[
	'browserify', 
	'd3-node', 
	'decimal.js', 
	'esprima', 
	'exectimer', 
	'express', 
	'jquery', 
	'lodash', 
	'mathjs', 
	'minimist', 
	'moment', 
	'node-semver', 
	'plivo-node', 
	'pug', 
	'tleaf', 
	'UglifyJS2', 
	'underscore',
	'uuid',
	'xml2js' 
];

var rounds = 1;
var counter = {};

/*
 * Processes one file
 */
function handleFile(item, index) {
	var baseDir = "DFAHC\\" + item;
	var contentsOriginal = fs.readFileSync(baseDir + "\\HC\\original.js", "utf8");
	
	for (var i = 0; i < rounds; i++) {
		console.log(item + "-" + i + " ...");
		var contentsVariant = fs.readFileSync(baseDir + "\\HC\\" + i + ".js", "utf8");
		
		var jsonDiff = calculateEsprimaDiff(contentsOriginal, contentsVariant);
//		fs.writeFileSync(baseDir + "\\ediff-" + i + ".json", JSON.stringify(jsonDiff, null, '\t'), 'utf8');

		var jsonTopmost = findTopmost(jsonDiff);
//		fs.writeFileSync(baseDir + "\\topmost-" + i + ".json", JSON.stringify(jsonTopmost), 'utf8');

		countTopmost(jsonTopmost);
	}
}

/*
 * Calculates the Esprima DIFF between two source code files
 */
function calculateEsprimaDiff(contentsOriginal, contentsVariant) {
	var jsonOriginal = esprima.parse(contentsOriginal, {loc:true});
	filter(jsonOriginal, "loc");

	var jsonVariant = esprima.parse(contentsVariant, {loc:true});
	filter(jsonVariant, "loc");
	
	return diff(jsonOriginal, jsonVariant)
}

/*
 * Calculates a diff between two JSON trees
 */
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

/*
 * Removes a field from all objects
 */
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

/*
 * Finds the topmost node types in an Esprima DIFF
 */
function findTopmost(diff) {
	var results = [];
	
	if (typeof diff == 'object') { 
		if (diff["type"]) {
			results.push(diff["type"]);
			return results;
		}
		
		for (var key in diff) {
			var r = findTopmost(diff[key]);
			
			for (var i = 0; i < r.length; i++)
				results.push(r[i]);
		}
	}
	
	return results;
}

/*
 * Counts the topmost node types
 */
function countTopmost(jsonTopmost) {
	for (var j = 0; j < jsonTopmost.length; j++) {
		var key = jsonTopmost[j];
		
		if (counter[key] == null) {
			// console.log(key);
			counter[key] = 1;
		}
		else {
			// console.log(key);
			counter[key] = counter[key] + 1;
		}
	}
}

/*
 * Writes the topmost count file
 */
function writeTopmostFile() {
	var result = "";

	for (var key in counter) {
		result += key + "\t" + counter[key] + "\n";
	}

	fs.writeFileSync("results/topmost-count-dfahc.csv", result, 'utf8');
}
 
/*
 * Main program
 */
libs.forEach(handleFile);
writeTopmostFile();
