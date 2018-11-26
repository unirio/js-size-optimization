# Setup
rm(list = ls());
library("tidyverse");
baseDir <- "/Users/Marcio barros/Desktop/Codigos/js-size-optimization/evaluation";

# Instances
instances <- c(
	"browserify",
	"d3-node",
	"decimal.js",
	"esprima",
	"exectimer",
	"express",
	"jquery",
	"lodash",
	"mathjs",
	"minimist",
	"moment",
	"node-semver",
	"pug",
	"tleaf",
	"UglifyJS2",
	"underscore",
	"uuid",
	"xml2js"
);

# Load instance characteristics
instancesFilename <- paste(baseDir, "/instance-data/instances.csv", sep="");
instanceData <- read_delim(instancesFilename, delim=",");


for (instance_ in instances) {
	instanceFilename <- paste(baseDir, "/DFAHC/", instance_, "/HC/0_modifications.csv", sep="");
	instanceDFAHC <- read_delim(instanceFilename, delim=";");
	instanceDFAHC %>% mutate(chars = as.integer(`totalChars `));
	
}






# Load FAHC results
fahcFilename <- paste(baseDir, "/DFAHC/results.csv", sep="");
fahc <- read_delim(fahcFilename, delim=";");
fahc <- fahc %>% mutate(imp = 100 * diffchars / originalchars);

# Load SFAHC results
sfahcFilename <- paste(baseDir, "/SFAHC/results.csv", sep="");
sfahc <- read_delim(sfahcFilename, delim=";");
sfahc <- sfahc %>% mutate(imp = 100 * diffchars / originalchars);

# Load SHC results
shcFilename <- paste(baseDir, "/SHC/results.csv", sep="");
shc <- read_delim(shcFilename, delim=";");
shc <- shc %>% mutate(imp = 100 * diffchars / originalchars);

# Prepare consolidated data
fahc_consolidate <- fahc %>%
	group_by(Lib) %>% 
	select(Lib, imp);

sfahc_consolidate <- sfahc %>% 
	group_by(Lib) %>% 
	summarize(sfahc_mean = mean(imp), sfahc_sd = sd(imp), sfahc_median = median(imp), sfahc_max = max(imp));
	
shc_consolidate <- shc %>% 
	group_by(Lib) %>% 
	summarize(shc_mean = mean(imp), shc_sd = sd(imp), shc_median = median(imp), shc_max = max(imp));

# Generate results
improvements <- fahc_consolidate %>%
	inner_join(sfahc_consolidate) %>%
	inner_join(shc_consolidate) %>%
	arrange(Lib);

# Save main results
improvementsFilename <- paste(baseDir, "/results/improvements.csv", sep="");
write.table(improvements, file = improvementsFilename, quote=FALSE, row.names=FALSE);

# SHC x DFACH
focusInstances <- c("uuid", "xml2js");

for (instance_ in focusInstances) {
	wshc <- shc %>% filter(Lib == instance_);
	wfahc <- fahc %>% filter(Lib == instance_);
	pValue <- wilcox.test(wshc$imp, mu = wfahc$imp)$p.value;
	print(paste("SHC x DFAHC: pValue(", instance_, ") = ", pValue, sep=""));
}

# SFAHC x DFACH
focusInstances <- c("d3-node", "decimal.js", "exectimer", "express", "jquery", "mathjs", "minimist", "node-semver", "tleaf", "UglifyJS2", "uuid");

for (instance_ in focusInstances) {
	wsfahc <- sfahc %>% filter(Lib == instance_);
	wfahc <- fahc %>% filter(Lib == instance_);
	pValue <- wilcox.test(wsfahc$imp, mu = wfahc$imp)$p.value;
	print(paste("SFAHC x DFAHC: pValue(", instance_, ") = ", pValue, sep=""));
}

# Analise de correlacao
improvementsToCorrelation <- improvements %>% inner_join(instances, by=c("Lib" = "lib"));

cor(improvementsToCorrelation$imp, improvementsToCorrelation$loc, method="spearman");
cor(improvementsToCorrelation$imp, improvementsToCorrelation$tests, method="spearman");
cor(improvementsToCorrelation$imp, improvementsToCorrelation$cov, method="spearman");

cor(improvementsToCorrelation$sfahc_median - improvementsToCorrelation$imp, improvementsToCorrelation$loc, method="spearman");
cor(improvementsToCorrelation$sfahc_median - improvementsToCorrelation$imp, improvementsToCorrelation$tests, method="spearman");
cor(improvementsToCorrelation$sfahc_median - improvementsToCorrelation$imp, improvementsToCorrelation$cov, method="spearman");

