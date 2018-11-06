var fs = require('fs');
var math = require('mathjs');

var libs = 
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

/*
 * Setup
 */
var result = "instance\talgorithm\tmean\tmedian\tstd\tmax\n";

/*
 * Processes an instance
 */
function handleFile(item, index) {
	result += handleFileAlgorithm(item, "RD");
	result += handleFileAlgorithm(item, "GA");
}

/*
 * Calculate mean, median, std and max size reduction for an instance
 */
function handleFileAlgorithm(item, algorithm) {

	var originalSize = getFileSize(item, algorithm, "original");
	var rounds = [];

	for (i = 0; i <= 59; i++) {
		var roundSize = getFileSize(item, algorithm, "" + i);
		
		if (roundSize > 0) {
			var variation = (originalSize - roundSize) / originalSize;
			rounds.push(variation);
		}
	}

	var mean = math.mean(rounds);
	var median = math.median(rounds);
	var std = math.std(rounds);
	var max = math.max(rounds);
	return item + "\t" + algorithm + "\t"+ mean + "\t" + median + "\t" + std + "\t" + max + "\n";
}

/*
 * Gets the size of a file
 */
function getFileSize(item, algorithm, name) {

	var minifiedFile = item + "\\" + algorithm + "-minified\\" + name + ".js";

	if (fs.existsSync(minifiedFile)){
		return fs.statSync(minifiedFile).size
	}
	
	return 0;
}

/*
 * Main program
 */
libs.forEach(handleFile);
console.log(result);
