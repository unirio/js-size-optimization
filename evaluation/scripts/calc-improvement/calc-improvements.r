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
	"plivo-node",
	"pug",
	"tleaf",
	"UglifyJS2",
	"underscore",
	"uuid",
	"xml2js"
);


# Load DFAHC resuts
dfahc <- tibble(instance = character(), original = numeric(), reduced = numeric());

for (instance_ in instances) {
	instanceFilename <- paste(baseDir, "/DFAHC/", instance_, "/HC/0_modifications.csv", sep="");
	instanceDFAHC <- read_delim(instanceFilename, delim=";");

	instanceDFAHC <- instanceDFAHC %>% 
						mutate(row = as.integer(`counter`)) %>%
						mutate(chars = as.integer(`totalChars `)) %>%
						select(row, chars);
						
	maxRow <- max(instanceDFAHC$row);
	original <- instanceDFAHC %>% filter(row == 0) %>% pull(chars);
	reduced <- instanceDFAHC %>% filter(row == maxRow) %>% pull(chars);
	dfahc <- dfahc %>% union(tibble(instance = instance_, original = original, reduced = reduced));
}

dfahc <- dfahc %>% 
		arrange(instance) %>%
		mutate(imp = 100 * (1 - reduced / original));

		
# Load SFAHC results
sfahc <- tibble(instance = character(), round = numeric(), original = numeric(), reduced = numeric());

for (instance_ in instances) {
	for (round_ in 0:9) {
		instanceFilename <- paste(baseDir, "/SFAHC/", instance_, "/HC/", round_, "_modifications.csv", sep="");
		instanceSFAHC <- read_delim(instanceFilename, delim=";");

		instanceSFAHC <- instanceSFAHC %>% 
							mutate(row = as.integer(`counter`)) %>%
							mutate(chars = as.integer(`totalChars `)) %>%
							select(row, chars);
							
		maxRow <- max(instanceSFAHC$row);
		original <- instanceSFAHC %>% filter(row == 0) %>% pull(chars);
		reduced <- instanceSFAHC %>% filter(row == maxRow) %>% pull(chars);
		sfahc <- sfahc %>% union(tibble(instance = instance_, round = round_, original = original, reduced = reduced));
	}
}

sfahc <- sfahc %>% 
		arrange(instance, round) %>%
		mutate(imp = 100 * (1 - reduced / original));

		
# Load SHC results
shc <- tibble(instance = character(), round = numeric(), original = numeric(), reduced = numeric());

for (instance_ in instances) {
	for (round_ in 0:9) {
		instanceFilename <- paste(baseDir, "/SHC/", instance_, "/RD/", round_, "_modifications.csv", sep="");
		instanceSHC <- read_delim(instanceFilename, delim=";");

		instanceSHC <- instanceSHC %>% 
							mutate(row = as.integer(`counter`)) %>%
							mutate(chars = as.integer(`totalChars `)) %>%
							select(row, chars);
							
		maxRow <- max(instanceSHC$row);
		original <- instanceSHC %>% filter(row == 0) %>% pull(chars);
		reduced <- instanceSHC %>% filter(row == maxRow) %>% pull(chars);
		shc <- shc %>% union(tibble(instance = instance_, round = round_, original = original, reduced = reduced));
	}
}

shc <- shc %>% 
		arrange(instance, round) %>%
		mutate(imp = 100 * (1 - reduced / original));

		
# Prepare consolidated data
dfahc_consolidate <- dfahc %>%
	group_by(instance) %>% 
	select(instance, imp);

sfahc_consolidate <- sfahc %>% 
	group_by(instance) %>% 
	summarize(sfahc_mean = mean(imp), sfahc_sd = sd(imp), sfahc_median = median(imp), sfahc_max = max(imp));
	
shc_consolidate <- shc %>% 
	group_by(instance) %>% 
	summarize(shc_mean = mean(imp), shc_sd = sd(imp), shc_median = median(imp), shc_max = max(imp));

	
# Generate results
improvements <- dfahc_consolidate %>%
	inner_join(sfahc_consolidate) %>%
	inner_join(shc_consolidate) %>%
	arrange(instance);

	
# Save main results
improvementsFilename <- paste(baseDir, "/results/improvements.csv", sep="");
write.table(improvements, file = improvementsFilename, quote=FALSE, row.names=FALSE);


# Boxplots for solution quality
boxplotFilename <- paste(baseDir, '/results/boxplots.pdf', sep="");
pdf(boxplotFilename, width=7, height=3);

par(mfrow=c(3, 7));
par(mar=c(2.1, 1.1, 1.1, 1.1));
par(mgp=c(2.5, 0.75, 0));
par(las=1);

for (instance_ in instances) {
	bp_dfahc <- dfahc %>% filter(instance == instance_);
	bp_sfahc <- sfahc %>% filter(instance == instance_);
	bp_shc <- shc %>% filter(instance == instance_);
	
	ymin <- min(bp_dfahc$imp, bp_sfahc$imp, bp_shc$imp) - 0.1;
	ymax <- max(bp_dfahc$imp, bp_sfahc$imp, bp_shc$imp) + 0.1;
	
	boxplot(bp_shc$imp, bp_sfahc$imp, ylim=c(ymin, ymax), main=instance_, names=c("SHC", "SFAHC"), cex.lab=0.6, cex.axis=0.6, cex.main=0.8, cex.sub=0.6);
	abline(h=bp_dfahc$imp, col="Red");
}

dev.off();


# Boxplots for solution quality (Thesis document version)
boxplotFilename <- paste(baseDir, '/results/boxplots-thesis.pdf', sep="");
pdf(boxplotFilename, width=6, height=8);

