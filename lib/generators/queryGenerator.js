module.exports = QueryGenerator;

function QueryGenerator(cb, field, meta) {
    if (!(this instanceof QueryGenerator))
        return new QueryGenerator(cb, field, meta); // use ctor as factory

    // private
    this.cb = function (term) { return cb(term, this) };
    this.field = field; //applyFieldSettings(field, root.prefix, root.camelCase);
    this.meta = meta;
}

QueryGenerator.prototype.__type = '2b1f86d4bbb140c5a476fdab44bef38c';

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

QueryGenerator.prototype.wildcard = function(q) {
    
    var qLower = q.toLowerCase();
    var fields = this.field;

    var boolQuery = {
        "bool": {
            "should": []
        }
    };

    var fields = this.field;
    var len = fields.length;

    for (var i=0; i < len; i++) {
        var field = fields[i];

        var wildcardQuery = {
            "query": {
                "wildcard": {
                }
            }
        };

        wildcardQuery.query.wildcard[field] = {
            "value": qLower
        };
        boolQuery.bool.should.push(wildcardQuery);
    }

    return this.cb(boolQuery);
};

QueryGenerator.prototype.beMissing = function() {
    var field = this.field;
    var query = {
        bool: {
            must_not: {
                exists: {
                    field: field
                }
            }
        }
    };

    return this.cb(query);
};
