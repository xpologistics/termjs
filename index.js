var BoolFilter = require('./lib/boolQuery');
var filterGenerator = require('./lib/generators/filterGenerator');
var queryGenerator = require('./lib/generators/queryGenerator');

module.exports = Term;

function Term() {
    this._query = new BoolFilter(queryGenerator);
    this._filter = new BoolFilter(filterGenerator);
}

Object.defineProperty(Term.prototype, "filter", {
    get: function () { return this._filter; },
    enumerable: true,
    configurable: false
});

Object.defineProperty(Term.prototype, "query", {
    get: function () { return this._query; },
    enumerable: true,
    configurable: false
});

Term.prototype.createNew = function () {
    return new Term();
};

Term.prototype.getvalue = function() {
    var qBool = this._query.getvalue() || {};
    var fBool = this._filter.getvalue();

    if (!_.isEmpty(fBool))
        qBool.filter = fBool;

    return {
        query: qBool
    }
};

Term.BoolQuery = BoolFilter;

