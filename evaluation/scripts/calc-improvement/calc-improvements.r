# Setup
rm(list = ls());
library("tidyverse");
baseDir <- "/Users/Marcio/Desktop/Codigos/js-size-optimization/evaluation/scripts";

# Load instance characteristics
instancesFilename <- paste(baseDir, "/instance-data/instances.csv", sep="");
instances <- read_delim(instancesFilename, delim=",");

# Load FAHC results
fahcFilename <- paste(baseDir, "/../FAHC/results.csv", sep="");
fahc <- read_delim(fahcFilename, delim=";");

# Load SFAHC results
sfahcFilename <- paste(baseDir, "/../SFAHC/results.csv", sep="");
sfahc <- read_delim(sfahcFilename, delim=";");

# Load SHC results
shcFilename <- paste(baseDir, "/../SHC/results.csv", sep="");
shc <- read_delim(shcFilename, delim=";");

# Prepare consolidated data
fahc_consolidate <- fahc %>%
	group_by(Lib) %>% 
	mutate(imp = 100 * diffchars / originalchars) %>%
	select(Lib, imp);

sfahc_consolidate <- sfahc %>% 
	group_by(Lib) %>% 
	mutate(imp = 100 * diffchars / originalchars) %>%
	summarize(sfahc_mean = mean(imp), sfahc_sd = sd(imp), sfahc_median = median(imp), sfahc_max = max(imp));
	
shc_consolidate <- shc %>% 
	group_by(Lib) %>% 
	mutate(imp = 100 * diffchars / originalchars) %>%
	summarize(shc_mean = mean(imp), shc_sd = sd(imp), shc_median = median(imp), shc_max = max(imp));

# Generate results
improvements <- fahc_consolidate %>%
	inner_join(sfahc_consolidate) %>%
	inner_join(shc_consolidate) %>%
	arrange(Lib);
