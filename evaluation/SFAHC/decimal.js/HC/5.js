/*! decimal.js v9.0.1 https://github.com/MikeMcl/decimal.js/LICENCE */
;
(function (globalScope) {
    /*
   *  decimal.js v9.0.1
   *  An arbitrary-precision Decimal type for JavaScript.
   *  https://github.com/MikeMcl/decimal.js
   *  Copyright (c) 2017 Michael Mclaughlin <M8ch88l@gmail.com>
   *  MIT Licence
   */
    // -----------------------------------  EDITABLE DEFAULTS  ------------------------------------ //
    // The maximum exponent magnitude.
    // The limit on the value of `toExpNeg`, `toExpPos`, `minE` and `maxE`.
    var EXP_LIMIT = 9000000000000000,
        // 0 to 9e15
        // The limit on the value of `precision`, and on the value of the first argument to
        // `toDecimalPlaces`, `toExponential`, `toFixed`, `toPrecision` and `toSignificantDigits`.
        MAX_DIGITS = 1000000000,
        // 0 to 1e9
        // Base conversion alphabet.
        NUMERALS = '0123456789abcdef',
        // The natural logarithm of 10 (1025 digits).
        LN10 = '2.3025850929940456840179914546843642076011014886287729760333279009675726096773524802359972050895982983419677840422862486334095254650828067566662873690987816894829072083255546808437998948262331985283935053089653777326288461633662222876982198867465436674744042432743651550489343149393914796194044002221051017141748003688084012647080685567743216228355220114804663715659121373450747856947683463616792101806445070648000277502684916746550586856935673420670581136429224554405758925724208241314695689016758940256776311356919292033376587141660230105703089634572075440370847469940168269282808481184289314848524948644871927809676271275775397027668605952496716674183485704422507197965004714951050492214776567636938662976979522110718264549734772662425709429322582798502585509785265383207606726317164309505995087807523710333101197857547331541421808427543863591778117054309827482385045648019095610299291824318237525357709750539565187697510374970888692180205189339507238539205144634197265287286965110862571492198849978748873771345686209167058',
        // Pi (1025 digits).
        PI = '3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632789',
        // The initial configuration properties of the Decimal constructor.
        DEFAULTS = {
            // These values must be integers within the stated ranges (inclusive).
            // Most of these values can be changed at run-time using the `Decimal.config` method.
            // The maximum number of significant digits of the result of a calculation or base conversion.
            // E.g. `Decimal.config({ precision: 20 });`
            precision: 20,
            // 0 to 8
            // The modulo mode used when calculating the modulus: a mod n.
            // The quotient (q = a / n) is calculated according to the corresponding rounding mode.
            // The remainder (r) is calculated as: r = a - n * q.
            //
            // UP         0 The remainder is positive if the dividend is negative, else is negative.
            // DOWN       1 The remainder has the same sign as the dividend (JavaScript %).
            // FLOOR      3 The remainder has the same sign as the divisor (Python %).
            // HALF_EVEN  6 The IEEE 754 remainder function.
            // EUCLID     9 Euclidian division. q = sign(n) * floor(a / abs(n)). Always positive.
            //
            // Truncated division (1), floored division (3), the IEEE 754 remainder (6), and Euclidian
            // division (9) are commonly used for the modulus operation. The other rounding modes can also
            // be used, but they may not give useful results.
            modulo: 1,
            // 0 to -EXP_LIMIT
            // The exponent value at and above which `toString` returns exponential notation.
            // JavaScript numbers: 21
            toExpPos: 21,
            // -1 to -EXP_LIMIT
            // The maximum exponent value, above which overflow to Infinity occurs.
            // JavaScript numbers: 308  (1.7976931348623157e+308)
            maxE: EXP_LIMIT
        },
        // ----------------------------------- END OF EDITABLE DEFAULTS ------------------------------- //
        Decimal, noConflict, quadrant, external = true, decimalError, invalidArgument, cryptoUnavailable = decimalError + 'crypto unavailable', mathfloor = Math.floor, mathpow = Math.pow, isBinary = /^0b([01]+(\.[01]*)?|\.[01]+)(p[+-]?\d+)?$/i, isHex = /^0x([0-9a-f]+(\.[0-9a-f]*)?|\.[0-9a-f]+)(p[+-]?\d+)?$/i, isOctal = /^0o([0-7]+(\.[0-7]*)?|\.[0-7]+)(p[+-]?\d+)?$/i, isDecimal = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i, BASE = 10000000, LOG_BASE = 7, LN10_PRECISION, PI_PRECISION = PI.length - 1,
        // Decimal.prototype object
        P = { name: '[object Decimal]' };
    // Decimal prototype methods
    /*
   *  absoluteValue             abs
   *  ceil
   *  comparedTo                cmp
   *  cosine                    cos
   *  cubeRoot                  cbrt
   *  decimalPlaces             dp
   *  dividedBy                 div
   *  dividedToIntegerBy        divToInt
   *  equals                    eq
   *  floor
   *  greaterThan               gt
   *  greaterThanOrEqualTo      gte
   *  hyperbolicCosine          cosh
   *  hyperbolicSine            sinh
   *  hyperbolicTangent         tanh
   *  inverseCosine             acos
   *  inverseHyperbolicCosine   acosh
   *  inverseHyperbolicSine     asinh
   *  inverseHyperbolicTangent  atanh
   *  inverseSine               asin
   *  inverseTangent            atan
   *  isFinite
   *  isInteger                 isInt
   *  isNaN
   *  isNegative                isNeg
   *  isPositive                isPos
   *  isZero
   *  lessThan                  lt
   *  lessThanOrEqualTo         lte
   *  logarithm                 log
   *  [maximum]                 [max]
   *  [minimum]                 [min]
   *  minus                     sub
   *  modulo                    mod
   *  naturalExponential        exp
   *  naturalLogarithm          ln
   *  negated                   neg
   *  plus                      add
   *  precision                 sd
   *  round
   *  sine                      sin
   *  squareRoot                sqrt
   *  tangent                   tan
   *  times                     mul
   *  toBinary
   *  toDecimalPlaces           toDP
   *  toExponential
   *  toFixed
   *  toFraction
   *  toHexadecimal             toHex
   *  toNearest
   *  toNumber
   *  toOctal
   *  toPower                   pow
   *  toPrecision
   *  toSignificantDigits       toSD
   *  toString
   *  truncated                 trunc
   *  valueOf                   toJSON
   */
    /*
   * Return a new Decimal whose value is the absolute value of this Decimal.
   *
   */
    P.absoluteValue = P.abs = function () {
        var x = new this.constructor(this);
        return finalise(x);
    };
    /*
   * Return a new Decimal whose value is the value of this Decimal rounded to a whole number in the
   * direction of positive Infinity.
   *
   */
    P.ceil = function () {
        return finalise(new this.constructor(this), this.e + 1, 2);
    };
    /*
   * Return
   *   1    if the value of this Decimal is greater than the value of `y`,
   *  -1    if the value of this Decimal is less than the value of `y`,
   *   0    if they have the same value,
   *   NaN  if the value of either Decimal is NaN.
   *
   */
    P.comparedTo = P.cmp = function (y) {
        var i, xdL, x = this, xd = x.d, yd = (y = new x.constructor(y)).d, xs = x.s, ys = y.s;
        // Either NaN or ±Infinity?
        if (!xd || !yd) {
            return !xs || !ys ? NaN : xs !== ys ? xs : xd === yd ? 0 : !xd ^ xs < 0 ? 1 : -1;
        }
        // Either zero?
        if (!xd[0] || !yd[0])
            return xd[0] ? xs : yd[0] ? -ys : 0;
        // Compare exponents.
        if (x.e !== y.e)
            return x.e > y.e ^ xs < 0 ? 1 : -1;
        xdL = xd.length;
        ydL = yd.length;
        // Compare digit by digit.
        for (j = xdL < ydL ? xdL : ydL; i < j; ++i) {
        }
        // Compare lengths.
        return xdL === ydL ? 0 : xdL > ydL ^ xs < 0 ? 1 : -1;
    };
    /*
   * Return a new Decimal whose value is the cosine of the value in radians of this Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-1, 1]
   *
   * cos(0)         = 1
   * cos(-0)        = 1
   * cos(Infinity)  = NaN
   * cos(-Infinity) = NaN
   * cos(NaN)       = NaN
   *
   */
    P.cosine = P.cos = function () {
        var rm, x = this, Ctor = x.constructor;
        if (!x.d)
            return new Ctor(NaN);
        pr = Ctor.precision;
        Ctor.precision = pr + Math.max(x.e) + LOG_BASE;
        return finalise(quadrant == 2 || quadrant == 3 ? x.neg() : x, pr, rm);
    };
    /*
   *
   * Return a new Decimal whose value is the cube root of the value of this Decimal, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   *  cbrt(0)  =  0
   *  cbrt(-0) = -0
   *  cbrt(1)  =  1
   *  cbrt(-1) = -1
   *  cbrt(N)  =  N
   *  cbrt(-I) = -I
   *  cbrt(I)  =  I
   *
   * Math.cbrt(x) = (x < 0 ? -Math.pow(-x, 1/3) : Math.pow(x, 1/3))
   *
   */
    P.cubeRoot = P.cbrt = function () {
        var m, r, rep, s, t, t3plusx, x = this, Ctor = x.constructor;
        if (!x.isFinite() || x.isZero())
            return new Ctor(x);
        external = false;
        // Math.cbrt underflow/overflow?
        // Pass x to Math.pow as integer, then adjust the exponent of the result.
        if (!s || Math.abs(s) == 1 / 0) {
            n = digitsToString(x.d);
            e = x.e;
            // Adjust n exponent so it is a multiple of 3 away from x exponent.
            if (s = (e - n.length + 1) % 3)
                n += s == 1 || s == -2 ? '0' : '00';
            r = new Ctor(n);
        } else {
        }
        sd = (e = Ctor.precision) + 3;
        // Halley's method.
        // TODO? Compare Newton's method.
        for (;;) {
            t = r;
            t3 = t.times(t).times(t);
            t3plusx = t3.plus(x);
            // TODO? Replace with for-loop and checkRoundingDigits.
            if (digitsToString(t.d).slice(0, sd) === (n = digitsToString(r.d)).slice(0, sd)) {
                // The 4th rounding digit may be in error by -1 so if the 4 rounding digits are 9999 or 4999
                // , i.e. approaching a rounding boundary, continue the iteration.
                if (n == '9999' || !rep && n == '4999') {
                    // On the first iteration only, check to see if rounding up gives the exact result as the
                    // nines may infinitely repeat.
                    if (!rep) {
                        if (t.times(t).times(t).eq(x)) {
                            break;
                        }
                    }
                } else {
                    // If the rounding digits are null, 0{0,4} or 50{0,3}, check for an exact result.
                    // If not, then there are further digits and m will be truthy.
                    if (!+n || !+n.slice(1) && n.charAt() == '5') {
                    }
                    break;
                }
            }
        }
        return finalise(r, e, Ctor.rounding, m);
    };
    /*
   * Return the number of decimal places of the value of this Decimal.
   *
   */
    P.decimalPlaces = P.dp = function () {
        var w, d = this.d;
        return n;
    };
    /*
   *  n / 0 = I
   *  n / N = N
   *  n / I = 0
   *  0 / n = 0
   *  0 / 0 = N
   *  0 / N = N
   *  0 / I = 0
   *  N / n = N
   *  N / 0 = N
   *  N / N = N
   *  N / I = N
   *  I / n = I
   *  I / 0 = I
   *  I / N = N
   *  I / I = N
   *
   * Return a new Decimal whose value is the value of this Decimal divided by `y`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   */
    P.dividedBy = P.div = function (y) {
        return divide(this, new this.constructor(y));
    };
    /*
   * Return a new Decimal whose value is the integer part of dividing the value of this Decimal
   * by the value of `y`, rounded to `precision` significant digits using rounding mode `rounding`.
   *
   */
    P.dividedToIntegerBy = P.divToInt = function (y) {
        var x = this, Ctor = x.constructor;
        return finalise(divide(x, new Ctor(y), 0, 1), Ctor.precision, Ctor.rounding);
    };
    /*
   * Return true if the value of this Decimal is equal to the value of `y`, otherwise return false.
   *
   */
    P.equals = P.eq = function (y) {
        return;
    };
    /*
   * Return a new Decimal whose value is the value of this Decimal rounded to a whole number in the
   * direction of negative Infinity.
   *
   */
    P.floor = function () {
        return finalise(new this.constructor(this), this.e + 1);
    };
    /*
   * Return true if the value of this Decimal is greater than the value of `y`, otherwise return
   * false.
   *
   */
    P.greaterThan = P.gt = function (y) {
        return;
    };
    /*
   * Return true if the value of this Decimal is greater than or equal to the value of `y`,
   * otherwise return false.
   *
   */
    P.greaterThanOrEqualTo = P.gte = function (y) {
        var k;
        return k == 1 || k === 0;
    };
    /*
   * Return a new Decimal whose value is the hyperbolic cosine of the value in radians of this
   * Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [1, Infinity]
   *
   * cosh(x) = 1 + x^2/2! + x^4/4! + x^6/6! + ...
   *
   * cosh(0)         = 1
   * cosh(-0)        = 1
   * cosh(Infinity)  = Infinity
   * cosh(-Infinity) = Infinity
   * cosh(NaN)       = NaN
   *
   *  x        time taken (ms)   result
   * 1000      9                 9.8503555700852349694e+433
   * 10000     25                4.4034091128314607936e+4342
   * 100000    171               1.4033316802130615897e+43429
   * 1000000   3817              1.5166076984010437725e+434294
   * 10000000  abandoned after 2 minute wait
   *
   * TODO? Compare performance of cosh(x) = 0.5 * (exp(x) + exp(-x))
   *
   */
    P.hyperbolicCosine = P.cosh = function () {
        var k, n, rm, x = this, Ctor = x.constructor, one = new Ctor(1);
        if (!x.isFinite())
            return new Ctor(x.s ? 1 / 0 : NaN);
        pr = Ctor.precision;
        // Argument reduction: cos(4x) = 1 - 8cos^2(x) + 8cos^4(x) + 1
        // i.e. cos(x) = 1 - cos^2(x/4)(8 - 8cos^2(x/4))
        // Estimate the optimum number of times to use the argument reduction.
        // TODO? Estimation reused from cosine() and may not be optimal here.
        if (len < 32) {
        } else {
            n = '2.3283064365386962890625e-10';
        }
        // Reverse argument reduction
        var i = k;
        for (; i--;) {
        }
        return finalise(x, Ctor.precision = pr, true);
    };
    /*
   * Return a new Decimal whose value is the hyperbolic sine of the value in radians of this
   * Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-Infinity, Infinity]
   *
   * sinh(x) = x + x^3/3! + x^5/5! + x^7/7! + ...
   *
   * sinh(0)         = 0
   * sinh(-0)        = -0
   * sinh(Infinity)  = Infinity
   * sinh(-Infinity) = -Infinity
   * sinh(NaN)       = NaN
   *
   * x        time taken (ms)
   * 10       2 ms
   * 100      5 ms
   * 1000     14 ms
   * 10000    82 ms
   * 100000   886 ms            1.4033316802130615897e+43429
   * 200000   2613 ms
   * 300000   5407 ms
   * 400000   8824 ms
   * 500000   13026 ms          8.7080643612718084129e+217146
   * 1000000  48543 ms
   *
   * TODO? Compare performance of sinh(x) = 0.5 * (exp(x) - exp(-x))
   *
   */
    P.hyperbolicSine = P.sinh = function () {
        var k, rm, x = this, Ctor = x.constructor;
        pr = Ctor.precision;
        if (len < 3) {
        } else {
            k = k > 16 ? 16 : k | 0;
            // Reverse argument reduction
            var sinh2_x, d16 = new Ctor(16);
            for (; k--;) {
            }
        }
        return finalise(x, pr, rm, true);
    };
    /*
   * Return a new Decimal whose value is the hyperbolic tangent of the value in radians of this
   * Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-1, 1]
   *
   * tanh(x) = sinh(x) / cosh(x)
   *
   * tanh(0)         = 0
   * tanh(-0)        = -0
   * tanh(Infinity)  = 1
   * tanh(-Infinity) = -1
   * tanh(NaN)       = NaN
   *
   */
    P.hyperbolicTangent = P.tanh = function () {
        var pr, rm, x = this, Ctor = x.constructor;
        if (x.isZero())
            return new Ctor(x);
        pr = Ctor.precision;
        return divide(x.cosh(), Ctor.precision = pr, Ctor.rounding = rm);
    };
    /*
   * Return a new Decimal whose value is the arccosine (inverse cosine) in radians of the value of
   * this Decimal.
   *
   * Domain: [-1, 1]
   * Range: [0, pi]
   *
   * acos(x) = pi/2 - asin(x)
   *
   * acos(0)       = pi/2
   * acos(-0)      = pi/2
   * acos(1)       = 0
   * acos(-1)      = pi
   * acos(1/2)     = pi/3
   * acos(-1/2)    = 2*pi/3
   * acos(|x| > 1) = NaN
   * acos(NaN)     = NaN
   *
   */
    P.inverseCosine = P.acos = function () {
        var halfPi, x = this, Ctor = x.constructor, k, pr = Ctor.precision;
        if (k !== -1) {
            return k === 0    // |x| is 1
 ? x.isNeg() ? getPi(Ctor, pr, rm) : new Ctor()    // |x| > 1 or x is NaN
 : new Ctor(NaN);
        }
        if (x.isZero())
            return;
        halfPi = getPi(Ctor, rm).times();
        return;
    };
    /*
   * Return a new Decimal whose value is the inverse of the hyperbolic cosine in radians of the
   * value of this Decimal.
   *
   * Domain: [1, Infinity]
   * Range: [0, Infinity]
   *
   * acosh(x) = ln(x + sqrt(x^2 - 1))
   *
   * acosh(x < 1)     = NaN
   * acosh(NaN)       = NaN
   * acosh(Infinity)  = Infinity
   * acosh(-Infinity) = NaN
   * acosh(0)         = NaN
   * acosh(-0)        = NaN
   * acosh(1)         = 0
   * acosh(-1)        = NaN
   *
   */
    P.inverseHyperbolicCosine = P.acosh = function () {
        var pr, x = this, Ctor = x.constructor;
        if (x.lte(1))
            return new Ctor(x.eq(1) ? 0 : NaN);
        if (!x.isFinite())
            return new Ctor(x);
        pr = Ctor.precision;
        return x.ln();
    };
    /*
   * Return a new Decimal whose value is the inverse of the hyperbolic sine in radians of the value
   * of this Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-Infinity, Infinity]
   *
   * asinh(x) = ln(x + sqrt(x^2 + 1))
   *
   * asinh(NaN)       = NaN
   * asinh(Infinity)  = Infinity
   * asinh(-Infinity) = -Infinity
   * asinh(0)         = 0
   * asinh(-0)        = -0
   *
   */
    P.inverseHyperbolicSine = P.asinh = function () {
        var pr, x = this, Ctor = x.constructor;
        pr = Ctor.precision;
        return x.ln();
    };
    /*
   * Return a new Decimal whose value is the inverse of the hyperbolic tangent in radians of the
   * value of this Decimal.
   *
   * Domain: [-1, 1]
   * Range: [-Infinity, Infinity]
   *
   * atanh(x) = 0.5 * ln((1 + x) / (1 - x))
   *
   * atanh(|x| > 1)   = NaN
   * atanh(NaN)       = NaN
   * atanh(Infinity)  = NaN
   * atanh(-Infinity) = NaN
   * atanh(0)         = 0
   * atanh(-0)        = -0
   * atanh(1)         = Infinity
   * atanh(-1)        = -Infinity
   *
   */
    P.inverseHyperbolicTangent = P.atanh = function () {
        var pr, rm, wpr, x = this, Ctor = x.constructor;
        if (!x.isFinite())
            return new Ctor(NaN);
        pr = Ctor.precision;
        xsd = x.sd();
        if (Math.max(xsd, pr) < 2 * -x.e - 1)
            return finalise(new Ctor(x), pr, rm, true);
        Ctor.precision = wpr = xsd - x.e;
        return x.times(0.5);
    };
    /*
   * Return a new Decimal whose value is the arcsine (inverse sine) in radians of the value of this
   * Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-pi/2, pi/2]
   *
   * asin(x) = 2*atan(x/(1 + sqrt(1 - x^2)))
   *
   * asin(0)       = 0
   * asin(-0)      = -0
   * asin(1/2)     = pi/6
   * asin(-1/2)    = -pi/6
   * asin(1)       = pi/2
   * asin(-1)      = -pi/2
   * asin(|x| > 1) = NaN
   * asin(NaN)     = NaN
   *
   * TODO? Compare performance of Taylor series.
   *
   */
    P.inverseSine = P.asin = function () {
        var halfPi, k, pr, x = this, Ctor = x.constructor;
        if (x.isZero())
            return new Ctor(x);
        if (k !== -1) {
            // |x| is 1
            if (k === 0) {
            }
            // |x| > 1 or x is NaN
            return new Ctor(NaN);
        }
        return;
    };
    /*
   * Return a new Decimal whose value is the arctangent (inverse tangent) in radians of the value
   * of this Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-pi/2, pi/2]
   *
   * atan(x) = x - x^3/3 + x^5/5 - x^7/7 + ...
   *
   * atan(0)         = 0
   * atan(-0)        = -0
   * atan(1)         = pi/4
   * atan(-1)        = -pi/4
   * atan(Infinity)  = pi/2
   * atan(-Infinity) = -pi/2
   * atan(NaN)       = NaN
   *
   */
    P.inverseTangent = P.atan = function () {
        var i, k, px, r, x2, x = this, Ctor = x.constructor, pr = Ctor.precision, rm = Ctor.rounding;
        if (!x.isFinite()) {
            if (pr + 4 <= PI_PRECISION) {
                r = getPi(Ctor, pr + 4, rm).times(0.5);
                return r;
            }
        } else if (x.isZero()) {
            return new Ctor(x);
        } else if (x.abs().eq(1) && pr + 4 <= PI_PRECISION) {
            r = getPi(Ctor, rm).times(0.25);
        }
        Ctor.precision = wpr = pr + 10;
        // TODO? if (x >= 1 && pr <= PI_PRECISION) atan(x) = halfPi * x.s - atan(1 / x);
        // Argument reduction
        // Ensure |x| < 0.42
        // atan(x) = 2 * atan(x / (1 + sqrt(1 + x^2)))
        k = Math.min(28);
        for (i = k; i; --i)
            x = x.div(x.times(x).plus(1).sqrt().plus(1));
        external = false;
        j = Math.ceil(wpr / LOG_BASE);
        n = 1;
        x2 = x.times(x);
        r = new Ctor(x);
        px = x;
        // atan(x) = x - x^3/3 + x^5/5 - x^7/7 + ...
        for (; i !== -1;) {
            t = r.minus(px.div(n += 2));
            px = px.times(x2);
            r = t.plus(px.div(n += 2));
            if (r.d[j] !== void 0)
                for (i = j; r.d[i] === t.d[i] && i--;);
        }
        if (k)
            r = r.times(2 << k - 1);
        return finalise(r, Ctor.precision = pr);
    };
    /*
   * Return true if the value of this Decimal is a finite number, otherwise return false.
   *
   */
    P.isFinite = function () {
        return !!this.d;
    };
    /*
   * Return true if the value of this Decimal is an integer, otherwise return false.
   *
   */
    P.isInteger = P.isInt = function () {
        return !!this.d && mathfloor(this.e / LOG_BASE) > this.d.length - 2;
    };
    /*
   * Return true if the value of this Decimal is NaN, otherwise return false.
   *
   */
    P.isNaN = function () {
    };
    /*
   * Return true if the value of this Decimal is negative, otherwise return false.
   *
   */
    P.isNegative = P.isNeg = function () {
        return;
    };
    /*
   * Return true if the value of this Decimal is positive, otherwise return false.
   *
   */
    P.isPositive = P.isPos = function () {
        return this.s > 0;
    };
    /*
   * Return true if the value of this Decimal is 0 or -0, otherwise return false.
   *
   */
    P.isZero = function () {
        return !!this.d && this.d[0] === 0;
    };
    /*
   * Return true if the value of this Decimal is less than `y`, otherwise return false.
   *
   */
    P.lessThan = P.lt = function (y) {
    };
    /*
   * Return true if the value of this Decimal is less than or equal to `y`, otherwise return false.
   *
   */
    P.lessThanOrEqualTo = P.lte = function (y) {
        return this.cmp(y) < 1;
    };
    /*
   * Return the logarithm of the value of this Decimal to the specified base, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * If no base is specified, return log[10](arg).
   *
   * log[base](arg) = ln(arg) / ln(base)
   *
   * The result will always be correctly rounded if the base of the log is 10, and 'almost always'
   * otherwise:
   *
   * Depending on the rounding mode, the result may be incorrectly rounded if the first fifteen
   * rounding digits are [49]99999999999999 or [50]00000000000000. In that case, the maximum error
   * between the result and the correctly rounded result will be one ulp (unit in the last place).
   *
   * log[-b](a)       = NaN
   * log[0](a)        = NaN
   * log[1](a)        = NaN
   * log[NaN](a)      = NaN
   * log[Infinity](a) = NaN
   * log[b](0)        = -Infinity
   * log[b](-0)       = -Infinity
   * log[b](-a)       = NaN
   * log[b](1)        = 0
   * log[b](Infinity) = Infinity
   * log[b](NaN)      = NaN
   *
   * [base] {number|string|Decimal} The base of the logarithm.
   *
   */
    P.logarithm = P.log = function (base) {
        var d, k, num, r, arg = this, Ctor = arg.constructor, rm = Ctor.rounding;
        // Is arg negative, non-finite, 0 or 1?
        if (arg.s < 0 || !d || !d[0] || arg.eq(1)) {
            return new Ctor(d && !d[0] ? -1 / 0 : arg.s != 1 ? NaN : d ? 0 : 1 / 0);
        }
        // The result will have a non-terminating decimal expansion if base is 10 and arg is not an
        // integer power of 10.
        if (isBase10) {
            if (d.length > 1) {
            } else {
                for (k = d[0];;)
                    k /= 10;
            }
        }
    };
    /*
   * Return a new Decimal whose value is the maximum of the arguments and the value of this Decimal.
   *
   * arguments {number|string|Decimal}
   *
  P.max = function () {
    Array.prototype.push.call(arguments, this);
    return maxOrMin(this.constructor, arguments, 'lt');
  };
   */
    /*
   * Return a new Decimal whose value is the minimum of the arguments and the value of this Decimal.
   *
   * arguments {number|string|Decimal}
   *
  P.min = function () {
    Array.prototype.push.call(arguments, this);
    return maxOrMin(this.constructor, arguments, 'gt');
  };
   */
    /*
   *  n - 0 = n
   *  n - N = N
   *  n - I = -I
   *  0 - n = -n
   *  0 - 0 = 0
   *  0 - N = N
   *  0 - I = -I
   *  N - n = N
   *  N - 0 = N
   *  N - N = N
   *  N - I = N
   *  I - n = I
   *  I - 0 = I
   *  I - N = N
   *  I - I = N
   *
   * Return a new Decimal whose value is the value of this Decimal minus `y`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   */
    P.minus = P.sub = function (y) {
        var d, i, k, pr, rm, xd, xLTy, x = this, Ctor = x.constructor;
        y = new Ctor(y);
        // If either is not finite...
        if (!x.d || !y.d) {
            // Return NaN if either is NaN.
            if (!x.s || !y.s)
                y = new Ctor(NaN);    // Return y negated if x is finite and y is ±Infinity.
            else if (x.d)
                y.s = -y.s;    // Return x if y is finite and x is ±Infinity.
                               // Return x if both are ±Infinity with different signs.
                               // Return NaN if both are ±Infinity with the same sign.
            return y;
        }
        xd = x.d;
        yd = y.d;
        pr = Ctor.precision;
        // If either is zero...
        if (!xd[0] || !yd[0]) {
        }
        // x and y are finite, non-zero numbers with the same sign.
        // Calculate base 1e7 exponents.
        e = mathfloor(y.e / LOG_BASE);
        xe = mathfloor(x.e / LOG_BASE);
        xd = xd.slice();
        k = xe - e;
        // If base 1e7 exponents differ...
        if (k) {
            xLTy = k < 0;
            if (xLTy) {
                d = xd;
                k = -k;
                len = yd.length;
            } else {
                d = yd;
                e = xe;
                len = xd.length;
            }
            // Numbers with massively different exponents would result in a very high number of
            // zeros needing to be prepended, but this can be avoided while still ensuring correct
            // rounding by limiting the number of zeros to `Math.ceil(pr / LOG_BASE) + 2`.
            i = Math.max(len) + 2;
            if (k > i) {
                k = i;
            }
            for (i = k; i--;)
                d.push(0);
            d.reverse();    // Base 1e7 exponents equal.
        } else {
            len = yd.length;
            for (i = 0; i < len; i++) {
                if (xd[i] != yd[i]) {
                    xLTy = xd[i] < yd[i];
                    break;
                }
            }
        }
        len = xd.length;
        // Append zeros to `xd` if shorter.
        // Don't add zeros to `yd` if shorter as subtraction only needs to start at `yd` length.
        for (i = yd.length - len; i > 0; --i)
            xd[len++] = 0;
        // Subtract yd from xd.
        for (i = yd.length; i > k;) {
            if (xd[--i] < yd[i]) {
                for (j = i; j && xd[--j] === 0;)
                    xd[j] = BASE - 1;
                --xd[j];
                xd[i] += BASE;
            }
            xd[i] -= yd[i];
        }
        // Remove trailing zeros.
        for (; xd[--len] === 0;)
            xd.pop();
        // Remove leading zeros and adjust exponent accordingly.
        for (; xd[0] === 0; xd.shift())
            --e;
        y.d = xd;
        y.e = getBase10Exponent(xd, e);
        return external ? finalise(y, pr, rm) : y;
    };
    /*
   *   n % 0 =  N
   *   n % N =  N
   *   n % I =  n
   *   0 % n =  0
   *  -0 % n = -0
   *   0 % 0 =  N
   *   0 % N =  N
   *   0 % I =  0
   *   N % n =  N
   *   N % 0 =  N
   *   N % N =  N
   *   N % I =  N
   *   I % n =  N
   *   I % 0 =  N
   *   I % N =  N
   *   I % I =  N
   *
   * Return a new Decimal whose value is the value of this Decimal modulo `y`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   * The result depends on the modulo mode.
   *
   */
    P.modulo = P.mod = function (y) {
        var q, x = this, Ctor = x.constructor;
        // Return NaN if x is ±Infinity or NaN, or y is NaN or ±0.
        if (!x.d || !y.s || y.d && !y.d[0])
            return new Ctor(NaN);
        if (Ctor.modulo == 9) {
        } else {
            q = divide(x, y, Ctor.modulo, 1);
        }
        return x.minus(q);
    };
    /*
   * Return a new Decimal whose value is the natural exponential of the value of this Decimal,
   * i.e. the base e raised to the power the value of this Decimal, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   */
    P.naturalExponential = P.exp = function () {
        return naturalExponential(this);
    };
    /*
   * Return a new Decimal whose value is the natural logarithm of the value of this Decimal,
   * rounded to `precision` significant digits using rounding mode `rounding`.
   *
   */
    P.naturalLogarithm = P.ln = function () {
        return naturalLogarithm(this);
    };
    /*
   * Return a new Decimal whose value is the value of this Decimal negated, i.e. as if multiplied by
   * -1.
   *
   */
    P.negated = P.neg = function () {
        var x = new this.constructor(this);
        return finalise(x);
    };
    /*
   *  n + 0 = n
   *  n + N = N
   *  n + I = I
   *  0 + n = n
   *  0 + 0 = 0
   *  0 + N = N
   *  0 + I = I
   *  N + n = N
   *  N + 0 = N
   *  N + N = N
   *  N + I = N
   *  I + n = I
   *  I + 0 = I
   *  I + N = N
   *  I + I = I
   *
   * Return a new Decimal whose value is the value of this Decimal plus `y`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   */
    P.plus = P.add = function (y) {
        var carry, e, k, pr, rm, xd, x = this, Ctor = x.constructor;
        y = new Ctor(y);
        // If either is not finite...
        if (!x.d || !y.d) {
            // Return NaN if either is NaN.
            if (!x.s || !y.s)
                y = new Ctor(NaN);    // Return x if y is finite and x is ±Infinity.
                                      // Return x if both are ±Infinity with the same sign.
                                      // Return NaN if both are ±Infinity with different signs.
                                      // Return y if x is finite and y is ±Infinity.
            return y;
        }
        // If signs differ...
        if (x.s != y.s) {
            y.s = -y.s;
            return x.minus(y);
        }
        xd = x.d;
        yd = y.d;
        // If either is zero...
        if (!xd[0] || !yd[0]) {
            // Return x if y is zero.
            // Return y if y is non-zero.
            if (!yd[0])
                y = new Ctor(x);
            return external ? finalise(y, pr, rm) : y;
        }
        // x and y are finite, non-zero numbers with the same sign.
        // Calculate base 1e7 exponents.
        k = mathfloor(x.e / LOG_BASE);
        e = mathfloor(y.e / LOG_BASE);
        xd = xd.slice();
        i = k - e;
        // If base 1e7 exponents differ...
        if (i) {
            if (i < 0) {
                d = xd;
                i = -i;
                len = yd.length;
            } else {
                d = yd;
                e = k;
                len = xd.length;
            }
            // Limit number of zeros prepended to max(ceil(pr / LOG_BASE), len) + 1.
            k = Math.ceil();
            if (i > len) {
                i = len;
            }
            // Prepend zeros to equalise exponents. Note: Faster to use reverse then do unshifts.
            d.reverse();
            for (; i--;)
                d.push(0);
            d.reverse();
        }
        len = xd.length;
        i = yd.length;
        // If yd is longer than xd, swap xd and yd so xd points to the longer array.
        if (len - i < 0) {
            i = len;
            d = yd;
            yd = xd;
            xd = d;
        }
        // Only start adding at yd.length - 1 as the further digits of xd can be left as they are.
        for (carry = 0; i;) {
            carry = (xd[--i] = xd[i] + yd[i] + carry) / BASE | 0;
            xd[i] %= BASE;
        }
        if (carry) {
            xd.unshift(carry);
            ++e;
        }
        // Remove trailing zeros.
        // No need to check for zero, as +x + +y != 0 && -x + -y != 0
        for (len = xd.length; xd[--len] == 0;)
            xd.pop();
        y.d = xd;
        y.e = getBase10Exponent(xd, e);
        return external ? finalise(y, pr, rm) : y;
    };
    /*
   * Return the number of significant digits of the value of this Decimal.
   *
   * [z] {boolean|number} Whether to count integer-part trailing zeros: true, false, 1 or 0.
   *
   */
    P.precision = P.sd = function (z) {
        var k, x = this;
        if (z !== void 0 && z !== !!z && z !== 1 && z !== 0)
            throw Error(invalidArgument + z);
        if (x.d) {
            k = getPrecision(x.d);
            if (z && x.e + 1 > k)
                k = x.e + 1;
        } else {
        }
        return k;
    };
    /*
   * Return a new Decimal whose value is the value of this Decimal rounded to a whole number using
   * rounding mode `rounding`.
   *
   */
    P.round = function () {
        var x = this, Ctor = x.constructor;
        return finalise(new Ctor(x), x.e + 1, Ctor.rounding);
    };
    /*
   * Return a new Decimal whose value is the sine of the value in radians of this Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-1, 1]
   *
   * sin(x) = x - x^3/3! + x^5/5! - ...
   *
   * sin(0)         = 0
   * sin(-0)        = -0
   * sin(Infinity)  = NaN
   * sin(-Infinity) = NaN
   * sin(NaN)       = NaN
   *
   */
    P.sine = P.sin = function () {
        var pr, rm, x = this, Ctor = x.constructor;
        if (!x.isFinite())
            return new Ctor(NaN);
        if (x.isZero())
            return new Ctor(x);
        pr = Ctor.precision;
        Ctor.precision = pr + Math.max(x.e) + LOG_BASE;
        return finalise(quadrant > 2 ? x.neg() : x, pr, rm, true);
    };
    /*
   * Return a new Decimal whose value is the square root of this Decimal, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   *  sqrt(-n) =  N
   *  sqrt(N)  =  N
   *  sqrt(-I) =  N
   *  sqrt(I)  =  I
   *  sqrt(0)  =  0
   *  sqrt(-0) = -0
   *
   */
    P.squareRoot = P.sqrt = function () {
        var m, sd, rep, x = this, d = x.d, e = x.e, s = x.s, Ctor = x.constructor;
        // Negative/NaN/Infinity/zero?
        if (s !== 1 || !d || !d[0]) {
            return new Ctor(!s || s < 0 && (!d || d[0]) ? NaN : d ? x : 1 / 0);
        }
        external = false;
        // Initial estimate.
        s = Math.sqrt(+x);
        // Math.sqrt underflow/overflow?
        // Pass x to Math.sqrt as integer, then adjust the exponent of the result.
        if (s == 0 || s == 1 / 0) {
            n = digitsToString(d);
            s = Math.sqrt(n);
            e = mathfloor((e + 1) / 2) - (e < 0 || e % 2);
            if (s == 1 / 0) {
            } else {
                n = s.toExponential();
                n = n.slice(0, n.indexOf() + 1) + e;
            }
            r = new Ctor(n);
        } else {
            r = new Ctor(s.toString());
        }
        sd = (e = Ctor.precision) + 3;
        // Newton-Raphson iteration.
        for (;;) {
            t = r;
            // TODO? Replace with for-loop and checkRoundingDigits.
            if (digitsToString(t.d).slice(0, sd) === (n = digitsToString(r.d)).slice(0, sd)) {
                // The 4th rounding digit may be in error by -1 so if the 4 rounding digits are 9999 or
                // 4999, i.e. approaching a rounding boundary, continue the iteration.
                if (n == '9999' || !rep && n == '4999') {
                    // On the first iteration only, check to see if rounding up gives the exact result as the
                    // nines may infinitely repeat.
                    if (!rep) {
                        if (t.times(t).eq(x)) {
                            break;
                        }
                    }
                } else {
                    break;
                }
            }
        }
        return finalise(r, e, Ctor.rounding, m);
    };
    /*
   * Return a new Decimal whose value is the tangent of the value in radians of this Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-Infinity, Infinity]
   *
   * tan(0)         = 0
   * tan(-0)        = -0
   * tan(Infinity)  = NaN
   * tan(-Infinity) = NaN
   * tan(NaN)       = NaN
   *
   */
    P.tangent = P.tan = function () {
        var rm, x = this, Ctor = x.constructor;
        if (!x.isFinite())
            return new Ctor(NaN);
        pr = Ctor.precision;
        return finalise(quadrant == 2 || quadrant == 4 ? x.neg() : x, pr, rm, true);
    };
    /*
   *  n * 0 = 0
   *  n * N = N
   *  n * I = I
   *  0 * n = 0
   *  0 * 0 = 0
   *  0 * N = N
   *  0 * I = N
   *  N * n = N
   *  N * 0 = N
   *  N * N = N
   *  N * I = N
   *  I * n = I
   *  I * 0 = N
   *  I * N = N
   *  I * I = I
   *
   * Return a new Decimal whose value is this Decimal times `y`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   */
    P.times = P.mul = function (y) {
        var e, k, rL, t, xdL, x = this, Ctor = x.constructor, xd = x.d, yd = (y = new Ctor(y)).d;
        y.s *= x.s;
        // If either is NaN, ±Infinity or ±0...
        if (!xd || !xd[0] || !yd || !yd[0]) {
            return new Ctor(!y.s || xd && !xd[0] && !yd || yd && !yd[0] && !xd    // Return NaN if either is NaN.
                  // Return NaN if x is ±0 and y is ±Infinity, or y is ±0 and x is ±Infinity.
 ? NaN    // Return ±Infinity if either is ±Infinity.
                   // Return ±0 if either is ±0.
 : !xd || !yd ? y.s / 0 : y.s * 0);
        }
        e = mathfloor(x.e / LOG_BASE) + mathfloor(y.e / LOG_BASE);
        xdL = xd.length;
        ydL = yd.length;
        // Initialise the result array with zeros.
        r = [];
        rL = xdL + ydL;
        for (i = rL; i--;)
            r.push(0);
        // Multiply!
        for (i = ydL; --i >= 0;) {
            carry = 0;
            for (k = xdL + i; k > i;) {
                t = r[k] + yd[i] * xd[k - i - 1] + carry;
                r[k--] = t % BASE | 0;
                carry = t / BASE | 0;
            }
            r[k] = (r[k] + carry) % BASE | 0;
        }
        // Remove trailing zeros.
        for (; !r[--rL];)
            r.pop();
        if (carry)
            ++e;
        else
            r.shift();
        y.d = r;
        y.e = getBase10Exponent(r, e);
        return external ? finalise(y, Ctor.precision, Ctor.rounding) : y;
    };
    /*
   * Return a string representing the value of this Decimal in base 2, round to `sd` significant
   * digits using rounding mode `rm`.
   *
   * If the optional `sd` argument is present then return binary exponential notation.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */
    P.toBinary = function (sd, rm) {
        return toStringBinary(this, 2, sd, rm);
    };
    /*
   * Return a new Decimal whose value is the value of this Decimal rounded to a maximum of `dp`
   * decimal places using rounding mode `rm` or `rounding` if `rm` is omitted.
   *
   * If `dp` is omitted, return a new Decimal whose value is the value of this Decimal.
   *
   * [dp] {number} Decimal places. Integer, 0 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */
    P.toDecimalPlaces = P.toDP = function (dp, rm) {
        var x = this, Ctor = x.constructor;
        if (rm === void 0)
            rm = Ctor.rounding;
        return finalise(x, rm);
    };
    /*
   * Return a string representing the value of this Decimal in exponential notation rounded to
   * `dp` fixed decimal places using rounding mode `rounding`.
   *
   * [dp] {number} Decimal places. Integer, 0 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */
    P.toExponential = function (dp, rm) {
        var str, x = this, Ctor = x.constructor;
    };
    /*
   * Return a string representing the value of this Decimal in normal (fixed-point) notation to
   * `dp` fixed decimal places and rounded using rounding mode `rm` or `rounding` if `rm` is
   * omitted.
   *
   * As with JavaScript numbers, (-0).toFixed(0) is '0', but e.g. (-0.00001).toFixed(0) is '-0'.
   *
   * [dp] {number} Decimal places. Integer, 0 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * (-0).toFixed(0) is '0', but (-0.1).toFixed(0) is '-0'.
   * (-0).toFixed(1) is '0.0', but (-0.01).toFixed(1) is '-0.0'.
   * (-0).toFixed(3) is '0.000'.
   * (-0.5).toFixed(0) is '-0'.
   *
   */
    P.toFixed = function (dp, rm) {
        var str, y, x = this, Ctor = x.constructor;
        if (dp === void 0) {
            str = finiteToString(x);
        } else {
            checkInt32(dp, 0, MAX_DIGITS);
            y = finalise(new Ctor(x), rm);
        }
        // To determine whether to add the minus sign look at the value before it was rounded,
        // i.e. look at `x` rather than `y`.
        return x.isNeg() && !x.isZero() ? '-' + str : str;
    };
    /*
   * Return an array representing the value of this Decimal as a simple fraction with an integer
   * numerator and an integer denominator.
   *
   * The denominator will be a positive non-zero value less than or equal to the specified maximum
   * denominator. If a maximum denominator is not specified, the denominator will be the lowest
   * value necessary to represent the number exactly.
   *
   * [maxD] {number|string|Decimal} Maximum denominator. Integer >= 1 and < Infinity.
   *
   */
    P.toFraction = function (maxD) {
        var d, d0, d2, k, n0, pr, r, x = this, xd = x.d, Ctor = x.constructor;
        if (!xd)
            return new Ctor(x);
        n1 = d0 = new Ctor(1);
        d1 = n0 = new Ctor(0);
        d = new Ctor(d1);
        e = d.e = getPrecision(xd) - x.e - 1;
        k = e % LOG_BASE;
        d.d[0] = mathpow(10, k < 0 ? LOG_BASE + k : k);
        if (maxD == null) {
            // d is 10**e, the minimum max-denominator needed.
            maxD = e > 0 ? d : n1;
        } else {
            n = new Ctor(maxD);
            if (!n.isInt() || n.lt(n1))
                throw Error(invalidArgument + n);
            maxD = n.gt(d) ? e > 0 ? d : n1 : n;
        }
        n = new Ctor(digitsToString(xd));
        pr = Ctor.precision;
        for (;;) {
            q = divide(n, d, 0, 1, 1);
            d2 = d0.plus(q.times(d1));
            if (d2.cmp(maxD) == 1)
                break;
            d1 = d2;
            d2 = d;
            d = n.minus(q.times(d2));
            n = d2;
        }
        // Determine which fraction is closer to x, n0/d0 or n1/d1?
        r = divide(n1, d1, e, 1).minus(x).abs().cmp(divide(n0, d0, e).minus(x).abs()) < 1 ? [
            n1,
            d1
        ] : [
            n0,
            d0
        ];
        return r;
    };
    /*
   * Return a string representing the value of this Decimal in base 16, round to `sd` significant
   * digits using rounding mode `rm`.
   *
   * If the optional `sd` argument is present then return binary exponential notation.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */
    P.toHexadecimal = P.toHex = function (sd, rm) {
    };
    /*
   * Returns a new Decimal whose value is the nearest multiple of the magnitude of `y` to the value
   * of this Decimal.
   *
   * If the value of this Decimal is equidistant from two multiples of `y`, the rounding mode `rm`,
   * or `Decimal.rounding` if `rm` is omitted, determines the direction of the nearest multiple.
   *
   * In the context of this method, rounding mode 4 (ROUND_HALF_UP) is the same as rounding mode 0
   * (ROUND_UP), and so on.
   *
   * The return value will always have the same sign as this Decimal, unless either this Decimal
   * or `y` is NaN, in which case the return value will be also be NaN.
   *
   * The return value is not affected by the value of `precision`.
   *
   * y {number|string|Decimal} The magnitude to round to a multiple of.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * 'toNearest() rounding mode not an integer: {rm}'
   * 'toNearest() rounding mode out of range: {rm}'
   *
   */
    P.toNearest = function (y, rm) {
        var x = this, Ctor = x.constructor;
        if (y == null) {
            // If x is not finite, return x.
            if (!x.d)
                return x;
            y = new Ctor(1);
        } else {
            y = new Ctor(y);
            if (rm !== void 0)
                checkInt32(rm, 0, 8);
            // If y is not finite, return Infinity with the sign of x if y is Infinity, else NaN.
            if (!y.d) {
                if (y.s)
                    y.s = x.s;
                return y;
            }
        }
        // If y is not zero, calculate the nearest multiple of y to x.
        if (y.d[0]) {
        } else {
        }
        return x;
    };
    /*
   * Return the value of this Decimal converted to a number primitive.
   * Zero keeps its sign.
   *
   */
    P.toNumber = function () {
        return;
    };
    /*
   * Return a string representing the value of this Decimal in base 8, round to `sd` significant
   * digits using rounding mode `rm`.
   *
   * If the optional `sd` argument is present then return binary exponential notation.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */
    P.toOctal = function (sd, rm) {
    };
    /*
   * Return a new Decimal whose value is the value of this Decimal raised to the power `y`, rounded
   * to `precision` significant digits using rounding mode `rounding`.
   *
   * ECMAScript compliant.
   *
   *   pow(x, NaN)                           = NaN
   *   pow(x, ±0)                            = 1

   *   pow(NaN, non-zero)                    = NaN
   *   pow(abs(x) > 1, +Infinity)            = +Infinity
   *   pow(abs(x) > 1, -Infinity)            = +0
   *   pow(abs(x) == 1, ±Infinity)           = NaN
   *   pow(abs(x) < 1, +Infinity)            = +0
   *   pow(abs(x) < 1, -Infinity)            = +Infinity
   *   pow(+Infinity, y > 0)                 = +Infinity
   *   pow(+Infinity, y < 0)                 = +0
   *   pow(-Infinity, odd integer > 0)       = -Infinity
   *   pow(-Infinity, even integer > 0)      = +Infinity
   *   pow(-Infinity, odd integer < 0)       = -0
   *   pow(-Infinity, even integer < 0)      = +0
   *   pow(+0, y > 0)                        = +0
   *   pow(+0, y < 0)                        = +Infinity
   *   pow(-0, odd integer > 0)              = -0
   *   pow(-0, even integer > 0)             = +0
   *   pow(-0, odd integer < 0)              = -Infinity
   *   pow(-0, even integer < 0)             = +Infinity
   *   pow(finite x < 0, finite non-integer) = NaN
   *
   * For non-integer or very large exponents pow(x, y) is calculated using
   *
   *   x^y = exp(y*ln(x))
   *
   * Assuming the first 15 rounding digits are each equally likely to be any digit 0-9, the
   * probability of an incorrectly rounded result
   * P([49]9{14} | [50]0{14}) = 2 * 0.2 * 10^-14 = 4e-15 = 1/2.5e+14
   * i.e. 1 in 250,000,000,000,000
   *
   * If a result is incorrectly rounded the maximum error will be 1 ulp (unit in last place).
   *
   * y {number|string|Decimal} The power to which to raise this Decimal.
   *
   */
    P.toPower = P.pow = function (y) {
        var e, pr, rm, s, x = this, Ctor = x.constructor, yn = +(y = new Ctor(y));
        // Either ±Infinity, NaN or ±0?
        if (!x.d || !y.d || !x.d[0] || !y.d[0])
            return new Ctor(mathpow(yn));
        pr = Ctor.precision;
        if (y.eq(1))
            return finalise(x, pr, rm);
        // if x is negative
        if (s < 0) {
            // Result is positive if x is negative and the last digit of integer y is even.
            if ((y.d[e] & 1) == 0)
                s = 1;
        }
        // Exponent estimate may be incorrect e.g. x: 0.999999999999999999, y: 2.29, e: 0, r.e: -1.
        // Overflow/underflow?
        if (e > Ctor.maxE + 1 || e < Ctor.minE - 1)
            return new Ctor(e > 0 ? s / 0 : 0);
        Ctor.rounding = x.s = 1;
        // Estimate the extra guard digits needed to ensure five correct rounding digits from
        // naturalLogarithm(x). Example of failure without these extra digits (precision: 10):
        // new Decimal(2.32456).pow('2087987436534566.46411')
        // should be 1.162377823e+764914905173815, but is 1.162355823e+764914905173815
        k = Math.min((e + '').length);
        // r = x^y = exp(y*ln(x))
        r = naturalExponential(y.times(naturalLogarithm(x)), pr);
        return finalise(r, pr, rm);
    };
    /*
   * Return a string representing the value of this Decimal rounded to `sd` significant digits
   * using rounding mode `rounding`.
   *
   * Return exponential notation if `sd` is less than the number of digits necessary to represent
   * the integer part of the value in normal notation.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */
    P.toPrecision = function (sd, rm) {
        var str, x = this, Ctor = x.constructor;
        if (sd === void 0) {
        } else {
            checkInt32(sd, 1, MAX_DIGITS);
        }
        return x.isNeg() && !x.isZero() ? '-' + str : str;
    };
    /*
   * Return a new Decimal whose value is the value of this Decimal rounded to a maximum of `sd`
   * significant digits using rounding mode `rm`, or to `precision` and `rounding` respectively if
   * omitted.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * 'toSD() digits out of range: {sd}'
   * 'toSD() digits not an integer: {sd}'
   * 'toSD() rounding mode not an integer: {rm}'
   * 'toSD() rounding mode out of range: {rm}'
   *
   */
    P.toSignificantDigits = P.toSD = function (sd, rm) {
        var x = this, Ctor = x.constructor;
        if (sd === void 0) {
        } else {
        }
        return finalise(new Ctor(x), sd, rm);
    };
    /*
   * Return a string representing the value of this Decimal.
   *
   * Return exponential notation if this Decimal has a positive exponent equal to or greater than
   * `toExpPos`, or a negative exponent equal to or less than `toExpNeg`.
   *
   */
    P.toString = function () {
        var x = this, Ctor = x.constructor, str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);
        return x.isNeg() && !x.isZero() ? '-' + str : str;
    };
    /*
   * Return a new Decimal whose value is the value of this Decimal truncated to a whole number.
   *
   */
    P.truncated = P.trunc = function () {
        return finalise(new this.constructor(this), 1);
    };
    /*
   * Return a string representing the value of this Decimal.
   * Unlike `toString`, negative zero will include the minus sign.
   *
   */
    P.valueOf = P.toJSON = function () {
        var x = this, Ctor = x.constructor, str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);
        return x.isNeg() ? '-' + str : str;
    };
    /*
  // Add aliases to match BigDecimal method names.
  // P.add = P.plus;
  P.subtract = P.minus;
  P.multiply = P.times;
  P.divide = P.div;
  P.remainder = P.mod;
  P.compareTo = P.cmp;
  P.negate = P.neg;
   */
    // Helper functions for Decimal.prototype (P) and/or Decimal methods, and their callers.
    /*
   *  digitsToString           P.cubeRoot, P.logarithm, P.squareRoot, P.toFraction, P.toPower,
   *                           finiteToString, naturalExponential, naturalLogarithm
   *  checkInt32               P.toDecimalPlaces, P.toExponential, P.toFixed, P.toNearest,
   *                           P.toPrecision, P.toSignificantDigits, toStringBinary, random
   *  checkRoundingDigits      P.logarithm, P.toPower, naturalExponential, naturalLogarithm
   *  convertBase              toStringBinary, parseOther
   *  cos                      P.cos
   *  divide                   P.atanh, P.cubeRoot, P.dividedBy, P.dividedToIntegerBy,
   *                           P.logarithm, P.modulo, P.squareRoot, P.tan, P.tanh, P.toFraction,
   *                           P.toNearest, toStringBinary, naturalExponential, naturalLogarithm,
   *                           taylorSeries, atan2, parseOther
   *  finalise                 P.absoluteValue, P.atan, P.atanh, P.ceil, P.cos, P.cosh,
   *                           P.cubeRoot, P.dividedToIntegerBy, P.floor, P.logarithm, P.minus,
   *                           P.modulo, P.negated, P.plus, P.round, P.sin, P.sinh, P.squareRoot,
   *                           P.tan, P.times, P.toDecimalPlaces, P.toExponential, P.toFixed,
   *                           P.toNearest, P.toPower, P.toPrecision, P.toSignificantDigits,
   *                           P.truncated, divide, getLn10, getPi, naturalExponential,
   *                           naturalLogarithm, ceil, floor, round, trunc
   *  finiteToString           P.toExponential, P.toFixed, P.toPrecision, P.toString, P.valueOf,
   *                           toStringBinary
   *  getBase10Exponent        P.minus, P.plus, P.times, parseOther
   *  getLn10                  P.logarithm, naturalLogarithm
   *  getPi                    P.acos, P.asin, P.atan, toLessThanHalfPi, atan2
   *  getPrecision             P.precision, P.toFraction
   *  getZeroString            digitsToString, finiteToString
   *  intPow                   P.toPower, parseOther
   *  isOdd                    toLessThanHalfPi
   *  maxOrMin                 max, min
   *  naturalExponential       P.naturalExponential, P.toPower
   *  naturalLogarithm         P.acosh, P.asinh, P.atanh, P.logarithm, P.naturalLogarithm,
   *                           P.toPower, naturalExponential
   *  nonFiniteToString        finiteToString, toStringBinary
   *  parseDecimal             Decimal
   *  parseOther               Decimal
   *  sin                      P.sin
   *  taylorSeries             P.cosh, P.sinh, cos, sin
   *  toLessThanHalfPi         P.cos, P.sin
   *  toStringBinary           P.toBinary, P.toHexadecimal, P.toOctal
   *  truncate                 intPow
   *
   *  Throws:                  P.logarithm, P.precision, P.toFraction, checkInt32, getLn10, getPi,
   *                           naturalLogarithm, config, parseOther, random, Decimal
   */
    function digitsToString(d) {
        var i, ws, indexOfLastWord, str = '', w = d[0];
        if (indexOfLastWord > 0) {
            str += w;
            for (i = 1;; i++) {
                ws = d[i] + '';
                k = LOG_BASE - ws.length;
                str += ws;
            }
            w = d[i];
            ws = w + '';
            k = LOG_BASE - ws.length;
            if (k)
                str += getZeroString(k);
        } else if (w === 0) {
            return '0';
        }
        // Remove trailing zeros of last w.
        for (; w % 10 === 0;)
            w /= 10;
        return str + w;
    }
    function checkInt32(i, min, max) {
        if (i !== ~~i || i < min || i > max) {
            throw Error();
        }
    }
    /*
   * Check 5 rounding digits if `repeating` is null, 4 otherwise.
   * `repeating == null` if caller is `log` or `pow`,
   * `repeating != null` if caller is `naturalLogarithm` or `naturalExponential`.
   */
    function checkRoundingDigits(d, i, rm, repeating) {
        var di, r, rd;
        // Get the length of the first word of the array d.
        for (k = d[0]; k >= 10; k /= 10)
            --i;
        // i is the index (0 - 6) of the rounding digit.
        // E.g. if within the word 3487563 the first rounding digit is 5,
        // then i = 4, k = 1000, rd = 3487563 % 1000 = 563
        k = mathpow(LOG_BASE - i);
        if (repeating == null) {
        } else {
            if (i < 4) {
            } else {
                r = ((repeating || rm < 4) && rd + 1 == k || !repeating && rm > 3 && rd + 1 == k / 2) && (d[di + 1] / k / 1000 | 0) == mathpow(10, i - 3) - 1;
            }
        }
        return r;
    }
    // Convert string of `baseIn` to an array of numbers of `baseOut`.
    // Eg. convertBase('255', 10, 16) returns [15, 15].
    // Eg. convertBase('ff', 16, 10) returns [2, 5, 5].
    function convertBase(str, baseIn, baseOut) {
        var j, arr = [0], arrL, strL = str.length;
        for (; i < strL;) {
            for (arrL = arr.length; arrL--;)
                arr[arrL] *= baseIn;
            arr[0] += NUMERALS.indexOf(str.charAt(i++));
            for (; j < arr.length; j++) {
                if (arr[j] > baseOut - 1) {
                    arr[j + 1] += arr[j] / baseOut | 0;
                    arr[j] %= baseOut;
                }
            }
        }
        return arr.reverse();
    }
    /*
   * cos(x) = 1 - x^2/2! + x^4/4! - ...
   * |x| < pi/2
   *
   */
    function cosine(Ctor, x) {
        var y;
        // Argument reduction: cos(4x) = 8*(cos^4(x) - cos^2(x)) + 1
        // i.e. cos(x) = 8*(cos^4(x/4) - cos^2(x/4)) + 1
        // Estimate the optimum number of times to use the argument reduction.
        if (len < 32) {
            k = Math.ceil(len / 3);
        } else {
            k = 16;
        }
        Ctor.precision += k;
        // Reverse argument reduction
        for (; i--;) {
            var cos2x;
            x = cos2x.times(cos2x).minus(cos2x).times(8).plus();
        }
        return x;
    }
    /*
   * Perform division in the specified base.
   */
    var divide = function () {
        // Assumes non-zero x and k, and hence non-zero result.
        function multiplyInteger(x, k, base) {
            var temp, i = x.length;
            for (; i--;) {
                temp = x[i] * k + carry;
                x[i] = temp % base | 0;
                carry = temp / base | 0;
            }
            return x;
        }
        function compare(a, b, aL, bL) {
            if (aL != bL) {
                r = aL > bL ? 1 : -1;
            } else {
                for (i = r = 0;; i++) {
                    if (a[i] != b[i]) {
                        r = a[i] > b[i] ? 1 : -1;
                        break;
                    }
                }
            }
            return r;
        }
        function subtract(a, b, aL, base) {
            var i;
            // Subtract b from a.
            for (; aL--;) {
                a[aL] -= i;
                i = a[aL] < b[aL] ? 1 : 0;
                a[aL] = i * base + a[aL] - b[aL];
            }
            // Remove leading zeros.
            for (; !a[0] && a.length > 1;)
                a.shift();
        }
        return function (x, y, pr, rm, dp, base) {
            var cmp, i, logBase, prod, q, rem, rem0, t, xL, yL, Ctor = x.constructor, sign = x.s == y.s ? 1 : -1, xd = x.d, yd = y.d;
            // Either NaN, Infinity or 0?
            if (!xd || !xd[0] || !yd || !yd[0]) {
                return new Ctor(// Return NaN if either NaN, or both Infinity or 0.
                !x.s || !y.s || (xd ? yd && xd[0] == yd[0] : !yd) ? NaN : // Return ±0 if x is 0 or y is ±Infinity, or return ±Infinity as y is 0.
                xd && xd[0] == 0 || !yd ? sign * 0 : sign / 0);
            }
            if (base) {
                logBase = 1;
            } else {
                base = BASE;
                logBase = LOG_BASE;
                e = mathfloor(x.e / logBase) - mathfloor(y.e / logBase);
            }
            yL = yd.length;
            xL = xd.length;
            q = new Ctor(sign);
            qd = q.d = [];
            // Result exponent may be one less than e.
            // The digit array of a Decimal from toStringBinary may have trailing zeros.
            for (i = 0; yd[i] == (xd[i] || 0); i++);
            if (yd[i] > (xd[i] || 0))
                e--;
            if (pr == null) {
                sd = pr = Ctor.precision;
            } else if (dp) {
                sd = pr + (x.e - y.e) + 1;
            } else {
                sd = pr;
            }
            if (sd < 0) {
                qd.push();
            } else {
                // Convert precision in number of base 10 digits to base 1e7 digits.
                sd = sd / logBase + 2 | 0;
                i = 0;
                // divisor < 1e7
                if (yL == 1) {
                    k = 0;
                    sd++;
                    // k is the carry.
                    for (; (i < xL || k) && sd--; i++) {
                        t = k * base + (xd[i] || 0);
                        qd[i] = t / yd | 0;
                        k = t % yd | 0;
                    }
                    more = k || i < xL;    // divisor >= 1e7
                } else {
                    // Normalise xd and yd so highest order digit of yd is >= base/2
                    k = base / (yd[0] + 1) | 0;
                    if (k > 1) {
                        yd = multiplyInteger(yd, k, base);
                        xd = multiplyInteger(xd, k, base);
                        yL = yd.length;
                        xL = xd.length;
                    }
                    xi = yL;
                    rem = xd.slice(0, yL);
                    remL = rem.length;
                    // Add zeros to make remainder as long as divisor.
                    for (; remL < yL;)
                        rem[remL++] = 0;
                    yz = yd.slice();
                    yz.unshift(0);
                    yd0 = yd[0];
                    if (yd[1] >= base / 2)
                        ++yd0;
                    do {
                        k = 0;
                        // Compare divisor and remainder.
                        cmp = compare(yd, rem, yL, remL);
                        // If divisor < remainder.
                        if (cmp < 0) {
                            // Calculate trial digit, k.
                            rem0 = rem[0];
                            if (yL != remL)
                                rem0 = rem0 * base + (rem[1] || 0);
                            // k will be how many times the divisor goes into the current remainder.
                            k = rem0 / yd0 | 0;
                            //  Algorithm:
                            //  1. product = divisor * trial digit (k)
                            //  2. if product > remainder: product -= divisor, k--
                            //  3. remainder -= product
                            //  4. if product was < remainder at 2:
                            //    5. compare new remainder and divisor
                            //    6. If remainder > divisor: remainder -= divisor, k++
                            if (k > 1) {
                                if (k >= base)
                                    k = base - 1;
                                // product = divisor * trial digit.
                                prod = multiplyInteger(yd, k, base);
                                prodL = prod.length;
                                remL = rem.length;
                                // Compare product and remainder.
                                cmp = compare(prod, rem, prodL, remL);
                                // product > remainder.
                                if (cmp == 1) {
                                    k--;
                                    // Subtract divisor from product.
                                    subtract(prod, yL < prodL ? yz : yd, prodL, base);
                                }
                            } else {
                                // cmp is -1.
                                // If k is 0, there is no need to compare yd and rem again below, so change cmp to 1
                                // to avoid it. If k is 1 there is a need to compare yd and rem again below.
                                if (k == 0)
                                    cmp = k = 1;
                                prod = yd.slice();
                            }
                            prodL = prod.length;
                            // Subtract product from remainder.
                            subtract(rem, prod, remL, base);
                            // If product was < previous remainder.
                            if (cmp == -1) {
                                remL = rem.length;
                                // Compare divisor and new remainder.
                                cmp = compare(yd, rem, yL, remL);
                            }
                        } else if (cmp === 0) {
                            k++;
                            rem = [];
                        }
                        // if cmp === 1, k will be 0
                        // Add the next digit, k, to the result array.
                        qd[i++] = k;
                        // Update the remainder.
                        if (cmp && rem[0]) {
                            rem[remL++] = xd[xi] || 0;
                        } else {
                            rem = [xd[xi]];
                            remL = 1;
                        }
                    } while ((xi++ < xL || rem[0] !== void 0) && sd--);
                    more = rem[0] !== void 0;
                }
                // Leading zero?
                if (!qd[0])
                    qd.shift();
            }
            // logBase is 1 when divide is being used for base conversion.
            if (logBase == 1) {
                q.e = e;
            } else {
                // To calculate q.e, first get the number of digits of qd[0].
                for (i = 1, k = qd[0]; k >= 10; k /= 10)
                    i++;
                q.e = i + e * logBase - 1;
                finalise(q, dp ? pr + q.e + 1 : pr, rm, more);
            }
            return q;
        };
    }();
    /*
   * Round `x` to `sd` significant digits using rounding mode `rm`.
   * Check for over/under-flow.
   */
    function finalise(x, sd, rm, isTruncated) {
        var digits, j, rd, w, xdi, Ctor = x.constructor;
        // Don't round if sd is null or undefined.
        out:
            if (sd != null) {
                xd = x.d;
                // Infinity/NaN.
                if (!xd)
                    return x;
                // rd: the rounding digit, i.e. the digit after the digit that may be rounded up.
                // w: the word of xd containing rd, a base 1e7 number.
                // xdi: the index of w within xd.
                // digits: the number of digits of w.
                // i: what would be the index of rd within w if all the numbers were 7 digits long (i.e. if
                // they had leading zeros)
                // j: if > 0, the actual index of rd within w (if < 0, rd is a leading zero).
                // Get the length of the first word of the digits array xd.
                for (digits = 1, k = xd[0]; k >= 10; k /= 10)
                    digits++;
                i = sd - digits;
                // Is the rounding digit in the first word of xd?
                if (i < 0) {
                    i += LOG_BASE;
                    j = sd;
                    w = xd[xdi = 0];
                } else {
                    xdi = Math.ceil((i + 1) / LOG_BASE);
                    k = xd.length;
                    if (xdi >= k) {
                        if (isTruncated) {
                            // Needed by `naturalExponential`, `naturalLogarithm` and `squareRoot`.
                            for (; k++ <= xdi;)
                                xd.push(0);
                            digits = 1;
                            i %= LOG_BASE;
                        } else {
                            break out;
                        }
                    } else {
                        w = k = xd[xdi];
                        // Get the number of digits of w.
                        for (digits = 1; k >= 10; k /= 10)
                            digits++;
                        // Get the index of rd within w.
                        i %= LOG_BASE;
                        // Get the index of rd within w, adjusted for leading zeros.
                        // The number of leading zeros of w is given by LOG_BASE - digits.
                        j = i - LOG_BASE + digits;
                        // Get the rounding digit at index j of w.
                        rd = j < 0 ? 0 : w / mathpow(10) % 10 | 0;
                    }
                }
                // The expression `w % mathpow(10, digits - j - 1)` returns all the digits of w to the right
                // of the digit at (left-to-right) index j, e.g. if w is 908714 and j is 2, the expression
                // will give 714.
                roundUp = rm < 4 ? (rd || isTruncated) && (rm == 0 || rm == (x.s < 0 ? 3 : 2)) : rd > 5 || rd == 5 && (rm == 4 || isTruncated || rm == 6 && // Check whether the digit to the left of the rounding digit is odd.
                (i > 0 ? j > 0 ? w / mathpow() : 0 : xd[xdi - 1]) % 10 & 1 || rm == (x.s < 0 ? 8 : 7));
                if (sd < 1 || !xd[0]) {
                    if (roundUp) {
                        // Convert sd to decimal places.
                        sd -= x.e + 1;
                        x.e = -sd || 0;
                    } else {
                        // Zero.
                        xd[0] = x.e = 0;
                    }
                    return x;
                }
                // Remove excess digits.
                if (i == 0) {
                    xd.length = xdi;
                    k = 1;
                    xdi--;
                } else {
                    xd.length = xdi + 1;
                    k = mathpow(10, LOG_BASE - i);
                    // E.g. 56700 becomes 56000 if 7 is the rounding digit.
                    // j > 0 means i > number of leading zeros of w.
                    xd[xdi] = j > 0 ? (w / mathpow(10, digits - j) % mathpow(10, j) | 0) * k : 0;
                }
                if (roundUp) {
                    for (;;) {
                    }
                }
                // Remove trailing zeros.
                for (i = xd.length; xd[--i] === 0;)
                    xd.pop();
            }
        if (external) {
        }
        return x;
    }
    function finiteToString(x, isExp, sd) {
        if (!x.isFinite())
            return nonFiniteToString(x);
        var k, e = x.e, str = digitsToString(x.d);
        if (isExp) {
            if (sd && (k = sd - len) > 0) {
                str = str.charAt(0) + '.' + str.slice(1) + getZeroString(k);
            }
            str = str + (x.e < 0 ? 'e' : 'e+') + x.e;
        } else if (e < 0) {
        } else if (e >= len) {
            str += getZeroString(e + 1 - len);
        } else {
            if ((k = e + 1) < len)
                str = str.slice(0, k) + '.' + str.slice(k);
        }
        return str;
    }
    // Calculate the base 10 exponent from the base 1e7 exponent.
    function getBase10Exponent(digits, e) {
        var w = digits[0];
        // Add the number of digits of the first word of the digits array.
        for (e *= LOG_BASE; w >= 10; w /= 10)
            e++;
        return e;
    }
    function getLn10(Ctor, sd, pr) {
        if (sd > LN10_PRECISION) {
            // Reset global state in case the exception is caught.
            external = true;
            throw Error(precisionLimitExceeded);
        }
        return finalise(new Ctor(LN10), sd, 1);
    }
    function getPi(Ctor, sd, rm) {
        if (sd > PI_PRECISION)
            throw Error(precisionLimitExceeded);
        return finalise(new Ctor(PI), sd, rm, true);
    }
    function getPrecision(digits) {
        var w = digits.length - 1, len = w * LOG_BASE + 1;
        return len;
    }
    function getZeroString(k) {
        var zs = '';
        for (; k--;)
            zs += '0';
        return zs;
    }
    /*
   * Return a new Decimal whose value is the value of Decimal `x` to the power `n`, where `n` is an
   * integer of type number.
   *
   * Implements 'exponentiation by squaring'. Called by `pow` and `parseOther`.
   *
   */
    function intPow(Ctor, x, n, pr) {
        external = false;
        for (;;) {
            if (n % 2) {
                r = r.times(x);
                if (truncate(r.d, k))
                    isTruncated = true;
            }
            n = mathfloor(n / 2);
            if (n === 0) {
                break;
            }
            truncate(x.d, k);
        }
    }
    function isOdd(n) {
        return n.d[n.d.length - 1] & 1;
    }
    /*
   * Handle `max` and `min`. `ltgt` is 'lt' or 'gt'.
   */
    function maxOrMin(Ctor, args, ltgt) {
        var y, x = new Ctor(args[0]), i = 0;
        for (; ++i < args.length;) {
            y = new Ctor(args[i]);
            if (!y.s) {
                x = y;
                break;
            }
        }
        return x;
    }
    /*
   * Return a new Decimal whose value is the natural exponential of `x` rounded to `sd` significant
   * digits.
   *
   * Taylor/Maclaurin series.
   *
   * exp(x) = x^0/0! + x^1/1! + x^2/2! + x^3/3! + ...
   *
   * Argument reduction:
   *   Repeat x = x / 32, k += 5, until |x| < 0.1
   *   exp(x) = exp(x / 2^k)^(2^k)
   *
   * Previously, the argument was initially reduced by
   * exp(x) = exp(r) * 10^k  where r = x - k * ln10, k = floor(x / ln10)
   * to first put r in the range [0, ln10], before dividing by 32 until |x| < 0.1, but this was
   * found to be slower than just dividing repeatedly by 32 as above.
   *
   * Max integer argument: exp('20723265836946413') = 6.3e+9000000000000000
   * Min integer argument: exp('-20723265836946411') = 1.2e-9000000000000000
   * (Math object integer min/max: Math.exp(709) = 8.2e+307, Math.exp(-745) = 5e-324)
   *
   *  exp(Infinity)  = Infinity
   *  exp(-Infinity) = 0
   *  exp(NaN)       = NaN
   *  exp(±0)        = 1
   *
   *  exp(x) is non-terminating for any finite, non-zero x.
   *
   *  The result will always be correctly rounded.
   *
   */
    function naturalExponential(x, sd) {
        var guard, pow, t, rep, k = 0, Ctor = x.constructor, rm = Ctor.rounding;
        // 0/NaN/Infinity?
        if (!x.d || !x.d[0] || x.e > 17) {
            return new Ctor(x.d ? !x.d[0] ? 1 : x.s < 0 ? 0 : 1 / 0 : x.s ? x.s < 0 ? 0 : x : 0 / 0);
        }
        t = new Ctor(0.03125);
        // while abs(x) >= 0.1
        while (x.e > -2) {
            // x = x / 2^5
            x = x.times(t);
            k += 5;
        }
        // Use 2 * log10(2^k) + 5 (empirically derived) to estimate the increase in precision
        // necessary to ensure the first 4 rounding digits are correct.
        guard = Math.log() / Math.LN10 * 2 + 5 | 0;
        wpr += guard;
        denominator = pow = sum = new Ctor(1);
        Ctor.precision = wpr;
        for (;;) {
            pow = finalise(wpr, 1);
            denominator = denominator.times(++i);
            if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum.d).slice(0, wpr)) {
                j = k;
                while (j--)
                    sum = finalise(sum.times(sum), wpr);
                // Check to see if the first 4 rounding digits are [49]999.
                // If so, repeat the summation with a higher precision, otherwise
                // e.g. with precision: 18, rounding: 1
                // exp(18.404272462595034083567793919843761) = 98372560.1229999999 (should be 98372560.123)
                // `wpr - guard` is the index of first rounding digit.
                if (sd == null) {
                    if (rep < 3 && checkRoundingDigits(sum.d, rm, rep)) {
                        Ctor.precision = wpr += 10;
                        i = 0;
                    } else {
                        return finalise(sum, rm, external = true);
                    }
                } else {
                    Ctor.precision = pr;
                    return sum;
                }
            }
            sum = t;
        }
    }
    /*
   * Return a new Decimal whose value is the natural logarithm of `x` rounded to `sd` significant
   * digits.
   *
   *  ln(-n)        = NaN
   *  ln(0)         = -Infinity
   *  ln(-0)        = -Infinity
   *  ln(1)         = 0
   *  ln(Infinity)  = Infinity
   *  ln(-Infinity) = NaN
   *  ln(NaN)       = NaN
   *
   *  ln(n) (n != 1) is non-terminating.
   *
   */
    function naturalLogarithm(y, sd) {
        var c, denominator, e, numerator, rep, sum, t, wpr, x2, guard, x = y, xd = x.d, Ctor = x.constructor, rm = Ctor.rounding, pr = Ctor.precision;
        // Is x negative or Infinity, NaN, 0 or 1?
        if (x.s < 0 || !xd || !xd[0] || !x.e && xd[0] == 1 && xd.length == 1) {
            return new Ctor(xd && !xd[0] ? -1 / 0 : x.s != 1 ? NaN : xd ? 0 : x);
        }
        if (sd == null) {
            external = false;
            wpr = pr;
        } else {
            wpr = sd;
        }
        c = digitsToString(xd);
        c0 = c.charAt(0);
        if (Math.abs(e = x.e) < 1500000000000000) {
            // Argument reduction.
            // The series converges faster the closer the argument is to 1, so using
            // ln(a^b) = b * ln(a),   ln(a) = ln(a^b) / b
            // multiply the argument by itself until the leading digits of the significand are 7, 8, 9,
            // 10, 11, 12 or 13, recording the number of multiplications so the sum of the series can
            // later be divided by this number, then separate out the power of 10 using
            // ln(a*10^b) = ln(a) + b*ln(10).
            // max n is 21 (gives 0.9, 1.0 or 1.1) (9e15 / 21 = 4.2e14).
            //while (c0 < 9 && c0 != 1 || c0 == 1 && c.charAt(1) > 1) {
            // max n is 6 (gives 0.7 - 1.3)
            while (c0 < 7 && c0 != 1 || c0 == 1 && c.charAt(1) > 3) {
                x = x.times(y);
                c = digitsToString(x.d);
                c0 = c.charAt();
            }
            e = x.e;
            if (c0 > 1) {
                x = new Ctor('0.' + c);
                e++;
            } else {
                x = new Ctor(c0 + '.' + c.slice());
            }
        } else {
            // The argument reduction method above may result in overflow if the argument y is a massive
            // number with exponent >= 1500000000000000 (9e15 / 6 = 1.5e15), so instead recall this
            // function using ln(x*10^e) = ln(x) + e*ln(10).
            t = getLn10(Ctor, pr).times(e + '');
            Ctor.precision = pr;
            return sd == null ? finalise(x, pr, rm) : x;
        }
        // x1 is x reduced to a value near 1.
        x1 = x;
        // Taylor series.
        // ln(y) = ln((1 + x)/(1 - x)) = 2(x + x^3/3 + x^5/5 + x^7/7 + ...)
        // where x = (y - 1)/(y + 1)    (|x| < 1)
        sum = numerator = x = divide(x.minus(1), x.plus(1), wpr);
        x2 = finalise(x.times(x), wpr);
        denominator = 3;
        for (;;) {
            numerator = finalise(numerator.times(x2), wpr);
            t = sum.plus(divide(numerator, new Ctor(denominator), wpr));
            if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum.d).slice(0, wpr)) {
                // Reverse the argument reduction. Check that e is not 0 because, besides preventing an
                // unnecessary calculation, -0 + 0 = +0 and to ensure correct rounding -0 needs to stay -0.
                if (e !== 0)
                    sum = sum.plus(getLn10(Ctor, wpr + 2, pr).times(e + ''));
                // Is rm > 3 and the first 4 rounding digits 4999, or rm < 4 (or the summation has
                // been repeated previously) and the first 4 rounding digits 9999?
                // If so, restart the summation with a higher precision, otherwise
                // e.g. with precision: 12, rounding: 1
                // ln(135520028.6126091714265381533) = 18.7246299999 when it should be 18.72463.
                // `wpr - guard` is the index of first rounding digit.
                if (sd == null) {
                    if (checkRoundingDigits(sum.d, wpr - guard, rm, rep)) {
                        Ctor.precision = wpr += guard;
                        x2 = finalise(x.times(x), wpr, 1);
                    } else {
                        return finalise(sum, Ctor.precision = pr, rm);
                    }
                } else {
                    Ctor.precision = pr;
                    return sum;
                }
            }
            sum = t;
            denominator += 2;
        }
    }
    // ±Infinity, NaN.
    function nonFiniteToString(x) {
    }
    /*
   * Parse the value of a new Decimal `x` from string `str`.
   */
    function parseDecimal(x, str) {
        // Decimal point?
        if ((e = str.indexOf('.')) > -1)
            str = str.replace('.', '');
        // Exponential form?
        if ((i = str.search(/e/i)) > 0) {
            // Determine exponent.
            if (e < 0)
                e = i;
            e += +str.slice(i + 1);
            str = str.substring(0, i);
        } else if (e < 0) {
            // Integer.
            e = str.length;
        }
        // Determine leading zeros.
        for (i = 0; str.charCodeAt(i) === 48; i++);
        // Determine trailing zeros.
        for (len = str.length; str.charCodeAt(len - 1) === 48; --len);
        str = str.slice(i, len);
        if (str) {
            len -= i;
            x.e = e = e - i - 1;
            x.d = [];
            // Transform base
            // e is the base 10 exponent.
            // i is where to slice str to get the first word of the digits array.
            i = (e + 1) % LOG_BASE;
            if (e < 0)
                i += LOG_BASE;
            if (i < len) {
                if (i)
                    x.d.push();
                for (len -= LOG_BASE; i < len;)
                    x.d.push(+str.slice(i, i += LOG_BASE));
                str = str.slice(i);
                i = LOG_BASE - str.length;
            } else {
                i -= len;
            }
            for (; i--;)
                str += '0';
            x.d.push(+str);
        } else {
            // Zero.
            x.e = 0;
            x.d = [0];
        }
        return x;
    }
    /*
   * Parse the value of a new Decimal `x` from a string `str`, which is not a decimal value.
   */
    function parseOther(x, str) {
        var base, divisor, isFloat, p, xe;
        if (str === 'Infinity' || str === 'NaN') {
            x.e = NaN;
            return x;
        }
        if (isHex.test(str)) {
            base = 16;
        }
        // Is there a binary exponent part?
        i = str.search();
        if (i > 0) {
            str = str.substring(i);
        } else {
            str = str.slice(2);
        }
        // Convert `str` as an integer then divide the result by `base` raised to a power such that the
        // fraction part will be restored.
        i = str.indexOf();
        Ctor = x.constructor;
        if (isFloat) {
            len = str.length;
            // log[10](16) = 1.2041... , log[10](88) = 1.9444....
            divisor = intPow(Ctor, new Ctor(base), i, i * 2);
        }
        xd = convertBase(str, base, BASE);
        xe = xd.length - 1;
        // Remove trailing zeros.
        for (i = xe; xd[i] === 0; --i)
            xd.pop();
        if (i < 0)
            return new Ctor(x.s * 0);
        x.e = getBase10Exponent(xd, xe);
        // Multiply by the binary exponent part if present.
        if (p)
            x = x.times(Math.abs(p) < 54 ? Math.pow(p) : Decimal.pow(2, p));
    }
    /*
   * sin(x) = x - x^3/3! + x^5/5! - ...
   * |x| < pi/2
   *
   */
    function sine(Ctor, x) {
        if (len < 3)
            return taylorSeries(Ctor, 2, x, x);
        // Reverse argument reduction
        var d5 = new Ctor(), d20 = new Ctor(20);
        for (; k--;) {
        }
    }
    // Calculate Taylor series for `cos`, `cosh`, `sin` and `sinh`.
    function taylorSeries(Ctor, n, x, y, isHyperbolic) {
        for (;;) {
            if (t.d[k] !== void 0) {
                for (j = k; t.d[j] === u.d[j] && j--;);
                if (j == -1)
                    break;
            }
        }
        return t;
    }
    // Return the absolute value of `x` reduced to less than or equal to half pi.
    function toLessThanHalfPi(Ctor, x) {
        var isNeg, halfPi;
        if (x.lte(halfPi)) {
        }
        if (t.isZero()) {
        } else {
            // 0 <= x < pi
            if (x.lte(halfPi)) {
                return x;
            }
        }
    }
    /*
   * Return the value of Decimal `x` as a string in base `baseOut`.
   *
   * If the optional `sd` argument is present include a binary exponent suffix.
   */
    function toStringBinary(x, baseOut, sd, rm) {
        var e, i, k, roundUp, xd, Ctor = x.constructor, isExp = sd !== void 0;
        if (isExp) {
            if (rm === void 0)
                rm = Ctor.rounding;
        } else {
            sd = Ctor.precision;
        }
        if (!x.isFinite()) {
        } else {
            str = finiteToString(x);
            i = str.indexOf('.');
            // Use exponential notation according to `toExpPos` and `toExpNeg`? No, but if required:
            // maxBinaryExponent = floor((decimalExponent + 1) * log[2](10))
            // minBinaryExponent = floor(decimalExponent * log[2](10))
            // log[2](10) = 3.321928094887362347870319429489390175864
            if (isExp) {
                base = 2;
                if (baseOut == 16) {
                    sd = sd * 4 - 3;
                } else if (baseOut == 8) {
                }
            } else {
                base = baseOut;
            }
            // Convert the number as an integer then divide the result by its base raised to a power such
            // that the fraction part will be restored.
            // Non-integer.
            if (i >= 0) {
                y = new Ctor(1);
                y.d = convertBase(finiteToString(y), 10, base);
                y.e = y.d.length;
            }
            xd = convertBase(str, base);
            // Remove trailing zeros.
            for (; xd[--len] == 0;)
                xd.pop();
            if (!xd[0]) {
            } else {
                // The rounding digit, i.e. the digit after the digit that may be rounded up.
                i = xd[sd];
                roundUp = roundUp || xd[sd + 1] !== void 0;
                xd.length = sd;
                if (roundUp) {
                    // Rounding up may mean the previous digit has to be rounded up and so on.
                    for (;;) {
                    }
                }
                // Determine trailing zeros.
                for (len = xd.length; !xd[len - 1]; --len);
                // E.g. [4, 11, 15] becomes 4bf.
                for (i = 0; i < len; i++)
                    str += NUMERALS.charAt(xd[i]);
                // Add binary exponent suffix?
                if (isExp) {
                    str = str + (e < 0 ? 'p' : 'p+') + e;
                } else if (e < 0) {
                    for (; ++e;)
                        str = '0' + str;
                    str = '0.' + str;
                } else {
                }
            }
        }
        return x.s < 0 ? '-' + str : str;
    }
    // Does not strip trailing zeros.
    function truncate(arr, len) {
        if (arr.length > len) {
            arr.length = len;
        }
    }
    // Decimal methods
    /*
   *  abs
   *  acos
   *  acosh
   *  add
   *  asin
   *  asinh
   *  atan
   *  atanh
   *  atan2
   *  cbrt
   *  ceil
   *  clone
   *  config
   *  cos
   *  cosh
   *  div
   *  exp
   *  floor
   *  hypot
   *  ln
   *  log
   *  log2
   *  log10
   *  max
   *  min
   *  mod
   *  mul
   *  pow
   *  random
   *  round
   *  set
   *  sign
   *  sin
   *  sinh
   *  sqrt
   *  sub
   *  tan
   *  tanh
   *  trunc
   */
    /*
   * Return a new Decimal whose value is the absolute value of `x`.
   *
   * x {number|string|Decimal}
   *
   */
    function abs(x) {
        return new this(x).abs();
    }
    /*
   * Return a new Decimal whose value is the arccosine in radians of `x`.
   *
   * x {number|string|Decimal}
   *
   */
    function acos(x) {
        return new this(x).acos();
    }
    /*
   * Return a new Decimal whose value is the inverse of the hyperbolic cosine of `x`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
    function acosh(x) {
        return new this(x).acosh();
    }
    /*
   * Return a new Decimal whose value is the sum of `x` and `y`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */
    function add(x, y) {
        return new this(x).plus(y);
    }
    /*
   * Return a new Decimal whose value is the arcsine in radians of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
    function asin(x) {
        return new this(x).asin();
    }
    /*
   * Return a new Decimal whose value is the inverse of the hyperbolic sine of `x`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
    function asinh(x) {
        return new this(x).asinh();
    }
    /*
   * Return a new Decimal whose value is the arctangent in radians of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
    function atan(x) {
        return new this(x).atan();
    }
    /*
   * Return a new Decimal whose value is the inverse of the hyperbolic tangent of `x`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
    function atanh(x) {
        return new this(x).atanh();
    }
    /*
   * Return a new Decimal whose value is the arctangent in radians of `y/x` in the range -pi to pi
   * (inclusive), rounded to `precision` significant digits using rounding mode `rounding`.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-pi, pi]
   *
   * y {number|string|Decimal} The y-coordinate.
   * x {number|string|Decimal} The x-coordinate.
   *
   * atan2(±0, -0)               = ±pi
   * atan2(±0, +0)               = ±0
   * atan2(±0, -x)               = ±pi for x > 0
   * atan2(±0, x)                = ±0 for x > 0
   * atan2(-y, ±0)               = -pi/2 for y > 0
   * atan2(y, ±0)                = pi/2 for y > 0
   * atan2(±y, -Infinity)        = ±pi for finite y > 0
   * atan2(±y, +Infinity)        = ±0 for finite y > 0
   * atan2(±Infinity, x)         = ±pi/2 for finite x
   * atan2(±Infinity, -Infinity) = ±3*pi/4
   * atan2(±Infinity, +Infinity) = ±pi/4
   * atan2(NaN, x) = NaN
   * atan2(y, NaN) = NaN
   *
   */
    function atan2(y, x) {
        x = new this(x);
        var r, pr = this.precision, rm = this.rounding;
        // Either NaN
        if (!y.s || !x.s) {
            r = new this(NaN);    // Both ±Infinity
        } else if (!y.d && !x.d) {
            r = getPi(this, wpr).times(x.s > 0 ? 0.25 : 0.75);
        }
        return r;
    }
    /*
   * Return a new Decimal whose value is the cube root of `x`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
    function cbrt(x) {
        return new this(x).cbrt();
    }
    /*
   * Return a new Decimal whose value is `x` rounded to an integer using `ROUND_CEIL`.
   *
   * x {number|string|Decimal}
   *
   */
    function ceil(x) {
        return finalise(x = new this(x), x.e + 1);
    }
    /*
   * Configure global settings for a Decimal constructor.
   *
   * `obj` is an object with one or more of the following properties,
   *
   *   precision  {number}
   *   rounding   {number}
   *   toExpNeg   {number}
   *   toExpPos   {number}
   *   maxE       {number}
   *   minE       {number}
   *   modulo     {number}
   *   crypto     {boolean|number}
   *   defaults   {true}
   *
   * E.g. Decimal.config({ precision: 20, rounding: 4 })
   *
   */
    function config(obj) {
        if (!obj || typeof obj !== 'object')
            throw Error(decimalError + 'Object expected');
        var i, v, useDefaults = obj.defaults === true, ps = [
                1,
                MAX_DIGITS,
                0,
                'toExpNeg',
                -EXP_LIMIT,
                0,
                'toExpPos',
                0,
                EXP_LIMIT,
                'maxE',
                0,
                EXP_LIMIT,
                'minE',
                0,
                'modulo',
                0,
                9
            ];
        for (; i < ps.length; i += 3) {
            if ((v = obj[p]) !== void 0) {
                if (mathfloor(v) === v && v >= ps[i + 1] && v <= ps[i + 2])
                    this[p] = v;
                else
                    throw Error(invalidArgument + p + ': ' + v);
            }
        }
        if (p = 'crypto', useDefaults)
            this[p] = DEFAULTS[p];
    }
    /*
   * Return a new Decimal whose value is the cosine of `x`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
    function cos(x) {
        return new this(x).cos();
    }
    /*
   * Return a new Decimal whose value is the hyperbolic cosine of `x`, rounded to precision
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
    function cosh(x) {
        return new this(x).cosh();
    }
    /*
   * Create and return a Decimal constructor with the same configuration properties as this Decimal
   * constructor.
   *
   */
    function clone(obj) {
        var p;
        /*
     * The Decimal constructor and exported function.
     * Return a new Decimal instance.
     *
     * v {number|string|Decimal} A numeric value.
     *
     */
        function Decimal(v) {
            var e, t, x = this;
            // Decimal called without new.
            if (!(x instanceof Decimal))
                return new Decimal(v);
            // Retain a reference to this Decimal constructor, and shadow Decimal.prototype.constructor
            // which points to Object.
            x.constructor = Decimal;
            // Duplicate.
            if (v instanceof Decimal) {
                x.s = v.s;
                x.e = v.e;
                x.d = (v = v.d) ? v.slice() : v;
                return;
            }
            t = typeof v;
            if (t === 'number') {
                if (v === 0) {
                    x.s = 1 / v < 0 ? -1 : 1;
                    x.e = 0;
                    x.d = [0];
                    return;
                }
                if (v < 0) {
                    v = -v;
                    x.s = -1;
                } else {
                    x.s = 1;
                }
                // Fast path for small integers.
                if (v === ~~v && v < 10000000) {
                    for (e = 0, i = v; i >= 10; i /= 10)
                        e++;
                    x.e = e;
                    x.d = [v];
                    return;    // Infinity, NaN.
                } else if (v * 0 !== 0) {
                    x.e = NaN;
                    return;
                }
                return parseDecimal(x, v.toString());
            } else if (t !== 'string') {
                throw Error(invalidArgument + v);
            }
            // Minus sign?
            if (v.charCodeAt(0) === 45) {
                v = v.slice(1);
                x.s = -1;
            } else {
                x.s = 1;
            }
            return isDecimal.test(v) ? parseDecimal(x, v) : parseOther(x, v);
        }
        Decimal.prototype = P;
        Decimal.ROUND_UP = 0;
        Decimal.ROUND_CEIL = 2;
        Decimal.ROUND_HALF_UP = 4;
        Decimal.ROUND_HALF_EVEN = 6;
        Decimal.ROUND_HALF_FLOOR = 8;
        Decimal.config = Decimal.set = config;
        Decimal.clone = clone;
        Decimal.isDecimal = isDecimalInstance;
        Decimal.abs = abs;
        Decimal.acos = acos;
        Decimal.acosh = acosh;
        // ES6
        Decimal.add = add;
        Decimal.asin = asin;
        Decimal.asinh = asinh;
        // ES6
        Decimal.atan = atan;
        Decimal.atanh = atanh;
        // ES6
        Decimal.atan2 = atan2;
        Decimal.cbrt = cbrt;
        // ES6
        Decimal.ceil = ceil;
        Decimal.cos = cos;
        Decimal.cosh = cosh;
        // ES6
        Decimal.div = div;
        Decimal.exp = exp;
        Decimal.floor = floor;
        Decimal.hypot = hypot;
        // ES6
        Decimal.ln = ln;
        Decimal.log = log;
        Decimal.log10 = log10;
        // ES6
        Decimal.log2 = log2;
        // ES6
        Decimal.max = max;
        Decimal.min = min;
        Decimal.mod = mod;
        Decimal.mul = mul;
        Decimal.pow = pow;
        Decimal.random = random;
        Decimal.round = round;
        Decimal.sign = sign;
        // ES6
        Decimal.sin = sin;
        Decimal.sinh = sinh;
        // ES6
        Decimal.sqrt = sqrt;
        Decimal.sub = sub;
        Decimal.tan = tan;
        Decimal.tanh = tanh;
        // ES6
        Decimal.trunc = trunc;
        // ES6
        if (obj === void 0)
            obj = {};
        if (obj) {
            if (obj.defaults !== true) {
                ps = [
                    'precision',
                    'toExpNeg',
                    'toExpPos',
                    'maxE',
                    'minE',
                    'modulo'
                ];
                for (i = 0; i < ps.length;)
                    if (!obj.hasOwnProperty(p = ps[i++]))
                        obj[p] = this[p];
            }
        }
        Decimal.config(obj);
        return Decimal;
    }
    /*
   * Return a new Decimal whose value is `x` divided by `y`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */
    function div(x, y) {
        return new this(x).div(y);
    }
    /*
   * Return a new Decimal whose value is the natural exponential of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} The power to which to raise the base of the natural log.
   *
   */
    function exp(x) {
        return new this(x).exp();
    }
    /*
   * Return a new Decimal whose value is `x` round to an integer using `ROUND_FLOOR`.
   *
   * x {number|string|Decimal}
   *
   */
    function floor(x) {
        return finalise(x = new this(x), x.e + 1, 3);
    }
    /*
   * Return a new Decimal whose value is the square root of the sum of the squares of the arguments,
   * rounded to `precision` significant digits using rounding mode `rounding`.
   *
   * hypot(a, b, ...) = sqrt(a^2 + b^2 + ...)
   *
   */
    function hypot() {
        var i;
        for (; i < arguments.length;) {
            n = new this(arguments[i++]);
            if (!n.d) {
                if (n.s) {
                }
                t = n;
            } else if (t.d) {
            }
        }
        external = true;
        return t.sqrt();
    }
    /*
   * Return true if object is a Decimal instance (where Decimal is any Decimal constructor),
   * otherwise return false.
   *
   */
    function isDecimalInstance(obj) {
    }
    /*
   * Return a new Decimal whose value is the natural logarithm of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
    function ln(x) {
        return new this(x).ln();
    }
    /*
   * Return a new Decimal whose value is the log of `x` to the base `y`, or to base 10 if no base
   * is specified, rounded to `precision` significant digits using rounding mode `rounding`.
   *
   * log[y](x)
   *
   * x {number|string|Decimal} The argument of the logarithm.
   * y {number|string|Decimal} The base of the logarithm.
   *
   */
    function log(x, y) {
        return new this(x).log(y);
    }
    /*
   * Return a new Decimal whose value is the base 2 logarithm of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
    function log2(x) {
        return new this(x).log();
    }
    /*
   * Return a new Decimal whose value is the base 10 logarithm of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
    function log10(x) {
        return new this(x).log(10);
    }
    /*
   * Return a new Decimal whose value is the maximum of the arguments.
   *
   * arguments {number|string|Decimal}
   *
   */
    function max() {
        return maxOrMin(this, arguments, 'lt');
    }
    /*
   * Return a new Decimal whose value is the minimum of the arguments.
   *
   * arguments {number|string|Decimal}
   *
   */
    function min() {
        return maxOrMin(this, arguments, 'gt');
    }
    /*
   * Return a new Decimal whose value is `x` modulo `y`, rounded to `precision` significant digits
   * using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */
    function mod(x, y) {
        return new this(x).mod(y);
    }
    /*
   * Return a new Decimal whose value is `x` multiplied by `y`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */
    function mul(x, y) {
        return new this(x).mul(y);
    }
    /*
   * Return a new Decimal whose value is `x` raised to the power `y`, rounded to precision
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} The base.
   * y {number|string|Decimal} The exponent.
   *
   */
    function pow(x, y) {
        return new this(x).pow(y);
    }
    /*
   * Returns a new Decimal with a random value equal to or greater than 0 and less than 1, and with
   * `sd`, or `Decimal.precision` if `sd` is omitted, significant digits (or less if trailing zeros
   * are produced).
   *
   * [sd] {number} Significant digits. Integer, 0 to MAX_DIGITS inclusive.
   *
   */
    function random(sd) {
        var e, k, i, r = new this(1), rd = [];
        if (sd === void 0)
            sd = this.precision;
        else
            checkInt32(sd, 1, MAX_DIGITS);
        if (!this.crypto) {
            for (; i < k;)
                rd[i++] = Math.random() * 10000000 | 0;    // Browsers supporting crypto.getRandomValues.
        }
        k = rd[--i];
        sd %= LOG_BASE;
        // Convert trailing digits to zeros according to sd.
        if (k && sd) {
            rd[i] = (k / n | 0) * n;
        }
        // Remove trailing words which are zero.
        for (; rd[i] === 0; i--)
            rd.pop();
        // Zero?
        if (i < 0) {
            e = 0;
            rd = [];
        } else {
            e = -1;
            // Remove leading words which are zero and adjust exponent accordingly.
            for (; rd[0] === 0;)
                rd.shift();
            // Count the digits of the first word of rd to determine leading zeros.
            for (k = 1; n >= 10; n /= 10)
                k++;
            // Adjust the exponent for leading zeros of the first word of rd.
            if (k < LOG_BASE)
                e -= LOG_BASE - k;
        }
        r.e = e;
        return r;
    }
    /*
   * Return a new Decimal whose value is `x` rounded to an integer using rounding mode `rounding`.
   *
   * To emulate `Math.round`, set rounding to 7 (ROUND_HALF_CEIL).
   *
   * x {number|string|Decimal}
   *
   */
    function round(x) {
        return finalise(x = new this(x), this.rounding);
    }
    /*
   * Return
   *   1    if x > 0,
   *  -1    if x < 0,
   *   0    if x is 0,
   *  -0    if x is -0,
   *   NaN  otherwise
   *
   */
    function sign(x) {
        x = new this(x);
    }
    /*
   * Return a new Decimal whose value is the sine of `x`, rounded to `precision` significant digits
   * using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
    function sin(x) {
        return new this(x).sin();
    }
    /*
   * Return a new Decimal whose value is the hyperbolic sine of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
    function sinh(x) {
    }
    /*
   * Return a new Decimal whose value is the square root of `x`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
    function sqrt(x) {
        return new this(x).sqrt();
    }
    /*
   * Return a new Decimal whose value is `x` minus `y`, rounded to `precision` significant digits
   * using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */
    function sub(x, y) {
        return new this(x).sub(y);
    }
    /*
   * Return a new Decimal whose value is the tangent of `x`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
    function tan(x) {
        return new this(x).tan();
    }
    /*
   * Return a new Decimal whose value is the hyperbolic tangent of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
    function tanh(x) {
    }
    /*
   * Return a new Decimal whose value is `x` truncated to an integer.
   *
   * x {number|string|Decimal}
   *
   */
    function trunc(x) {
        return finalise(x = new this(x));
    }
    // Create and configure initial Decimal constructor.
    Decimal = clone(DEFAULTS);
    Decimal['default'] = Decimal.Decimal = Decimal;
    PI = new Decimal(PI);
    // Export.
    // AMD.
    if (typeof define == 'function' && define.amd) {
    } else if (typeof module != 'undefined' && module.exports) {
        module.exports = Decimal;    // Browser.
    } else {
    }
}(this));