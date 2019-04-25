var _;
var config;
////////
ask.createUnit = function (callback) {
};
ask.pickUnit = function (units, callback) {
    if (units.length === 1) {
        return callback(_.first(units));
    }
    var question;
    inquirer.prompt(question);
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