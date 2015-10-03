// put decelerations here that you don't want overriden by "should"
// You need to do should(<obj>) to use these
var BoolQuery = require('../lib/boolQuery');
var queries = require('./data/expectedQueries');

var should = require('should'); // overrides Object.prototype

// put declerations here that you want to use like <obj>.should
var FilterGenerator = require('../lib/generators/filterGenerator');


describe('BoolQuery', function () {

    describe('appenders', function () {

        it('must return a FilterGenerator when using "must" passing a string', function () {
            var boolQuery = new BoolQuery();
            var result = boolQuery.must('test');
            result.should.be.an.instanceOf(FilterGenerator);
        });

        it('must return a FilterGenerator when using "should" passing a string', function () {

            var boolQuery = new BoolQuery();
            var result = boolQuery.should('test');

            result.should.be.an.instanceOf(FilterGenerator);
        });

        it('must return a FilterGenerator when using "mustNot" passing a string', function () {
            var boolQuery = new BoolQuery();
            var result = boolQuery.mustNot('test');
            result.should.be.an.instanceOf(FilterGenerator);
        });

        it('must return current BoolQuery when using "must" passing an external BoolQuery', function () {
            var parentBoolQuery = new BoolQuery();
            var externalBoolQuery = new BoolQuery();
            var result = parentBoolQuery.must(externalBoolQuery);

            should(result).equal(parentBoolQuery);
        });

        it('must return current BoolQuery when using "should" passing an external BoolQuery', function () {
            var parentBoolQuery = new BoolQuery();
            var externalBoolQuery = new BoolQuery();
            var result = parentBoolQuery.should(externalBoolQuery);

            should(result).equal(parentBoolQuery);
        });

        it('must return current BoolQuery when using "mustNot" passing an external BoolQuery', function () {
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

        it('must throw when using "must" not passing a string or BoolQuery object', function () {
            var boolQuery = new BoolQuery();
            ValidateAppenderThrows(boolQuery, 'must');
        });

        it('must throw when using "should" not passing a string or BoolQuery object', function () {
            var boolQuery = new BoolQuery();
            ValidateAppenderThrows(boolQuery, 'should');
        });

        it('must throw when using "mustNot" not passing a string or BoolQuery object', function () {
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

            var result = parentBoolQuery.must(nestedBoolQuery1.must(nestedBoolQuery2)).getvalue();

            should(parentBoolQuery.generators.must[0]).be.equal(nestedBoolQuery1);
            should(nestedBoolQuery1.generators.must[0]).be.equal(nestedBoolQuery2);
            result.should.eql(queries.deepNestedMustComposition);

        });

    });


});