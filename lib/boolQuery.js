var _ = require('underscore');
var S = require('string');
var FilterGenerator = require('./generators/filterGenerator');

module.exports = BoolQuery;

function processField(obj, field, type) {

    // if you pass a term object, apply it to the generators section
    if (_.isObject(field) && (field instanceof (BoolQuery))) {
        obj.generators[type].push(field);
        return obj;
    } else if (!_.isString(field))
        throw new Error('missing field name or BoolQuery in ' + type);

    return new FilterGenerator(obj, type, field);
}

function BoolQuery() {
    // es bool layout
    this.filters = Object.create(null);

    // when using appenders to create new bools, store the BoolQuery objects here to
    // be resolved to the final list later
    this.generators = {
        must: [],
        should: [],
        must_not: []
    };

    // config
    this.prefix = '';
    this.camelCase = false;
}

BoolQuery.prototype.applyTerms = function (key, terms) {

    // store a key under a group (must, should, must_not)
    if (!this.filters[key] || !_.isArray(this.filters[key]))
        this.filters[key] = [];

    if (!_.isArray(terms)) {
        this.filters[key].push(terms);
    } else {
        Array.prototype.push.apply(this.filters[key], terms);
    }

    return this;
};

BoolQuery.prototype.must = function (field) {
    return processField(this, field, 'must');
};

BoolQuery.prototype.mustNot = function (field) {
    return processField(this, field, 'must_not');
};

BoolQuery.prototype.should = function (field) {
    return processField(this, field, 'should');
};

BoolQuery.prototype.getvalue = function () {
    var that = this;
    Object.keys(this.generators).forEach(function (t) {
        that.generators[t].forEach(function (g) {
            that.applyTerms(t, g.getvalue());
        });
        that.generators.length = 0;
    });

    return { bool: this.filters };


    /*
     var result = {
     filtered: {}
     };

     if (!_.isEmpty(this.filters))
     result.filtered = { filter: { bool: this._filters } };

     (_.isEmpty(this._query)) ? result.filtered.query = {"match_all": {}} : result.filtered.query = this._query;

     return result;
     */


};


