# Setup
rm(list = ls());
library("tidyverse");
baseDir <- "/Users/Marcio.Barros/Desktop/Codigos/js-size-optimization/exploratory-study/scripts";

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
# Calculate patch frequency
#
counter <- data %>% group_by(lib, round) %>% summarize(count = n()) %>% group_by(lib);
counter0 <- counter %>% summarize(n0 = 60 - n());
counter1 <- counter %>% filter(count == 1) %>% summarize(n1 = n());
counter2 <- counter %>% filter(count == 2) %>% summarize(n2 = n());
counter3 <- counter %>% filter(count == 3) %>% summarize(n3 = n());
counter4 <- counter %>% filter(count == 4) %>% summarize(n4 = n()) %>% mutate(n4 = ifelse(is.na(n4), 0, n4));
counter5p <- counter %>% filter(count >= 5) %>% summarize(n5p = n()) %>% mutate(n5p = ifelse(is.na(n5p), 0, n5p));

patchCountFrequency <- counter0 %>% 
		left_join(counter1) %>% 
		left_join(counter2) %>% 
		left_join(counter3) %>% 
		left_join(counter4) %>% 
		left_join(counter5p);
		
patchCountFrequency <- patchCountFrequency %>% mutate(n2 = ifelse(is.na(n2), 0, n2));
patchCountFrequency <- patchCountFrequency %>% mutate(n4 = ifelse(is.na(n4), 0, n4));
patchCountFrequency <- patchCountFrequency %>% mutate(n5p = ifelse(is.na(n5p), 0, n5p));
		
pZeroPatches <- 100 * sum(patchCountFrequency$n0) / 660;
pOnePatch <- 100 * sum(patchCountFrequency$n1) / 660;
pTwoPatches <- 100 * sum(patchCountFrequency$n2) / 660;
pThreePatches <- 100 * sum(patchCountFrequency$n3) / 660;
pFourPatches <- 100 * sum(patchCountFrequency$n4) / 660;
pFiveMorePatches <- 100 * sum(patchCountFrequency$n5p) / 660;

#
# Correlation analysis
#
patchToCorrelation <- patchCountFrequency %>% inner_join(instances);
correlationFiveMorePatchesLoc <- cor(patchCountFrequency$n5p, patchToCorrelation$loc, method="spearman");


