'use strict';

var should = require('should'),
    assert = require('assert'),
    babel = require('../../index.js'),
    rewire = require("rewire");

describe("Babel Node Client Test Suite", function(){
    describe("- Constructor tests", function(){

        it("should throw error if config.babel_host is not supplied", function(done){
            var babelClient = function(){
                return babel.createClient({});
            };
            babelClient.should.throw("Missing Babel config: babel_host");
            done();
        });

        it("should throw error if config.babel_port is not supplied", function(done){
            var babelClient = function(){
                return babel.createClient({babel_host:'babel'});
            };
            babelClient.should.throw("Missing Babel config: babel_port");
            done();
        });

        it("should throw error if config.babel_host doesn't start with http/https", function(done){
            var babelClient = function(){
                return babel.createClient({
                    babel_host:'babel',
                    babel_port:3000});
            };
            babelClient.should.throw("Invalid Babel config: babel_host");
            done();
        });

        it("should NOT throw any error if all config params are defined", function(done){
            var babelClient = function(){
                return babel.createClient({
                    babel_host:"http://babel",
                    babel_port:3000
                });
            };
            babelClient.should.not.throw();
            done();
        });
    });

    describe("- Get Target Feed tests", function(){

        it("should throw error if no target supplied", function(done){
            var babelClient = babel.createClient({
                    babel_host:"http://babel",
                    babel_port:3000
                });

            var getTargetFeed = function(){
                return babelClient.getTargetFeed(null, null, null, function(err, result){});
            };

            getTargetFeed.should.throw("Missing target");
            done();
        });
        it("should throw error if no persona token supplied", function(done){
            var babelClient = babel.createClient({
                babel_host:"http://babel",
                babel_port:3000
            });

            var getTargetFeed = function(){
                return babelClient.getTargetFeed('TARGET', null, null, function(err, result){});
            };

            getTargetFeed.should.throw("Missing Persona token");
            done();
        });
        it("should not cause an error if no options passed in", function(done){
            var babel = rewire("../../index.js");

            var babelClient = babel.createClient({
                babel_host:"http://babel",
                babel_port:3000
            });

            var requestStub = function(options, callback){
                callback(null, {}, JSON.stringify({}));
            };

            babel.__set__("request", requestStub);

            babelClient.getTargetFeed('TARGET', 'secret', null, function(err){
                (err === null).should.be.true;
            });

            done();
        });

        it("get target feed should return an error if call to request returns an error", function(done){
            var babel = rewire("../../index.js");

            var babelClient = babel.createClient({
                babel_host:"http://babel",
                babel_port:3000
            });
            var requestStub = function(options, callback){
                callback(new Error('Error communicating with Babel'));
            };

            babel.__set__("request", requestStub);

            babelClient.getTargetFeed('TARGET', 'secret', {}, function(err, result){

                (err === null).should.be.false;
                err.message.should.equal('Error communicating with Babel');
                (typeof result).should.equal('undefined');
            });
            done();
        });

        it("get target feed should return an error (401) if persona token is invalid", function(done){
            var babel = rewire("../../index.js");

            var babelClient = babel.createClient({
                babel_host:"http://babel",
                babel_port:3000
            });
            var requestStub = function(options, callback){
                callback(null, {statusCode:401}, JSON.stringify({error:"invalid_token", error_description:"The token is invalid or has expired"}));
            };

            babel.__set__("request", requestStub);

            babelClient.getTargetFeed('TARGET', 'secret', {}, function(err, result){

                (err === null).should.be.false;
                err.http_code.should.equal(401);
                err.message.should.equal('The token is invalid or has expired');
                (typeof result).should.equal('undefined');
            });
            done();
        });

        it("get target feed should return an error (404) if babel returns no feed", function(done){
            var babel = rewire("../../index.js");

            var babelClient = babel.createClient({
                babel_host:"http://babel",
                babel_port:3000
            });
            var requestStub = function(options, callback){
                callback(null, {}, JSON.stringify({"error":"feed_not_found", "error_description":"Feed not found"}));
            };

            babel.__set__("request", requestStub);

            babelClient.getTargetFeed('TARGET', 'secret', {}, function(err, result){

                (err === null).should.be.false;
                err.http_code.should.equal(404);
                err.message.should.equal('Feed not found');
                (typeof result).should.equal('undefined');
            });
            done();
        });
        it("get target feed should return results if no error from babel and feed is found", function(done){
            var babel = rewire("../../index.js");

            var babelClient = babel.createClient({
                babel_host:"http://babel",
                babel_port:3000
            });

            var requestStub = function(options, callback){
                callback(null, {}, JSON.stringify({
                    "count":2,
                    "limit":25,
                    "offset":0,
                    "annotations":[{
                        "annotatedBy":"rg",
                        "_id":"54c107db52be6b4d90000001",
                        "__v":0,
                        "annotatedAt":"2015-01-22T14:23:23.013Z",
                        "motivatedBy":"commenting",
                        "hasTarget":{},
                        "hasBody":{}
                    },{
                        "annotatedBy":"rg",
                        "_id":"54c10857ae44b3f492000001",
                        "__v":0,
                        "annotatedAt":"2015-01-22T14:25:27.294Z",
                        "motivatedBy":"commenting",
                        "hasTarget":{},
                        "hasBody":{}
                    }]
                }));
            };

            babel.__set__("request", requestStub);

            babelClient.getTargetFeed('TARGET', 'secret', {}, function(err, result){

                (err === null).should.be.true;
                result.count.should.equal(2);
                result.limit.should.equal(25);
                result.annotations.should.have.lengthOf(2);
            });
            done();
        });
    });

    describe("- Get Annotations Feed tests", function(){
        it("should throw error if no persona token supplied", function(done){
            var babelClient = babel.createClient({
                babel_host:"http://babel",
                babel_port:3000
            });

            var getAnnotations = function(){
                return babelClient.getAnnotations(null, null, function(err, result){});
            };

            getAnnotations.should.throw("Missing Persona token");
            done();
        });
        it("should not cause an error if no options passed in", function(done){
            var babelClient = babel.createClient({
                babel_host:"http://babel",
                babel_port:3000
            });

            var getAnnotations = function(){
                return babelClient.getAnnotations('secret', null, function(err, result){});
            };

            getAnnotations.should.not.throw();
            done();
        });

        it("get target feed should return an error (401) if persona token is invalid", function(done){
            var babel = rewire("../../index.js");

            var babelClient = babel.createClient({
                babel_host:"http://babel",
                babel_port:3000
            });
            var requestStub = function(options, callback){
                callback(null, {statusCode:401}, JSON.stringify({error:"invalid_token", error_description:"The token is invalid or has expired"}));
            };

            babel.__set__("request", requestStub);

            babelClient.getAnnotations('secret', {}, function(err, result){

                (err === null).should.be.false;
                err.http_code.should.equal(401);
                err.message.should.equal('The token is invalid or has expired');
                (typeof result).should.equal('undefined');
            });
            done();
        });

        it("annotations feed should return an error if call to request returns an error", function(done){
            var babel = rewire("../../index.js");

            var babelClient = babel.createClient({
                babel_host:"http://babel",
                babel_port:3000
            });
            var requestStub = function(options, callback){
                callback(new Error('Error communicating with Babel'));
            };

            babel.__set__("request", requestStub);

            babelClient.getAnnotations('secret', {}, function(err, result){

                (err === null).should.be.false;
                err.message.should.equal('Error communicating with Babel');
                (typeof result).should.equal('undefined');
            });
            done();
        });

        it("annotations feed should return results if no error from babel", function(done){
            var babel = rewire("../../index.js");

            var babelClient = babel.createClient({
                babel_host:"http://babel",
                babel_port:3000
            });

            var requestMock = function(options, callback){
                callback(null, {}, JSON.stringify({
                    "count":2,
                    "limit":25,
                    "offset":0,
                    "annotations":[{
                        "annotatedBy":"rg",
                        "_id":"54c107db52be6b4d90000001",
                        "__v":0,
                        "annotatedAt":"2015-01-22T14:23:23.013Z",
                        "motivatedBy":"commenting",
                        "hasTarget":{},
                        "hasBody":{}
                    },{
                        "annotatedBy":"rg",
                        "_id":"54c10857ae44b3f492000001",
                        "__v":0,
                        "annotatedAt":"2015-01-22T14:25:27.294Z",
                        "motivatedBy":"commenting",
                        "hasTarget":{},
                        "hasBody":{}
                    }]
                }));
            };

            babel.__set__("request", requestMock);

            babelClient.getAnnotations('secret', {}, function(err, result){

                (err === null).should.be.true;
                result.count.should.equal(2);
                result.limit.should.equal(25);
                result.annotations.should.have.lengthOf(2);
            });
            done();
        });
    });

    describe("- Test creation of an annotation", function(){
        it("should throw error if no persona token supplied", function(done){
            var babelClient = babel.createClient({
                babel_host:"http://babel",
                babel_port:3000
            });

            var createAnnotation = function(){
                return babelClient.createAnnotation(null, null, function(err, result){});
            };

            createAnnotation.should.throw("Missing Persona token");
            done();
        });
        it("- create annotation should return an error if no hasBody supplied", function(done){
            var babelClient = babel.createClient({
                babel_host:"http://babel",
                babel_port:3000
            });

            var createAnnotation = function(){
                return babelClient.createAnnotation('token', {}, function(err, result){});
            };

            createAnnotation.should.throw("Missing data: hasBody");
            done();
        });
        it("- create annotation should return an error if no hasBody.format supplied", function(done){
            var babelClient = babel.createClient({
                babel_host:"http://babel",
                babel_port:3000
            });

            var createAnnotation = function(){
                return babelClient.createAnnotation('token', {hasBody:{}}, function(err, result){});
            };

            createAnnotation.should.throw("Missing data: hasBody.format");
            done();
        });

        it("- create annotation should return an error if no hasBody.type supplied", function(done){
            var babelClient = babel.createClient({
                babel_host:"http://babel",
                babel_port:3000
            });

            var createAnnotation = function(){
                return babelClient.createAnnotation('token', {hasBody:{format:'text/plain'}}, function(err, result){});
            };

            createAnnotation.should.throw("Missing data: hasBody.type");
            done();
        });
        it("- create annotation should return an error if no annotatedBy supplied", function(done){
            var babelClient = babel.createClient({
                babel_host:"http://babel",
                babel_port:3000
            });

            var createAnnotation = function(){
                return babelClient.createAnnotation('token', {hasBody:{format:'text/plain', 'type':'Text'}}, function(err, result){});
            };

            createAnnotation.should.throw("Missing data: annotatedBy");
            done();
        });
        it("- create annotation should return an error if hasTarget not supplied", function(done){
            var babelClient = babel.createClient({
                babel_host:"http://babel",
                babel_port:3000
            });

            var createAnnotation = function(){
                return babelClient.createAnnotation('token', {hasBody:{format:'text/plain', 'type':'Text'}, annotatedBy:'Gordon Freeman'}, function(err, result){});
            };

            createAnnotation.should.throw("Missing data: hasTarget");
            done();
        });
        it("- create annotation should return an error if hasTarget.uri not supplied", function(done){
            var babelClient = babel.createClient({
                babel_host:"http://babel",
                babel_port:3000
            });

            var createAnnotation = function(){
                return babelClient.createAnnotation('token', {hasBody:{format:'text/plain', 'type':'Text'}, hasTarget:{}, annotatedBy:'Gordon Freeman'}, function(err, result){});
            };

            createAnnotation.should.throw("Missing data: hasTarget.uri");
            done();
        });
        it("- create annotation should return an error (401) if persona token is invalid", function(done){
            var babel = rewire("../../index.js");

            var babelClient = babel.createClient({
                babel_host:"http://babel",
                babel_port:3000
            });
            var requestStub = {
                post:function(options, callback){
                    var error = new Error('The token is invalid or has expired');
                    error.http_code = 401;
                    callback(error);
                }
            };

            babel.__set__("request", requestStub);

            babelClient.createAnnotation('secret', {hasBody:{format:'text/plain', type:'Text'}, hasTarget:{uri:'http://example.com'}, annotatedBy:'Gordon Freeman'}, function(err, result){

                (err === null).should.be.false;
                err.http_code.should.equal(401);
                err.message.should.equal('The token is invalid or has expired');
                (typeof result).should.equal('undefined');
            });
            done();
        });

        it("- create annotation should return an error if call to request returns an error", function(done){
            var babel = rewire("../../index.js");

            var babelClient = babel.createClient({
                babel_host:"http://babel",
                babel_port:3000
            });
            var requestStub = {
                post:function(options, callback){
                    var error = new Error('Error communicating with Babel');
                    callback(error);
                }
            };

            babel.__set__("request", requestStub);

            babelClient.createAnnotation('secret', {hasBody:{format:'text/plain', type:'Text'}, hasTarget:{uri:'http://example.com'}, annotatedBy:'Gordon Freeman'}, function(err, result){

                (err === null).should.be.false;
                err.message.should.equal('Error communicating with Babel');
                (typeof result).should.equal('undefined');
            });
            done();
        });

        it("- create annotation should return no errors if everything is successful", function(done){

            var babel = rewire("../../index.js");

            var babelClient = babel.createClient({
                babel_host:"http://babel",
                babel_port:3000
            });

            var requestMock = {};
            requestMock.post = function(options, callback){
                callback(null, {}, {
                    __v: 0,
                    annotatedBy: 'Gordon Freeman',
                    _id: '12345678901234567890',
                    annotatedAt: '2015-02-03T10:28:37.725Z',
                    motivatedBy: 'The Combine',
                    hasTarget: {
                        uri: 'http://example.com/uri'
                    },
                    hasBody:{
                        format: 'text/plain',
                        type: 'Text',
                        uri: 'http://example.com/another/uri',
                        chars: "Eeeee it's dark! Where's that elevator? Eeeee!",
                        details:{
                            who: 'Gordon Freeman',
                            text: "Why don't we have a robot or something to push this sample into the core? This looks sort of dangerous."
                        }
                    }
                });
            };

            babel.__set__("request", requestMock);

            babelClient.createAnnotation('secret', {hasBody:{format:'text/plain', type:'Text'}, hasTarget:{uri:'http://example.com'}, annotatedBy:'Gordon Freeman'}, function(err, result){

                (err === null).should.be.true;

                result.annotatedBy.should.equal('Gordon Freeman');
                result.hasTarget.uri.should.equal('http://example.com/uri');
                result.hasBody.uri.should.equal('http://example.com/another/uri');
                done();
            });
        });
    });
});