var inquirer = require();
var _ = require('lodash');
var config = require();
////////
var ask = module.exports = {};
////////
ask.createUnit = function (callback) {
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
ask.identifyDeps = function (deps, callback) {
    if (!config.dependencies.process.length) {
        return callback([]);
    }
    var questions = deps.map(function (dep, index) {
        return {
            type: 'list',
            name: index.toString(),
            message: 'What is a type of "' + dep.name + '"?',
            choices: config.dependencies.process
        };
    });
    inquirer.prompt(questions, function (answers) {
        var identified;
        callback(identified);
    });
};
function required(input) {
    if (isEmptyString(input)) {
        return 'Value is required';
    }
    return true;
}
function isEmptyString(string) {
    return _.isEmpty(_.trim(string));
}