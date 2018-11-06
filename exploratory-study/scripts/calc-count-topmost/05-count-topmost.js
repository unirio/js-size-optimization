/*
 * Loads and count the topmost node types for each instance
 */

var fs = require('fs');

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

var counter = {};

function handleFile(item, index) {
	var baseDir = item;
	var topmostDir = baseDir + "\\topmost";

	for (var i = 0; i < rounds; i++) {
		var topmost = fs.readFileSync(topmostDir + "\\topmost-" + i + ".json", "utf8");
		var jsonTopmost = JSON.parse(topmost);

		for (var j = 0; j < jsonTopmost.length; j++) {
			var key = jsonTopmost[j];
			
			if (counter[key] == null) {
				counter[key] = 1;
			}
			else {
				counter[key] = counter[key] + 1;
			}
		}
	}
}

libs.forEach(handleFile);

result = "";

for (var key in counter) {
	result += key + "\t" + counter[key] + "\n";
}

fs.writeFileSync("topmost-nodetype-count.csv", result, 'utf8');

