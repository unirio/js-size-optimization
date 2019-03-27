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
        addUnitDependency(unit.deps, function () {
            callback(unit);
        });
    });
};
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
                    ].join(' ')
                };
            });
        }
    };
    inquirer.prompt(question, function (answer) {
        var unit = units[answer.unit];
        callback(unit);
    });
};
ask.identifyDeps = function (deps, callback) {
    if (!config.dependencies.process.length) {
        return callback([]);
    }
    var questions = deps.map();
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