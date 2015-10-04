module.exports = QueryGenerator;

function QueryGenerator(cb, field) {

    // private
    this.cb = cb;
    this.field = field; //applyFieldSettings(field, root.prefix, root.camelCase);
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


