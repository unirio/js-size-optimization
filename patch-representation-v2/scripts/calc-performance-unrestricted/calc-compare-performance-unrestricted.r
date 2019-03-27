# Setup
rm(list = ls());
library("tidyverse");
baseDir <- "/Users/Marcio/Desktop/Codigos/js-size-optimization/patch-representation-v2/results/";

# Load files
patchPerformanceFilename <- paste(baseDir, "performance-unrestricted-patchrep.csv", sep="");
patchPerformance <- read_delim(patchPerformanceFilename, delim="\t");

shcPerformanceFilename <- paste(baseDir, "performance-unrestricted-shc.csv", sep="");
shcPerformance <- read_delim(shcPerformanceFilename, delim="\t");

# Consolidate data
patchPerformance <- patchPerformance %>% 
						group_by(lib) %>% 
						summarize(p_mean = mean(improvement), p_sd = sd(improvement));

shcPerformance <- shcPerformance %>% 
						group_by(lib) %>% 
						summarize(s_mean = mean(improvement), s_sd = sd(improvement));
						
result <- patchPerformance %>% inner_join(shcPerformance);
