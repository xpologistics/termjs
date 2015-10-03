// put decelerations here that you don't want overriden by "should"
// You need to do should(<obj>) to use these
var BoolQuery = require('../lib/boolQuery');
var queries = require('./data/expectedQueries');

var should = require('should'); // overrides Object.prototype

// put declerations here that you want to use like <obj>.should
var FilterGenerator = require('../lib/generators/filterGenerator');


describe('BoolQuery', function () {

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

    describe('appenders', function () {

        it('should return a FilterGenerator when using "must" passing a string', function () {
            var boolQuery = new BoolQuery();
            var result = boolQuery.must('test');
            result.should.be.an.instanceOf(FilterGenerator);
        });

        it('should return a FilterGenerator when using "should" passing a string', function () {

            var boolQuery = new BoolQuery();
            var result = boolQuery.should('test');

            result.should.be.an.instanceOf(FilterGenerator);
        });

        it('should return a FilterGenerator when using "mustNot" passing a string', function () {
            var boolQuery = new BoolQuery();
            var result = boolQuery.mustNot('test');
            result.should.be.an.instanceOf(FilterGenerator);
        });

        it('should return current BoolQuery when using "must" passing an external BoolQuery', function () {
            var parentBoolQuery = new BoolQuery();
            var externalBoolQuery = new BoolQuery();
            var result = parentBoolQuery.must(externalBoolQuery);

            should(result).equal(parentBoolQuery);
        });

        it('should return current BoolQuery when using "should" passing an external BoolQuery', function () {
            var parentBoolQuery = new BoolQuery();
            var externalBoolQuery = new BoolQuery();
            var result = parentBoolQuery.should(externalBoolQuery);

            should(result).equal(parentBoolQuery);
        });

        it('should return current BoolQuery when using "mustNot" passing an external BoolQuery', function () {
            var parentBoolQuery = new BoolQuery();
            var externalBoolQuery = new BoolQuery();
            var result = parentBoolQuery.mustNot(externalBoolQuery);

            should(result).equal(parentBoolQuery);
        });

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

        it('should throw when using "must" not passing a string or BoolQuery object', function () {
            var boolQuery = new BoolQuery();
            ValidateAppenderThrows(boolQuery, 'must');
        });

        it('should throw when using "should" not passing a string or BoolQuery object', function () {
            var boolQuery = new BoolQuery();
            ValidateAppenderThrows(boolQuery, 'should');
        });

        it('should throw when using "mustNot" not passing a string or BoolQuery object', function () {
            var boolQuery = new BoolQuery();
            ValidateAppenderThrows(boolQuery, 'mustNot');
        });
    });


    describe('data', function () {
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

        it('should produce the same results after multiple calls to getvalue', function () {
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