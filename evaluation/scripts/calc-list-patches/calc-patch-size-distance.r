# Setup
rm(list = ls());
library("tidyverse");
baseDir <- "/Users/Marcio.Barros/Desktop/Codigos/js-size-optimization/evaluation/";

# Load files
instancesFilename <- paste(baseDir, "instance-data/instances.csv", sep="");
instances <- read_delim(instancesFilename, delim=",");

patchesFilename <- paste(baseDir, "results/patches.csv", sep="");
patches <- read_delim(patchesFilename, delim="\t");

# Prepare data
data <- patches %>% 
		inner_join(instances, by_x="lib", by_y="lib") %>% 
		mutate(size = finish - start + 1) %>% 
		mutate(psize = 100 * size / loc) %>% 
		mutate(pstart = 100 * start / loc) %>% 
		mutate(pfinish = 100 * finish / loc);

# Size analysis
size <- data %>% 
		group_by(lib) %>% 
		summarize(meanSize = mean(psize, na.rm=TRUE), medianSize = median(psize));

totalSize <- data %>% 
		group_by(lib, round) %>% 
		summarize(totalSize = sum(psize)) %>%
		group_by(lib) %>% 
		summarize(meanTotalSize = sum(totalSize) / 60);
		
size <- size %>%
		inner_join(totalSize, by_x="lib", by_y="lib");

overallSize <- data %>% 
		summarize(meanSize = mean(psize, na.rm=TRUE), medianSize = median(psize));

overallTotalSize <- data %>% 
		group_by(lib, round) %>% 
		summarize(totalSize = sum(psize));

meanMeanTotalSize <- mean(overallTotalSize$totalSize);
		
sizeToCorrelation <- size %>% 
		inner_join(instances, by_x="lib", by_y="lib") %>%
		select(-c("tests", "cov"));

correlationMeanSizeLoc <- cor(sizeToCorrelation$meanSize, sizeToCorrelation$loc, method="spearman");
correlationMedianSizeLoc <- cor(sizeToCorrelation$medianSize, sizeToCorrelation$loc, method="spearman");
correlationMeanTotalSizeLoc <- cor(sizeToCorrelation$meanTotalSize, sizeToCorrelation$loc, method="spearman");

		
# Distance analysis
distance <- data %>% 
		arrange(lib, round, start) %>% 
		mutate(lastLib = lag(lib, default="")) %>%
		mutate(lastRound = lag(round, default=0)) %>%
		mutate(lastPFinish = lag(pfinish, default=0)) %>%
		mutate(distance = ifelse(round != lastRound | lib != lastLib, NA, pstart - lastPFinish)) %>%
		group_by(lib) %>% 
		summarize(meanDistance = mean(distance, na.rm=TRUE), medianDistance = median(distance, na.rm=TRUE));
		
overallDistance <- data %>% 
		arrange(lib, round) %>% 
		mutate(lastRound = lag(round, default=0)) %>%
		mutate(lastPFinish = lag(pfinish, default=0)) %>%
		mutate(distance = ifelse(round != lastRound, pstart, pstart - lastPFinish)) %>%
		summarize(meanDistance = mean(distance, na.rm=TRUE), medianDistance = median(distance));
		
distanceToCorrelation <- distance %>% 
		inner_join(instances, by_x="lib", by_y="lib") %>%
		select(-c("tests", "cov"));

correlationMeanDistanceLoc <- cor(distanceToCorrelation$meanDistance, distanceToCorrelation$loc, method="spearman");
correlationMedianDistanceLoc <- cor(distanceToCorrelation$medianDistance, distanceToCorrelation$loc, method="spearman");
