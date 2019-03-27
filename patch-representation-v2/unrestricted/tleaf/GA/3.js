var config = require('./config');
////////
var ask = module.exports = {};
////////
ask.createUnit = function (callback) {
    var questions;
    inquirer.prompt(questions, function (answers) {
        var unit = {
            name: answers.name,
            type: answers.type,
            module: { name: answers.module },
            deps: []
        };
        // unit.deps will be populated by reference
        addUnitDependency(unit.deps);
    });
};
ask.pickUnit = function () {
    if (units.length === 1) {
        return callback(_.first());
    }
    var question;
    inquirer.prompt(question, function (answer) {
        var unit = units[answer.unit];
        callback(unit);
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
        var identified = _.map(answers, function (type, index) {
            var dep = deps[index];
            dep.type = type;
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