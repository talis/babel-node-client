'use strict';

var _ = require('lodash'),
    request = require('request'),
    md5 = require('MD5'),
    querystring = require('querystring');

// log severities
var DEBUG = "debug";
var ERROR = "error";

/**
 * Create a babel client
 *
 * @param {object} config Babel Client config
 * @param {string} config.babel_host Babel host (must start with http or https)
 * @param {string} config.babel_port Babel port
 * @constructor
 */
var BabelClient = function (config) {

    this.config = config || {};

    var requiredParams = ['babel_host', 'babel_port'];

    for(var i in requiredParams){
        if (this.config[requiredParams[i]] === undefined) {
            throw new Error("Missing Babel config: "+requiredParams[i]);
        }
    }

    if(!this.config.babel_host.match('^http')){
        throw new Error('Invalid Babel config: babel_host');
    }
};

/**
 * Get a feed based off a target identifier. Return either a list of feed identifiers, or hydrate it and
 * pass back the data as well
 *
 * @param {string} target Feed target identifier
 * @param {string} token Persona token
 * @param {boolean} hydrate Gets a fully hydrated feed, i.e. actually contains the posts
 * @callback callback
 */
BabelClient.prototype.getTargetFeed = function(target, token, hydrate, callback){

    if(!target){
        throw new Error('Missing target');
    }
    if(!token){
        throw new Error('Missing Persona token');
    }

    var self = this;

    hydrate = hydrate || false;

    var requestOptions = {
        url: this.config.babel_host+':'+this.config.babel_port+'/feeds/targets/'+md5(target)+'/activity/annotations'+((hydrate === true) ? '/hydrate' : ''),
        headers: {
            'Accept': 'application/json',
            'Authorization':'Bearer '+token
        }
    };

    this.debug(JSON.stringify(requestOptions));

    request(requestOptions, function(err, response, body){
        if(err){
            callback(err);
        } else{
            self._parseJSON(response, body, callback);
        }
    });
};

/***
 * Queries multiple feeds.
 * Given an array of feed ids it will return a merged hydrated feed.
 * @param {array} feeds an array of Feed Identifiers
 * @param {string} token Persona token
 * @param callback
 */
BabelClient.prototype.getFeeds = function (feeds, token, callback) {
    if (!feeds) {
        throw new Error('Missing feeds');
    }
    if (!_.isArray(feeds) || _.isEmpty(feeds)) {
        throw new Error("Feeds should be an array and must not be empty");
    }
    if (!token) {
        throw new Error('Missing Persona token');
    }

    var self = this;

    feeds = feeds.join(",");

    var requestOptions = {
        url: this.config.babel_host + ':' + this.config.babel_port + '/feeds/annotations/hydrate?feed_ids=' + encodeURIComponent(feeds),
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    };

    this.debug(JSON.stringify(requestOptions));

    request(requestOptions, function (err, response, body) {
        if (err) {
            callback(err);
        } else {
            self._parseJSON(response, body, callback);
        }
    });
};

/**
 * Get annotations feed based off options passed in
 *
 * @param {string} token Persona token
 * @param {object} querystringMap Options that can be used to query an annotations feed
 * @param {string} querystringMap.hasTarget.uri Restrict to a specific target
 * @param {string} querystringMap.annotatedBy Restrict to annotations made by a specific user
 * @param {string} querystringMap.hasBody.uri Restrict to a specific body uri
 * @param {string} querystringMap.hasBody.type Restrict to annotations by the type of the body
 * @param {string} querystringMap.q Perform a text search on hasBody.char field. If used, annotatedBy and hasTarget will be ignored
 * @param {string} querystringMap.limit Limit returned results
 * @param {string} querystringMap.offset Offset start of results
 * @callback callback
 */
BabelClient.prototype.getAnnotations = function(token, querystringMap, callback){

    if(!token){
        throw new Error('Missing Persona token');
    }

    var self = this;

    querystringMap = querystringMap || {};

    var requestOptions = {
        url: this.config.babel_host+':'+this.config.babel_port+'/annotations?'+querystring.stringify(querystringMap),
        headers: {
            'Accept': 'application/json',
            'Authorization':'Bearer '+token
        }
    };

    this.debug(JSON.stringify(requestOptions));

    request(requestOptions, function(err, response, body){
        if(err){
            callback(err);
        } else{
            self._parseJSON(response, body, callback);
        }
    });

};

