# Setup
rm(list = ls());
library("tidyverse");
library("barcode");
baseDir <- "/Users/Marcio.barros/Desktop/Codigos/js-size-optimization/exploratory-study/scripts";

# Load instance characteristic files
instancesFilename <- paste(baseDir, "/instance-data/instances.csv", sep="");
instances <- read_delim(instancesFilename, delim=",");

# Load patches
patchesFilename <- paste(baseDir, "/calc-list-patches/patches.csv", sep="");
patches <- read_delim(patchesFilename, delim="\t");

# Filter for the representative instances
data <- patches %>% 
		inner_join(instances, by_x="lib", by_y="lib") %>%
		select(lib, round, start, finish, loc);
		
lodash <- data %>% 
		filter(lib == "lodash" & round == 42);

uuid <- data %>% 
		filter(lib == "uuid" & round == 41);
		
# Add intermediate changed lines for UUID
ruuid <- tibble(lib=character(), start=numeric());

for (index in 1:nrow(uuid)) {
	start <- as.numeric(uuid[index, "start"]);
	finish <- as.numeric(uuid[index, "finish"]);
	loc <- as.numeric(uuid[index, "loc"]);
	
	for (i in start:finish) {
		ruuid <- add_row(ruuid, lib="uuid", start=i / loc);
	}
}
		
# Add intermediate changed lines for LODASH
rlodash <- tibble(lib=character(), start=numeric());

for (index in 1:nrow(lodash)) {
	start <- as.numeric(lodash[index, "start"]);
	finish <- as.numeric(lodash[index, "finish"]);
	loc <- as.numeric(lodash[index, "loc"]);
	
	for (i in start:finish) {
		rlodash <- add_row(rlodash, lib="lodash", start=i / loc);
	}
}

# Prepare percentile data
ruuid <- ruuid %>% 
		mutate(pstart = 100 * start / loc) %>%
		select(lib, pstart);

rlodash <- rlodash %>% 
		mutate(pstart = 100 * start / loc) %>%
		select(lib, pstart);

# Plot the barcode chart
barcodeData <- list("lodash"=rlodash$pstart, "uuid"=ruuid$pstart);
margins <- list(bottom = unit(2, "lines"), left = unit(1, "lines"), top = unit(1, "lines"), right = unit(1, "lines"));

barcodeFilename <- paste(baseDir, "/calc-barcode/barcode.pdf", sep="");
pdf(barcodeFilename, width=8, height=2);
barcode(barcodeData, bcspace=0.8, outer.margins=margins);
dev.off();
