This folder contains one directory for the results of executing the unrestricted GA based on 
patch representation, one directory for the results of executing the restricted GA based on 
patch representation, and one directory for scripts.

The directories for the genetic algorithm contain one subdirectory for each instance under
analysis, each being represented by five rounds of optimization and its original source
code file. Each round of optimization has one file with the reduced source code and a text
file describing the nodes that were removed from the original program's AST to create the
respective reduced source code file.

The scripts allow comparing the performance of the unrestricted GA with the SHC used in the
exploratory studies, comparing the performance of the restricted GA with the DFAHC, and 
finding the topmost node types identified by the unrestricted GA (and SHC, for comparison).