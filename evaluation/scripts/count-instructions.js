/*
 * Counts the number of instructions in JS files
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

/*
 * Processes one file
 */
function handleFile(item, index) {
	var baseDir = item;
	var contentsOriginal = fs.readFileSync("SHC\\" + baseDir + "\\RD\\original.js", "utf8");

	var jsonOriginal = esprima.parse(contentsOriginal, {loc:true});
//	fs.writeFileSync(baseDir + "\\..\\esprima-" + item + ".json", JSON.stringify(jsonOriginal, null, '\t'), 'utf8');

	var count = countInstructions(jsonOriginal, "type");
	console.log(item + " - " + count + " ...");
}

/*
 * Count the number of instructions in a Esprima JSON
 */
function countInstructions(original) {
	var count = 0;
	
	if (original) {
		if (typeof original == 'object') { 
			if (original["type"])
				count++;
				
			for (var key in original)
				count += countInstructions(original[key]);
		}
		else if (typeof original == 'array') { 
			for (var i = 0; i < original.length; i++)
				count += countInstructions(original[i]);
		}
	}
	
	return count;
}
 
/*
 * Main program
 */
libs.forEach(handleFile);
