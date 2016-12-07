// put decelerations here that you don't want overriden by "should"
// You need to do should(<obj>) to use these
var should = require('should'); // overrides Object.prototype

// put declerations here that you want to use like <obj>.should
var QueryGenerator = require('../lib/generators/queryGenerator');

describe('QueryGenerator', function () {
    describe('ctor', function () {

    });

    describe('#startsWith', function () {
        it('should produce a multi match query of type phrase prefix on the passed in fields', function (done) {
            var expected = { multi_match: { query: 'test', fields: ['field1', 'field2'], type: 'phrase_prefix'}};

            new QueryGenerator(function (actual) {
                actual.should.eql(expected);
                done();
            }, ['field1', 'field2']).startsWith('test');
        });
    });

    describe('#beMissing', function () {
        it('should produce a must not exists query on the passed in fields', function (done) {
            var expected = {
                bool: {
                    must_not: {
                        exists: {
                            field: ['field1', 'field2']
                        }
                    }
                }
            };

            new QueryGenerator(function (actual) {
                actual.should.eql(expected);
                done();
            }, ['field1', 'field2']).beMissing();
        });
    });
});