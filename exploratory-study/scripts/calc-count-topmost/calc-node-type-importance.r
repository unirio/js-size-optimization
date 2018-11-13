# Setup
rm(list = ls());
library("tidyverse");
baseDir <- "/Users/Marcio/Desktop/Codigos/js-size-optimization/exploratory-study";

# Load node type frequency
nodeTypeFrequencyFilename <- paste(baseDir, "/instance-data/esprima.csv", sep="");
nodeTypeFrequency <- read_delim(nodeTypeFrequencyFilename, delim="\t");

# Convert node type frequency to percentile
nodeTypeFrequency <- nodeTypeFrequency %>% 
						select(-"nomeBiblioteca") %>% 
						summarise_all(funs(sum));
						
nodeTypeFrequency <- as_tibble(cbind(type = names(nodeTypeFrequency), t(nodeTypeFrequency))) %>% 
						mutate(count=as.numeric(V1)) %>% 
						select("type", "count");
						
totalCount <- sum(nodeTypeFrequency$count);

nodeTypeFrequency <- nodeTypeFrequency %>% 
						mutate(frequency = count * 100 / totalCount) %>% 
						select("type", "frequency");
						
nodeTypeFrequency <- nodeTypeFrequency %>% 
						arrange(desc(frequency));

# Load topmost node frequency
topmostFrequencyFilename <- paste(baseDir, "/results/topmost-count-shc.csv", sep="");
topmostFrequency <- read_delim(topmostFrequencyFilename, delim="\t");

# Calculate rank
nodeImportance <- topmostFrequency %>% 
					inner_join(nodeTypeFrequency) %>% 
					mutate(rank = count / (100 * (1 - frequency / 100))) %>% 
					arrange(desc(rank))

# Saves the rank
nodeImportanceFilename <- paste(baseDir, "/results/node-importance.csv", sep="");
write.table(nodeImportance, file = nodeImportanceFilename, quote=FALSE, row.names=FALSE);
