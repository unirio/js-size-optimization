var fs = require('fs');

var libs = 
[
	'exectimer',
	'minimist',
	'tleaf', 
	'uuid'
];

var rounds = 60;
var result = "";

/*
 * Processes an instance
 */
function handleFile(item, index) {
	var originalSize = getFileSize(item, "RD", "original");

	for (i = 0; i < rounds; i++) {
		var reducedSize = getFileSize(item, "RD", "" + i);
		var improvement = 100.0 - 100.0 * reducedSize / originalSize;
		result += item + "\t" + i + "\t"+ originalSize + "\t" + reducedSize + "\t" + improvement + "\n";
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
 * Main program
 */
libs.forEach(handleFile);

result = "lib\tround\toriginal\treduced\timprovement\n" + result;
fs.writeFileSync("results\\performance-unrestricted-shc.csv", result, 'utf8');
