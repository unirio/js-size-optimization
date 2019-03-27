var fs = require('fs');

var libs = 
[
	'd3-node',
	'exectimer', 
	'express',
	'minimist', 
	'node-semver',
	'tleaf', 
	'underscore',
	'uuid'
];

var resultDFAHC = "lib\tround\toriginal\treduced\timprovement\n";

var roundsPatchRepresentation = 10;
var resultPatchRepresentation = "lib\tround\toriginal\treduced\timprovement\n";

/*
 * Calculates the performance of DFACH for a single instance
 */
function calculatePerformanceDFAHC(item, index) {
	var baseDir = "..\\evaluation\\dfahc\\" + item;
	
	var improvements = fs.readFileSync(baseDir + "\\HC\\0_modifications.csv", "utf8");
	var lines = improvements.split("\n");
	var len = lines.length;
	
	var line1 = lines[1];
	var tokens = line1.split(";");
	var originalSize = (tokens.length == 4 && tokens[2] == "original") ? parseInt(tokens[3]) : 0;
	
	var lineN = lines[len-2];
	var tokens = lineN.split(";");
	var reducedSize = (tokens.length == 4) ? parseInt(tokens[3]) : originalSize;
	
	var improvement = 100.0 - 100.0 * reducedSize / originalSize;
	resultDFAHC += item + "\t" + 0 + "\t"+ originalSize + "\t" + reducedSize + "\t" + improvement + "\n";
}

/*
 * Calculates the performance of the patch representation for a single instance
 */
function calculatePerformancePatchRepresentation(item, index) {
	var baseDir = "restricted\\" + item;
	
	for (var i = 0; i < roundsPatchRepresentation; i++) {
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
		resultPatchRepresentation += item + "\t" + i + "\t"+ originalSize + "\t" + reducedSize + "\t" + improvement + "\n";
	}
}

/*
 * Main program
 */
libs.forEach(calculatePerformanceDFAHC);
fs.writeFileSync("results\\performance-restricted-dfahc.csv", resultDFAHC, 'utf8');

libs.forEach(calculatePerformancePatchRepresentation);
fs.writeFileSync("results\\performance-restricted-patchrep.csv", resultPatchRepresentation, 'utf8');
