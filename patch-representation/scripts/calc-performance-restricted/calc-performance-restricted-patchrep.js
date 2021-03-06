var fs = require('fs');
var esprima = require('esprima');

var libs = 
[
	'browserify',
	'd3-node',
	'exectimer', 
	'express',
	'minimist', 
	'node-semver',
	'plivo-node',
	'pug',
	'tleaf', 
	'underscore',
	'uuid',
	'xml2js'
];

var rounds = 30;
var result = "";

/*
 * Processes one file
 */
function handleFile(item, index) {
	var baseDir = "restricted\\" + item;
	
	for (var i = 0; i < rounds; i++) {
		var improvements = fs.readFileSync(baseDir + "\\GA\\" + i + "_modifications.csv", "utf8");
		var lines = improvements.split("\n");
		var len = lines.length;
		
		var line1 = lines[1];
		var tokens = line1.split(";");
		var originalSize = (tokens.length == 4 && tokens[2] == "original") ? parseInt(tokens[3]) : 0;
		
		var lineN = lines[len-2];
		var tokens = lineN.split(";");
		var reducedSize = (tokens.length == 5) ? parseInt(tokens[3]) : originalSize;
		
		var improvement = 100.0 - 100.0 * reducedSize / originalSize;
		result += item + "\t" + i + "\t"+ originalSize + "\t" + reducedSize + "\t" + improvement + "\n";
	}
}

/*
 * Main program
 */
libs.forEach(handleFile);

result = "lib\tround\toriginal\treduced\timprovement\n" + result;
fs.writeFileSync("results\\performance-restricted-patchrep.csv", result, 'utf8');
