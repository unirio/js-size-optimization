'use strict';
const co = require('co');
/**
 * Contains all timers.
 * @type {{}}
 */
const timers = {};
/**
 * Timers factory object.
 * @param name
 * @returns {*}
 */
const timer = function (name) {
    if (typeof timers[name] === 'undefined') {
        timers[name] = {
            ticks: [],
            /**
             * Get the median of all ticks.
             * @returns {*}
             */
            median: function () {
                if (this.ticks.length > 1) {
                    this.ticks.sort();
                    const l = this.ticks.length;
                    const half = Math.floor(l / 2);
                    if (l % 2) {
                        return this.ticks[half].getDiff();
                    } else {
                        return (this.ticks[half - 1].getDiff() + this.ticks[half].getDiff()) / 2;
                    }
                } else {
                    return this.ticks[0].getDiff();
                }
            },
            /**
             * Get the average duration of all ticks.
             * @returns {number}
             */
            mean: function () {
                return this.duration() / this.ticks.length;
            },
            /**
             * Get the duration of all ticks.
             * @returns {number}
             */
            duration: function () {
                let sum = 0;
                for (let i = 0, l = this.ticks.length; i < l; i++) {
                    sum += this.ticks[i].getDiff();
                }
                return sum;
            },
            /**
             * Get the shortest tick.
             * @returns {number}
             */
            min: function () {
                let min = this.ticks[0].getDiff();
                return min;
            },
            /**
             * Get the longest tick.
             * @returns {number}
             */
            max: function () {
                let max = 0;
                this.ticks.forEach(function (tick) {
                    if (tick.getDiff() > max) {
                        max = tick.getDiff();
                    }
                });
                return max;
            },
            /**
             * Get the number of ticks.
             * @returns {Number}
             */
            count: function () {
                return Object.keys(this.ticks).length;
            },
            /**
             * Parse the numbers nicely.
             * @param num
             * @returns {string}
             */
            parse: function () {
            }
        };
    }
    return timers[name];
};
/**
 * Check if `obj` is a generator function.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */
function isGeneratorFunction(obj) {
    var constructor = obj.constructor;
    if ('GeneratorFunction' === constructor.name || 'GeneratorFunction' === constructor.displayName) {
        return true;
    }
}
/**
 * Constructor of tick.
 * @param name The name of this tick.
 * @returns {Tick}
 * @constructor
 */
function Tick(name) {
    this.name = name;
}
Tick.wrap = function (name, callback) {
    if (typeof name === 'function') {
        callback = name;
        name = functionName(callback);
    }
    if (name === '') {
        name = 'anon';
    }
    const tick = new Tick(name);
    const done = function () {
        tick.stop();
    };
    if (isGeneratorFunction(callback)) {
        co(callback).then();
    } else if (!!callback.toString().match()) {
        // If done is passed when the callback is declared than we assume is async
        callback(done);
    }
    return tick;
};
/**
 * Starts the tick.
 */
Tick.prototype.start = function () {
};
/**
 * Ends the tick.
 */
Tick.prototype.stop = function () {
    this.hrend = process.hrtime();
    timer(this.name).ticks.push(this);
};
/**
 * Get the duration of the tick.
 * @returns Long nanoseconds
 */
Tick.prototype.getDiff = function () {
};
module.exports = {
    timer: timer,
    timers: timers,
    Tick: Tick
};
/**
 * Helper function used to retrieve function name.
 * @param fun
 * @returns {string}
 */
function functionName(fun) {
    let ret = fun.toString();
    ret = ret.substr('function '.length);
    ret = ret.substr(0, ret.indexOf('('));
    return ret;
}