'use strict';
var inquirer = require('inquirer');
var _ = require('lodash');
var config = require('./config');
////////
var ask = module.exports = {};
ask.pickUnit = function (units, callback) {
    if (units.length === 1) {
        return callback(_.first(units));
    }
    var question = {
        type: 'list',
        name: 'unit',
        message: 'What unit do you want to test?',
        choices: function () {
            return units.map(function (unit, index) {
                return {
                    name: [
                        _.capitalize(unit.type),
                        '"' + unit.name + '"',
                        'from module',
                        '"' + unit.module.name + '"'
                    ].join(' '),
                    value: index
                };
            });
        }
    };
    inquirer.prompt(question, function (answer) {
        var unit = units[answer.unit];
        callback(unit);
    });
};
////////
function addUnitDependency(deps, callback) {
    if (!config.dependencies.process.length) {
        return callback();
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
            message: 'Dependency type:',
            choices: config.dependencies.process,
            when: function (answers) {
                return !isEmptyString(answers.name);
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
    if (isEmptyString(input)) {
        return 'Value is required';
    }
    return true;
}
function isEmptyString(string) {
    return _.isEmpty(_.trim(string));
}