/**
 * Create an annotation
 *
 * @param {string} token Persona token
 * @param {object} data Data that can be passed into an annotation
 * @param {object} data.hasbody
 * @param {string} data.hasBody.format
 * @param {string} data.hasBody.type
 * @param {string} data.hasBody.chars
 * @param {object} data.hasBody.details
 * @param {string} data.hasBody.uri
 * @param {string} data.hasBody.asReferencedBy
 * @param {object} data.hasTarget
 * @param {string} data.hasTarget.uri
 * @param {string} data.hasTarget.fragment
 * @param {string} data.hasTarget.asReferencedBy
 * @param {string} data.annotatedBy
 * @param {string} data.motiviatedBy
 * @param {string} data.annotatedAt
 * @param {object} options that control the request being made to babel.
 * @param {boolean} options.headers['X-Ingest-Synchronously']
 * @param callback
 */
BabelClient.prototype.createAnnotation = function(token, data, options, callback){

    if(_.isUndefined(callback) && _.isFunction(options)){
        callback = options;
        options = null;
    }

    if(!token){
        throw new Error('Missing Persona token');
    }
    if(!data.hasBody){
        throw new Error('Missing data: hasBody');
    }
    if(!data.hasBody.format){
        throw new Error('Missing data: hasBody.format');
    }
    if(!data.hasBody.type){
        throw new Error('Missing data: hasBody.type');
    }
    if(!data.annotatedBy){
        throw new Error('Missing data: annotatedBy');
    }
    if(!data.hasTarget){
        throw new Error('Missing data: hasTarget');
    }

    // validate the hasTarget property
    var targets = [];
    if (_.isArray(data.hasTarget)) {
        targets = data.hasTarget;
        if (targets.length===0) {
            throw new Error("Missing data: hasTarget cannot be empty array");
        }
    } else {
        targets.push(data.hasTarget);
    }
    _.map(targets,function(target) {
        if (!_.has(target,"uri")) {
            throw new Error("Missing data: hasTarget.uri is required");
        }
        for (var prop in target) {
            if (!(prop==="uri" || prop==="fragment" || prop==="asReferencedBy" )) {
                throw new Error("Invalid data: hasTarget has unrecognised property '"+prop+"'");
            }
        }
    });

    var requestOptions = {
        method:'POST',
        body:data,
        json:true,
        url: this.config.babel_host+':'+this.config.babel_port+'/annotations',
        headers: {
            'Accept': 'application/json',
            'Authorization':'Bearer '+token
        }
    };

    // if options.xIngestSynchronously set to true, then and only then add the header
    // otherwise leave it out which defaults to false
    if( options && _.has(options, 'headers') && _.has(options.headers,'X-Ingest-Synchronously') && options.headers['X-Ingest-Synchronously'] === true ) {
        requestOptions.headers['X-Ingest-Synchronously'] = 'true';
    }

    this.debug(JSON.stringify(requestOptions));

    request.post(requestOptions, function(err, response, body){
        if(err){
            callback(err);
        } else{

            if(body.message && body.errors){
                var babelError = new Error(body.message);
                babelError.http_code = response.statusCode || 404;
                callback(babelError);
            } else{
                callback(null, body);
            }
        }
    });
};

/**
 * Parse JSON safely
 * @param {object} response
 * @param {object} body
 * @callback callback
 * @private
 */
BabelClient.prototype._parseJSON = function(response, body, callback){
    try{
        var jsonBody = JSON.parse(body);

        if(jsonBody.error){
            var babelError = new Error(jsonBody.error_description);
            babelError.http_code = response.statusCode || 404;
            callback(babelError);
        } else{
            callback(null, jsonBody);
        }
    } catch(e){
        var babelError = new Error("Error parsing JSON: "+body);
        callback(babelError);
    }
};

/**
 * Log wrapping functions
 *
 * @param severity ( debug or error )
 * @param message
 * @returns {boolean}
 * @private
 */
BabelClient.prototype._log = function (severity, message) {
    if (!this.config.enable_debug) {
        return true;
    }

    if (this.config.logger) {
        if (severity === DEBUG) {
            this.config.logger.debug("[babel_node_client] " + message);
        } else if (severity === ERROR) {
            this.config.logger.error("[babel_node_client] " + message);
        } else {
            console.log(severity + ": [babel_node_client] " + message);
        }
    } else {
        console.log(severity + ": [babel_node_client] " + message);
    }
};

BabelClient.prototype.debug = function (message) {
    this._log(DEBUG, message);
};
BabelClient.prototype.error = function (message) {
    this._log(ERROR, message);
};

/**
 * The only way to get an instance of the Babel Client is through this method
 * @param config
 * @returns {NodeClient}
 */
exports.createClient = function (config) {
    return new BabelClient(config);
};