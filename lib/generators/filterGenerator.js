var S = require('string');
var _ = require('underscore');


module.exports = FilterGenerator;
/*
 * private
 * appies conventions to field names passed into the filter system.
 * If you pass in an array, it returns a transformed array. If you
 * pass in a single value, it returns a transformed single value
 */
/*
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
*/

function FilterGenerator(cb, field, meta) {
    if (!(this instanceof FilterGenerator))
        return new FilterGenerator(cb, field, meta); // use ctor as factory

    // private
    this.cb = function (term) { return cb(term, this) };
    this.field = field; //applyFieldSettings(field, root.prefix, root.camelCase);
    this.meta = meta;
}

FilterGenerator.prototype.haveRadius = function(distance, lat, lon) {
    var field = this.field;
    var term = {
        'geo_distance': {
            distance: distance + 'mi'
        }
    };

    term['geo_distance'][field] = {};
    term['geo_distance'][field].lat = lat;
    term['geo_distance'][field].lon = lon;

    return this.cb(term);
};

FilterGenerator.prototype.beInList = function(items) {
    var field = this.field;
    var term = {
        terms: {}
    };

    term.terms[field] = _.isArray(items) ? items : [items];

    return this.cb(term);
};

FilterGenerator.prototype.beTrue = function () {
    return this.beInList(1);
};

FilterGenerator.prototype.beFalse = function () {
    return this.beInList(0);
};


FilterGenerator.prototype.beInRange = function(min, max) {
    var field = this.field;
    var term = {
        range: {
        }
    };

    term.range[field] = {};

    if (min != null)
        term.range[field].gte = min;

    if (max != null)
        term.range[field].lte = max;

    return this.cb(term);
};

FilterGenerator.prototype.beNull = function() {
    var field = this.field;
    var term = {
        missing: {
            field: field
        }
    };

    return this.cb(term);
};
