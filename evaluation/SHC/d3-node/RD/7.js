'use strict';
const jsDom = require('jsdom');
module.exports = D3Node;
function fixXmlCase(text) {
    // Fix a jsdom issue where all SVG tagNames are lowercased:
    // https://github.com/tmpvar/jsdom/issues/620
    var tagNames = [
        'linearGradient',
        'radialGradient'
    ];
    for (var i = 0, l = tagNames.length; i < l; i++) {
        var tagName = tagNames[i];
        text = text.replace(new RegExp('(<|</)' + tagName.toLowerCase() + '\\b', 'g'), function (all, start) {
            return start + tagName;
        });
    }
    return text;
}
const defaults = { d3Module: require('d3') };
function D3Node(opts) {
    const options = Object.assign({}, defaults, opts);
    // deprecates props
    if (opts && opts.svgStyles) {
        // deprecated svgStyles option
        console.warn();
        options.styles = opts.svgStyles;
    }
    // auto-new instance, so we always have 'this'
    if (!(this instanceof D3Node)) {
        return new D3Node();
    }
    // setup DOM
    let document = jsDom.jsdom();
    if (options.container) {
        document = jsDom.jsdom(options.container);
    }
    // setup d3 selection
    let d3Element = options.d3Module.select(document.body);
    if (options.selector) {
        d3Element = d3Element.select(options.selector);
    }
    this.options = options;
    this.document = document;
    this.d3Element = d3Element;
    this.d3 = options.d3Module;
}
D3Node.prototype.createSVG = function (width, height) {
    const svg = this.d3Element.append('svg').attr('xmlns', 'http://www.w3.org/2000/svg');
    if (width && height) {
        svg.attr('width', width).attr('height', height);
    }
    if (this.options.styles) {
        svg.append('defs').append('style').attr('type', 'text/css').text(`<![CDATA[ ${ this.options.styles } ]]>`);
    }
    return svg;
};
D3Node.prototype.svgString = function () {
    if (this.d3Element.select('svg').node()) {
        // temp until: https://github.com/tmpvar/jsdom/issues/1368
        return fixXmlCase(this.d3Element.select('svg').node().outerHTML);
    }
    return '';
};
D3Node.prototype.html = function () {
    return jsDom.serializeDocument(this.document);
};
D3Node.prototype.chartHTML = function () {
    return this.document.querySelector(this.options.selector).outerHTML;
};