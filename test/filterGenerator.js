// put decelerations here that you don't want overriden by "should"
// You need to do should(<obj>) to use these
var filters = require('./data/expectedFilters');

var should = require('should'); // overrides Object.prototype

// put declerations here that you want to use like <obj>.should
var FilterGenerator = require('../lib/generators/filterGenerator');

describe('FilterGenerator', function () {
    describe('ctor', function () {

    });

    describe('#haveRadius', function () {
        it('should produce geo_distance filter in miles', function (done) {
            var expected = { geo_distance: { distance: '10mi', field1: { lat: 1, lon: 2}}};

            new FilterGenerator(function (actual) {
                actual.should.eql(expected);
                done();
            }, 'field1').haveRadius(10, 1, 2);
        });
    });

    describe('#beInList', function () {
        it('should accept an array and produce a terms filter', function (done) {
            var expected = { terms: { field1: [1, 2, 3]}};

            new FilterGenerator(function (actual) {
                actual.should.eql(expected);
                done();
            }, 'field1').beInList([1, 2, 3]);
        });

        it('should accept a non-array and produce a terms filter', function (done) {
            var expected = { terms: { field1: [1]}};

            new FilterGenerator(function (actual) {
                actual.should.eql(expected);
                done();
            }, 'field1').beInList(1);
        });
    });

    describe('#beInRange', function () {
        it('should produce a range within the given minimum and maximum inclusive integers', function (done) {
            var expected = { range: {field1: { gte: 1, lte: 10}}};
            new FilterGenerator(function (actual) {
                actual.should.eql(expected);
                done();
            }, 'field1').beInRange(1, 10);
        });

        it('should produce a range within the given minimum and maximum inclusive strings', function (done) {
            var expected = { range: {field1: { gte: 'A', lte: 'G'}}};
            new FilterGenerator(function (actual) {
                actual.should.eql(expected);
                done();
            }, 'field1').beInRange('A', 'G');
        });

        it('should produce only a greater than range filter when a maximum is not specified', function (done) {
            var expected = { range: {field1: { gte: 10 }}};
            new FilterGenerator(function (actual) {
                actual.should.eql(expected);
                done();
            }, 'field1').beInRange(10);
        });

        it('should produce only a less than range filter when a minimum is not specified', function (done) {
            var expected = { range: {field1: { lte: 10 }}};
            new FilterGenerator(function (actual) {
                actual.should.eql(expected);
                done();
            }, 'field1').beInRange(null, 10);
        });
    });

    describe('#beNull', function () {
        it('should produce a missing filter', function (done) {
            var expected = { missing: { field: 'field1'}};

            new FilterGenerator(function (actual) {
                actual.should.eql(expected);
                done();
            }, 'field1').beNull();

        });
    });
});