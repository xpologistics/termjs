var BoolFilter = require('./lib/boolQuery');
var filterGenerator = require('./lib/generators/filterGenerator');
var queryGenerator = require('./lib/generators/queryGenerator');

function Term() {
    this._query = new BoolFilter(queryGenerator);
    this._filter = new BoolFilter(filterGenerator);
}

Term.prototype.filter = function () {
    return this._filter;
};

Term.prototype.query = function () {
    return this._query;
};

Term.prototype.createNew = function () {
    return new Term();
};

Term.prototype.getvalue = function() {
    return {
        filtered: {
            query: this._query.getvalue(),
            filter: this._filter.getvalue()
        }
    }
};


