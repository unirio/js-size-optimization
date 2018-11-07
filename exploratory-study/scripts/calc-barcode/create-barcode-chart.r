# Setup
rm(list = ls());
library("tidyverse");
library("barcode");
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
		#mutate(size = finish - start + 1) %>% 
		#mutate(psize = 100 * size / loc) %>% 
		mutate(pstart = 100 * start / loc) %>% 
		mutate(pfinish = 100 * finish / loc);

#
# Filter for the better results of LODASH and UUID
#
lodash <- data %>% filter(lib == "lodash" & round == 42);
uuid <- data %>% filter(lib == "uuid" & round == 41);

#
# Plot the barcode chart
#
barcodeData <- list("lodash"=lodash$pstart, "uuid"=uuid$pstart);
margins <- list(bottom = unit(2, "lines"), left = unit(1, "lines"), top = unit(1, "lines"), right = unit(1, "lines"));

pdf("\\Users\\marcio.barros\\Desktop\\distribution.pdf", width=8, height=2);
barcode(barcodeData, bcspace=0.8, outer.margins=margins);
dev.off();
