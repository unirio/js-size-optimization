# Setup
rm(list = ls());
library("tidyverse");
baseDir <- "/Users/Marcio/Desktop/Codigos/js-size-optimization/patch-representation-v2/results/";

# Load files
patchPerformanceFilename <- paste(baseDir, "performance-restricted-patchrep.csv", sep="");
patchPerformance <- read_delim(patchPerformanceFilename, delim="\t");

dfahcPerformanceFilename <- paste(baseDir, "performance-restricted-dfahc.csv", sep="");
dfahcPerformance <- read_delim(dfahcPerformanceFilename, delim="\t");

# Consolidate data
patchPerformance <- patchPerformance %>% 
						group_by(lib) %>% 
						summarize(p_mean = mean(improvement), p_sd = sd(improvement));

dfahcPerformance <- dfahcPerformance %>% 
						mutate(d_mean = improvement) %>%
						select(lib, d_mean);
						
result <- patchPerformance %>% inner_join(dfahcPerformance);