par(mfrow=c(5, 4));
par(mar=c(2.1, 1.1, 1.1, 1.1));
par(mgp=c(2.5, 0.75, 0));
par(las=1);

for (instance_ in instances) {
	bp_dfahc <- dfahc %>% filter(instance == instance_);
	bp_sfahc <- sfahc %>% filter(instance == instance_);
	bp_shc <- shc %>% filter(instance == instance_);
	
	ymin <- min(bp_dfahc$imp, bp_sfahc$imp, bp_shc$imp) - 0.1;
	ymax <- max(bp_dfahc$imp, bp_sfahc$imp, bp_shc$imp) + 0.1;

	boxplot(bp_shc$imp, bp_sfahc$imp, ylim=c(ymin, ymax), main=instance_, names=c("SHC", "SFAHC"), cex.lab=0.6, cex.axis=0.6, cex.main=0.8, cex.sub=0.6);
	abline(h=bp_dfahc$imp, col="Red");
}

dev.off()


# Comparing SHC x DFACH: instances SHC(max) < DFAHC
count <- shc %>% 
			group_by(instance) %>% 
			summarize(shc_max = max(imp)) %>% 
			inner_join(dfahc) %>% 
			mutate(dfahc = imp) %>% 
			select(instance, dfahc, shc_max) %>% 
			filter(dfahc > shc_max) %>%
			summarize(count = n());

print(paste("All solutions found by SHC are worse than DFAHC for", count$count, "instance(s)."));


# Comparing SHC x DFACH: instances SHC(min) > DFAHC
count <- shc %>% 
			group_by(instance) %>% 
			summarize(shc_min = min(imp)) %>% 
			inner_join(dfahc) %>% 
			mutate(dfahc = imp) %>% 
			select(instance, dfahc, shc_min) %>% 
			filter(shc_min > dfahc) %>%
			summarize(count = n());

print(paste("All solutions found by SHC are better than DFAHC for", count$count, "instance(s)."));

	
# Comparing SHC x DFACH: inference test for middle-case instances
focusInstances <- shc %>% 
			group_by(instance) %>% 
			summarize(shc_min = min(imp), shc_max = max(imp)) %>% 
			inner_join(dfahc) %>% 
			mutate(dfahc = imp) %>% 
			select(instance, dfahc, shc_min, shc_max) %>% 
			filter(shc_min <= dfahc & shc_max >= dfahc) %>%
			.$instance;

for (instance_ in focusInstances) {
	wshc <- shc %>% filter(instance == instance_);
	wfahc <- dfahc %>% filter(instance == instance_);
	pValue <- wilcox.test(wshc$imp, mu = wfahc$imp)$p.value;
	print(paste("SHC x DFAHC: WMW pValue(", instance_, ") = ", pValue, sep=""));
}


# Comparing SFAHC x DFACH: instances SFAHC(max) < DFAHC
count <- sfahc %>% 
			group_by(instance) %>% 
			summarize(sfahc_max = max(imp)) %>% 
			inner_join(dfahc) %>% 
			mutate(dfahc = imp) %>% 
			select(instance, dfahc, sfahc_max) %>% 
			filter(dfahc > sfahc_max) %>%
			summarize(count = n());

print(paste("All solutions found by SFAHC are worse than DFAHC for", count$count, "instance(s)."));


# Comparing SFAHC x DFACH: instances SFAHC(min) > DFAHC
count <- sfahc %>% 
			group_by(instance) %>% 
			summarize(sfahc_min = min(imp)) %>% 
			inner_join(dfahc) %>% 
			mutate(dfahc = imp) %>% 
			select(instance, dfahc, sfahc_min) %>% 
			filter(sfahc_min > dfahc) %>%
			summarize(count = n());

print(paste("All solutions found by SFAHC are better than DFAHC for", count$count, "instance(s)."));


# Comparing SFAHC x DFACH: inference test for middle-case instances
focusInstances <- sfahc %>% 
			group_by(instance) %>% 
			summarize(sfahc_min = min(imp), sfahc_max = max(imp)) %>% 
			inner_join(dfahc) %>% 
			mutate(dfahc = imp) %>% 
			select(instance, dfahc, sfahc_min, sfahc_max) %>% 
			filter(sfahc_min <= dfahc & sfahc_max >= dfahc) %>%
			.$instance;

for (instance_ in focusInstances) {
	wsfahc <- sfahc %>% filter(instance == instance_);
	wdfahc <- dfahc %>% filter(instance == instance_);
	pValue <- wilcox.test(wsfahc$imp, mu = wdfahc$imp)$p.value;
	print(paste("SFAHC x DFAHC: pValue(", instance_, ") = ", pValue, sep=""));
}












# Load instance characteristics
#instancesFilename <- paste(baseDir, "/instance-data/instances.csv", sep="");
#instanceData <- read_delim(instancesFilename, delim=",");


# Analise de correlacao
improvementsToCorrelation <- improvements %>% inner_join(instances, by=c("Lib" = "lib"));

cor(improvementsToCorrelation$imp, improvementsToCorrelation$loc, method="spearman");
cor(improvementsToCorrelation$imp, improvementsToCorrelation$tests, method="spearman");
cor(improvementsToCorrelation$imp, improvementsToCorrelation$cov, method="spearman");

cor(improvementsToCorrelation$sfahc_median - improvementsToCorrelation$imp, improvementsToCorrelation$loc, method="spearman");
cor(improvementsToCorrelation$sfahc_median - improvementsToCorrelation$imp, improvementsToCorrelation$tests, method="spearman");
cor(improvementsToCorrelation$sfahc_median - improvementsToCorrelation$imp, improvementsToCorrelation$cov, method="spearman");

