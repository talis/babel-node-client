'use strict';

var request = require('request'),
    md5 = require('MD5'),
    querystring = require('querystring');

// log severities
var DEBUG = "debug";
var ERROR = "error";

/**
 * Create a babel client
 * Required config:
 *      - babel_host
 *      - babel_port
 *
 * @param {object} config
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
 * pass back the data as well.
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
            var jsonBody = JSON.parse(body);

            if(jsonBody.error){
                var babelError = new Error(jsonBody.error_description);
                babelError.http_code = response.statusCode || 404;
                callback(babelError);
            } else{
                callback(null, jsonBody);
            }
        }
    });
};

/**
 * Get annotations feed based off options passed in
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
            var jsonBody = JSON.parse(body);

            if(jsonBody.error){
                var babelError = new Error(jsonBody.error_description);
                babelError.http_code = response.statusCode || 404;
                callback(babelError);
            } else{
                callback(null, jsonBody);
            }
        }
    });

};


/**
 * Log wrapping functions
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