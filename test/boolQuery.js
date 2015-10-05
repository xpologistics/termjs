// put decelerations here that you don't want overriden by "should"
// You need to do should(<obj>) to use these
var BoolQuery = require('../lib/boolQuery');
var queries = require('./data/expectedQueries');

var should = require('should'); // overrides Object.prototype

// put declerations here that you want to use like <obj>.should
var FilterGenerator = require('../lib/generators/filterGenerator');
var QueryGenerator  = require('../lib/generators/queryGenerator');

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

var newBoolQuery = function() {
    return new BoolQuery(FilterGenerator);
};


describe('BoolQuery', function () {
    describe('ctor', function () {
        it('should throw an exception when using the default constructor (empty)', function () {
            should(BoolQuery).throw();
        })
    });

    describe('#isCompatible', function () {
        it('should return false when passed null', function () {
            var q = newBoolQuery();

            q.isCompatible().should.be.false();
        });

        it('should return false if the generator factories resolve to different types', function () {
            var filter = new BoolQuery(FilterGenerator);
            var query  = new BoolQuery(QueryGenerator);

            filter.isCompatible(query).should.be.false();
        });

        it('should return false if the generator factories resolve to the same type', function () {
            var query = new BoolQuery(FilterGenerator);
            var otherQuery  = new BoolQuery(FilterGenerator);

            query.isCompatible(otherQuery).should.be.true();
        });

    });
    describe('#and', function () {
        it('should return a new BoolQuery and add it to the must generators with no parameters', function() {
            var expected = newBoolQuery();
            var actual = expected.and();

            should(expected).not.equal(actual);
            should(expected.generators.must[0]).equal(actual);
        });

        it('should return the same BoolQuery and add it to the must generators when called with a BoolQuery', function () {
            var base = newBoolQuery();
            var expected = newBoolQuery();
            var actual = base.and(expected);

            should(expected).equal(actual);
            should(base.generators.must[0]).equal(actual);
        });

        it('should throw when passing an argument that is not BoolQuery', function () {
            var q = newBoolQuery();

            q.and.bind(q, {}).should.throw();
        });

        it('should throw an exception when trying to pass a BoolQuery with an incompatible generator', function () {
            var filter = new BoolQuery(FilterGenerator);
            var query  = new BoolQuery(QueryGenerator);

            filter.and.bind(filter, query).should.throw();
        });

        it('should not throw an exception when trying to pass a BoolQuery with a compatible generator', function () {
            var filter = new BoolQuery(FilterGenerator);
            var query  = new BoolQuery(FilterGenerator);

            filter.and.bind(filter, query).should.not.throw();
        });
    });

    describe('#or', function () {
        it('should return a new BoolQuery and add it to the should generators with no parameters', function() {
            var expected = newBoolQuery();
            var actual = expected.or();

            should(expected).not.equal(actual);
            should(expected.generators.should[0]).equal(actual);
        });

        it('should return the same BoolQuery and add it to the should generators when called with a BoolQuery', function () {
            var base = newBoolQuery();
            var expected = newBoolQuery();
            var actual = base.or(expected);

            should(expected).equal(actual);
            should(base.generators.should[0]).equal(actual);
        });

        it('should throw an exception when trying to pass a BoolQuery with an incompatible generator', function () {
            var filter = new BoolQuery(FilterGenerator);
            var query  = new BoolQuery(QueryGenerator);

            filter.or.bind(filter, query).should.throw();
        });

        it('should not throw an exception when trying to pass a BoolQuery with a compatible generator', function () {
            var filter = new BoolQuery(FilterGenerator);
            var query  = new BoolQuery(FilterGenerator);

            filter.or.bind(filter, query).should.not.throw();
        });

        it('should throw when passing an argument that is not BoolQuery', function () {
            var q = newBoolQuery();

            q.or.bind(q, {}).should.throw();
        });
    });

    describe('#not', function () {
        it('should return a new BoolQuery and add it to the must_not generators with no parameters', function() {
            var expected = newBoolQuery();
            var actual = expected.not();

            should(expected).not.equal(actual);
            should(expected.generators.must_not[0]).equal(actual);
        });

        it('should return the same BoolQuery and add it to the must_not generators when called with a BoolQuery', function () {
            var base = newBoolQuery();
            var expected = newBoolQuery();
            var actual = base.not(expected);

            should(expected).equal(actual);
            should(base.generators.must_not[0]).equal(actual);
        });

        it('should throw an exception when trying to pass a BoolQuery with an incompatible generator', function () {
            var filter = new BoolQuery(FilterGenerator);
            var query  = new BoolQuery(QueryGenerator);

            filter.not.bind(filter, query).should.throw();
        });

        it('should not throw an exception when trying to pass a BoolQuery with a compatible generator', function () {
            var filter = new BoolQuery(FilterGenerator);
            var query  = new BoolQuery(FilterGenerator);

            filter.not.bind(filter, query).should.not.throw();
        });

        it('should throw when passing an argument that is not BoolQuery', function () {
            var q = newBoolQuery();

            q.not.bind(q, {}).should.throw();
        });
    });


    describe('#applyQuery', function () {
        it('should take a single query and append it to filters.must', function () {
            var boolQuery = newBoolQuery();
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

            var boolQuery = newBoolQuery();
            var returnObj = boolQuery.applyQuery('must', q);
            var result = boolQuery.getvalue();

            should(returnObj).be.equal(boolQuery);
            should(returnObj.filters.must.length).equal(2);
            result.should.eql(queries.mustMatchField1AndField2);
        });
    });

    describe('#must', function () {
        it('should return a FilterGenerator when passing a string', function () {
            var boolQuery = newBoolQuery();
            var result = boolQuery.must('test');
            result.should.be.an.instanceOf(FilterGenerator);
        });

        it('should return current BoolQuery when passing an external BoolQuery', function () {
            var parentBoolQuery = newBoolQuery();
            var externalBoolQuery = newBoolQuery();
            var result = parentBoolQuery.must(externalBoolQuery);

            should(result).equal(parentBoolQuery);
        });

        it('should throw when not passing a string or BoolQuery object', function () {
            var boolQuery = newBoolQuery();
            ValidateAppenderThrows(boolQuery, 'must');
        });

        it('should throw an exception when trying to pass a BoolQuery with an incompatible generator', function () {
            var filter = new BoolQuery(FilterGenerator);
            var query  = new BoolQuery(QueryGenerator);

            filter.must.bind(filter, query).should.throw();
        });

        it('should not throw an exception when trying to pass a BoolQuery with a compatible generator', function () {
            var filter = new BoolQuery(FilterGenerator);
            var query  = new BoolQuery(FilterGenerator);

            filter.must.bind(filter, query).should.not.throw();
        });

    });

    describe('#should', function () {
        it('should return a FilterGenerator when passing a string', function () {

            var boolQuery = newBoolQuery();
            var result = boolQuery.should('test');

            result.should.be.an.instanceOf(FilterGenerator);
        });

        it('should return current BoolQuery when passing an external BoolQuery', function () {
            var parentBoolQuery = newBoolQuery();
            var externalBoolQuery = newBoolQuery();
            var result = parentBoolQuery.should(externalBoolQuery);

            should(result).equal(parentBoolQuery);
        });

        it('should throw when not passing a string or BoolQuery object', function () {
            var boolQuery = newBoolQuery();
            ValidateAppenderThrows(boolQuery, 'should');
        });

        it('should throw an exception when trying to pass a BoolQuery with an incompatible generator', function () {
            var filter = new BoolQuery(FilterGenerator);
            var query  = new BoolQuery(QueryGenerator);

            filter.should.bind(filter, query).should.throw();
        });

        it('should not throw an exception when trying to pass a BoolQuery with a compatible generator', function () {
            var filter = new BoolQuery(FilterGenerator);
            var query  = new BoolQuery(FilterGenerator);

            filter.should.bind(filter, query).should.not.throw();
        });

    });

    describe('#mustNot', function () {
        it('should return a FilterGenerator when passing a string', function () {
            var boolQuery = newBoolQuery();
            var result = boolQuery.mustNot('test');
            result.should.be.an.instanceOf(FilterGenerator);
        });

        it('should return current BoolQuery when passing an external BoolQuery', function () {
            var parentBoolQuery = newBoolQuery();
            var externalBoolQuery = newBoolQuery();
            var result = parentBoolQuery.mustNot(externalBoolQuery);

            should(result).equal(parentBoolQuery);
        });

        it('should throw when not passing a string or BoolQuery object', function () {
            var boolQuery = newBoolQuery();
            ValidateAppenderThrows(boolQuery, 'mustNot');
        });

        it('should throw an exception when trying to pass a BoolQuery with an incompatible generator', function () {
            var filter = new BoolQuery(FilterGenerator);
            var query  = new BoolQuery(QueryGenerator);

            filter.mustNot.bind(filter, query).should.throw();
        });

        it('should not throw an exception when trying to pass a BoolQuery with a compatible generator', function () {
            var filter = new BoolQuery(FilterGenerator);
            var query  = new BoolQuery(FilterGenerator);

            filter.mustNot.bind(filter, query).should.not.throw();
        });
    });

    // TODO: These tests rely on the generator and calls to get value when they should just be checking
    // the raw data structures for verification. These tests are more generator specific.
    describe('#applyQuery', function () {
        it('should produce a single bool with single BoolQuery composition', function () {
            var result = newBoolQuery().must('field1').beInList([1, 2, 3])
                .should('field2').beInList([4])
                .should('field3').beInList([5])
                .mustNot('field4').beInList([6])
                .getvalue();

            result.should.eql(queries.mustMatchField1AndField2OrField3AndNotField4);
        });

        it('should produce a nested bool in must passing a BoolQuery into the "must" appender', function () {
            var nestedBoolQuery = newBoolQuery().must('field1').beInList([1, 2, 3]);
            var parentBoolQuery = newBoolQuery().must(nestedBoolQuery);
            var result = parentBoolQuery.getvalue();

            result.should.eql(queries.mustMatchField1Nested);
        });

        it('should produce a nested bool in should passing a BoolQuery into the "should" appender', function () {
            var nestedBoolQuery = newBoolQuery().should('field1').beInList(['A', 'B', 'C']).should('field2').beInList(['D', 'E', 'F']);
            var parentBoolQuery = newBoolQuery().should(nestedBoolQuery);
            var result = parentBoolQuery.getvalue();

            result.should.eql(queries.mustMatchField1OrField2Nested);
        });

        it('should produce a nested bool in must_not passing a BoolQuery into the "mustNot" appender', function () {
            var nestedBoolQuery = newBoolQuery().mustNot('field1').beInList([4, 5, 6]);
            var parentBoolQuery = newBoolQuery().mustNot(nestedBoolQuery);
            var result = parentBoolQuery.getvalue();

            result.should.eql(queries.mustNotMatchField1Nested);
        });

        it('should produce a deep nested bool in must using multiple BoolQuery composition', function () {
            var parentBoolQuery = newBoolQuery().must('field1').beInList([1, 2, 3])
                .should('field2').beInList([4]).should('field3').beInList([5])
                .mustNot('field4').beInList([6]);
            var nestedBoolQuery1 = newBoolQuery().must('field1').beInList([1, 2, 3])
                .should('field2').beInList([4]).should('field3').beInList([5])
                .mustNot('field4').beInList([6]);
            var nestedBoolQuery2 = newBoolQuery().must('field1').beInList([1, 2, 3])
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
            var boolQuery = newBoolQuery().must('field1').beInList([1, 2, 3])
                .should('field2').beInList([4])
                .should('field3').beInList([5])
                .mustNot('field4').beInList([6]);
            var nestedBoolQuery = newBoolQuery().must('field1').beInList([1, 2, 3])
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