var exports = module.exports = {};

exports.mustMatchField1 = {
    bool: {
        must: [
            { terms: { 'field1': [1, 2, 3] }}
        ]
    }
};

exports.mustNotMatchField1 = {
    bool: {
        must_not: [
            { terms: { 'field1': [4, 5, 6] }}
        ]
    }
};

exports.mustMatchField1OrField2 = {
    bool: {
        should: [
            { terms: { 'field1': ['A', 'B', 'C'] }},
            { terms: { 'field2': ['D', 'E', 'F'] }}
        ]
    }
};

exports.mustMatchField1Nested = {
    bool: {
        must: [
            exports.mustMatchField1
        ]
    }
};

exports.mustNotMatchField1Nested = {
    bool: {
        must_not: [
           exports.mustNotMatchField1
        ]
    }
};

exports.mustMatchField1OrField2Nested = {
    bool: {
        should: [
            exports.mustMatchField1OrField2
        ]
    }
};


exports.mustMatchField1AndAnyOfField2OrField3 = {
    bool: {
        must: [
            {terms: { "doc.field1": [1, 2, 3] }},
            {bool: {
                should: [
                    { terms: { "doc.field2": [4, 5, 6]}},
                    { terms: { "doc.field3": ['A', 'B', 'C']}}
                ]
            }}
        ]
    }
};

exports.mustMatchField1AndField2OrField3AndNotField4 = {
   bool: {
       must: [
           { terms: { 'field1': [1, 2, 3]}}
       ],
       should: [
           { terms: { 'field2': [4]}},
           { terms: { 'field3': [5]}}
       ],
       must_not: [
           { terms: { 'field4': [6]}}
       ]
   }
};

exports.deepNestedMustComposition = JSON.parse(JSON.stringify(exports.mustMatchField1AndField2OrField3AndNotField4));
var idx = exports.deepNestedMustComposition.bool.must.push(JSON.parse(JSON.stringify(exports.mustMatchField1AndField2OrField3AndNotField4)));
exports.deepNestedMustComposition.bool.must[idx-1].bool.must.push(JSON.parse(JSON.stringify(exports.mustMatchField1AndField2OrField3AndNotField4)));

