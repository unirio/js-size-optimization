# Setup
rm(list = ls());
library("tidyverse");
baseDir <- "/Users/Marcio/Desktop/Codigos/js-size-optimization/patch-representation/results/";

# Load files
patchPerformanceFilename <- paste(baseDir, "performance-restricted-patchrep.csv", sep="");
patchPerformance <- read_delim(patchPerformanceFilename, delim="\t");

dfahcPerformanceFilename <- paste(baseDir, "performance-restricted-dfahc.csv", sep="");
dfahcPerformance <- read_delim(dfahcPerformanceFilename, delim="\t");

# Consolidate data
patchPerformance <- patchPerformance %>% 
						group_by(lib) %>% 
						summarize(p_median = median(improvement), p_mean = mean(improvement), p_sd = sd(improvement), p_max = max(improvement));

dfahcPerformance <- dfahcPerformance %>% 
						mutate(d_mean = improvement) %>%
						select(lib, d_mean);
						
result <- dfahcPerformance %>% inner_join(patchPerformance);

resultFilename <- paste(baseDir, "results.txt", sep="");
write_csv(result, path=resultFilename);
