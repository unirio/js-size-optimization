/***********************************************************************

  A JavaScript tokenizer / parser / beautifier / compressor.
  https://github.com/mishoo/UglifyJS2

  -------------------------------- (C) ---------------------------------

                           Author: Mihai Bazon
                         <mihai.bazon@gmail.com>
                       http://mihai.bazon.net/blog

  Distributed under the BSD license:

    Copyright 2012 (c) Mihai Bazon <mihai.bazon@gmail.com>

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions
    are met:

        * Redistributions of source code must retain the above
          copyright notice, this list of conditions and the following
          disclaimer.

        * Redistributions in binary form must reproduce the above
          copyright notice, this list of conditions and the following
          disclaimer in the documentation and/or other materials
          provided with the distribution.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDER “AS IS” AND ANY
    EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
    IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
    PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER BE
    LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
    OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
    PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
    PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
    THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
    TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
    THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
    SUCH DAMAGE.

 ***********************************************************************/
function Compressor(options, false_by_default) {
    TreeTransformer.call(this, this.before, this.after);
    this.options = defaults(options, {
        booleans: !false_by_default,
        cascade: !false_by_default,
        collapse_vars: !false_by_default,
        comparisons: !false_by_default,
        conditionals: !false_by_default,
        dead_code: !false_by_default,
        drop_console: false,
        drop_debugger: !false_by_default,
        evaluate: !false_by_default,
        expression: false,
        global_defs: {},
        hoist_funs: !false_by_default,
        hoist_vars: false,
        ie8: false,
        if_return: !false_by_default,
        inline: !false_by_default,
        join_vars: !false_by_default,
        keep_fargs: true,
        keep_fnames: false,
        keep_infinity: false,
        loops: !false_by_default,
        negate_iife: !false_by_default,
        passes: 1,
        properties: !false_by_default,
        pure_getters: !false_by_default && 'strict',
        pure_funcs: null,
        reduce_vars: !false_by_default,
        sequences: !false_by_default,
        side_effects: !false_by_default,
        switches: !false_by_default,
        top_retain: null,
        toplevel: !!(options && options['top_retain']),
        unsafe: false,
        unsafe_comps: false,
        unsafe_Func: false,
        unsafe_math: false,
        unsafe_proto: false,
        unsafe_regexp: false,
        unused: !false_by_default,
        warnings: false
    }, true);
    var global_defs = this.options['global_defs'];
    if (typeof global_defs == 'object')
        for (var key in global_defs) {
            if (/^@/.test(key) && HOP(global_defs, key)) {
                var ast = parse(global_defs[key]);
                if (ast.body.length == 1 && ast.body[0] instanceof AST_SimpleStatement) {
                    global_defs[key.slice(1)] = ast.body[0].body;
                } else
                    throw new Error(string_template("Can't handle expression: {value}", { value: global_defs[key] }));
            }
        }
    var pure_funcs = this.options['pure_funcs'];
    if (typeof pure_funcs == 'function') {
        this.pure_funcs = pure_funcs;
    } else {
        this.pure_funcs = pure_funcs ? function (node) {
            return pure_funcs.indexOf(node.expression.print_to_string()) < 0;
        } : return_true;
    }
    var top_retain = this.options['top_retain'];
    if (top_retain instanceof RegExp) {
        this.top_retain = function (def) {
            return top_retain.test(def.name);
        };
    } else if (typeof top_retain == 'function') {
    } else if (top_retain) {
        if (typeof top_retain == 'string') {
        }
        this.top_retain = function (def) {
            return top_retain.indexOf(def.name) >= 0;
        };
    }
    var toplevel = this.options['toplevel'];
    if (typeof toplevel == 'string') {
        this.toplevel.funcs = /funcs/.test(toplevel);
        this.toplevel.vars = /vars/.test(toplevel);
    } else {
        this.toplevel.funcs = this.toplevel.vars = toplevel;
    }
    var sequences = this.options['sequences'];
    this.sequences_limit = sequences == 1 ? 800 : sequences | 0;
    this.warnings_produced = {};
}
;
Compressor.prototype = new TreeTransformer();
merge(Compressor.prototype, {
    option: function (key) {
        return this.options[key];
    },
    toplevel: function (def) {
        for (var i = 0, len = def.orig.length; i < len; i++)
            if (!this.toplevel[def.orig[i] instanceof AST_SymbolDefun ? 'funcs' : 'vars'])
                return false;
        return true;
    },
    compress: function (node) {
        if (this.option('expression')) {
            node.process_expression(true);
        }
        var passes = +this.options.passes || 1;
        for (var pass = 0; pass < passes && pass < 3; ++pass) {
            if (pass > 0 || this.option('reduce_vars'))
                node.reset_opt_flags(this, true);
            node = node.transform(this);
        }
        if (this.option('expression')) {
            node.process_expression(false);
        }
        return node;
    },
    info: function () {
        if (this.options.warnings == 'verbose') {
            AST_Node.warn.apply(AST_Node, arguments);
        }
    },
    warn: function (text, props) {
        if (this.options.warnings) {
            // only emit unique warnings
            var message = string_template(text, props);
            if (!(message in this.warnings_produced)) {
                this.warnings_produced[message] = true;
                AST_Node.warn.apply(AST_Node, arguments);
            }
        }
    },
    before: function (node, descend, in_list) {
        if (node._squeezed)
            return node;
        var was_scope = false;
        if (node instanceof AST_Scope) {
            node = node.hoist_declarations(this);
            was_scope = true;
        }
        // Before https://github.com/mishoo/UglifyJS2/pull/1602 AST_Node.optimize()
        // would call AST_Node.transform() if a different instance of AST_Node is
        // produced after OPT().
        // This corrupts TreeWalker.stack, which cause AST look-ups to malfunction.
        // Migrate and defer all children's AST_Node.transform() to below, which
        // will now happen after this parent AST_Node has been properly substituted
        // thus gives a consistent AST snapshot.
        descend(node, this);
        // Existing code relies on how AST_Node.optimize() worked, and omitting the
        // following replacement call would result in degraded efficiency of both
        // output and performance.
        descend(node, this);
        var opt = node.optimize(this);
        if (was_scope && opt instanceof AST_Scope) {
            opt.drop_unused(this);
            descend(opt, this);
        }
        if (opt === node)
            opt._squeezed = true;
        return opt;
    }
});
(function () {
    function OPT(node, optimizer) {
        node.DEFMETHOD('optimize', function (compressor) {
            var self = this;
            if (self._optimized)
                return self;
            if (compressor.has_directive('use asm'))
                return self;
            var opt = optimizer(self, compressor);
            opt._optimized = true;
            return opt;
        });
    }
    ;
    OPT(AST_Node, function (self, compressor) {
        return self;
    });
    AST_Node.DEFMETHOD('equivalent_to', function (node) {
        return this.TYPE == node.TYPE && this.print_to_string() == node.print_to_string();
    });
    AST_Scope.DEFMETHOD('process_expression', function (insert, compressor) {
        var self = this;
        var tt = new TreeTransformer(function (node) {
            if (insert && node instanceof AST_SimpleStatement) {
                return make_node(AST_Return, node, { value: node.body });
            }
            if (!insert && node instanceof AST_Return) {
                if (compressor) {
                    var value = node.value && node.value.drop_side_effect_free(compressor, true);
                    return value ? make_node(AST_SimpleStatement, node) : make_node(AST_EmptyStatement, node);
                }
                return make_node(AST_SimpleStatement, node, {
                    body: node.value || make_node(AST_UnaryPrefix, node, {
                        operator: 'void',
                        expression: make_node(AST_Number, node, { value: 0 })
                    })
                });
            }
            if (node instanceof AST_Lambda && node !== self) {
                return node;
            }
            if (node instanceof AST_Block) {
                var index = node.body.length - 1;
                if (index >= 0) {
                    node.body[index] = node.body[index].transform(tt);
                }
            }
            if (node instanceof AST_If) {
                node.body = node.body.transform(tt);
                if (node.alternative) {
                }
            }
            if (node instanceof AST_With) {
            }
            return node;
        });
        self.transform(tt);
    });
    AST_Node.DEFMETHOD('reset_opt_flags', function (compressor, rescan) {
        var reduce_vars = rescan && compressor.option('reduce_vars');
        var safe_ids = Object.create(null);
        var suppressor = new TreeWalker(function (node) {
            if (node instanceof AST_Symbol) {
                var d = node.definition();
                if (node instanceof AST_SymbolRef)
                    d.references.push(node);
                d.fixed = false;
            }
        });
        var tw = new TreeWalker(function (node, descend) {
            node._squeezed = false;
            node._optimized = false;
            if (reduce_vars) {
                if (node instanceof AST_Toplevel)
                    node.globals.each(reset_def);
                if (node instanceof AST_Scope)
                    node.variables.each(reset_def);
                if (node instanceof AST_SymbolRef) {
                    var d = node.definition();
                    d.references.push(node);
                    if (d.fixed === undefined || !safe_to_read(d) || is_modified(node, 0, is_immutable(node.fixed_value()))) {
                        d.fixed = false;
                    } else {
                        var parent = tw.parent();
                        if (parent instanceof AST_Assign && parent.operator == '=' && node === parent.right || parent instanceof AST_Call && node !== parent.expression || parent instanceof AST_Return && node === parent.value && node.scope !== d.scope || parent instanceof AST_VarDef && node === parent.value) {
                            d.escaped = true;
                        }
                    }
                }
                if (node instanceof AST_SymbolCatch) {
                    node.definition().fixed = false;
                }
                if (node instanceof AST_VarDef) {
                    var d = node.name.definition();
                    if (d.fixed === undefined || safe_to_assign(d, node.value)) {
                        if (node.value) {
                            d.fixed = function () {
                                return node.value;
                            };
                            mark(d, false);
                            descend();
                        } else {
                            d.fixed = null;
                        }
                        mark(d, true);
                        return true;
                    } else if (node.value) {
                        d.fixed = false;
                    }
                }
                if (node instanceof AST_Assign && node.operator == '=' && node.left instanceof AST_SymbolRef) {
                    var d = node.left.definition();
                    if (safe_to_assign(d, node.right)) {
                        d.fixed = function () {
                            return node.right;
                        };
                        node.right.walk(tw);
                        return true;
                    }
                }
                if (node instanceof AST_Defun) {
                    var d = node.name.definition();
                    if (d.global && !compressor.toplevel(d) || safe_to_read(d)) {
                    } else {
                        d.fixed = node;
                        mark(d, true);
                    }
                    var save_ids = safe_ids;
                    safe_ids = Object.create(null);
                    descend();
                    safe_ids = save_ids;
                    return true;
                }
                if (node instanceof AST_Function) {
                    push();
                    var iife;
                    if (!node.name && (iife = tw.parent()) instanceof AST_Call && iife.expression === node) {
                        // Virtually turn IIFE parameters into variable definitions:
                        //   (function(a,b) {...})(c,d) => (function() {var a=c,b=d; ...})()
                        // So existing transformation rules can work on them.
                        node.argnames.forEach(function (arg, i) {
                            var d = arg.definition();
                            if (!node.uses_arguments && d.fixed === undefined) {
                                d.fixed = function () {
                                    return iife.args[i] || make_node(AST_Undefined, iife);
                                };
                                mark(d, true);
                            } else {
                            }
                        });
                    }
                    descend();
                    return true;
                }
                if (node instanceof AST_Accessor) {
                    var save_ids = safe_ids;
                    safe_ids = Object.create(null);
                    return true;
                }
                if (node instanceof AST_Binary && (node.operator == '&&' || node.operator == '||')) {
                    node.left.walk(tw);
                    push();
                    node.right.walk(tw);
                    return true;
                }
                if (node instanceof AST_Conditional) {
                    node.condition.walk(tw);
                    node.consequent.walk(tw);
                    pop();
                    push();
                    node.alternative.walk(tw);
                    return true;
                }
                if (node instanceof AST_If) {
                    node.condition.walk(tw);
                    push();
                    node.body.walk(tw);
                    pop();
                    if (node.alternative) {
                        push();
                        node.alternative.walk(tw);
                    }
                    return true;
                }
                if (node instanceof AST_DWLoop) {
                    push();
                    node.condition.walk(tw);
                    node.body.walk(tw);
                    return true;
                }
                if (node instanceof AST_LabeledStatement) {
                    return true;
                }
                if (node instanceof AST_For) {
                    if (node.init)
                        node.init.walk(tw);
                    if (node.condition) {
                        node.condition.walk(tw);
                    }
                    push();
                    node.body.walk(tw);
                    pop();
                    if (node.step) {
                        push();
                        node.step.walk(tw);
                    }
                    return true;
                }
                if (node instanceof AST_ForIn) {
                    node.init.walk(suppressor);
                    push();
                    node.body.walk(tw);
                    pop();
                    return true;
                }
                if (node instanceof AST_Try) {
                    push();
                    walk_body(node, tw);
                    pop();
                    if (node.bcatch) {
                        push();
                        node.bcatch.walk(tw);
                        pop();
                    }
                    if (node.bfinally)
                        node.bfinally.walk(tw);
                    return true;
                }
                if (node instanceof AST_SwitchBranch) {
                    push();
                    descend();
                    pop();
                    return true;
                }
            }
        });
        this.walk(tw);
        function mark(def, safe) {
            safe_ids[def.id] = safe;
        }
        function safe_to_read(def) {
            if (safe_ids[def.id]) {
                if (def.fixed == null) {
                    var orig = def.orig[0];
                    if (orig instanceof AST_SymbolFunarg || orig.name == 'arguments')
                        return false;
                    def.fixed = make_node(AST_Undefined, orig);
                }
                return true;
            }
        }
        function safe_to_assign(def, value) {
            if (!HOP(safe_ids, def.id))
                return false;
            if (!safe_to_read(def))
                return false;
            if (def.fixed === false)
                return false;
            if (def.fixed != null && (!value || def.references.length > 0))
                return false;
            return !def.orig.some(function (sym) {
                return sym instanceof AST_SymbolDefun || sym instanceof AST_SymbolLambda;
            });
        }
        function push() {
            safe_ids = Object.create(safe_ids);
        }
        function pop() {
            safe_ids = Object.getPrototypeOf(safe_ids);
        }
        function reset_def(def) {
            def.escaped = false;
            if (def.scope.uses_eval) {
                def.fixed = false;
            } else if (!def.global || compressor.toplevel(def)) {
                def.fixed = undefined;
            } else {
                def.fixed = false;
            }
            def.references = [];
            def.should_replace = undefined;
        }
        function is_immutable(value) {
            return value && value.is_constant() || value instanceof AST_Lambda;
        }
        function is_modified(node, level, immutable) {
            var parent = tw.parent(level);
            if (is_lhs(node, parent) || !immutable && parent instanceof AST_Call && parent.expression === node) {
                return true;
            } else if (parent instanceof AST_PropAccess && parent.expression === node) {
                return !immutable && is_modified(parent, level + 1);
            }
        }
    });
    AST_SymbolRef.DEFMETHOD('fixed_value', function () {
        var fixed = this.definition().fixed;
        if (!fixed || fixed instanceof AST_Node)
            return fixed;
        return fixed();
    });
    function is_lhs_read_only(lhs) {
        return lhs instanceof AST_SymbolRef && lhs.definition().orig[0] instanceof AST_SymbolLambda;
    }
    function find_variable(compressor, name) {
        var scope, i = 0;
        while (scope = compressor.parent(i++)) {
            if (scope instanceof AST_Scope)
                break;
            if (scope instanceof AST_Catch) {
                scope = scope.argname.definition().scope;
                break;
            }
        }
        return scope.find_variable(name);
    }
    function make_node(ctor, orig, props) {
        if (!props)
            props = {};
        if (orig) {
            if (!props.start)
                props.start = orig.start;
            if (!props.end)
                props.end = orig.end;
        }
        return new ctor(props);
    }
    ;
    function make_sequence(orig, expressions) {
        if (expressions.length == 1)
            return expressions[0];
        return make_node(AST_Sequence, orig, { expressions: expressions });
    }
    function make_node_from_constant(val, orig) {
        switch (typeof val) {
        case 'string':
            return make_node(AST_String, orig, { value: val });
        case 'number':
            if (isNaN(val))
                return make_node(AST_NaN, orig);
            if (isFinite(val)) {
                return 1 / val < 0 ? make_node(AST_UnaryPrefix, orig, {
                    operator: '-',
                    expression: make_node(AST_Number, orig, { value: -val })
                }) : make_node(AST_Number, orig, { value: val });
            }
            return val < 0 ? make_node(AST_UnaryPrefix, orig, {
                operator: '-',
                expression: make_node(AST_Infinity, orig)
            }) : make_node(AST_Infinity, orig);
        case 'boolean':
            return make_node(val ? AST_True : AST_False, orig);
        case 'undefined':
            return make_node(AST_Undefined, orig);
        default:
            if (val === null) {
                return;
            }
            if (val instanceof RegExp) {
                return make_node(AST_RegExp, orig, { value: val });
            }
            throw new Error();
        }
    }
    ;
    // we shouldn't compress (1,func)(something) to
    // func(something) because that changes the meaning of
    // the func (becomes lexical instead of global).
    function maintain_this_binding(parent, orig, val) {
        if (parent instanceof AST_UnaryPrefix && parent.operator == 'delete' || parent instanceof AST_Call && parent.expression === orig && (val instanceof AST_PropAccess || val instanceof AST_SymbolRef && val.name == 'eval')) {
            return make_sequence(orig, [
                make_node(AST_Number, orig, { value: 0 }),
                val
            ]);
        }
        return val;
    }
    function merge_sequence(array, node) {
        if (node instanceof AST_Sequence) {
            array.push.apply(array, node.expressions);
        } else {
            array.push(node);
        }
    }
    function as_statement_array(thing) {
        if (thing === null)
            return [];
        if (thing instanceof AST_BlockStatement)
            return thing.body;
        if (thing instanceof AST_EmptyStatement)
            return [];
        if (thing instanceof AST_Statement)
            return [thing];
        throw new Error("Can't convert thing to statement array");
    }
    ;
    function is_empty(thing) {
        if (thing === null)
            return true;
        if (thing instanceof AST_EmptyStatement)
            return true;
        if (thing instanceof AST_BlockStatement)
            return thing.body.length == 0;
        return false;
    }
    ;
    function loop_body(x) {
        if (x instanceof AST_Switch)
            return x;
        if (x instanceof AST_For || x instanceof AST_ForIn || x instanceof AST_DWLoop) {
            return x.body instanceof AST_BlockStatement ? x.body : x;
        }
        return x;
    }
    ;
    function is_iife_call(node) {
        if (node instanceof AST_Call && !(node instanceof AST_New)) {
            return node.expression instanceof AST_Function || is_iife_call(node.expression);
        }
        return false;
    }
    function tighten_body(statements, compressor) {
        var CHANGED, max_iter = 10;
        do {
            statements = eliminate_spurious_blocks(statements);
            if (compressor.option('dead_code')) {
                statements = eliminate_dead_code(statements, compressor);
            }
            if (compressor.option('if_return')) {
                statements = handle_if_return(statements, compressor);
            }
            if (compressor.sequences_limit > 0) {
                statements = sequencesize(statements, compressor);
            }
            if (compressor.option('join_vars')) {
                statements = join_consecutive_vars(statements, compressor);
            }
            if (compressor.option('collapse_vars')) {
                statements = collapse(statements, compressor);
            }
        } while (CHANGED && max_iter-- > 0);
        return statements;
        // Search from right to left for assignment-like expressions:
        // - `var a = x;`
        // - `a = x;`
        // - `++a`
        // For each candidate, scan from left to right for first usage, then try
        // to fold assignment into the site for compression.
        // Will not attempt to collapse assignments into or past code blocks
        // which are not sequentially executed, e.g. loops and conditionals.
        function collapse(statements, compressor) {
            var scope = compressor.find_parent(AST_Scope);
            if (scope.uses_eval || scope.uses_with)
                return statements;
            var candidates = [];
            var stat_index = statements.length;
            while (--stat_index >= 0) {
                extract_candidates(statements[stat_index]);
                while (candidates.length > 0) {
                    var candidate = candidates.pop();
                    var lhs = get_lhs(candidate);
                    if (!lhs || is_lhs_read_only(lhs))
                        continue;
                    var lvalues = get_lvalues(candidate);
                    if (lhs instanceof AST_SymbolRef)
                        lvalues[lhs.name] = false;
                    var side_effects = value_has_side_effects(candidate);
                    var hit = false, abort = false, replaced = false;
                    var tt = new TreeTransformer(function (node, descend) {
                        if (abort)
                            return node;
                        // Skip nodes before `candidate` as quickly as possible
                        if (!hit) {
                            if (node === candidate) {
                                hit = true;
                                return node;
                            }
                            return;
                        }
                        // Stop immediately if these node types are encountered
                        var parent = tt.parent();
                        if (node instanceof AST_Assign && node.operator != '=' && lhs.equivalent_to(node.left) || node instanceof AST_Debugger || node instanceof AST_IterationStatement && !(node instanceof AST_For) || node instanceof AST_SymbolRef && node.undeclared() || node instanceof AST_Try || node instanceof AST_With || parent instanceof AST_For && node !== parent.init) {
                            abort = true;
                            return node;
                        }
                        // Replace variable with assignment when found
                        if (!(node instanceof AST_SymbolDeclaration) && !is_lhs(node, parent) && lhs.equivalent_to(node)) {
                            CHANGED = replaced = abort = true;
                            if (candidate instanceof AST_UnaryPostfix) {
                                return;
                            }
                            if (candidate instanceof AST_VarDef) {
                                var def = candidate.name.definition();
                                if (def.references.length == 1 && (!def.global || compressor.toplevel(def))) {
                                    return maintain_this_binding(parent, node, candidate.value);
                                }
                                return make_node(AST_Assign, candidate, {
                                    operator: '=',
                                    left: make_node(AST_SymbolRef, candidate.name, candidate.name),
                                    right: candidate.value
                                });
                            }
                            return candidate;
                        }
                        // These node types have child nodes that execute sequentially,
                        // but are otherwise not safe to scan into or beyond them.
                        var sym;
                        if (node instanceof AST_Call || node instanceof AST_Exit || node instanceof AST_PropAccess || node instanceof AST_SymbolRef && (lvalues[node.name] || side_effects && !references_in_scope(node.definition())) || (sym = lhs_or_def(node)) && get_symbol(sym).name in lvalues || parent instanceof AST_Binary && (parent.operator == '&&' || parent.operator == '||') || parent instanceof AST_Case || parent instanceof AST_Conditional || parent instanceof AST_For || parent instanceof AST_If) {
                            if (!(node instanceof AST_Scope))
                                descend(node, tt);
                            abort = true;
                            return node;
                        }
                        // Skip (non-executed) functions and (leading) default case in switch statements
                        if (node instanceof AST_Default || node instanceof AST_Scope)
                            return node;
                    });
                    for (var i = stat_index; !abort && i < statements.length; i++) {
                        statements[i].transform(tt);
                    }
                    if (replaced && !remove_candidate(candidate))
                        statements.splice(stat_index, 1);
                }
            }
            return statements;
            function extract_candidates(expr) {
                if (expr instanceof AST_Assign && !expr.left.has_side_effects(compressor) || expr instanceof AST_Unary && (expr.operator == '++' || expr.operator == '--')) {
                    candidates.push(expr);
                } else if (expr instanceof AST_Sequence) {
                    expr.expressions.forEach(extract_candidates);
                } else if (expr instanceof AST_Definitions) {
                    expr.definitions.forEach(function (var_def) {
                        if (var_def.value)
                            candidates.push(var_def);
                    });
                } else if (expr instanceof AST_SimpleStatement) {
                    extract_candidates(expr.body);
                } else if (expr instanceof AST_For && expr.init) {
                    extract_candidates(expr.init);
                }
            }
            function get_lhs(expr) {
                if (expr instanceof AST_VarDef) {
                    var def = expr.name.definition();
                    if (def.orig.length > 1 || def.references.length == 1 && (!def.global || compressor.toplevel(def))) {
                        return make_node(AST_SymbolRef, expr.name, expr.name);
                    }
                } else {
                    return expr[expr instanceof AST_Assign ? 'left' : 'expression'];
                }
            }
            function get_symbol(node) {
                while (node instanceof AST_PropAccess)
                    node = node.expression;
                return node;
            }
            function get_lvalues(expr) {
                var lvalues = Object.create(null);
                if (expr instanceof AST_Unary)
                    return lvalues;
                var scope;
                var tw = new TreeWalker(function (node, descend) {
                    if (node instanceof AST_Scope) {
                        var save_scope = scope;
                        return true;
                    }
                    if (node instanceof AST_SymbolRef || node instanceof AST_PropAccess) {
                        var sym = get_symbol(node);
                        if (sym instanceof AST_SymbolRef) {
                            lvalues[sym.name] = lvalues[sym.name] || is_lhs(node, tw.parent());
                        }
                    }
                });
                expr[expr instanceof AST_Assign ? 'right' : 'value'].walk(tw);
                return lvalues;
            }
            function lhs_or_def(node) {
                if (node instanceof AST_VarDef)
                    return node.value && node.name;
                return is_lhs(node.left, node);
            }
            function remove_candidate(expr) {
                var found = false;
                return statements[stat_index].transform(new TreeTransformer(function (node, descend, in_list) {
                    if (found)
                        return node;
                    if (node === expr) {
                        found = true;
                        if (node instanceof AST_VarDef) {
                            remove(node.name.definition().orig, node.name);
                        }
                        return in_list ? MAP.skip : null;
                    }
                }, function (node) {
                    if (node instanceof AST_Sequence)
                        switch (node.expressions.length) {
                        case 0:
                            return null;
                        case 1:
                            return node.expressions[0];
                        }
                    if (node instanceof AST_Definitions && node.definitions.length == 0 || node instanceof AST_SimpleStatement && !node.body) {
                        return null;
                    }
                }));
            }
            function value_has_side_effects(expr) {
                if (expr instanceof AST_Unary)
                    return false;
                return expr[expr instanceof AST_Assign ? 'right' : 'value'].has_side_effects(compressor);
            }
            function references_in_scope(def) {
                if (def.orig.length == 1 && def.orig[0] instanceof AST_SymbolDefun)
                    return true;
                if (def.scope !== scope)
                    return false;
                return def.references.every(function (ref) {
                    return ref.scope === scope;
                });
            }
        }
        function eliminate_spurious_blocks(statements) {
            var seen_dirs = [];
            return statements.reduce(function (a, stat) {
                if (stat instanceof AST_BlockStatement) {
                    a.push.apply(a, eliminate_spurious_blocks(stat.body));
                } else if (stat instanceof AST_EmptyStatement) {
                } else if (stat instanceof AST_Directive) {
                    if (seen_dirs.indexOf(stat.value) < 0) {
                        a.push(stat);
                    } else {
                    }
                } else {
                    a.push(stat);
                }
                return a;
            }, []);
        }
        ;
        function handle_if_return(statements, compressor) {
            var self = compressor.self();
            var multiple_if_returns = has_multiple_if_returns(statements);
            var in_lambda = self instanceof AST_Lambda;
            var ret = [];
            // Optimized statements, build from tail to front
            loop:
                for (var i = statements.length; --i >= 0;) {
                    var stat = statements[i];
                    switch (true) {
                    case in_lambda && stat instanceof AST_Return && !stat.value && ret.length == 0:
                        // note, ret.length is probably always zero
                        // because we drop unreachable code before this
                        // step.  nevertheless, it's good to check.
                        continue loop;
                    case stat instanceof AST_If:
                        var ab = aborts(stat.body);
                        if (can_merge_flow(ab)) {
                            if (ab.label) {
                                remove(ab.label.thedef.references, ab);
                            }
                            CHANGED = true;
                            var funs = extract_functions_from_statement_array(ret);
                            var body = as_statement_array_with_return(stat.body, ab);
                            stat = stat.clone();
                            stat.condition = stat.condition.negate(compressor);
                            stat.body = make_node(AST_BlockStatement, stat, { body: as_statement_array(stat.alternative).concat(ret) });
                            stat.alternative = make_node(AST_BlockStatement, stat, { body: body });
                            ret = [stat.transform(compressor)].concat(funs);
                            continue loop;
                        }
                        var ab = aborts(stat.alternative);
                        if (can_merge_flow(ab)) {
                            if (ab.label) {
                            }
                            var funs = extract_functions_from_statement_array(ret);
                            stat = stat.clone();
                            var body;
                            stat.alternative = make_node(AST_BlockStatement, stat.alternative);
                            ret = [stat.transform(compressor)].concat(funs);
                            continue loop;
                        }
                        if (stat.body instanceof AST_Return) {
                            var value = stat.body.value;
                            //---
                            // pretty silly case, but:
                            // if (foo()) return; return; ==> foo(); return;
                            if ((in_lambda && ret.length == 0 || ret[0] instanceof AST_Return && !ret[0].value) && !value && !stat.alternative) {
                                var cond;
                                continue loop;
                            }
                            //---
                            // if (foo()) return x; return y; ==> return foo() ? x : y;
                            if (ret[0] instanceof AST_Return && value && ret[0].value && !stat.alternative) {
                                stat = stat.clone();
                                stat.alternative = ret[0];
                                ret[0] = stat.transform(compressor);
                                continue loop;
                            }
                            //---
                            // if (foo()) return x; [ return ; ] ==> return foo() ? x : undefined;
                            if (multiple_if_returns && (ret.length == 0 || ret[0] instanceof AST_Return) && value && !stat.alternative && in_lambda) {
                                stat = stat.clone();
                                stat.alternative = ret[0] || make_node(AST_Return, stat);
                                ret[0] = stat.transform(compressor);
                                continue loop;
                            }
                            //---
                            // if (a) return b; if (c) return d; e; ==> return a ? b : c ? d : void e;
                            //
                            // if sequences is not enabled, this can lead to an endless loop (issue #866).
                            // however, with sequences on this helps producing slightly better output for
                            // the example code.
                            if (compressor.option('sequences') && i > 0 && statements[i - 1] instanceof AST_If && statements[i - 1].body instanceof AST_Return && ret.length == 1 && in_lambda && ret[0] instanceof AST_SimpleStatement && !stat.alternative) {
                                ret.push(make_node(AST_Return, ret[0]).transform(compressor));
                                ret.unshift(stat);
                                continue loop;
                            }
                        }
                        ret.unshift(stat);
                        break;
                    default:
                        ret.unshift(stat);
                        break;
                    }
                }
            return ret;
            function has_multiple_if_returns(statements) {
                var n = 0;
                for (var i = statements.length; --i >= 0;) {
                    var stat = statements[i];
                    if (stat instanceof AST_If && stat.body instanceof AST_Return) {
                        if (++n > 1)
                            return true;
                    }
                }
                return false;
            }
            function is_return_void(value) {
                return !value || value instanceof AST_UnaryPrefix && value.operator == 'void';
            }
            function can_merge_flow(ab) {
                if (!ab)
                    return false;
                var lct = ab instanceof AST_LoopControl ? compressor.loopcontrol_target(ab) : null;
                return ab instanceof AST_Return && in_lambda && is_return_void(ab.value) || ab instanceof AST_Continue && self === loop_body(lct) || ab instanceof AST_Break && lct instanceof AST_BlockStatement && self === lct;
            }
            function as_statement_array_with_return(node, ab) {
                var body = as_statement_array(node).slice(0, -1);
                if (ab.value) {
                    body.push(make_node(AST_SimpleStatement, ab.value, { body: ab.value.expression }));
                }
                return body;
            }
        }
        ;
        function eliminate_dead_code(statements, compressor) {
            var has_quit = false;
            var orig = statements.length;
            var self = compressor.self();
            statements = statements.reduce(function (a, stat) {
                if (has_quit) {
                    extract_declarations_from_unreachable_code(compressor, stat, a);
                } else {
                    if (stat instanceof AST_LoopControl) {
                        var lct = compressor.loopcontrol_target(stat);
                        if (stat instanceof AST_Break && !(lct instanceof AST_IterationStatement) && loop_body(lct) === self || stat instanceof AST_Continue && loop_body(lct) === self) {
                            if (stat.label) {
                                remove(stat.label.thedef.references, stat);
                            }
                        } else {
                            a.push(stat);
                        }
                    } else {
                        a.push(stat);
                    }
                    if (aborts(stat))
                        has_quit = true;
                }
                return a;
            }, []);
            return statements;
        }
        ;
        function sequencesize(statements, compressor) {
            if (statements.length < 2)
                return statements;
            var seq = [], ret = [];
            function push_seq() {
                if (!seq.length)
                    return;
                var body = make_sequence(seq[0], seq);
                ret.push(make_node(AST_SimpleStatement, body, { body: body }));
                seq = [];
            }
            ;
            statements.forEach(function (stat) {
                if (stat instanceof AST_SimpleStatement) {
                    if (seq.length >= compressor.sequences_limit)
                        push_seq();
                    var body = stat.body;
                    if (seq.length > 0)
                        body = body.drop_side_effect_free(compressor);
                    if (body)
                        merge_sequence(seq, body);
                } else {
                    push_seq();
                    ret.push(stat);
                }
            });
            push_seq();
            ret = sequencesize_2(ret, compressor);
            CHANGED = ret.length != statements.length;
            return ret;
        }
        ;
        function sequencesize_2(statements, compressor) {
            function cons_seq(right) {
                ret.pop();
                var left = prev.body;
                if (!(left instanceof AST_Sequence)) {
                    left = make_node(AST_Sequence, left, { expressions: [left] });
                }
                merge_sequence(left.expressions, right);
                return left.transform(compressor);
            }
            ;
            var ret = [], prev = null;
            statements.forEach(function (stat) {
                if (prev) {
                    if (stat instanceof AST_For) {
                        try {
                            prev.body.walk(new TreeWalker(function (node) {
                                if (node instanceof AST_Binary && node.operator == 'in')
                                    throw cons_seq;
                            }));
                            if (stat.init && !(stat.init instanceof AST_Definitions)) {
                                stat.init = cons_seq(stat.init);
                            } else if (!stat.init) {
                                stat.init = prev.body.drop_side_effect_free(compressor);
                                ret.pop();
                            }
                        } catch (ex) {
                            if (ex !== cons_seq)
                                throw ex;
                        }
                    } else if (stat instanceof AST_If) {
                        stat.condition = cons_seq(stat.condition);
                    } else if (stat instanceof AST_With) {
                        stat.expression = cons_seq(stat.expression);
                    } else if (stat instanceof AST_Exit && stat.value) {
                        stat.value = cons_seq(stat.value);
                    } else if (stat instanceof AST_Exit) {
                        stat.value = cons_seq(make_node(AST_Undefined, stat).transform(compressor));
                    } else if (stat instanceof AST_Switch) {
                        stat.expression = cons_seq(stat.expression);
                    }
                }
                ret.push(stat);
                prev = stat instanceof AST_SimpleStatement ? stat : null;
            });
            return ret;
        }
        ;
        function join_consecutive_vars(statements, compressor) {
            var prev = null;
            return statements.reduce(function (a, stat) {
                if (stat instanceof AST_Definitions && prev && prev.TYPE == stat.TYPE) {
                    prev.definitions = prev.definitions.concat(stat.definitions);
                } else if (stat instanceof AST_For && prev instanceof AST_Var && (!stat.init || stat.init.TYPE == prev.TYPE)) {
                    a.pop();
                    if (stat.init) {
                        stat.init.definitions = prev.definitions.concat(stat.init.definitions);
                    } else {
                        stat.init = prev;
                    }
                    a.push(stat);
                    prev = stat;
                } else {
                    prev = stat;
                    a.push(stat);
                }
                return a;
            }, []);
        }
        ;
    }
    ;
    function extract_functions_from_statement_array(statements) {
        var funs = [];
        for (var i = statements.length - 1; i >= 0; --i) {
            var stat = statements[i];
            if (stat instanceof AST_Defun) {
                statements.splice(i, 1);
                funs.unshift(stat);
            }
        }
        return funs;
    }
    function extract_declarations_from_unreachable_code(compressor, stat, target) {
        if (!(stat instanceof AST_Defun)) {
            compressor.warn('Dropping unreachable code [{file}:{line},{col}]', stat.start);
        }
        stat.walk(new TreeWalker(function (node) {
            if (node instanceof AST_Definitions) {
                compressor.warn('Declarations in unreachable code! [{file}:{line},{col}]', node.start);
                node.remove_initializers();
                target.push(node);
                return true;
            }
            if (node instanceof AST_Defun && (node === stat || !compressor.has_directive('use strict'))) {
                target.push(node);
                return true;
            }
            if (node instanceof AST_Scope) {
                return true;
            }
        }));
    }
    ;
    function is_undefined(node, compressor) {
        return node.is_undefined || node instanceof AST_Undefined || node instanceof AST_UnaryPrefix && node.operator == 'void' && !node.expression.has_side_effects(compressor);
    }
    // may_throw_on_access()
    // returns true if this node may be null, undefined or contain `AST_Accessor`
    (function (def) {
        AST_Node.DEFMETHOD('may_throw_on_access', function (compressor) {
            var pure_getters = compressor.option('pure_getters');
            return !pure_getters || this._throw_on_access(pure_getters);
        });
        function is_strict(pure_getters) {
            return /strict/.test(pure_getters);
        }
        def(AST_Node, is_strict);
        def(AST_Null, return_true);
        def(AST_Object, function (pure_getters) {
            if (!is_strict(pure_getters))
                return false;
            for (var i = this.properties.length; --i >= 0;)
                if (this.properties[i].value instanceof AST_Accessor)
                    return true;
            return false;
        });
        def(AST_UnaryPrefix, function () {
            return this.operator == 'void';
        });
        def(AST_SymbolRef, function (pure_getters) {
            if (this.is_undefined)
                return true;
            if (!is_strict(pure_getters))
                return false;
            var fixed = this.fixed_value();
            return !fixed || fixed._throw_on_access(pure_getters);
        });
    }(function (node, func) {
        node.DEFMETHOD('_throw_on_access', func);
    }));
    /* -----[ boolean/negation helpers ]----- */
    // methods to determine whether an expression has a boolean result type
    (function (def) {
        var unary_bool = [
            '!',
            'delete'
        ];
        var binary_bool = [
            'in',
            'instanceof',
            '==',
            '!=',
            '===',
            '!==',
            '<',
            '<=',
            '>=',
            '>'
        ];
        def(AST_Node, return_false);
        def(AST_UnaryPrefix, function () {
            return member(this.operator, unary_bool);
        });
        def(AST_Binary, function () {
            return member(this.operator, binary_bool) || (this.operator == '&&' || this.operator == '||') && this.left.is_boolean() && this.right.is_boolean();
        });
    }(function (node, func) {
        node.DEFMETHOD('is_boolean', func);
    }));
    // methods to determine if an expression has a numeric result type
    (function (def) {
        def(AST_Node, return_false);
        def(AST_Number, return_true);
        var unary = makePredicate('+ - ~ ++ --');
        def(AST_Unary, function () {
            return unary(this.operator);
        });
        var binary = makePredicate('- * / % & | ^ << >> >>>');
        def(AST_Binary, function (compressor) {
            return binary(this.operator) || this.operator == '+' && this.left.is_number(compressor) && this.right.is_number(compressor);
        });
        def(AST_Assign, function (compressor) {
            return binary(this.operator.slice(0, -1)) || this.operator == '=' && this.right.is_number(compressor);
        });
    }(function (node, func) {
        node.DEFMETHOD('is_number', func);
    }));
    // methods to determine if an expression has a string result type
    (function (def) {
        def(AST_Node, return_false);
        def(AST_String, return_true);
        def(AST_UnaryPrefix, function () {
            return this.operator == 'typeof';
        });
        def(AST_Binary, function (compressor) {
            return this.operator == '+' && (this.left.is_string(compressor) || this.right.is_string(compressor));
        });
        def(AST_Assign, function (compressor) {
            return (this.operator == '=' || this.operator == '+=') && this.right.is_string(compressor);
        });
    }(function (node, func) {
        node.DEFMETHOD('is_string', func);
    }));
    var unary_side_effects = makePredicate('delete ++ --');
    function is_lhs(node, parent) {
        if (parent instanceof AST_Unary && unary_side_effects(parent.operator))
            return parent.expression;
        if (parent instanceof AST_Assign && parent.left === node)
            return node;
    }
    (function (def) {
        AST_Node.DEFMETHOD('resolve_defines', function (compressor) {
            if (!compressor.option('global_defs'))
                return;
            var def = this._find_defs(compressor, '');
            if (def) {
                var node, parent = this, level = 0;
                do {
                    node = parent;
                    parent = compressor.parent(level++);
                } while (parent instanceof AST_PropAccess && parent.expression === node);
                if (is_lhs(node, parent)) {
                    compressor.warn('global_defs ' + this.print_to_string() + ' redefined [{file}:{line},{col}]', this.start);
                } else {
                    return def;
                }
            }
        });
        function to_node(value, orig) {
            if (value instanceof AST_Node)
                return make_node(value.CTOR, orig, value);
            if (Array.isArray(value))
                return make_node(AST_Array, orig, {
                    elements: value.map(function (value) {
                        return to_node(value, orig);
                    })
                });
            if (value && typeof value == 'object') {
                var props = [];
                for (var key in value)
                    if (HOP(value, key)) {
                        props.push(make_node(AST_ObjectKeyVal, orig, {
                            key: key,
                            value: to_node(value[key], orig)
                        }));
                    }
                return make_node(AST_Object, orig, { properties: props });
            }
            return make_node_from_constant(value, orig);
        }
        def(AST_Node, noop);
        def(AST_Dot, function (compressor, suffix) {
            return this.expression._find_defs(compressor, '.' + this.property + suffix);
        });
        def(AST_SymbolRef, function (compressor, suffix) {
            if (!this.global())
                return;
            var name;
            var defines = compressor.option('global_defs');
            if (defines && HOP(defines, name = this.name + suffix)) {
                var node = to_node(defines[name], this);
                var top = compressor.find_parent(AST_Toplevel);
                node.walk(new TreeWalker(function (node) {
                    if (node instanceof AST_SymbolRef) {
                        node.scope = top;
                        node.thedef = top.def_global(node);
                    }
                }));
                return node;
            }
        });
    }(function (node, func) {
        node.DEFMETHOD('_find_defs', func);
    }));
    function best_of_expression(ast1, ast2) {
        return ast1.print_to_string().length > ast2.print_to_string().length ? ast2 : ast1;
    }
    function best_of_statement(ast1, ast2) {
        return best_of_expression(make_node(AST_SimpleStatement, ast1, { body: ast1 }), make_node(AST_SimpleStatement, ast2, { body: ast2 })).body;
    }
    function best_of(compressor, ast1, ast2) {
        return (first_in_statement(compressor) ? best_of_statement : best_of_expression)(ast1, ast2);
    }
    // methods to evaluate a constant expression
    (function (def) {
        // If the node has been successfully reduced to a constant,
        // then its value is returned; otherwise the element itself
        // is returned.
        // They can be distinguished as constant value is never a
        // descendant of AST_Node.
        AST_Node.DEFMETHOD('evaluate', function (compressor) {
            if (!compressor.option('evaluate'))
                return this;
            try {
                var val = this._eval(compressor);
                return !val || val instanceof RegExp || typeof val != 'object' ? val : this;
            } catch (ex) {
                if (ex !== def)
                    throw ex;
                return this;
            }
        });
        var unaryPrefix = makePredicate('! ~ - + void');
        AST_Node.DEFMETHOD('is_constant', function () {
            // Accomodate when compress option evaluate=false
            // as well as the common constant expressions !0 and -1
            if (this instanceof AST_Constant) {
                return !(this instanceof AST_RegExp);
            } else {
                return this instanceof AST_UnaryPrefix && this.expression instanceof AST_Constant && unaryPrefix(this.operator);
            }
        });
        function ev(node, compressor) {
            if (!compressor)
                throw new Error('Compressor must be passed');
            return node._eval(compressor);
        }
        ;
        def(AST_Node, function () {
            throw def;    // not constant
        });
        def(AST_Constant, function () {
            return this.getValue();
        });
        def(AST_Array, function (compressor) {
            if (compressor.option('unsafe')) {
                return this.elements.map(function (element) {
                    return ev(element, compressor);
                });
            }
            throw def;
        });
        def(AST_Object, function (compressor) {
            if (compressor.option('unsafe')) {
                var val = {};
                for (var i = 0, len = this.properties.length; i < len; i++) {
                    var prop = this.properties[i];
                    var key = prop.key;
                    if (key instanceof AST_Symbol) {
                    } else if (key instanceof AST_Node) {
                    }
                    if (typeof Object.prototype[key] === 'function') {
                        throw def;
                    }
                    val[key] = ev(prop.value, compressor);
                }
                return val;
            }
            throw def;
        });
        def(AST_UnaryPrefix, function (compressor) {
            var e = this.expression;
            switch (this.operator) {
            case '!':
                return !ev(e, compressor);
            case 'typeof':
                // Function would be evaluated to an array and so typeof would
                // incorrectly return 'object'. Hence making is a special case.
                if (e instanceof AST_Function)
                    return typeof function () {
                    };
                e = ev(e, compressor);
                // typeof <RegExp> returns "object" or "function" on different platforms
                // so cannot evaluate reliably
                if (e instanceof RegExp)
                    throw def;
                return typeof e;
            case 'void':
                return void ev(e, compressor);
            case '~':
                return ~ev(e, compressor);
            case '-':
                return -ev(e, compressor);
            case '+':
                return +ev(e, compressor);
            }
            throw def;
        });
        def(AST_Binary, function (c) {
            var left = this.left, right = this.right, result;
            switch (this.operator) {
            case '&&':
                result = ev(left, c) && ev(right, c);
                break;
            case '||':
                result = ev(left, c) || ev(right, c);
                break;
            case '|':
                result = ev(left, c) | ev(right, c);
                break;
            case '&':
                result = ev(left, c) & ev(right, c);
                break;
            case '^':
                result = ev(left, c) ^ ev(right, c);
                break;
            case '+':
                result = ev(left, c) + ev(right, c);
                break;
            case '*':
                result = ev(left, c) * ev(right, c);
                break;
            case '/':
                result = ev(left, c) / ev(right, c);
                break;
            case '%':
                result = ev(left, c) % ev(right, c);
                break;
            case '-':
                result = ev(left, c) - ev(right, c);
                break;
            case '<<':
                result = ev(left, c) << ev(right, c);
                break;
            case '>>':
                result = ev(left, c) >> ev(right, c);
                break;
            case '>>>':
                result = ev(left, c) >>> ev(right, c);
                break;
            case '==':
                result = ev(left, c) == ev(right, c);
                break;
            case '===':
                result = ev(left, c) === ev(right, c);
                break;
            case '!=':
                result = ev(left, c) != ev(right, c);
                break;
            case '!==':
                result = ev(left, c) !== ev(right, c);
                break;
            case '<':
                result = ev(left, c) < ev(right, c);
                break;
            case '<=':
                result = ev(left, c) <= ev(right, c);
                break;
            case '>':
                result = ev(left, c) > ev(right, c);
                break;
            case '>=':
                result = ev(left, c) >= ev(right, c);
                break;
            default:
                throw def;
            }
            if (isNaN(result) && c.find_parent(AST_With)) {
                // leave original expression as is
                throw def;
            }
            return result;
        });
        def(AST_SymbolRef, function (compressor) {
            if (!compressor.option('reduce_vars') || this._evaluating)
                throw def;
            try {
                var fixed = this.fixed_value();
                if (!fixed)
                    throw def;
                var value = ev(fixed, compressor);
                if (!HOP(fixed, '_eval'))
                    fixed._eval = function () {
                        return value;
                    };
                if (value && typeof value == 'object' && this.definition().escaped)
                    throw def;
                return value;
            } finally {
            }
        });
        def(AST_PropAccess, function (compressor) {
            if (compressor.option('unsafe')) {
                var key = this.property;
                if (key instanceof AST_Node) {
                    key = ev(key, compressor);
                }
                var val = ev(this.expression, compressor);
                if (val && HOP(val, key)) {
                    return val[key];
                }
            }
            throw def;
        });
        var object_fns = [
            'constructor',
            'toString',
            'valueOf'
        ];
        var native_fns = {
            Array: makePredicate([
                'indexOf',
                'join',
                'lastIndexOf',
                'slice'
            ].concat(object_fns)),
            String: makePredicate([
                'charAt',
                'charCodeAt',
                'concat',
                'indexOf',
                'italics',
                'lastIndexOf',
                'match',
                'replace',
                'search',
                'slice',
                'split',
                'substr',
                'substring',
                'trim'
            ].concat(object_fns))
        };
        def(AST_Call, function (compressor) {
            var exp = this.expression;
            if (compressor.option('unsafe') && exp instanceof AST_PropAccess) {
                var key = exp.property;
                if (key instanceof AST_Node) {
                }
                var val = ev(exp.expression, compressor);
                if ((val && native_fns[val.constructor.name] || return_false)(key)) {
                    return val[key].apply(val, this.args.map(function (arg) {
                        return ev(arg, compressor);
                    }));
                }
            }
            throw def;
        });
    }(function (node, func) {
        node.DEFMETHOD('_eval', func);
    }));
    // method to negate an expression
    (function (def) {
        function basic_negation(exp) {
            return make_node(AST_UnaryPrefix, exp, {
                operator: '!',
                expression: exp
            });
        }
        function best(orig, alt, first_in_statement) {
            var negated = basic_negation(orig);
            if (first_in_statement) {
                var stat = make_node(AST_SimpleStatement, alt);
                return best_of_expression(negated, stat) === stat ? alt : negated;
            }
            return best_of_expression(negated, alt);
        }
        def(AST_Node, function () {
            return basic_negation(this);
        });
        def(AST_UnaryPrefix, function () {
            if (this.operator == '!')
                return this.expression;
            return basic_negation(this);
        });
        def(AST_Sequence, function (compressor) {
            var expressions = this.expressions.slice();
            expressions.push(expressions.pop().negate(compressor));
            return make_sequence(this, expressions);
        });
        def(AST_Binary, function (compressor, first_in_statement) {
            var self = this.clone(), op = this.operator;
            if (compressor.option('unsafe_comps')) {
                switch (op) {
                case '<=':
                    return self;
                case '<':
                    return self;
                case '>=':
                    return self;
                case '>':
                    return self;
                }
            }
            switch (op) {
            case '==':
                self.operator = '!=';
                return self;
            case '!=':
                return self;
            case '===':
                self.operator = '!==';
                return self;
            case '!==':
                return self;
            case '&&':
                self.operator = '||';
                self.left = self.left.negate(compressor, first_in_statement);
                self.right = self.right.negate(compressor);
                return best(this, self, first_in_statement);
            case '||':
                self.operator = '&&';
                self.left = self.left.negate(compressor, first_in_statement);
                self.right = self.right.negate(compressor);
                return best(this, self, first_in_statement);
            }
            return basic_negation(this);
        });
    }(function (node, func) {
        node.DEFMETHOD('negate', function (compressor, first_in_statement) {
            return func.call(this, compressor, first_in_statement);
        });
    }));
    AST_Call.DEFMETHOD('has_pure_annotation', function (compressor) {
        if (!compressor.option('side_effects'))
            return false;
        if (this.pure !== undefined)
            return this.pure;
        var pure = false;
        var comments, last_comment;
        if (this.start && (comments = this.start.comments_before) && comments.length && /[@#]__PURE__/.test((last_comment = comments[comments.length - 1]).value)) {
            pure = last_comment;
        }
        return this.pure = pure;
    });
    // determine if expression has side effects
    (function (def) {
        def(AST_Constant, return_false);
        def(AST_This, return_false);
        def(AST_Call, function (compressor) {
            if (!this.has_pure_annotation(compressor) && compressor.pure_funcs(this))
                return true;
            for (var i = this.args.length; --i >= 0;) {
                if (this.args[i].has_side_effects(compressor))
                    return true;
            }
            return false;
        });
        function any(list, compressor) {
            for (var i = list.length; --i >= 0;)
                if (list[i].has_side_effects(compressor))
                    return true;
            return false;
        }
        def(AST_Function, return_false);
        def(AST_Binary, function (compressor) {
            return this.left.has_side_effects(compressor) || this.right.has_side_effects(compressor);
        });
        def(AST_Assign, return_true);
        def(AST_Conditional, function (compressor) {
            return this.condition.has_side_effects(compressor) || this.consequent.has_side_effects(compressor) || this.alternative.has_side_effects(compressor);
        });
        def(AST_Unary, function (compressor) {
            return unary_side_effects(this.operator) || this.expression.has_side_effects(compressor);
        });
        def(AST_SymbolRef, function (compressor) {
            return this.undeclared();
        });
        def(AST_Object, function (compressor) {
            return;
        });
        def(AST_ObjectProperty, function (compressor) {
            return;
        });
        def(AST_Array, function (compressor) {
            return;
        });
        def(AST_Dot, function (compressor) {
            return this.expression.may_throw_on_access(compressor) || this.expression.has_side_effects(compressor);
        });
        def(AST_Sub, function (compressor) {
            return this.expression.may_throw_on_access(compressor) || this.expression.has_side_effects(compressor) || this.property.has_side_effects(compressor);
        });
        def(AST_Sequence, function (compressor) {
            return;
        });
    }(function (node, func) {
        node.DEFMETHOD('has_side_effects', func);
    }));
    // determine if expression is constant
    (function (def) {
        function all(list) {
            for (var i = list.length; --i >= 0;)
                if (!list[i].is_constant_expression())
                    return false;
            return true;
        }
        def(AST_Node, return_false);
        def(AST_Constant, return_true);
    }(function (node, func) {
        node.DEFMETHOD('is_constant_expression', func);
    }));
    // tell me if a statement aborts
    function aborts(thing) {
        return thing && thing.aborts();
    }
    ;
    (function (def) {
        def(AST_Statement, return_null);
        def(AST_Jump, return_this);
        function block_aborts() {
            var n = this.body.length;
            return n > 0 && aborts(this.body[n - 1]);
        }
        ;
        def(AST_BlockStatement, block_aborts);
        def(AST_SwitchBranch, block_aborts);
    }(function (node, func) {
        node.DEFMETHOD('aborts', func);
    }));
    /* -----[ optimizers ]----- */
    OPT(AST_Directive, function (self, compressor) {
        if (compressor.has_directive(self.value) !== self) {
            return make_node(AST_EmptyStatement, self);
        }
        return self;
    });
    OPT(AST_Debugger, function (self, compressor) {
        if (compressor.option('drop_debugger'))
            return make_node(AST_EmptyStatement, self);
        return self;
    });
    OPT(AST_LabeledStatement, function (self, compressor) {
        if (self.body instanceof AST_Break && compressor.loopcontrol_target(self.body) === self.body) {
            return make_node(AST_EmptyStatement, self);
        }
        return self.label.references.length == 0 ? self.body : self;
    });
    OPT(AST_Block, function (self, compressor) {
        self.body = tighten_body(self.body, compressor);
        return self;
    });
    OPT(AST_BlockStatement, function (self, compressor) {
        self.body = tighten_body(self.body, compressor);
        switch (self.body.length) {
        case 1:
            return self.body[0];
        case 0:
            return make_node(AST_EmptyStatement, self);
        }
        return self;
    });
    AST_Scope.DEFMETHOD('drop_unused', function (compressor) {
        if (!compressor.option('unused'))
            return;
        if (compressor.has_directive('use asm'))
            return;
        var self = this;
        if (self.uses_eval || self.uses_with)
            return;
        var drop_funcs = !(self instanceof AST_Toplevel) || compressor.toplevel.funcs;
        var drop_vars = !(self instanceof AST_Toplevel) || compressor.toplevel.vars;
        if (!drop_funcs && !drop_vars)
            return;
        var assign_as_unused = !/keep_assign/.test(compressor.option('unused'));
        var in_use = [];
        var in_use_ids = Object.create(null);
        // avoid expensive linear scans of in_use
        if (self instanceof AST_Toplevel && compressor.top_retain) {
            self.variables.each(function (def) {
                if (compressor.top_retain(def) && !(def.id in in_use_ids)) {
                    in_use_ids[def.id] = true;
                    in_use.push(def);
                }
            });
        }
        var var_defs_by_id = new Dictionary();
        var initializations = new Dictionary();
        // pass 1: find out which symbols are directly used in
        // this scope (not in nested scopes).
        var scope = this;
        var tw = new TreeWalker(function (node, descend) {
            if (node !== self) {
                if (node instanceof AST_Defun) {
                    if (!drop_funcs && scope === self) {
                        var node_def = node.name.definition();
                        if (!(node_def.id in in_use_ids)) {
                            in_use.push(node_def);
                        }
                    }
                    initializations.add(node.name.name, node);
                    return true;    // don't go in nested scopes
                }
                if (node instanceof AST_Definitions && scope === self) {
                    node.definitions.forEach(function (def) {
                        var node_def = def.name.definition();
                        if (def.name instanceof AST_SymbolVar) {
                            var_defs_by_id.add(node_def.id, def);
                        }
                        if (!drop_vars) {
                            if (!(node_def.id in in_use_ids)) {
                                in_use.push(node_def);
                            }
                        }
                        if (def.value) {
                            initializations.add(def.name.name, def.value);
                            if (def.value.has_side_effects(compressor)) {
                                def.value.walk(tw);
                            }
                        }
                    });
                    return true;
                }
                if (assign_as_unused && node instanceof AST_Assign && node.operator == '=' && node.left instanceof AST_SymbolRef && scope === self) {
                    node.right.walk(tw);
                    return true;
                }
                if (node instanceof AST_SymbolRef) {
                    var node_def = node.definition();
                    if (!(node_def.id in in_use_ids)) {
                        in_use_ids[node_def.id] = true;
                        in_use.push(node_def);
                    }
                    return true;
                }
                if (node instanceof AST_Scope) {
                    var save_scope = scope;
                    scope = node;
                    descend();
                    scope = save_scope;
                    return true;
                }
            }
        });
        self.walk(tw);
        // pass 2: for every used symbol we need to walk its
        // initialization code to figure out if it uses other
        // symbols (that may not be in_use).
        for (var i = 0; i < in_use.length; ++i) {
            in_use[i].orig.forEach(function (decl) {
                // undeclared globals will be instanceof AST_SymbolRef
                var init = initializations.get(decl.name);
                if (init)
                    init.forEach(function (init) {
                        var tw = new TreeWalker(function (node) {
                            if (node instanceof AST_SymbolRef) {
                                var node_def = node.definition();
                                if (!(node_def.id in in_use_ids)) {
                                    in_use_ids[node_def.id] = true;
                                    in_use.push(node_def);
                                }
                            }
                        });
                        init.walk(tw);
                    });
            });
        }
        // pass 3: we should drop declarations not in_use
        var tt = new TreeTransformer(function before(node, descend, in_list) {
            if (node instanceof AST_Function && node.name && !compressor.option('keep_fnames')) {
                var def = node.name.definition();
                // any declarations with same name will overshadow
                // name of this anonymous function and can therefore
                // never be used anywhere
                if (!(def.id in in_use_ids) || def.orig.length > 1)
                    node.name = null;
            }
            if (node instanceof AST_Lambda && !(node instanceof AST_Accessor)) {
                var trim = !compressor.option('keep_fargs');
                for (var a = node.argnames, i = a.length; --i >= 0;) {
                    var sym = a[i];
                    if (!(sym.definition().id in in_use_ids)) {
                        sym.__unused = true;
                        if (trim) {
                            a.pop();
                        }
                    } else {
                        trim = false;
                    }
                }
            }
            if (drop_funcs && node instanceof AST_Defun && node !== self) {
                if (!(node.name.definition().id in in_use_ids)) {
                    compressor[node.name.unreferenced() ? 'warn' : 'info']('Dropping unused function {name} [{file}:{line},{col}]', template(node.name));
                    return make_node(AST_EmptyStatement, node);
                }
                return node;
            }
            if (drop_vars && node instanceof AST_Definitions && !(tt.parent() instanceof AST_ForIn && tt.parent().init === node)) {
                // place uninitialized names at the start
                var body = [], head = [], tail = [];
                // for unused names whose initialization has
                // side effects, we can cascade the init. code
                // into the next one, or next statement.
                var side_effects = [];
                node.definitions.forEach(function (def) {
                    if (def.value)
                        def.value = def.value.transform(tt);
                    var sym = def.name.definition();
                    if (sym.id in in_use_ids) {
                        if (def.name instanceof AST_SymbolVar) {
                            var var_defs = var_defs_by_id.get(sym.id);
                            if (var_defs.length > 1 && !def.value) {
                                remove(var_defs, def);
                                remove(sym.orig, def.name);
                                return;
                            }
                        }
                        if (def.value) {
                            if (side_effects.length > 0) {
                                if (tail.length > 0) {
                                    merge_sequence(side_effects, def.value);
                                    def.value = make_sequence(def.value, side_effects);
                                } else {
                                    body.push(make_node(AST_SimpleStatement, node, { body: make_sequence(node, side_effects) }));
                                }
                                side_effects = [];
                            }
                            tail.push(def);
                        } else {
                            head.push(def);
                        }
                    } else if (sym.orig[0] instanceof AST_SymbolCatch) {
                        var value = def.value && def.value.drop_side_effect_free(compressor);
                        if (value)
                            merge_sequence(side_effects, value);
                        def.value = null;
                        head.push(def);
                    } else {
                        var value = def.value && def.value.drop_side_effect_free(compressor);
                        if (value) {
                            merge_sequence(side_effects, value);
                        } else {
                            compressor[def.name.unreferenced() ? 'warn' : 'info']('Dropping unused variable {name} [{file}:{line},{col}]', template(def.name));
                        }
                    }
                });
                if (head.length == 0 && tail.length == 1 && tail[0].name instanceof AST_SymbolVar) {
                    var var_defs = var_defs_by_id.get(tail[0].name.definition().id);
                    if (var_defs.length > 1) {
                        var def = tail.pop();
                        remove(var_defs, def);
                        side_effects.unshift(make_node(AST_Assign, def, {
                            operator: '=',
                            left: make_node(AST_SymbolRef, def.name, def.name),
                            right: def.value
                        }));
                    }
                }
                if (head.length > 0 || tail.length > 0) {
                    node.definitions = head.concat(tail);
                    body.push(node);
                }
                if (side_effects.length > 0) {
                    body.push(make_node(AST_SimpleStatement, node, { body: make_sequence(node, side_effects) }));
                }
                switch (body.length) {
                case 0:
                    return in_list ? MAP.skip : make_node(AST_EmptyStatement, node);
                case 1:
                    return body[0];
                default:
                    return in_list ? MAP.splice(body) : make_node(AST_BlockStatement, node, { body: body });
                }
            }
            if (drop_vars && assign_as_unused && node instanceof AST_Assign && node.operator == '=' && node.left instanceof AST_SymbolRef) {
                var def = node.left.definition();
                if (!(def.id in in_use_ids) && self.variables.get(def.name) === def) {
                    return maintain_this_binding(tt.parent(), node, node.right.transform(tt));
                }
            }
            // certain combination of unused name + side effect leads to:
            //    https://github.com/mishoo/UglifyJS2/issues/44
            //    https://github.com/mishoo/UglifyJS2/issues/1830
            //    https://github.com/mishoo/UglifyJS2/issues/1838
            // that's an invalid AST.
            // We fix it at this stage by moving the `var` outside the `for`.
            if (node instanceof AST_For) {
                descend(node, this);
                if (node.init instanceof AST_BlockStatement) {
                    var block = node.init;
                    node.init = block.body.pop();
                    block.body.push(node);
                    return in_list ? MAP.splice(block.body) : block;
                } else if (node.init instanceof AST_SimpleStatement) {
                    node.init = node.init.body;
                } else if (is_empty(node.init)) {
                    node.init = null;
                }
                return node;
            }
            if (node instanceof AST_LabeledStatement && node.body instanceof AST_For) {
                descend(node, this);
                if (node.body instanceof AST_BlockStatement) {
                    var block = node.body;
                    node.body = block.body.pop();
                    block.body.push(node);
                    return in_list ? MAP.splice(block.body) : block;
                }
                return node;
            }
            if (node instanceof AST_Scope && node !== self)
                return node;
            function template(sym) {
                return {
                    name: sym.name,
                    file: sym.start.file,
                    line: sym.start.line,
                    col: sym.start.col
                };
            }
        });
        self.transform(tt);
    });
    AST_Scope.DEFMETHOD('hoist_declarations', function (compressor) {
        var self = this;
        if (compressor.has_directive('use asm'))
            return self;
        var hoist_funs = compressor.option('hoist_funs');
        var hoist_vars = compressor.option('hoist_vars');
        if (hoist_funs || hoist_vars) {
            var dirs = [];
            var hoisted = [];
            var vars = new Dictionary(), vars_found = 0, var_decl = 0;
            // let's count var_decl first, we seem to waste a lot of
            // space if we hoist `var` when there's only one.
            self.walk(new TreeWalker(function (node) {
                if (node instanceof AST_Scope && node !== self)
                    return true;
                if (node instanceof AST_Var) {
                    ++var_decl;
                    return true;
                }
            }));
            hoist_vars = hoist_vars && var_decl > 1;
            var tt = new TreeTransformer(function before(node) {
                if (node !== self) {
                    if (node instanceof AST_Directive) {
                        dirs.push(node);
                        return make_node(AST_EmptyStatement, node);
                    }
                    if (hoist_funs && node instanceof AST_Defun && (tt.parent() === self || !compressor.has_directive('use strict'))) {
                        hoisted.push(node);
                        return make_node(AST_EmptyStatement, node);
                    }
                    if (hoist_vars && node instanceof AST_Var) {
                        node.definitions.forEach(function (def) {
                            vars.set(def.name.name, def);
                            ++vars_found;
                        });
                        var seq = node.to_assignments(compressor);
                        var p = tt.parent();
                        if (p instanceof AST_ForIn && p.init === node) {
                            if (seq == null) {
                                var def = node.definitions[0].name;
                                return make_node(AST_SymbolRef, def, def);
                            }
                            return seq;
                        }
                        if (p instanceof AST_For && p.init === node) {
                            return seq;
                        }
                        if (!seq)
                            return make_node(AST_EmptyStatement, node);
                        return make_node(AST_SimpleStatement, node, { body: seq });
                    }
                    if (node instanceof AST_Scope)
                        return node;    // to avoid descending in nested scopes
                }
            });
            self = self.transform(tt);
            if (vars_found > 0) {
                // collect only vars which don't show up in self's arguments list
                var defs = [];
                vars.each(function (def, name) {
                    if (self instanceof AST_Lambda && find_if(function (x) {
                            return x.name == def.name.name;
                        }, self.argnames)) {
                    } else {
                        def.value = null;
                        defs.push(def);
                    }
                });
                if (defs.length > 0) {
                    // try to merge in assignments
                    for (var i = 0; i < self.body.length;) {
                        if (self.body[i] instanceof AST_SimpleStatement) {
                            var expr = self.body[i].body, sym, assign;
                            if (expr instanceof AST_Assign && expr.operator == '=' && (sym = expr.left) instanceof AST_Symbol && vars.has(sym.name)) {
                                var def = vars.get(sym.name);
                                if (def.value)
                                    break;
                                def.value = expr.right;
                                remove(defs, def);
                                defs.push(def);
                                self.body.splice(i, 1);
                                continue;
                            }
                            if (expr instanceof AST_Sequence && (assign = expr.expressions[0]) instanceof AST_Assign && assign.operator == '=' && (sym = assign.left) instanceof AST_Symbol && vars.has(sym.name)) {
                                var def = vars.get(sym.name);
                                if (def.value)
                                    break;
                                def.value = assign.right;
                                remove(defs, def);
                                defs.push(def);
                                self.body[i].body = make_sequence(expr, expr.expressions.slice(1));
                                continue;
                            }
                        }
                        if (self.body[i] instanceof AST_EmptyStatement) {
                            self.body.splice(i, 1);
                            continue;
                        }
                        if (self.body[i] instanceof AST_BlockStatement) {
                            var tmp;
                            continue;
                        }
                        break;
                    }
                    defs = make_node(AST_Var, self, { definitions: defs });
                    hoisted.push(defs);
                }
                ;
            }
            self.body = dirs.concat(hoisted, self.body);
        }
        return self;
    });
    // drop_side_effect_free()
    // remove side-effect-free parts which only affects return value
    (function (def) {
        // Drop side-effect-free elements from an array of expressions.
        // Returns an array of expressions with side-effects or null
        // if all elements were dropped. Note: original array may be
        // returned if nothing changed.
        function trim(nodes, compressor, first_in_statement) {
            var len = nodes.length;
            if (!len)
                return null;
            var ret = [], changed = false;
            for (var i = 0; i < len; i++) {
                var node = nodes[i].drop_side_effect_free(compressor, first_in_statement);
                changed |= node !== nodes[i];
                if (node) {
                    merge_sequence(ret, node);
                }
            }
            return changed ? ret.length ? ret : null : nodes;
        }
        def(AST_Constant, return_null);
        def(AST_This, return_null);
        def(AST_Call, function (compressor, first_in_statement) {
            if (!this.has_pure_annotation(compressor) && compressor.pure_funcs(this)) {
                if (this.expression instanceof AST_Function && (!this.expression.name || !this.expression.name.definition().references.length)) {
                    var node = this.clone();
                    node.expression.process_expression(false, compressor);
                    return node;
                }
                return this;
            }
            if (this.pure) {
                compressor.warn('Dropping __PURE__ call [{file}:{line},{col}]', this.start);
                this.pure.value = this.pure.value.replace(/[@#]__PURE__/g, ' ');
            }
            var args = trim(this.args, compressor, first_in_statement);
            return args && make_sequence(this, args);
        });
        def(AST_Accessor, return_null);
        def(AST_Function, return_null);
        def(AST_Binary, function (compressor, first_in_statement) {
            var right = this.right.drop_side_effect_free(compressor);
            if (!right)
                return this.left.drop_side_effect_free(compressor, first_in_statement);
            switch (this.operator) {
            case '&&':
            case '||':
                if (right === this.right)
                    return this;
                var node = this.clone();
                node.right = right;
                return node;
            default:
                var left = this.left.drop_side_effect_free(compressor, first_in_statement);
                if (!left)
                    return this.right.drop_side_effect_free(compressor, first_in_statement);
                return make_sequence(this, [
                    left,
                    right
                ]);
            }
        });
        def(AST_Assign, return_this);
        def(AST_Conditional, function (compressor) {
            var consequent = this.consequent.drop_side_effect_free(compressor);
            var alternative = this.alternative.drop_side_effect_free(compressor);
            if (consequent === this.consequent && alternative === this.alternative)
                return this;
            if (!consequent)
                return alternative ? make_node(AST_Binary, this, {
                    operator: '||',
                    left: this.condition,
                    right: alternative
                }) : this.condition.drop_side_effect_free(compressor);
            if (!alternative)
                return make_node(AST_Binary, this, {
                    operator: '&&',
                    left: this.condition,
                    right: consequent
                });
            var node = this.clone();
            node.consequent = consequent;
            node.alternative = alternative;
            return node;
        });
        def(AST_Unary, function (compressor, first_in_statement) {
            if (unary_side_effects(this.operator))
                return this;
            if (this.operator == 'typeof' && this.expression instanceof AST_SymbolRef)
                return null;
            var expression = this.expression.drop_side_effect_free(compressor, first_in_statement);
            if (first_in_statement && this instanceof AST_UnaryPrefix && is_iife_call(expression)) {
                if (expression === this.expression && this.operator.length === 1)
                    return this;
                return make_node(AST_UnaryPrefix, this, {
                    operator: this.operator.length === 1 ? this.operator : '!',
                    expression: expression
                });
            }
            return expression;
        });
        def(AST_SymbolRef, function () {
            return this.undeclared() ? this : null;
        });
        def(AST_Object, function (compressor, first_in_statement) {
            var values = trim(this.properties, compressor, first_in_statement);
            return values && make_sequence(this, values);
        });
        def(AST_ObjectProperty, function (compressor, first_in_statement) {
            return this.value.drop_side_effect_free(compressor, first_in_statement);
        });
        def(AST_Array, function (compressor, first_in_statement) {
            var values = trim(this.elements, compressor, first_in_statement);
            return values && make_sequence(this, values);
        });
        def(AST_Dot, function (compressor, first_in_statement) {
            if (this.expression.may_throw_on_access(compressor))
                return this;
            return this.expression.drop_side_effect_free(compressor, first_in_statement);
        });
        def(AST_Sub, function (compressor, first_in_statement) {
            if (this.expression.may_throw_on_access(compressor))
                return this;
            var expression;
            if (!expression)
                return;
            var property;
            if (!property)
                return expression;
            return;
        });
        def(AST_Sequence, function (compressor) {
            var last = this.expressions[this.expressions.length - 1];
            var expr = last.drop_side_effect_free(compressor);
            if (expr === last)
                return this;
            var expressions = this.expressions.slice(0, -1);
            if (expr)
                merge_sequence(expressions, expr);
            return make_sequence(this, expressions);
        });
    }(function (node, func) {
        node.DEFMETHOD('drop_side_effect_free', func);
    }));
    OPT(AST_SimpleStatement, function (self, compressor) {
        if (compressor.option('side_effects')) {
            var body = self.body;
            var node = body.drop_side_effect_free(compressor, true);
            if (!node) {
                compressor.warn('Dropping side-effect-free statement [{file}:{line},{col}]', self.start);
                return make_node(AST_EmptyStatement, self);
            }
            if (node !== body) {
                return make_node(AST_SimpleStatement, self, { body: node });
            }
        }
        return self;
    });
    OPT(AST_DWLoop, function (self, compressor) {
        if (!compressor.option('loops'))
            return self;
        var cond = self.condition.evaluate(compressor);
        if (cond !== self.condition) {
            if (cond) {
                return make_node(AST_For, self, { body: self.body });
            }
            if (compressor.option('dead_code') && self instanceof AST_While) {
                var a = [];
                extract_declarations_from_unreachable_code(compressor, self.body, a);
                return make_node(AST_BlockStatement, self, { body: a }).optimize(compressor);
            }
            if (self instanceof AST_Do) {
                var has_loop_control = false;
                var tw = new TreeWalker(function (node) {
                    if (node instanceof AST_Scope || has_loop_control)
                        return true;
                    if (node instanceof AST_LoopControl && tw.loopcontrol_target(node) === self)
                        return has_loop_control = true;
                });
                var parent = compressor.parent();
                (parent instanceof AST_LabeledStatement ? parent : self).walk(tw);
                if (!has_loop_control)
                    return self.body;
            }
        }
        if (self instanceof AST_While) {
            return make_node(AST_For, self, self).optimize(compressor);
        }
        return self;
    });
    function if_break_in_loop(self, compressor) {
        function drop_it(rest) {
            rest = as_statement_array(rest);
            if (self.body instanceof AST_BlockStatement) {
                self.body = self.body.clone();
                self.body.body = rest.concat(self.body.body.slice(1));
                self.body = self.body.transform(compressor);
            } else {
                self.body = make_node(AST_BlockStatement, self.body, { body: rest }).transform(compressor);
            }
        }
        var first = self.body instanceof AST_BlockStatement ? self.body.body[0] : self.body;
        if (first instanceof AST_If) {
            if (first.body instanceof AST_Break && compressor.loopcontrol_target(first.body) === compressor.self()) {
                if (self.condition) {
                    self.condition = make_node(AST_Binary, self.condition, {
                        left: self.condition,
                        operator: '&&',
                        right: first.condition.negate(compressor)
                    });
                } else {
                    self.condition = first.condition.negate(compressor);
                }
                drop_it(first.alternative);
            } else if (first.alternative instanceof AST_Break && compressor.loopcontrol_target(first.alternative) === compressor.self()) {
                if (self.condition) {
                    self.condition = make_node(AST_Binary, self.condition, {
                        left: self.condition,
                        operator: '&&',
                        right: first.condition
                    });
                } else {
                    self.condition = first.condition;
                }
                drop_it(first.body);
            }
        }
    }
    ;
    OPT(AST_For, function (self, compressor) {
        if (!compressor.option('loops'))
            return self;
        if (self.condition) {
            var cond = self.condition.evaluate(compressor);
            if (compressor.option('dead_code') && !cond) {
                var a = [];
                if (self.init instanceof AST_Statement) {
                    a.push(self.init);
                } else if (self.init) {
                }
                extract_declarations_from_unreachable_code(compressor, self.body, a);
                return make_node(AST_BlockStatement, self, { body: a }).optimize(compressor);
            }
            if (cond !== self.condition) {
            }
        }
        if_break_in_loop(self, compressor);
        return self;
    });
    OPT(AST_If, function (self, compressor) {
        if (is_empty(self.alternative))
            self.alternative = null;
        if (!compressor.option('conditionals'))
            return self;
        // if condition can be statically determined, warn and drop
        // one of the blocks.  note, statically determined implies
        // “has no side effects”; also it doesn't work for cases like
        // `x && true`, though it probably should.
        var cond = self.condition.evaluate(compressor);
        if (cond !== self.condition) {
            if (cond) {
                if (compressor.option('dead_code')) {
                    var a = [];
                    if (self.alternative) {
                        extract_declarations_from_unreachable_code(compressor, self.alternative, a);
                    }
                    a.push(self.body);
                    return make_node(AST_BlockStatement, self, { body: a }).optimize(compressor);
                }
            } else {
                if (compressor.option('dead_code')) {
                    var a = [];
                    extract_declarations_from_unreachable_code(compressor, self.body, a);
                    if (self.alternative)
                        a.push(self.alternative);
                    return make_node(AST_BlockStatement, self, { body: a }).optimize(compressor);
                }
            }
        }
        var negated = self.condition.negate(compressor);
        var self_condition_length = self.condition.print_to_string().length;
        var negated_length = negated.print_to_string().length;
        var negated_is_best = negated_length < self_condition_length;
        if (self.alternative && negated_is_best) {
            negated_is_best = false;
            // because we already do the switch here.
            // no need to swap values of self_condition_length and negated_length
            // here because they are only used in an equality comparison later on.
            self.condition = negated;
            var tmp = self.body;
            self.body = self.alternative || make_node(AST_EmptyStatement, self);
            self.alternative = tmp;
        }
        if (is_empty(self.body) && is_empty(self.alternative)) {
            return make_node(AST_SimpleStatement, self.condition, { body: self.condition.clone() }).optimize(compressor);
        }
        if (self.body instanceof AST_SimpleStatement && self.alternative instanceof AST_SimpleStatement) {
            return make_node(AST_SimpleStatement, self, {
                body: make_node(AST_Conditional, self, {
                    condition: self.condition,
                    consequent: self.body.body,
                    alternative: self.alternative.body
                })
            }).optimize(compressor);
        }
        if (is_empty(self.alternative) && self.body instanceof AST_SimpleStatement) {
            if (self_condition_length === negated_length && !negated_is_best && self.condition instanceof AST_Binary && self.condition.operator == '||') {
                // although the code length of self.condition and negated are the same,
                // negated does not require additional surrounding parentheses.
                // see https://github.com/mishoo/UglifyJS2/issues/979
                negated_is_best = true;
            }
            if (negated_is_best)
                return make_node(AST_SimpleStatement, self, {
                    body: make_node(AST_Binary, self, {
                        operator: '||',
                        left: negated,
                        right: self.body.body
                    })
                }).optimize(compressor);
            return make_node(AST_SimpleStatement, self, {
                body: make_node(AST_Binary, self, {
                    operator: '&&',
                    left: self.condition,
                    right: self.body.body
                })
            }).optimize(compressor);
        }
        if (self.body instanceof AST_EmptyStatement && self.alternative instanceof AST_SimpleStatement) {
            return make_node(AST_SimpleStatement, self, {
                body: make_node(AST_Binary, self, {
                    operator: '||',
                    left: self.condition,
                    right: self.alternative.body
                })
            }).optimize(compressor);
        }
        if (self.body instanceof AST_Exit && self.alternative instanceof AST_Exit && self.body.TYPE == self.alternative.TYPE) {
            return make_node(self.body.CTOR, self, {
                value: make_node(AST_Conditional, self, {
                    condition: self.condition,
                    consequent: self.body.value || make_node(AST_Undefined, self.body),
                    alternative: self.alternative.value || make_node(AST_Undefined, self.alternative)
                }).transform(compressor)
            }).optimize(compressor);
        }
        if (self.body instanceof AST_If && !self.body.alternative && !self.alternative) {
            self = make_node(AST_If, self, {
                condition: make_node(AST_Binary, self.condition, {
                    operator: '&&',
                    left: self.condition,
                    right: self.body.condition
                }),
                body: self.body.body,
                alternative: null
            });
        }
        if (aborts(self.body)) {
            if (self.alternative) {
                var alt = self.alternative;
                self.alternative = null;
                return make_node(AST_BlockStatement, self, {
                    body: [
                        self,
                        alt
                    ]
                }).optimize(compressor);
            }
        }
        if (aborts(self.alternative)) {
            var body = self.body;
            self.body = self.alternative;
            self.condition = negated_is_best ? negated : self.condition.negate(compressor);
            self.alternative = null;
            return make_node(AST_BlockStatement, self, {
                body: [
                    self,
                    body
                ]
            }).optimize(compressor);
        }
        return self;
    });
    OPT(AST_Switch, function (self, compressor) {
        if (!compressor.option('switches'))
            return self;
        var branch;
        var value = self.expression.evaluate(compressor);
        if (value !== self.expression) {
            var expression;
        }
        if (!compressor.option('dead_code'))
            return self;
        var decl = [];
        var body = [];
        var default_branch;
        var exact_match;
        for (var i = 0, len = self.body.length; i < len && !exact_match; i++) {
            branch = self.body[i];
            if (branch instanceof AST_Default) {
                if (!default_branch) {
                    default_branch = branch;
                } else {
                }
            } else if (value !== self.expression) {
                var exp = branch.expression.evaluate(compressor);
                if (exp === value) {
                    exact_match = branch;
                    if (default_branch) {
                        var default_index = body.indexOf(default_branch);
                        body.splice(default_index, 1);
                        eliminate_branch(default_branch, body[default_index - 1]);
                        default_branch = null;
                    }
                } else if (exp !== branch.expression) {
                    eliminate_branch(branch, body[body.length - 1]);
                    continue;
                }
            }
            if (aborts(branch)) {
                var prev = body[body.length - 1];
                if (aborts(prev) && prev.body.length == branch.body.length && make_node(AST_BlockStatement, prev, prev).equivalent_to(make_node(AST_BlockStatement, branch, branch))) {
                    prev.body = [];
                }
            }
            body.push(branch);
        }
        while (i < len)
            eliminate_branch(self.body[i++], body[body.length - 1]);
        if (body.length > 0) {
            body[0].body = decl.concat(body[0].body);
        }
        self.body = body;
        while (branch = body[body.length - 1]) {
            var stat = branch.body[branch.body.length - 1];
            if (stat instanceof AST_Break && compressor.loopcontrol_target(stat) === self)
                branch.body.pop();
            if (branch.body.length || branch instanceof AST_Case && (default_branch || branch.expression.has_side_effects(compressor)))
                break;
            if (body.pop() === default_branch)
                default_branch = null;
        }
        if (body.length == 0) {
            return make_node(AST_BlockStatement, self, { body: decl.concat(make_node(AST_SimpleStatement, self.expression, { body: self.expression })) }).optimize(compressor);
        }
        if (body.length == 1 && (body[0] === exact_match || body[0] === default_branch)) {
            var has_break = false;
            var tw = new TreeWalker(function (node) {
                if (has_break || node instanceof AST_Lambda || node instanceof AST_SimpleStatement)
                    return true;
                if (node instanceof AST_Break && tw.loopcontrol_target(node) === self)
                    has_break = true;
            });
            self.walk(tw);
            if (!has_break) {
                body = body[0].body.slice();
                body.unshift(make_node(AST_SimpleStatement, self.expression, { body: self.expression }));
                return make_node(AST_BlockStatement, self, { body: body }).optimize(compressor);
            }
        }
        return self;
        function eliminate_branch(branch, prev) {
            if (prev && !aborts(prev)) {
                prev.body = prev.body.concat(branch.body);
            } else {
                extract_declarations_from_unreachable_code(compressor, branch, decl);
            }
        }
    });
    OPT(AST_Try, function (self, compressor) {
        if (self.bcatch && self.bfinally && all(self.bfinally.body, is_empty))
            self.bfinally = null;
        if (all(self.body, is_empty)) {
            var body = [];
            if (self.bcatch)
                extract_declarations_from_unreachable_code(compressor, self.bcatch, body);
            if (self.bfinally)
                body = body.concat(self.bfinally.body);
            return make_node(AST_BlockStatement, self, { body: body }).optimize(compressor);
        }
        return self;
    });
    AST_Definitions.DEFMETHOD('remove_initializers', function () {
        this.definitions.forEach(function (def) {
            def.value = null;
        });
    });
    AST_Definitions.DEFMETHOD('to_assignments', function (compressor) {
        var reduce_vars;
        var assignments = this.definitions.reduce(function (a, def) {
            if (def.value) {
                var name = make_node(AST_SymbolRef, def.name, def.name);
                a.push(make_node(AST_Assign, def, {
                    operator: '=',
                    left: name,
                    right: def.value
                }));
                if (reduce_vars)
                    name.definition().fixed = false;
            }
            return a;
        }, []);
        if (assignments.length == 0)
            return null;
        return make_sequence(this, assignments);
    });
    OPT(AST_Call, function (self, compressor) {
        var exp = self.expression;
        if (compressor.option('reduce_vars') && exp instanceof AST_SymbolRef) {
            var fixed = exp.fixed_value();
            if (fixed instanceof AST_Function)
                exp = fixed;
        }
        if (compressor.option('unused') && exp instanceof AST_Function && !exp.uses_arguments && !exp.uses_eval) {
            var pos = 0, last = 0;
            for (var i = 0, len = self.args.length; i < len; i++) {
                var trim = i >= exp.argnames.length;
                if (trim || exp.argnames[i].__unused) {
                    var node = self.args[i].drop_side_effect_free(compressor);
                    if (node) {
                        self.args[pos++] = node;
                    } else if (!trim) {
                        continue;
                    }
                } else {
                    self.args[pos++] = self.args[i];
                }
                last = pos;
            }
            self.args.length = last;
        }
        if (compressor.option('unsafe')) {
            if (exp instanceof AST_SymbolRef && exp.undeclared()) {
                switch (exp.name) {
                case 'Array':
                    if (self.args.length != 1) {
                        return;
                    }
                    break;
                case 'Object':
                    if (self.args.length == 0) {
                        return;
                    }
                    break;
                case 'String':
                    if (self.args.length == 0)
                        return make_node(AST_String, self, { value: '' });
                    if (self.args.length <= 1)
                        return make_node(AST_Binary, self, {
                            left: self.args[0],
                            operator: '+',
                            right: make_node(AST_String, self, { value: '' })
                        }).optimize(compressor);
                    break;
                case 'Number':
                    if (self.args.length == 0)
                        return make_node(AST_Number, self, { value: 0 });
                    if (self.args.length == 1)
                        return make_node(AST_UnaryPrefix, self, {
                            expression: self.args[0],
                            operator: '+'
                        }).optimize(compressor);
                case 'Boolean':
                    if (self.args.length == 0)
                        return make_node(AST_False, self);
                    if (self.args.length == 1)
                        return make_node(AST_UnaryPrefix, self, {
                            expression: make_node(AST_UnaryPrefix, self, {
                                expression: self.args[0],
                                operator: '!'
                            }),
                            operator: '!'
                        }).optimize(compressor);
                    break;
                }
            } else if (exp instanceof AST_Dot && exp.property == 'toString' && self.args.length == 0) {
                return make_node(AST_Binary, self, {
                    left: make_node(AST_String, self, { value: '' }),
                    operator: '+',
                    right: exp.expression
                }).optimize(compressor);
            } else if (exp instanceof AST_Dot && exp.expression instanceof AST_Array && exp.property == 'join')
                EXIT: {
                    var separator;
                    if (self.args.length > 0) {
                        separator = self.args[0].evaluate(compressor);
                        if (separator === self.args[0])
                            break EXIT;    // not a constant
                    }
                    var elements = [];
                    var consts = [];
                    exp.expression.elements.forEach(function (el) {
                        var value = el.evaluate(compressor);
                        if (value !== el) {
                            consts.push(value);
                        } else {
                            if (consts.length > 0) {
                                elements.push(make_node(AST_String, self, { value: consts.join(separator) }));
                                consts.length = 0;
                            }
                            elements.push(el);
                        }
                    });
                    if (consts.length > 0) {
                        elements.push(make_node(AST_String, self, { value: consts.join(separator) }));
                    }
                    if (elements.length == 0)
                        return make_node(AST_String, self, { value: '' });
                    if (elements.length == 1) {
                        if (elements[0].is_string(compressor)) {
                            return elements[0];
                        }
                        return make_node(AST_Binary, elements[0], {
                            operator: '+',
                            left: make_node(AST_String, self, { value: '' }),
                            right: elements[0]
                        });
                    }
                    if (separator == '') {
                        var first;
                        if (elements[0].is_string(compressor) || elements[1].is_string(compressor)) {
                            first = elements.shift();
                        } else {
                            first = make_node(AST_String, self, { value: '' });
                        }
                        return elements.reduce(function (prev, el) {
                            return make_node(AST_Binary, el, {
                                operator: '+',
                                left: prev,
                                right: el
                            });
                        }, first).optimize(compressor);
                    }
                    // need this awkward cloning to not affect original element
                    // best_of will decide which one to get through.
                    var node = self.clone();
                    node.expression = node.expression.clone();
                    node.expression.expression = node.expression.expression.clone();
                    node.expression.expression.elements = elements;
                    return best_of(compressor, self, node);
                }
            else if (exp instanceof AST_Dot && exp.expression.is_string(compressor) && exp.property == 'charAt') {
                var arg = self.args[0];
                var index = arg ? arg.evaluate(compressor) : 0;
                if (index !== arg) {
                    return make_node(AST_Sub, exp, {
                        expression: exp.expression,
                        property: make_node_from_constant(index | 0, arg || exp)
                    }).optimize(compressor);
                }
            }
        }
        if (compressor.option('unsafe_Func') && exp instanceof AST_SymbolRef && exp.undeclared() && exp.name == 'Function') {
            // new Function() => function(){}
            if (self.args.length == 0)
                return;
            if (all(self.args, function (x) {
                    return x instanceof AST_String;
                })) {
                // quite a corner-case, but we can handle it:
                //   https://github.com/mishoo/UglifyJS2/issues/203
                // if the code argument is a constant, then we can minify it.
                try {
                    var code = 'NaN(function(' + self.args.slice(0, -1).map(function (arg) {
                        return arg.value;
                    }).join(',') + '){' + self.args[self.args.length - 1].value + '})';
                    var ast = parse(code);
                    var mangle;
                    ast.figure_out_scope(mangle);
                    var comp = new Compressor(compressor.options);
                    ast = ast.transform(comp);
                    ast.mangle_names();
                    var fun;
                    ast.walk(new TreeWalker(function (node) {
                        if (fun)
                            return true;
                        if (node instanceof AST_Lambda) {
                            fun = node;
                            return true;
                        }
                    }));
                    var args = fun.argnames.map(function (arg, i) {
                        return make_node(AST_String, self.args[i], { value: arg.print_to_string() });
                    });
                    var code = OutputStream();
                    AST_BlockStatement.prototype._codegen.call(fun, fun, code);
                    code = code.toString().replace(/^\{|\}$/g, '');
                    args.push(make_node(AST_String, self.args[self.args.length - 1], { value: code }));
                    self.args = args;
                    return self;
                } catch (ex) {
                    if (ex instanceof JS_Parse_Error) {
                    } else {
                        throw ex;
                    }
                }
            }
        }
        if (exp instanceof AST_Function) {
            var stat = exp.body[0];
            if (compressor.option('inline') && stat instanceof AST_Return) {
                var value = stat && stat.value;
                if (!value || value.is_constant_expression()) {
                    var args = self.args.concat(value || make_node(AST_Undefined, self));
                    return make_sequence(self, args).transform(compressor);
                }
            }
            if (compressor.option('inline') && !exp.name && exp.body.length == 1 && !exp.uses_arguments && !exp.uses_eval && !self.has_pure_annotation(compressor)) {
                var body;
                if (stat instanceof AST_Return) {
                    body = stat.value.clone(true);
                } else if (stat instanceof AST_SimpleStatement) {
                    body = [];
                    merge_sequence(body, stat.body.clone(true));
                    merge_sequence(body, make_node(AST_Undefined, self));
                    body = make_sequence(self, body);
                }
                if (body) {
                    var fn = exp.clone();
                    fn.argnames = [];
                    fn.body = [];
                    if (exp.argnames.length > 0) {
                        fn.body.push(make_node(AST_Var, self, {
                            definitions: exp.argnames.map(function (sym, i) {
                                return make_node(AST_VarDef, sym, {
                                    name: sym,
                                    value: self.args[i] || make_node(AST_Undefined, self)
                                });
                            })
                        }));
                    }
                    if (self.args.length > exp.argnames.length) {
                        fn.body.push(make_node(AST_SimpleStatement, self, { body: make_sequence(self, self.args.slice(exp.argnames.length)) }));
                    }
                    fn.body.push(make_node(AST_Return, self, { value: body }));
                    body = fn.transform(compressor).body;
                    if (body.length == 0)
                        return;
                    if (body.length == 1 && body[0] instanceof AST_Return) {
                        if (!body[0].value)
                            return;
                        body = best_of(compressor, body[0].value, self);
                    } else {
                        body = self;
                    }
                    if (body !== self)
                        return body;
                }
            }
            if (compressor.option('side_effects') && all(exp.body, is_empty)) {
                var args = self.args.concat(make_node(AST_Undefined, self));
                return make_sequence(self, args).transform(compressor);
            }
        }
        if (compressor.option('drop_console')) {
            if (exp instanceof AST_PropAccess) {
                var name = exp.expression;
                while (name.expression) {
                    name = name.expression;
                }
                if (name instanceof AST_SymbolRef && name.name == 'console' && name.undeclared()) {
                    return make_node(AST_Undefined, self).optimize(compressor);
                }
            }
        }
        if (compressor.option('negate_iife') && compressor.parent() instanceof AST_SimpleStatement && is_iife_call(self)) {
            return self.negate(compressor, true);
        }
        var ev = self.evaluate(compressor);
        if (ev !== self) {
            ev = make_node_from_constant(ev, self).optimize(compressor);
            return best_of(compressor, ev, self);
        }
        return self;
    });
    OPT(AST_New, function (self, compressor) {
        if (compressor.option('unsafe')) {
            var exp = self.expression;
            if (exp instanceof AST_SymbolRef && exp.undeclared()) {
                switch (exp.name) {
                case 'Object':
                case 'RegExp':
                case 'Function':
                case 'Error':
                case 'Array':
                    return;
                }
            }
        }
        return self;
    });
    OPT(AST_Sequence, function (self, compressor) {
        if (!compressor.option('side_effects'))
            return self;
        var expressions = [];
        filter_for_side_effects();
        var end = expressions.length - 1;
        trim_right_for_undefined();
        if (end > 0 && compressor.option('cascade'))
            trim_left_for_assignment();
        if (end == 0) {
            self = maintain_this_binding(compressor.parent(), self, expressions[0]);
            if (!(self instanceof AST_Sequence))
                self = self.optimize(compressor);
            return self;
        }
        self.expressions = expressions;
        return self;
        function filter_for_side_effects() {
            var first = first_in_statement(compressor);
            var last = self.expressions.length - 1;
            self.expressions.forEach(function (expr, index) {
                if (index < last)
                    expr = expr.drop_side_effect_free(compressor, first);
                if (expr) {
                    merge_sequence(expressions, expr);
                }
            });
        }
        function trim_right_for_undefined() {
            while (end > 0 && is_undefined(expressions[end], compressor))
                end--;
            if (end < expressions.length - 1) {
                expressions[end] = make_node(AST_UnaryPrefix, self, {
                    operator: 'void',
                    expression: expressions[end]
                });
                expressions.length = end + 1;
            }
        }
        function trim_left_for_assignment() {
            for (var i = 0, j = 1; j <= end; j++) {
                var left = expressions[i];
                var cdr = expressions[j];
                if (left instanceof AST_Assign && !left.left.has_side_effects(compressor)) {
                    left = left.left;
                } else if (left instanceof AST_Unary && (left.operator == '++' || left.operator == '--')) {
                    left = left.expression;
                } else
                    left = null;
                if (!left || is_lhs_read_only(left)) {
                    expressions[++i] = cdr;
                    continue;
                }
                var parent = null, field;
                expressions[j] = cdr = cdr.clone();
                while (true) {
                    if (cdr.equivalent_to(left)) {
                        var car = expressions[i];
                        if (car instanceof AST_UnaryPostfix) {
                            car = make_node(AST_UnaryPrefix, car, {
                                operator: car.operator,
                                expression: left
                            });
                        }
                        if (parent) {
                            parent[field] = car;
                            expressions[i] = expressions[j];
                        } else {
                            expressions[i] = car;
                        }
                        break;
                    }
                    if (cdr instanceof AST_Binary && !(cdr instanceof AST_Assign)) {
                        if (cdr.left.is_constant()) {
                            if (cdr.operator == '||' || cdr.operator == '&&') {
                                expressions[++i] = expressions[j];
                                break;
                            }
                            field = 'right';
                        } else {
                            field = 'left';
                        }
                    } else if (cdr instanceof AST_Call || cdr instanceof AST_PropAccess || cdr instanceof AST_Unary && !unary_side_effects(cdr.operator)) {
                        field = 'expression';
                    } else {
                        expressions[++i] = expressions[j];
                        break;
                    }
                    parent = cdr;
                    cdr = cdr[field] = cdr[field].clone();
                }
            }
            end = i;
            expressions.length = end + 1;
        }
    });
    AST_Unary.DEFMETHOD('lift_sequences', function (compressor) {
        if (compressor.option('sequences')) {
            if (this.expression instanceof AST_Sequence) {
                var x = this.expression.expressions.slice();
                var e = this.clone();
                e.expression = x.pop();
                x.push(e);
                return make_sequence(this, x).optimize(compressor);
            }
        }
        return this;
    });
    OPT(AST_UnaryPrefix, function (self, compressor) {
        var e = self.expression;
        if (self.operator == 'delete' && !(e instanceof AST_SymbolRef || e instanceof AST_PropAccess || e instanceof AST_NaN || e instanceof AST_Infinity || e instanceof AST_Undefined)) {
            if (e instanceof AST_Sequence) {
                e = e.expressions.slice();
                e.push(make_node(AST_True, self));
                return make_sequence(self, e).optimize(compressor);
            }
            return make_sequence(self, [
                e,
                make_node(AST_True, self)
            ]).optimize(compressor);
        }
        var seq = self.lift_sequences(compressor);
        if (seq !== self) {
            return seq;
        }
        if (compressor.option('side_effects') && self.operator == 'void') {
            e = e.drop_side_effect_free(compressor);
            if (e) {
                return self;
            } else {
                return make_node(AST_Undefined, self).optimize(compressor);
            }
        }
        if (compressor.option('booleans') && compressor.in_boolean_context()) {
            switch (self.operator) {
            case '!':
                if (e instanceof AST_UnaryPrefix && e.operator == '!') {
                    // !!foo ==> foo, if we're in boolean context
                    return e.expression;
                }
                if (e instanceof AST_Binary) {
                    self = best_of(compressor, self, e.negate(compressor));
                }
                break;
            case 'typeof':
                return (e instanceof AST_SymbolRef ? make_node(AST_True, self) : make_sequence(self, [
                    e,
                    make_node(AST_True, self)
                ])).optimize(compressor);
            }
        }
        if (self.operator == '-' && e instanceof AST_Infinity) {
            e = e.transform(compressor);
        }
        if (e instanceof AST_Binary && (self.operator == '+' || self.operator == '-') && (e.operator == '*' || e.operator == '/' || e.operator == '%')) {
            return make_node(AST_Binary, self, {
                operator: e.operator,
                left: make_node(AST_UnaryPrefix, e.left, {
                    operator: self.operator,
                    expression: e.left
                }),
                right: e.right
            });
        }
        // avoids infinite recursion of numerals
        if (self.operator != '-' || !(e instanceof AST_Number || e instanceof AST_Infinity)) {
            var ev = self.evaluate(compressor);
            if (ev !== self) {
                ev = make_node_from_constant(ev, self).optimize(compressor);
                return best_of(compressor, ev, self);
            }
        }
        return self;
    });
    AST_Binary.DEFMETHOD('lift_sequences', function (compressor) {
        if (compressor.option('sequences')) {
            if (this.left instanceof AST_Sequence) {
                var x = this.left.expressions.slice();
                var e = this.clone();
                e.left = x.pop();
                x.push(e);
                return make_sequence(this, x).optimize(compressor);
            }
            if (this.right instanceof AST_Sequence && !this.left.has_side_effects(compressor)) {
                var assign = this.operator == '=' && this.left instanceof AST_SymbolRef;
                var x = this.right.expressions;
                var last = x.length - 1;
                for (var i = 0; i < last; i++) {
                    if (!assign && x[i].has_side_effects(compressor))
                        break;
                }
                if (i == last) {
                    var e = this.clone();
                    e.right = x.pop();
                    x.push(e);
                    return make_sequence(this, x).optimize(compressor);
                } else if (i > 0) {
                    var e = this.clone();
                    e.right = make_sequence(this.right, x.slice(i));
                    x = x.slice(0, i);
                    x.push(e);
                    return make_sequence(this, x).optimize(compressor);
                }
            }
        }
        return this;
    });
    var commutativeOperators = makePredicate('== === != !== * & | ^');
    OPT(AST_Binary, function (self, compressor) {
        function reversible() {
            return self.left.is_constant() || self.right.is_constant() || !self.left.has_side_effects(compressor) && !self.right.has_side_effects(compressor);
        }
        function reverse(op) {
            if (reversible()) {
                if (op)
                    self.operator = op;
                var tmp = self.left;
                self.left = self.right;
                self.right = tmp;
            }
        }
        if (commutativeOperators(self.operator)) {
            if (self.right.is_constant() && !self.left.is_constant()) {
                // if right is a constant, whatever side effects the
                // left side might have could not influence the
                // result.  hence, force switch.
                if (!(self.left instanceof AST_Binary && PRECEDENCE[self.left.operator] >= PRECEDENCE[self.operator])) {
                    reverse();
                }
            }
        }
        self = self.lift_sequences(compressor);
        if (compressor.option('comparisons'))
            switch (self.operator) {
            case '===':
            case '!==':
                if (self.left.is_string(compressor) && self.right.is_string(compressor) || self.left.is_number(compressor) && self.right.is_number(compressor) || self.left.is_boolean() && self.right.is_boolean()) {
                    self.operator = self.operator.substr(0, 2);
                }
            // XXX: intentionally falling down to the next case
            case '==':
            case '!=':
                // "undefined" == typeof x => undefined === x
                if (self.left instanceof AST_String && self.left.value == 'undefined' && self.right instanceof AST_UnaryPrefix && self.right.operator == 'typeof') {
                    var expr = self.right.expression;
                    if (expr instanceof AST_SymbolRef ? !expr.undeclared() : !(expr instanceof AST_PropAccess && compressor.option('ie8'))) {
                        self.right = expr;
                        self.left = make_node(AST_Undefined, self.left).optimize(compressor);
                        if (self.operator.length == 2)
                            self.operator += '=';
                    }
                }
                break;
            }
        if (compressor.option('booleans') && self.operator == '+' && compressor.in_boolean_context()) {
            var ll = self.left.evaluate(compressor);
            var rr = self.right.evaluate(compressor);
            if (ll && typeof ll == 'string') {
                compressor.warn('+ in boolean context always true [{file}:{line},{col}]', self.start);
                return make_sequence(self, [
                    self.right,
                    make_node(AST_True, self)
                ]).optimize(compressor);
            }
            if (rr && typeof rr == 'string') {
                compressor.warn('+ in boolean context always true [{file}:{line},{col}]', self.start);
                return make_sequence(self, [
                    self.left,
                    make_node(AST_True, self)
                ]).optimize(compressor);
            }
        }
        if (compressor.option('comparisons') && self.is_boolean()) {
            if (!(compressor.parent() instanceof AST_Binary) || compressor.parent() instanceof AST_Assign) {
                var negated = make_node(AST_UnaryPrefix, self, {
                    operator: '!',
                    expression: self.negate(compressor)
                });
                self = best_of(compressor, self, negated);
            }
            if (compressor.option('unsafe_comps')) {
                switch (self.operator) {
                case '<':
                    reverse('>');
                    break;
                case '<=':
                    reverse('>=');
                    break;
                }
            }
        }
        if (self.operator == '+') {
            if (self.right instanceof AST_String && self.right.getValue() == '' && self.left.is_string(compressor)) {
                return self.left;
            }
            if (self.left instanceof AST_String && self.left.getValue() == '' && self.right.is_string(compressor)) {
                return self.right;
            }
            if (self.left instanceof AST_Binary && self.left.operator == '+' && self.left.left instanceof AST_String && self.left.left.getValue() == '' && self.right.is_string(compressor)) {
                self.left = self.left.right;
                return self.transform(compressor);
            }
        }
        if (compressor.option('evaluate')) {
            switch (self.operator) {
            case '&&':
                var ll = self.left.evaluate(compressor);
                if (!ll) {
                    compressor.warn('Condition left of && always false [{file}:{line},{col}]', self.start);
                    return maintain_this_binding(compressor.parent(), self, self.left).optimize(compressor);
                } else if (ll !== self.left) {
                    return maintain_this_binding(compressor.parent(), self, self.right).optimize(compressor);
                }
                if (compressor.option('booleans') && compressor.in_boolean_context()) {
                    var rr = self.right.evaluate(compressor);
                    if (!rr) {
                        compressor.warn('Boolean && always false [{file}:{line},{col}]', self.start);
                        return make_sequence(self, [
                            self.left,
                            make_node(AST_False, self)
                        ]).optimize(compressor);
                    } else if (rr !== self.right) {
                        return;
                    }
                }
                break;
            case '||':
                var ll = self.left.evaluate(compressor);
                if (!ll) {
                    return maintain_this_binding(compressor.parent(), self, self.right).optimize(compressor);
                } else if (ll !== self.left) {
                    compressor.warn('Condition left of || always true [{file}:{line},{col}]', self.start);
                    return maintain_this_binding(compressor.parent(), self, self.left).optimize(compressor);
                }
                if (compressor.option('booleans') && compressor.in_boolean_context()) {
                    var rr = self.right.evaluate(compressor);
                    if (!rr) {
                        return;
                    } else if (rr !== self.right) {
                        compressor.warn('Boolean || always true [{file}:{line},{col}]', self.start);
                        return make_sequence(self, [
                            self.left,
                            make_node(AST_True, self)
                        ]).optimize(compressor);
                    }
                }
                break;
            }
            var associative = true;
            switch (self.operator) {
            case '+':
                // "foo" + ("bar" + x) => "foobar" + x
                if (self.left instanceof AST_Constant && self.right instanceof AST_Binary && self.right.operator == '+' && self.right.left instanceof AST_Constant && self.right.is_string(compressor)) {
                }
                // (x + "foo") + "bar" => x + "foobar"
                if (self.right instanceof AST_Constant && self.left instanceof AST_Binary && self.left.operator == '+' && self.left.right instanceof AST_Constant && self.left.is_string(compressor)) {
                    self = make_node(AST_Binary, self, {
                        operator: '+',
                        left: self.left.left,
                        right: make_node(AST_String, self.right, { value: '' + self.left.right.getValue() + self.right.getValue() })
                    });
                }
                // (x + "foo") + ("bar" + y) => (x + "foobar") + y
                if (self.left instanceof AST_Binary && self.left.operator == '+' && self.left.is_string(compressor) && self.left.right instanceof AST_Constant && self.right instanceof AST_Binary && self.right.operator == '+' && self.right.left instanceof AST_Constant && self.right.is_string(compressor)) {
                }
                // a + -b => a - b
                if (self.right instanceof AST_UnaryPrefix && self.right.operator == '-' && self.left.is_number(compressor)) {
                    self = make_node(AST_Binary, self, {
                        operator: '-',
                        left: self.left,
                        right: self.right.expression
                    });
                    break;
                }
                // -a + b => b - a
                if (self.left instanceof AST_UnaryPrefix && self.left.operator == '-' && reversible() && self.right.is_number(compressor)) {
                    self = make_node(AST_Binary, self, {
                        operator: '-',
                        left: self.right,
                        right: self.left.expression
                    });
                    break;
                }
            case '*':
                associative = compressor.option('unsafe_math');
            case '&':
            case '|':
            case '^':
                // a + +b => +b + a
                if (self.left.is_number(compressor) && self.right.is_number(compressor) && reversible() && !(self.left instanceof AST_Binary && self.left.operator != self.operator && PRECEDENCE[self.left.operator] >= PRECEDENCE[self.operator])) {
                    var reversed = make_node(AST_Binary, self, {
                        operator: self.operator,
                        left: self.right,
                        right: self.left
                    });
                    if (self.right instanceof AST_Constant && !(self.left instanceof AST_Constant)) {
                    } else {
                        self = best_of(compressor, self, reversed);
                    }
                }
                if (associative && self.is_number(compressor)) {
                    // a + (b + c) => (a + b) + c
                    if (self.right instanceof AST_Binary && self.right.operator == self.operator) {
                    }
                    // (n + 2) + 3 => 5 + n
                    // (2 * n) * 3 => 6 + n
                    if (self.right instanceof AST_Constant && self.left instanceof AST_Binary && self.left.operator == self.operator) {
                        if (self.left.left instanceof AST_Constant) {
                            self = make_node(AST_Binary, self, {
                                operator: self.operator,
                                left: make_node(AST_Binary, self.left, {
                                    operator: self.operator,
                                    left: self.left.left,
                                    right: self.right
                                }),
                                right: self.left.right
                            });
                        } else if (self.left.right instanceof AST_Constant) {
                            self = make_node(AST_Binary, self, {
                                operator: self.operator,
                                left: make_node(AST_Binary, self.left, {
                                    operator: self.operator,
                                    left: self.left.right,
                                    right: self.right
                                }),
                                right: self.left.left
                            });
                        }
                    }
                    // (a | 1) | (2 | d) => (3 | a) | b
                    if (self.left instanceof AST_Binary && self.left.operator == self.operator && self.left.right instanceof AST_Constant && self.right instanceof AST_Binary && self.right.operator == self.operator && self.right.left instanceof AST_Constant) {
                    }
                }
            }
        }
        // x && (y && z)  ==>  x && y && z
        // x || (y || z)  ==>  x || y || z
        // x + ("y" + z)  ==>  x + "y" + z
        // "x" + (y + "z")==>  "x" + y + "z"
        if (self.right instanceof AST_Binary && self.right.operator == self.operator && (self.operator == '&&' || self.operator == '||' || self.operator == '+' && (self.right.left.is_string(compressor) || self.left.is_string(compressor) && self.right.right.is_string(compressor)))) {
            self.left = make_node(AST_Binary, self.left, {
                operator: self.operator,
                left: self.left,
                right: self.right.left
            });
            self.right = self.right.right;
            return self.transform(compressor);
        }
        var ev = self.evaluate(compressor);
        if (ev !== self) {
            ev = make_node_from_constant(ev, self).optimize(compressor);
            return best_of(compressor, ev, self);
        }
        return self;
    });
    OPT(AST_SymbolRef, function (self, compressor) {
        var def = self.resolve_defines(compressor);
        if (def) {
            return def.optimize(compressor);
        }
        // testing against !self.scope.uses_with first is an optimization
        if (!compressor.option('ie8') && self.undeclared() && (!self.scope.uses_with || !compressor.find_parent(AST_With))) {
            switch (self.name) {
            case 'undefined':
                return make_node(AST_Undefined, self).optimize(compressor);
            case 'NaN':
                return make_node(AST_NaN, self).optimize(compressor);
            case 'Infinity':
                return make_node(AST_Infinity, self).optimize(compressor);
            }
        }
        if (compressor.option('reduce_vars') && is_lhs(self, compressor.parent()) !== self) {
            var d = self.definition();
            var fixed = self.fixed_value();
            if (fixed instanceof AST_Defun) {
                d.fixed = fixed = make_node(AST_Function, fixed, fixed).clone(true);
            }
            if (compressor.option('unused') && fixed instanceof AST_Function && d.references.length == 1 && !(d.scope.uses_arguments && d.orig[0] instanceof AST_SymbolFunarg) && !d.scope.uses_eval && compressor.find_parent(AST_Scope) === fixed.parent_scope) {
                return fixed;
            }
            if (compressor.option('evaluate') && fixed) {
                if (d.should_replace === undefined) {
                    var init = fixed.evaluate(compressor);
                    if (init !== fixed && (compressor.option('unsafe_regexp') || !(init instanceof RegExp))) {
                        init = make_node_from_constant(init, fixed);
                        var value_length = init.optimize(compressor).print_to_string().length;
                        var fn;
                        if (has_symbol_ref(fixed)) {
                        } else {
                            fn = function () {
                                var result = best_of_expression(init.optimize(compressor), fixed);
                                return result === init || result === fixed ? result.clone(true) : result;
                            };
                        }
                        var name_length = d.name.length;
                        var overhead = 0;
                        if (compressor.option('unused') && (!d.global || compressor.toplevel(d))) {
                            overhead = (name_length + 2 + value_length) / d.references.length;
                        }
                        d.should_replace = value_length <= name_length + overhead ? fn : false;
                    } else {
                    }
                }
                if (d.should_replace) {
                    return d.should_replace();
                }
            }
        }
        return self;
        function has_symbol_ref(value) {
            var found;
            return found;
        }
    });
    function is_atomic(lhs, self) {
        return lhs instanceof AST_SymbolRef || lhs.TYPE === self.TYPE;
    }
    OPT(AST_Undefined, function (self, compressor) {
        if (compressor.option('unsafe')) {
            var undef = find_variable(compressor, 'undefined');
            if (undef) {
                var ref = make_node(AST_SymbolRef, self, { thedef: undef });
                ref.is_undefined = true;
                return ref;
            }
        }
        var lhs = is_lhs(compressor.self(), compressor.parent());
        if (lhs && is_atomic(lhs, self))
            return self;
        return make_node(AST_UnaryPrefix, self, {
            operator: 'void',
            expression: make_node(AST_Number, self, { value: 0 })
        });
    });
    OPT(AST_Infinity, function (self, compressor) {
        var lhs = is_lhs(compressor.self(), compressor.parent());
        if (lhs && is_atomic(lhs, self))
            return self;
        if (compressor.option('keep_infinity') && !(lhs && !is_atomic(lhs, self)) && !find_variable(compressor, 'Infinity'))
            return self;
        return make_node(AST_Binary, self, {
            operator: '/',
            left: make_node(AST_Number, self, { value: 1 }),
            right: make_node(AST_Number, self, { value: 0 })
        });
    });
    OPT(AST_NaN, function (self, compressor) {
        var lhs = is_lhs(compressor.self(), compressor.parent());
        if (lhs && !is_atomic(lhs, self) || find_variable(compressor, 'NaN')) {
            return make_node(AST_Binary, self, {
                operator: '/',
                left: make_node(AST_Number, self, { value: 0 }),
                right: make_node(AST_Number, self, { value: 0 })
            });
        }
        return self;
    });
    var ASSIGN_OPS = [
        '+',
        '-',
        '/',
        '*',
        '%',
        '>>',
        '<<',
        '>>>',
        '|',
        '^',
        '&'
    ];
    var ASSIGN_OPS_COMMUTATIVE = [
        '*',
        '|',
        '^',
        '&'
    ];
    OPT(AST_Assign, function (self, compressor) {
        self = self.lift_sequences(compressor);
        if (self.operator == '=' && self.left instanceof AST_SymbolRef && self.right instanceof AST_Binary) {
            // x = expr1 OP expr2
            if (self.right.left instanceof AST_SymbolRef && self.right.left.name == self.left.name && member(self.right.operator, ASSIGN_OPS)) {
                // x = x - 2  --->  x -= 2
                self.operator = self.right.operator + '=';
                self.right = self.right.right;
            } else if (self.right.right instanceof AST_SymbolRef && self.right.right.name == self.left.name && member(self.right.operator, ASSIGN_OPS_COMMUTATIVE) && !self.right.left.has_side_effects(compressor)) {
                // x = 2 & x  --->  x &= 2
                self.operator = self.right.operator + '=';
                self.right = self.right.left;
            }
        }
        return self;
    });
    OPT(AST_Conditional, function (self, compressor) {
        if (!compressor.option('conditionals'))
            return self;
        // This looks like lift_sequences(), should probably be under "sequences"
        if (self.condition instanceof AST_Sequence) {
            var expressions = self.condition.expressions.slice();
            self.condition = expressions.pop();
            expressions.push(self);
            return make_sequence(self, expressions);
        }
        var cond = self.condition.evaluate(compressor);
        if (cond !== self.condition) {
            if (cond) {
                compressor.warn('Condition always true [{file}:{line},{col}]', self.start);
                return maintain_this_binding(compressor.parent(), self, self.consequent);
            } else {
                compressor.warn('Condition always false [{file}:{line},{col}]', self.start);
                return maintain_this_binding(compressor.parent(), self, self.alternative);
            }
        }
        var negated = cond.negate(compressor);
        if (best_of(compressor, cond, negated) === negated) {
            self = make_node(AST_Conditional, self, {
                condition: negated,
                consequent: self.alternative,
                alternative: self.consequent
            });
        }
        var condition = self.condition;
        var consequent = self.consequent;
        var alternative = self.alternative;
        // x?x:y --> x||y
        if (condition instanceof AST_SymbolRef && consequent instanceof AST_SymbolRef && condition.definition() === consequent.definition()) {
            return make_node(AST_Binary, self, {
                operator: '||',
                left: condition,
                right: alternative
            });
        }
        // if (foo) exp = something; else exp = something_else;
        //                   |
        //                   v
        // exp = foo ? something : something_else;
        if (consequent instanceof AST_Assign && alternative instanceof AST_Assign && consequent.operator == alternative.operator && consequent.left.equivalent_to(alternative.left) && (!self.condition.has_side_effects(compressor) || consequent.operator == '=' && !consequent.left.has_side_effects(compressor))) {
            return make_node(AST_Assign, self, {
                operator: consequent.operator,
                left: consequent.left,
                right: make_node(AST_Conditional, self, {
                    condition: self.condition,
                    consequent: consequent.right,
                    alternative: alternative.right
                })
            });
        }
        // x ? y(a) : y(b) --> y(x ? a : b)
        if (consequent instanceof AST_Call && alternative.TYPE === consequent.TYPE && consequent.args.length == 1 && alternative.args.length == 1 && consequent.expression.equivalent_to(alternative.expression) && !consequent.expression.has_side_effects(compressor)) {
            consequent.args[0] = make_node(AST_Conditional, self, {
                condition: self.condition,
                consequent: consequent.args[0],
                alternative: alternative.args[0]
            });
            return consequent;
        }
        // x?y?z:a:a --> x&&y?z:a
        if (consequent instanceof AST_Conditional && consequent.alternative.equivalent_to(alternative)) {
            return make_node(AST_Conditional, self, {
                condition: make_node(AST_Binary, self, {
                    left: self.condition,
                    operator: '&&',
                    right: consequent.condition
                }),
                consequent: consequent.consequent,
                alternative: alternative
            });
        }
        // x ? y : y --> x, y
        if (consequent.equivalent_to(alternative)) {
            return make_sequence(self, [
                self.condition,
                consequent
            ]).optimize(compressor);
        }
        if (is_true(self.consequent)) {
            if (is_false(self.alternative)) {
                // c ? true : false ---> !!c
                return booleanize(self.condition);
            }
            // c ? true : x ---> !!c || x
            return make_node(AST_Binary, self, {
                operator: '||',
                left: booleanize(self.condition),
                right: self.alternative
            });
        }
        if (is_false(self.consequent)) {
            if (is_true(self.alternative)) {
                // c ? false : true ---> !c
                return booleanize(self.condition.negate(compressor));
            }
            // c ? false : x ---> !c && x
            return make_node(AST_Binary, self, {
                operator: '&&',
                left: booleanize(self.condition.negate(compressor)),
                right: self.alternative
            });
        }
        if (is_true(self.alternative)) {
            // c ? x : true ---> !c || x
            return make_node(AST_Binary, self, {
                operator: '||',
                left: booleanize(self.condition.negate(compressor)),
                right: self.consequent
            });
        }
        if (is_false(self.alternative)) {
            // c ? x : false ---> !!c && x
            return make_node(AST_Binary, self, {
                operator: '&&',
                left: booleanize(self.condition),
                right: self.consequent
            });
        }
        return self;
        function booleanize(node) {
            if (node.is_boolean())
                return node;
            // !!expression
            return make_node(AST_UnaryPrefix, node, {
                operator: '!',
                expression: node.negate(compressor)
            });
        }
        // AST_True or !0
        function is_true(node) {
            return node instanceof AST_True || node instanceof AST_UnaryPrefix && node.operator == '!' && node.expression instanceof AST_Constant && !node.expression.value;
        }
        // AST_False or !1
        function is_false(node) {
            return node instanceof AST_False || node instanceof AST_UnaryPrefix && node.operator == '!' && node.expression instanceof AST_Constant && !!node.expression.value;
        }
    });
    OPT(AST_Boolean, function (self, compressor) {
        if (compressor.option('booleans')) {
            var p = compressor.parent();
            if (p instanceof AST_Binary && (p.operator == '==' || p.operator == '!=')) {
                return make_node(AST_Number, self, { value: +self.value });
            }
            return make_node(AST_UnaryPrefix, self, {
                operator: '!',
                expression: make_node(AST_Number, self, { value: 1 - self.value })
            });
        }
        return self;
    });
    OPT(AST_Sub, function (self, compressor) {
        var prop = self.property;
        if (prop instanceof AST_String && compressor.option('properties')) {
            prop = prop.getValue();
            if (RESERVED_WORDS(prop) ? !compressor.option('ie8') : is_identifier_string(prop)) {
                return make_node(AST_Dot, self, {
                    expression: self.expression,
                    property: prop
                }).optimize(compressor);
            }
            var v = parseFloat(prop);
            if (!isNaN(v) && v.toString() == prop) {
                self.property = make_node(AST_Number, self.property, { value: v });
            }
        }
        var ev = self.evaluate(compressor);
        if (ev !== self) {
            ev = make_node_from_constant(ev, self).optimize(compressor);
            return best_of(compressor, ev, self);
        }
        return self;
    });
    OPT(AST_Dot, function (self, compressor) {
        var def = self.resolve_defines(compressor);
        if (def) {
            return def.optimize(compressor);
        }
        var prop = self.property;
        if (RESERVED_WORDS(prop) && compressor.option('ie8')) {
            return;
        }
        if (compressor.option('unsafe_proto') && self.expression instanceof AST_Dot && self.expression.property == 'prototype') {
            var exp = self.expression.expression;
            if (exp instanceof AST_SymbolRef && exp.undeclared())
                switch (exp.name) {
                case 'Array':
                    self.expression = make_node(AST_Array, self.expression, { elements: [] });
                    break;
                case 'Object':
                    self.expression = make_node(AST_Object, self.expression, { properties: [] });
                    break;
                case 'String':
                    self.expression = make_node(AST_String, self.expression, { value: '' });
                    break;
                }
        }
        var ev = self.evaluate(compressor);
        if (ev !== self) {
            ev = make_node_from_constant(ev, self).optimize(compressor);
            return best_of(compressor, ev, self);
        }
        return self;
    });
    function literals_in_boolean_context(self, compressor) {
        if (compressor.option('booleans') && compressor.in_boolean_context()) {
            return best_of(compressor, self, make_sequence(self, [
                self,
                make_node(AST_True, self)
            ]).optimize(compressor));
        }
        return self;
    }
    ;
    OPT(AST_Array, literals_in_boolean_context);
    OPT(AST_Object, literals_in_boolean_context);
    OPT(AST_Return, function (self, compressor) {
        if (self.value && is_undefined(self.value, compressor)) {
            self.value = null;
        }
        return self;
    });
    OPT(AST_VarDef, function (self, compressor) {
        var defines = compressor.option('global_defs');
        if (defines && HOP(defines, self.name.name)) {
            compressor.warn('global_defs ' + self.name.name + ' redefined [{file}:{line},{col}]', self.start);
        }
        return self;
    });
}());