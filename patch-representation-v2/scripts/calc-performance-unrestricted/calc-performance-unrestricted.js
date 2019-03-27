var fs = require('fs');

var libs = 
[
	'exectimer', 
	'minimist', 
	'tleaf', 
	'underscore',
	'uuid'
];

var roundsSHC = 60;
var resultSHC = "lib\tround\toriginal\treduced\timprovement\n";

var roundsPatchRepresentation = 10;
var resultPatchRepresentation = "lib\tround\toriginal\treduced\timprovement\n";

/*
 * Calculate the performance of SHC for an instance
 */
function calculatePerformanceSHC(item, index) {
	var originalSize = getFileSize(item, "RD", "original");

	for (i = 0; i < roundsSHC; i++) {
		var reducedSize = getFileSize(item, "RD", "" + i);
		var improvement = 100.0 - 100.0 * reducedSize / originalSize;
		resultSHC += item + "\t" + i + "\t"+ originalSize + "\t" + reducedSize + "\t" + improvement + "\n";
	}
}

/*
 * Gets the size of a file
 */
function getFileSize(item, algorithm, name) {

	var minifiedFile = "..\\exploratory-study\\" + item + "\\" + algorithm + "-minified\\" + name + ".js";

	if (fs.existsSync(minifiedFile)){
		return fs.statSync(minifiedFile).size
	}
	
	return 0;
}

/*
 * Calculate the performance of the patch representation for an instance
 */
function calculatePerformancePatchRepresentation(item, index) {
	var baseDir = "unrestricted\\" + item;
	
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
libs.forEach(calculatePerformanceSHC);
fs.writeFileSync("results\\performance-unrestricted-shc.csv", resultSHC, 'utf8');

libs.forEach(calculatePerformancePatchRepresentation);
fs.writeFileSync("results\\performance-unrestricted-patchrep.csv", resultPatchRepresentation, 'utf8');
