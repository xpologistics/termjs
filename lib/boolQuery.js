var _ = require('underscore');
var S = require('string');

module.exports = BoolQuery;

function processAppender(obj, type, field) {

    // if you pass a term object, apply it to the generators section
    if (_.isObject(field) && (field instanceof (BoolQuery))) {
        obj.generators[type].push(field);
        return obj;
    } else if (!_.isString(field))
        throw new Error('missing field name or BoolQuery in ' + type);

    return new obj.factory(obj.applyQuery.bind(obj, type), field);
}

function processNester(obj, type, query) {
    query = query || new BoolQuery(obj.factory);

    obj.generators[type].push(query);
    return query;
}

function BoolQuery(generatorFactory) {
    if (!generatorFactory || !_.isFunction(generatorFactory))
        throw new Error('Must supply a function that returns a generator');

    this.factory = generatorFactory;

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

BoolQuery.prototype.applyQuery = function (key, query) {

    // store a key under a group (must, should, must_not)
    if (!this.filters[key] || !_.isArray(this.filters[key]))
        this.filters[key] = [];

    if (!_.isArray(query)) {
        this.filters[key].push(query);
    } else {
        Array.prototype.push.apply(this.filters[key], query);
    }

    return this;
};

BoolQuery.prototype.must = function (field) {
    return processAppender(this, 'must', field);
};

BoolQuery.prototype.mustNot = function (field) {
    return processAppender(this, 'must_not', field);
};

BoolQuery.prototype.should = function (field) {
    return processAppender(this, 'should', field);
};

BoolQuery.prototype.and = function (query) {
    return processNester(this, 'must', query);
};

BoolQuery.prototype.or = function (query) {
    return processNester(this, 'should', query);
};

BoolQuery.prototype.not = function (query) {
    return processNester(this, 'must_not', query);
};

BoolQuery.prototype.getvalue = function () {
    var that = this;
    Object.keys(this.generators).forEach(function (t) {
        that.generators[t].forEach(function (g) {
            that.applyQuery(t, g.getvalue());
        });
        that.generators[t].length = 0;
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


