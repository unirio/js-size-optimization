'use strict';
var inquirer = require('inquirer');
var config = require('./config');
////////
var ask = module.exports = {};
////////
ask.createUnit = function () {
    var questions = [{
            type: 'list',
            name: 'type',
            choices: config.units.process
        }];
    inquirer.prompt(questions, function (answers) {
        var unit;
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
    var questions = deps.map(function (dep) {
        return {
            type: 'list',
            message: 'What is a type of "' + dep.name + '"?',
            choices: config.dependencies.process
        };
    });
    inquirer.prompt(questions, function () {
    });
};
////////
function addUnitDependency(deps) {
    if (!config.dependencies.process.length) {
        return;
    }
    var questions = [
        {},
        {
            type: 'list',
            name: 'type',
            choices: config.dependencies.process
        }
    ];
    inquirer.prompt(questions, function () {
    });
}