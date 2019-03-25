var inquirer = require('inquirer');
////////
var ask = module.exports = {};
////////
ask.createUnit = function (callback) {
    var questions;
    inquirer.prompt(questions, function (answers) {
        var unit = {
            type: answers.type,
            module: { name: answers.module },
            deps: []
        };
        // unit.deps will be populated by reference
        addUnitDependency(unit.deps, function () {
            callback(unit);
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
            message: 'What is a type of "' + dep.name + '"?'
        };
    });
    inquirer.prompt(questions, function (answers) {
        var identified = _.map(answers, function (type, index) {
            var dep = deps[index];
            return dep;
        });
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