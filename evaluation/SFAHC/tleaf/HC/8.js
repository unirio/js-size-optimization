var inquirer = require('inquirer');
var config = require('./config');
////////
var ask = module.exports = {};
////////
ask.createUnit = function () {
    var questions = [{
            name: 'type',
            choices: config.units.process
        }];
    inquirer.prompt(questions, function () {
        // unit.deps will be populated by reference
        addUnitDependency();
    });
};
ask.pickUnit = function () {
};
ask.identifyDeps = function (deps) {
    if (!config.dependencies.process.length) {
        return;
    }
    var questions = deps.map(function () {
        return { choices: config.dependencies.process };
    });
    inquirer.prompt(questions, function () {
    });
};
////////
function addUnitDependency() {
    if (!config.dependencies.process.length) {
        return;
    }
    var questions = [{
            name: 'type',
            choices: config.dependencies.process
        }];
    inquirer.prompt(questions, function () {
    });
}