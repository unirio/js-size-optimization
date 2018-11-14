/**
 * Count a node type inside *_modifications.csv
 */
var fs = require('fs');
var path = require('path');
var fs = require('fs');

//====================================================================================//>
//TODO: put here de complete path of libs resutls
var Directory = 'C:\\Users\\dr_bo\\Downloads\\Fitness_Loc\\Fitness_Loc\\Estudo Final\\SFAHC';
var ListaDasBibliotecas = fs.readdirSync(Directory).filter(file => fs.lstatSync(path.join(Directory, file)).isDirectory())
var ocorrencias = 0;
var numeroTotalLinhas = 0;

//For each lib in results, we collect number occurrences for a type of instruction configured in line 29
 ListaDasBibliotecas.forEach(function (biblioteca) {
    var diretorioBiblioteca = path.join(Directory, biblioteca);
    var ListaDasHeuristicas = fs.readdirSync(diretorioBiblioteca).filter(file => fs.lstatSync(path.join(diretorioBiblioteca, file)).isDirectory())
    ListaDasHeuristicas.forEach(function (heuristica) {
        for (var index = 0; index < 10; index++) { //possible 10 files
            if (!fs.existsSync(`${diretorioBiblioteca}/${heuristica}/${index}_modifications.csv`))
                continue;
    
            var fileContent = fs.readFileSync(`${diretorioBiblioteca}/${heuristica}/${index}_modifications.csv`, 'utf8');
            
            if (fileContent.length === 0)
                continue;
    
            numeroTotalLinhas += fileContent.split("\n").length -1;        
            //TODO: put here the type of instruction yoy want to count
            ocorrencias += (fileContent.match(/ConditionalExpression/g) || []).length;
        }
    });
    
});

console.log(`Total lines: ${numeroTotalLinhas}`);
console.log(`Occurrences: ${ocorrencias}`);



