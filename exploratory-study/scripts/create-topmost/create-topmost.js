/*
 * Loads the ESPRIMA DIFF files and selects the topmost node types for
 * a program variant produced by an optimization round. The topmost
 * node types are saved in the TOPMOST directory.
 */
var fs = require('fs');

var libs_inicial = 
[
	'exectimer',
	'express-ifttt-webhook', 
	'gulp-cccr', 
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
	var eDiffDir = baseDir + "\\esprima-diff";
	var topmostDir = baseDir + "\\topmost";

	if (!fs.existsSync(topmostDir)) {
		fs.mkdirSync(topmostDir);
	}

	for (var i = 0; i < rounds; i++) {
		console.log(item + "-" + i + " ...");	

		var diff = fs.readFileSync(eDiffDir + "\\ediff-" + i + ".json", "utf8");
		var jsonDiff = JSON.parse(diff);
		
		var jsonTopmost = findTopmost(jsonDiff)
		fs.writeFileSync(topmostDir + "\\topmost-" + i + ".json", JSON.stringify(jsonTopmost), 'utf8');
	}
}

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

libs.forEach(handleFile);

