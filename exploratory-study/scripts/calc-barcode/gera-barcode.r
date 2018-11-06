rm(list = ls());
library("tidyverse");
library("barcode");

data <- data <- read_delim("\\Users\\marcio.barros\\Desktop\\tdiff-count.json", delim="\t");

lodash <- data %>% 
			filter(instance == "lodash") %>%
			mutate(pposition = position / 10795.0);

uuid <- data %>% 
			filter(instance == "uuid") %>%
			mutate(pposition = position / 209.0);

barcodeData <- list("lodash"=lodash$pposition, "uuid"=uuid$pposition);
margins <- list(bottom = unit(2, "lines"), left = unit(1, "lines"), top = unit(1, "lines"), right = unit(1, "lines"));

pdf("\\Users\\marcio.barros\\Desktop\\distribution.pdf", width=8, height=2);
barcode(barcodeData, bcspace=0.8, outer.margins=margins);
dev.off();
