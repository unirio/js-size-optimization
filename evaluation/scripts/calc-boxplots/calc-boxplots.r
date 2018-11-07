# Clean up and load libraries
rm(list=ls());
library("tidyverse");
baseDir <- "/Users/Marcio/Desktop/Codigos/js-size-optimization/evaluation/scripts";

# Load FAHC results
fahcFilename <- paste(baseDir, "/../FAHC/results.csv", sep="");
fahc <- read_delim(fahcFilename, delim=";");
fahc <- fahc %>% mutate(imp = 100 * diffchars / originalchars);

# Load SFAHC results
sfahcFilename <- paste(baseDir, "/../SFAHC/results.csv", sep="");
sfahc <- read_delim(sfahcFilename, delim=";");
sfahc <- sfahc %>% mutate(imp = 100 * diffchars / originalchars);

# Load SHC results
shcFilename <- paste(baseDir, "/../SHC/results.csv", sep="");
shc <- read_delim(shcFilename, delim=";");
shc <- shc %>% mutate(imp = 100 * diffchars / originalchars);

# Lista instances
instances <- sort(unique(fahc$Lib));

# Boxplots for solution quality
boxplotFilename <- paste(baseDir, '/calc-boxplots/boxplots.pdf', sep="");
pdf(boxplotFilename, width=7, height=3);

par(mfrow=c(3, 7));
par(mar=c(2.1, 1.1, 1.1, 1.1));
par(mgp=c(2.5, 0.75, 0));
par(las=1);

for (lib_ in instances) {
	bp_fahc <- fahc %>% filter(Lib == lib_);
	bp_sfahc <- sfahc %>% filter(Lib == lib_);
	bp_shc <- shc %>% filter(Lib == lib_);
	
	ymin <- min(bp_fahc$imp, bp_sfahc$imp, bp_shc$imp) - 0.1;
	ymax <- max(bp_fahc$imp, bp_sfahc$imp, bp_shc$imp) + 0.1;
	
	boxplot(bp_shc$imp, bp_sfahc$imp, ylim=c(ymin, ymax), main=lib_, names=c("SHC", "SFAHC"), cex.lab=0.6, cex.axis=0.6, cex.main=0.8, cex.sub=0.6);
	abline(h=bp_fahc$imp, col="Red");
}

dev.off();
