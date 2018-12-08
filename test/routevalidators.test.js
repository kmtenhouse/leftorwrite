var chai = require("chai");
var expect = chai.expect;

var db = require("../models");
var validators = require("../helpers/routevalidators");

describe("isvalidid", function(){
    it("should return false if id is not a string", function(){
        var id = {abc: "abc"};
        var result = validators.isvalidid(id);
        expect(result).to.equal(false);
    });

    it("should return false if id is not a number", function(){
        var id = "abc";
        var result = validators.isvalidid(id);
        expect(result).to.equal(false);
    });

    it("should return false if id is a negative number", function(){
        var id = -1;
        var result = validators.isvalidid(id);
        expect(result).to.equal(false);
    });

    it("should return false if id is equal to 0", function(){
        var id = 0;
        var result = validators.isvalidid(id);
        expect(result).to.equal(false);
    });

    it("should return true if id is a positive integer", function(){
        var id = 3;
        var result = validators.isvalidid(id);
        expect(result).to.equal(true);
    });
});