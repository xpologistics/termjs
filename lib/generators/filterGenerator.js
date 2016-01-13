var S      = require('string');
var _      = require('underscore');
var moment = require('moment');

module.exports = FilterGenerator;

function FilterGenerator(cb, field, meta) {
    if (!(this instanceof FilterGenerator))
        return new FilterGenerator(cb, field, meta); // use ctor as factory

    // private
    this.cb = function (term) { return cb(term, this) };
    this.field = field; //applyFieldSettings(field, root.prefix, root.camelCase);
    this.meta = meta;
}

FilterGenerator.prototype.__type = 'd25dde7027cd449c9dd35835ecd50c87';

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

FilterGenerator.prototype.generateDateSuffix = function (val) {
    if (!_.isString(val)) return '';

    var dt = moment(val, ['MM/DD/YYYY HH:mm', moment.ISO_8601]);
    var matrix = [
      // min 0, min 1
        ['d',   'm'], // hr 0

        ['h',   '']  // hr 1

    ];
    if (!dt.isValid()) return '';

    if (!(~val.indexOf(":")))
        return '||/d';

    return '';

};

FilterGenerator.prototype.beInRange = function(min, max) {
    var field = this.field;
    var term = {
        range: {
        }
    };
    var minSuffix = this.generateDateSuffix(min);
    var maxSuffix = this.generateDateSuffix(max);

    term.range[field] = {};

    if (min != null && (_.isNumber(min) || (_.isString(min) && !_.isEmpty(min))))
        term.range[field].gte = _.isString(min) ? min + minSuffix : min;

    if (max != null && (_.isNumber(max) || (_.isString(max) && !_.isEmpty(max))))
        term.range[field].lte = _.isString(max) ? max + maxSuffix : max;

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
