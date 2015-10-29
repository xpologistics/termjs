module.exports = QueryGenerator;

function QueryGenerator(cb, field, meta) {
    if (!(this instanceof QueryGenerator))
        return new QueryGenerator(cb, field, meta); // use ctor as factory

    // private
    this.cb = function (term) { return cb(term, this) };
    this.field = field; //applyFieldSettings(field, root.prefix, root.camelCase);
    this.meta = meta;
}

QueryGenerator.prototype.startsWith = function(q) {
    var fields = this.field;
    var query = {
        "multi_match": {
            query: q.toLowerCase(),
            fields: fields,
            type: "phrase_prefix"
        }
    };

    return this.cb(query);
};


