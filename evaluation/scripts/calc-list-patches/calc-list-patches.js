/*
 * Loads the TEXTUAL DIFFs generated using a DIFF application and list the
 * starting and finishing line numbers for each patch in a resulting file.
 */
var fs = require('fs');

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
var result = "";

function handleFile(item, index) {
	var baseDir = "DFAHC\\" + item;
	var textDiffDir = baseDir + "\\text-diff";

	for (var i = 0; i < rounds; i++) {
		var diff = fs.readFileSync(textDiffDir + "\\tdiff-" + i + ".json", "utf8");
		
		var lines = diff.split("\n");
		var inVariant = false;
		var inOriginal = false;
		var startLine = -1;
		var lastLine = -1;
		
		for (index = 0, len = lines.length; index < len; ++index) {
			var line = lines[index].trim();

			if (line.startsWith("*****")) {
				if (!inVariant && !inOriginal) {
					inVariant = true;
					inOriginal = false;
				}
				else if (inVariant) {
					inVariant = false;
					inOriginal = true;
					startLine = -1;
					lastLine = -1
				}
				else if (inOriginal) {
					inVariant = false;
					inOriginal = false;
					result += item + "\t" + i + "\t" + startLine + "\t" + (lastLine-1) + "\n";
				}
			}
			else if (inOriginal) {
				var position = line.indexOf(":");
				
				if (position > 0) {
					var lineNumber = parseInt(line.substring(0, position).trim());
					if (startLine == -1) startLine = lineNumber + 1;
					lastLine = lineNumber;
				}
			}
		}
	}
}

libs.forEach(handleFile);

result = "lib\tround\tstart\tfinish\n" + result;
fs.writeFileSync("results\\patches.csv", result, 'utf8');
