var S = require('string');
var _ = require('underscore');


module.exports = FilterGenerator;
/*
 * private
 * appies conventions to field names passed into the filter system.
 * If you pass in an array, it returns a transformed array. If you
 * pass in a single value, it returns a transformed single value
 */
var applyFieldSettings = function(field, prefix, camelCase)
{
    var fields = [];

    _.isArray(field) ? Array.prototype.push.apply(fields, field) : fields.push(field);

    // handle camelcasing (lowercase the first letter of the field)
    if (camelCase)
        fields.forEach(function (f, i) { fields[i] = f.charAt(0).toLowerCase() + f.slice(1); });

    // handle adding the prefix to the field name if it exists
    if (prefix.length && S(prefix).endsWith('.'))
        fields.forEach(function (f, i) { fields[i] = prefix + f; });
    else if (prefix.length)
        fields.forEach(function (f, i) {
            fields[i] = prefix + '.' + f;
        });

    return _.isArray(field) ? fields : fields[0];
};

function FilterGenerator(root, method, field) {

    // private
    this._obj = root;
    this._method = method;
    this._field = applyFieldSettings(field, root.prefix, root.camelCase);
}

FilterGenerator.prototype.haveRadius = function(distance, lat, lon) {
    var field = this._field;
    var term = {
        'geo_distance': {
            distance: distance + 'mi'
        }
    };

    term['geo_distance'][field] = {};
    term['geo_distance'][field].lat = lat;
    term['geo_distance'][field].lon = lon;

    return this._obj.applyQuery(this._method, term);
};

FilterGenerator.prototype.beInList = function(items) {
    var field = this._field;
    var term = {
        terms: {}
    };

    term.terms[field] = _.isArray(items) ? items : [items];

    return this._obj.applyQuery(this._method, term);
};

FilterGenerator.prototype.beInRange = function(min, max) {
    var field = this._field;
    var term = {
        range: {
        }
    };

    term.range[field] = {};

    if (!_.isEmpty(min))
        term.range[field].gte = min;

    if (!_.isEmpty(max))
        term.range[field].lte = max;

    return this._obj.applyQuery(this._method, term);
};

FilterGenerator.prototype.beNull = function() {
    var field = this._field;
    var term = {
        missing: {
            field: field
        }
    };

    return this._obj.applyQuery(this._method, term);
};

FilterGenerator.prototype.startsWith = function(q) {
    if (this._method !== '_query_')
        throw new Error('startsWith must be used with a query (.query(fields).startsWith(q)');

    var fields = this._field;
    var q = {
        "multi_match": {
            query: q.toLowerCase(),
            fields: fields,
            type: "phrase_prefix"
        }
    };

//    return applyQuery.call(this._obj, this._method, q);
};