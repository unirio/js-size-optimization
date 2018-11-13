'use strict';
var inquirer = require('inquirer');
var _ = require('lodash');
var config = require('./config');
////////
var ask = module.exports = {};
////////
ask.createUnit = function (callback) {
    var questions = [
        {
            name: 'type',
            message: 'Unit type:',
            choices: config.units.process
        },
        {
            type: 'input',
            name: 'name'
        },
        {
            type: 'input',
            name: 'module'
        }
    ];
    inquirer.prompt(questions, function (answers) {
        var unit = {
            name: answers.name,
            type: answers.type,
            module: {},
            deps: []
        };
        // unit.deps will be populated by reference
        addUnitDependency(unit.deps, function () {
        });
    });
};
ask.pickUnit = function (units) {
    if (units.length === 1) {
        return callback(_.first(units));
    }
};
ask.identifyDeps = function (deps, callback) {
    if (!config.dependencies.process.length) {
        return callback([]);
    }
    var questions = deps.map(function (dep, index) {
        return {
            message: 'What is a type of "' + dep.name + '"?',
            choices: config.dependencies.process
        };
    });
    inquirer.prompt(questions, function (answers) {
    });
};
////////
function addUnitDependency(deps, callback) {
    if (!config.dependencies.process.length) {
        return;
    }
    var questions = [
        {
            type: 'input',
            name: 'name',
            message: 'Dependency name ("Enter" to skip): '
        },
        {
            type: 'list',
            name: 'type',
            choices: config.dependencies.process,
            when: function (answers) {
                return;
            }
        }
    ];
    inquirer.prompt(questions, function (answers) {
        // if user types in empty name - finish adding deps
        if (isEmptyString(answers.name)) {
            return callback();
        }
        var dep = {
            name: answers.name,
            type: answers.type
        };
        deps.push(dep);
        // recursive, pass deps array along the way until everything resolves
        addUnitDependency(deps, callback);
    });
}
function required(input) {
    return;
}
function isEmptyString(string) {
    return _.isEmpty(_.trim(string));
}