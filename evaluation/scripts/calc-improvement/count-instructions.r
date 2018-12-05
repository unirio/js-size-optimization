# Setup
rm(list = ls());
library("tidyverse");
baseDir <- "/Users/Marcio.Barros/Desktop/Codigos/js-size-optimization/evaluation";


# Instances
instances <- c(
	"esprima",
	"plivo-node",
	"underscore"
);


# Load DFAHC resuts
dfahc <- tibble(instance = character(), count = numeric());

for (instance_ in instances) {
	instanceFilename <- paste(baseDir, "/DFAHC/", instance_, "/HC/0_modifications.csv", sep="");
	instanceDFAHC <- read_delim(instanceFilename, delim=";");

	count_ <- instanceDFAHC %>% 
				filter(instructionType != "original") %>%
				summarize(count = n()) %>%
				pull(count);

	dfahc <- dfahc %>% union(tibble(instance = instance_, count = count_));
}

dfahc <- dfahc %>% mutate(dfahc = count) %>% select(instance, dfahc);

		
# Load SFAHC results
sfahc <- tibble(instance = character(), count = numeric());

for (instance_ in instances) {
	for (round_ in 0:9) {
		instanceFilename <- paste(baseDir, "/SFAHC/", instance_, "/HC/", round_, "_modifications.csv", sep="");
		instanceSFAHC <- read_delim(instanceFilename, delim=";");

		count_ <- instanceSFAHC %>% 
					filter(instructionType != "original") %>%
					summarize(count = n()) %>% 
					pull(count);

		sfahc <- sfahc %>% bind_rows(tibble(instance = instance_, count = count_));
	}
}

sfahc <- sfahc %>% 
		group_by(instance) %>%
		summarize(sfahc = mean(count));

		
# Compute results
results <- dfahc %>% inner_join(sfahc);
