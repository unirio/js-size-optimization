# Setup
rm(list = ls());
library("tidyverse");
baseDir <- "/Users/Marcio/Desktop/codigos/js-size-optimization/evaluation/";

#
# Load files
#
instancesFilename <- paste(baseDir, "instance-data/instances.csv", sep="");
instances <- read_delim(instancesFilename, delim=",");

patchesFilename <- paste(baseDir, "results/patches.csv", sep="");
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
counter0 <- counter %>% summarize(n0 = 1 - n());
counter1 <- counter %>% filter(count == 1) %>% summarize(n1 = n());
counter2 <- counter %>% filter(count == 2) %>% summarize(n2 = n());
counter3 <- counter %>% filter(count == 3) %>% summarize(n3 = n());
counter4 <- counter %>% filter(count == 4) %>% summarize(n4 = n());
counter5p <- counter %>% filter(count >= 5) %>% summarize(n5p = n());

patchCountFrequency <- counter0 %>% 
		left_join(counter1) %>% 
		left_join(counter2) %>% 
		left_join(counter3) %>% 
		left_join(counter4) %>% 
		left_join(counter5p);
