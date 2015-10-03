// put decelerations here that you don't want overriden by "should"
// You need to do should(<obj>) to use these
var BoolQuery = require('../lib/boolQuery');
var queries = require('./data/expectedQueries');

var should = require('should'); // overrides Object.prototype

// put declerations here that you want to use like <obj>.should
var FilterGenerator = require('../lib/generators/filterGenerator');

var ValidateAppenderThrows = function (boolQuery, method) {
    // object != BoolQuery
    boolQuery[method].bind(boolQuery, {}).should.throw();
    // null
    boolQuery[method].bind(boolQuery, null).should.throw();
    // numeric
    boolQuery[method].bind(boolQuery, 84).should.throw();
    // object that looks like BoolQuery
    boolQuery[method].bind(boolQuery, {filters: {}, generators: {}}).should.throw();
};

describe('BoolQuery', function () {
    describe('#and', function () {
        it('should return a new BoolQuery and add it to the must generators with no parameters', function() {
            var expected = new BoolQuery();
            var actual = expected.and();

            should(expected).not.equal(actual);
            should(expected.generators.must[0]).equal(actual);
        });

        it('should return the same BoolQuery and add it to the must generators when called with a BoolQuery', function () {
            var base = new BoolQuery();
            var expected = new BoolQuery();
            var actual = base.and(expected);

            should(expected).equal(actual);
            should(base.generators.must[0]).equal(actual);
        });
    });

    describe('#or', function () {
        it('should return a new BoolQuery and add it to the should generators with no parameters', function() {
            var expected = new BoolQuery();
            var actual = expected.or();

            should(expected).not.equal(actual);
            should(expected.generators.should[0]).equal(actual);
        });

        it('should return the same BoolQuery and add it to the should generators when called with a BoolQuery', function () {
            var base = new BoolQuery();
            var expected = new BoolQuery();
            var actual = base.or(expected);

            should(expected).equal(actual);
            should(base.generators.should[0]).equal(actual);
        });
    });

    describe('#not', function () {
        it('should return a new BoolQuery and add it to the must_not generators with no parameters', function() {
            var expected = new BoolQuery();
            var actual = expected.not();

            should(expected).not.equal(actual);
            should(expected.generators.must_not[0]).equal(actual);
        });

        it('should return the same BoolQuery and add it to the must_not generators when called with a BoolQuery', function () {
            var base = new BoolQuery();
            var expected = new BoolQuery();
            var actual = base.not(expected);

            should(expected).equal(actual);
            should(base.generators.must_not[0]).equal(actual);
        });
    });


    describe('#applyQuery', function () {
        it('should take a single query and append it to filters.must', function () {
            var boolQuery = new BoolQuery();
            var returnObj = boolQuery.applyQuery('must', { terms: {field1: [1, 2, 3]}});
            var result = boolQuery.getvalue();

            should(returnObj).be.equal(boolQuery);
            result.should.eql(queries.mustMatchField1);
        });

        it('should take an array of queries and append it to filters.must', function () {
            var q = [
                { terms: {field1: [1, 2, 3]}},
                { terms: {field2: [4, 5, 6]}}
            ];

            var boolQuery = new BoolQuery();
            var returnObj = boolQuery.applyQuery('must', q);
            var result = boolQuery.getvalue();

            should(returnObj).be.equal(boolQuery);
            should(returnObj.filters.must.length).equal(2);
            result.should.eql(queries.mustMatchField1AndField2);
        });
    });

    describe('#must', function () {
        it('should return a FilterGenerator when passing a string', function () {
            var boolQuery = new BoolQuery();
            var result = boolQuery.must('test');
            result.should.be.an.instanceOf(FilterGenerator);
        });

        it('should return current BoolQuery when passing an external BoolQuery', function () {
            var parentBoolQuery = new BoolQuery();
            var externalBoolQuery = new BoolQuery();
            var result = parentBoolQuery.must(externalBoolQuery);

            should(result).equal(parentBoolQuery);
        });

        it('should throw when not passing a string or BoolQuery object', function () {
            var boolQuery = new BoolQuery();
            ValidateAppenderThrows(boolQuery, 'must');
        });


    });

    describe('#should', function () {
        it('should return a FilterGenerator when passing a string', function () {

            var boolQuery = new BoolQuery();
            var result = boolQuery.should('test');

            result.should.be.an.instanceOf(FilterGenerator);
        });

        it('should return current BoolQuery when passing an external BoolQuery', function () {
            var parentBoolQuery = new BoolQuery();
            var externalBoolQuery = new BoolQuery();
            var result = parentBoolQuery.should(externalBoolQuery);

            should(result).equal(parentBoolQuery);
        });

        it('should throw when not passing a string or BoolQuery object', function () {
            var boolQuery = new BoolQuery();
            ValidateAppenderThrows(boolQuery, 'should');
        });

    });

    describe('#mustNot', function () {
        it('should return a FilterGenerator when passing a string', function () {
            var boolQuery = new BoolQuery();
            var result = boolQuery.mustNot('test');
            result.should.be.an.instanceOf(FilterGenerator);
        });

        it('should return current BoolQuery when passing an external BoolQuery', function () {
            var parentBoolQuery = new BoolQuery();
            var externalBoolQuery = new BoolQuery();
            var result = parentBoolQuery.mustNot(externalBoolQuery);

            should(result).equal(parentBoolQuery);
        });

        it('should throw when not passing a string or BoolQuery object', function () {
            var boolQuery = new BoolQuery();
            ValidateAppenderThrows(boolQuery, 'mustNot');
        });
    });

    // TODO: These tests rely on the generator and calls to get value when they should just be checking
    // the raw data structures for verification. These tests are more generator specific.
    describe('#applyQuery', function () {
        it('should produce a single bool with single BoolQuery composition', function () {
            var result = new BoolQuery().must('field1').beInList([1, 2, 3])
                .should('field2').beInList([4])
                .should('field3').beInList([5])
                .mustNot('field4').beInList([6])
                .getvalue();

            result.should.eql(queries.mustMatchField1AndField2OrField3AndNotField4);
        });

        it('should produce a nested bool in must passing a BoolQuery into the "must" appender', function () {
            var nestedBoolQuery = new BoolQuery().must('field1').beInList([1, 2, 3]);
            var parentBoolQuery = new BoolQuery().must(nestedBoolQuery);
            var result = parentBoolQuery.getvalue();

            result.should.eql(queries.mustMatchField1Nested);
        });

        it('should produce a nested bool in should passing a BoolQuery into the "should" appender', function () {
            var nestedBoolQuery = new BoolQuery().should('field1').beInList(['A', 'B', 'C']).should('field2').beInList(['D', 'E', 'F']);
            var parentBoolQuery = new BoolQuery().should(nestedBoolQuery);
            var result = parentBoolQuery.getvalue();

            result.should.eql(queries.mustMatchField1OrField2Nested);
        });

        it('should produce a nested bool in must_not passing a BoolQuery into the "mustNot" appender', function () {
            var nestedBoolQuery = new BoolQuery().mustNot('field1').beInList([4, 5, 6]);
            var parentBoolQuery = new BoolQuery().mustNot(nestedBoolQuery);
            var result = parentBoolQuery.getvalue();

            result.should.eql(queries.mustNotMatchField1Nested);
        });

        it('should produce a deep nested bool in must using multiple BoolQuery composition', function () {
            var parentBoolQuery = new BoolQuery().must('field1').beInList([1, 2, 3])
                .should('field2').beInList([4]).should('field3').beInList([5])
                .mustNot('field4').beInList([6]);
            var nestedBoolQuery1 = new BoolQuery().must('field1').beInList([1, 2, 3])
                .should('field2').beInList([4]).should('field3').beInList([5])
                .mustNot('field4').beInList([6]);
            var nestedBoolQuery2 = new BoolQuery().must('field1').beInList([1, 2, 3])
                .should('field2').beInList([4]).should('field3').beInList([5])
                .mustNot('field4').beInList([6]);

            parentBoolQuery.must(nestedBoolQuery1.must(nestedBoolQuery2));

            should(parentBoolQuery.generators.must[0]).be.equal(nestedBoolQuery1);
            should(nestedBoolQuery1.generators.must[0]).be.equal(nestedBoolQuery2);
            parentBoolQuery.getvalue().should.eql(queries.deepNestedMustComposition);
        });



    });

    describe('#getvalue', function () {
        it('should produce the same results after multiple calls', function () {
            var boolQuery = new BoolQuery().must('field1').beInList([1, 2, 3])
                .should('field2').beInList([4])
                .should('field3').beInList([5])
                .mustNot('field4').beInList([6]);
            var nestedBoolQuery = new BoolQuery().must('field1').beInList([1, 2, 3])
                .should('field2').beInList([4])
                .should('field3').beInList([5])
                .mustNot('field4').beInList([6]);

            boolQuery.must(nestedBoolQuery);

            var result1 = boolQuery.getvalue(); // invokes the generator to modify the filter list
            var result2 = boolQuery.getvalue(); // should not invoke the generator, list is already modified

            result1.should.eql(result2);
        });
    });


});