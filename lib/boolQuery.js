var _ = require('underscore');

module.exports = BoolQuery;

var conditional = {
    none: -1,
    if: 1,
    else: 2
};

function processAppender(obj, type, field) {

    // if you pass a term object, apply it to the generators section
    if (_.isObject(field) && (field instanceof (BoolQuery))) {
        processNester(obj, type, field);
        return obj;
    } else if (!_.isString(field) && !_.isArray(field))
        throw new Error('missing field name or BoolQuery in ' + type);

    // accepts string or array of string, but does not validate the array is an array of strings
    return obj.factory(obj.applyFilter.bind(obj, type), field, { type: obj.conditionalState });
}

function processNester(obj, type, query) {
    query = query || new BoolQuery(obj.factory);

    if (query.__type !== BoolQuery.prototype.__type)
        throw new Error('argument must be of type BoolQuery');

    if (!obj.isCompatible(query))
        throw new Error('BoolQuery is not compatible');

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
        must_not: [],
        filter: []
    };

    // if/else state
    this.conditionalPredicate = null;
    this.conditionalState = conditional.none;
    this.conditionalPending = false;
}

BoolQuery.prototype.__type = 'f48b5f1c85264f2ea30a67d9f10dc224';

BoolQuery.prototype.checkConditional = function (gen) {
    // if the generator isn't tagged with the appropriate metadata, return true
    // so that it get processed
    if (!gen || !gen.meta || !gen.meta.type) return true;

    // if we don't have an active conditional return true so that it gets processed
    if (this.conditionalPredicate == null) return true;

    // only return true if this generator is part of the condition that's true
    var result =  (this.conditionalPredicate && gen.meta.type == conditional.if) ||
        (!this.conditionalPredicate && gen.meta.type == conditional.else);

    // reset conditional logic on the else
    // TODO: consider an explict "end" call
    if (gen.meta.type == conditional.else) {
        this.conditionalPredicate = null;
        this.conditionalState = conditional.none;
    }

    return result;
};

BoolQuery.prototype.applyFilter = function (key, query, gen) {
    if (!this.checkConditional(gen))
        return this; // noop if we aren't supposed to execute this generator as part of a conditional

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

BoolQuery.prototype['if'] = function (predicate) {
    if (this.conditionalPending) // oops!
        throw new Error('got new "if" before closing "else"');

    this.conditionalPredicate = predicate;
    this.conditionalPending = true;
    this.conditionalState = conditional.if;
    return this;
};

BoolQuery.prototype['else'] = function (predicate) {
    this.conditionalState = conditional.else;
    this.conditionalPending = false;
    return this;
};


BoolQuery.prototype.isCompatible = function (obj) {
    if (!obj || obj.__type !== BoolQuery.prototype.__type)
        return false;

    var theirGenerator = obj.factory(null, null);
    var myGenerator = this.factory(null, null);

    return theirGenerator.__type === myGenerator.__type;
};

BoolQuery.prototype.isEmpty = function () {
    var result = this.getvalue();

    return _.isEmpty(result.bool);
};

BoolQuery.prototype.getvalue = function () {
    var that = this;
    Object.keys(this.generators).forEach(function (t) {
        that.generators[t].forEach(function (g) {
            if (g.isEmpty()) return;

            that.applyFilter(t, g.getvalue());
        });
        that.generators[t].length = 0;
    });


    return _.isEmpty(this.filters) ? {} : { bool: this.filters };
};

BoolQuery.prototype.toString = function () {
    return this.getvalue();
};


