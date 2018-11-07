# Start R on Ubuntu
# sudo -i R

# Clean up and load libraries
rm(list=ls());
library("data.table");

# "/Users/marcio.barros/Desktop/"
basePath <- '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/analises/'
basePathForboxplots <- '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/analises/boxplots'

# Load data
data <- read.table(paste(basePath,'results.csv',sep=""), header=TRUE, sep=',');
dt <- data.table(data);


percent <- function(x, digits = 2, format = "f", ...) {
  paste0(formatC(100 * x, format = format, digits = digits, ...), "%")
}


# Descriptive analysis over solution quality
means <- dt[, .(mean = mean(diffchars)), by=list(alg, Lib)]
meanByAlgorithm <- reshape(means, v.names = "mean", idvar = "Lib", timevar = "alg", direction = "wide")
print(meanByAlgorithm)


sds <- dt[, .(diffchars = sd(diffchars)), by=list(alg, Lib)]
sdsByAlgorithm <- reshape(sds, v.names = "diffchars", idvar = "Lib", timevar = "alg", direction = "wide")
print(sdsByAlgorithm)



maxs <- dt[, .(mean = max(diffchars)), by=list(alg, Lib)]
maxByAlgorithm <- reshape(maxs, v.names = "mean", idvar = "Lib", timevar = "alg", direction = "wide")
print(maxByAlgorithm)



# Boxplots for solution quality
#
# 2 gráficos apresentando 7 instâncias cada, ou seja, 14 boxplots por linha (RD + HC para cada instância)
# traçar uma linha representando o HC3
#for(LibName in unique(data$Lib))
#{
#	png(filename= paste(basePathForboxplots, LibName, "_diffchars.png",sep=""))
#	boxplot(data$diffchars[data$alg=="RD" & data$Lib==LibName],data$diffchars[data$alg=="HC" & data$Lib==LibName], data$diffchars[data$alg=="HC3" & data$Lib==LibName], ylab="DiffChars", main=LibName, xlab="Alg", names=c("RD", "HC", "HC3"), las=1, digits=3, varwidth=TRUE)
#	abline(h=data$diffchars[data$alg=="HC3" & data$Lib==LibName],col="Red")
#	dev.off()
#}

# Descriptive analysis over time
#
# idem ao anterior
#times <- dt[, .(mean = min(time)), by=list(alg, Lib)]
#timeByAlgorithm <- reshape(times, v.names = "mean", idvar = "Lib", timevar = "alg", direction = "wide")
#print(timeByAlgorithm)

# Boxplots for time
#
# idem ao anterior
#for(LibName in unique(data$Lib))
#{
#	png(filename= paste(basePathForboxplots, LibName, "_time.png",sep=""))
#	boxplot(data$time[data$alg=="RD" & data$Lib==LibName ],data$time[data$alg=="HC" & data$Lib==LibName], data$time[data$alg=="HC3" & data$Lib==LibName], ylab="time", main=LibName, xlab="Alg", names=c("RD", "HC", "HC3"), las=1, digits=3, varwidth=TRUE)
#	abline(h=data$time[data$alg=="HC3" & data$Lib==LibName],col="Red")
#	dev.off()
#}

# Analisar por percentual de melhoria, ao invés da melhoria nominal
percents <- dt[, .(meam = percent((1-max(chars/originalchars)))), by=list(alg, Lib)]
percentByAlgorithm <- reshape(percents, v.names = "meam", idvar = "Lib", timevar = "alg", direction = "wide")
print(percentByAlgorithm)

# Stat analysis comparing RD and HC
#
# teste de normalidade, teste de inferência, tamanho de efeito


# análise de correlação
#
# tamanho do código, tamanho da base de testes, cobertura de testes
dataSizes <- read.table(paste(basePath,'correlation.csv',sep=""), header=TRUE, sep=';');
dtSizes <- data.table(dataSizes);
#install.packages('Hmisc')
library(Hmisc)

diffChars <- dt[, .(value = sum(diffchars)), by=list(Lib)]
diffChars <- reshape(diffChars, v.names = "diffchars", idvar = "value", timevar = "Lib", direction = "wide")
LOC <- dtSizes[, .(value = LOC)]
Tests <- dtSizes[, .(value = Tests)]
Cov <- dtSizes[, .(value = Cov)]

cor(diffChars, LOC)
cor(diffChars, Tests)
cor(diffChars, Cov)





