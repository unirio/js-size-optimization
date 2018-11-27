# Boxplots for solution quality - thesis
boxplotFilename=paste(basePath, '/results/boxplots-thesis.pdf', sep="");
pdf(boxplotFilename, width=6, height=8);

par(mfrow=c(5, 4));
par(mar=c(2.1, 1.1, 1.1, 1.1));
par(mgp=c(2.5, 0.75, 0));
par(las=1);

for (lib_ in unique(data$lib)) {
	rdata <- subset(data, data$lib == lib_);
	
	shc <- subset(rdata, data$alg == "SHC")$imp;
	sfahc <- subset(rdata, data$alg == "SFAHC")$imp;
	dfahc <- subset(rdata, data$alg == "DFAHC")$imp;
	
	ymin <- min(rdata$imp) - 0.1;
	ymax <- max(rdata$imp) + 0.1;
	
	boxplot(shc, sfahc, ylim=c(ymin, ymax), main=lib_, names=c("SHC", "SFAHC"), cex.lab=0.6, cex.axis=0.6, cex.main=0.8, cex.sub=0.6);
	abline(h=dfahc, col="Red");
}

dev.off()
