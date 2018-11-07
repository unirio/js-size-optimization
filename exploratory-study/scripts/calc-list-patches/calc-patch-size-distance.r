# Setup
rm(list = ls());
library("tidyverse");
baseDir <- "/Users/Marcio/Desktop/Codigos/js-size-optimization/exploratory-study/scripts";

#
# Load files
#
instancesFilename <- paste(baseDir, "/instance-data/instances.csv", sep="");
instances <- read_delim(instancesFilename, delim=",");

patchesFilename <- paste(baseDir, "/calc-list-patches/patches.csv", sep="");
patches <- read_delim(patchesFilename, delim="\t");

#
# Prepare data
#
data <- patches %>% 
		inner_join(instances, by_x="lib", by_y="lib") %>% 
		mutate(size = finish - start + 1) %>% 
		mutate(psize = 100 * size / loc) %>% 
		mutate(pstart = 100 * start / loc) %>% 
		mutate(pfinish = 100 * finish / loc);

#
# Size analysis
#
size <- data %>% 
		group_by(lib) %>% 
		summarize(meanSize = mean(psize, na.rm=TRUE), medianSize = median(psize));
		
overallSize <- data %>% 
		summarize(meanSize = mean(psize, na.rm=TRUE), medianSize = median(psize));
		
sizeToCorrelation <- size %>% 
		inner_join(instances, by_x="lib", by_y="lib") %>%
		select(-c("tests", "cov"));

correlationMeanSizeLoc <- cor(sizeToCorrelation$meanSize, sizeToCorrelation$loc, method="spearman");
correlationMedianSizeLoc <- cor(sizeToCorrelation$medianSize, sizeToCorrelation$loc, method="spearman");

		
#
# Distance analysis
#
distance <- data %>% 
		arrange(lib, round) %>% 
		mutate(lastRound = lag(round, default=0)) %>%
		mutate(lastPFinish = lag(pfinish, default=0)) %>%
		mutate(distance = ifelse(round != lastRound, NA, pstart - lastPFinish)) %>%
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

correlationMeanSizeDistance <- cor(distanceToCorrelation$meanDistance, distanceToCorrelation$loc, method="spearman");
correlationMedianSizeDistance <- cor(distanceToCorrelation$medianDistance, distanceToCorrelation$loc, method="spearman");
