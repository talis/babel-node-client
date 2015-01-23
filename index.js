'use strict';

var request = require('request'),
    md5 = require('MD5'),
    querystring = require('querystring');

// log severities
var DEBUG = "debug";
var ERROR = "error";

var BabelClient = function (config) {
    this.config = config || {};
};

BabelClient.prototype.targetFeeds = function(target, token, options, callback){

    var requestOptions = {
        url: this.config.babel_host+':'+this.config.babel_port+'/feeds/targets/'+md5(target)+'/activity/annotations'+((options.hydrate && options.hydrate === true) ? '/hydrate' : ''),
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
                babelError.http_code = 404;
                callback(babelError);
            } else{
                callback(null, jsonBody);
            }
        }
    });
};

BabelClient.prototype.annotations = function(token, options, callback){

    var requestOptions = {
        url: this.config.babel_host+':'+this.config.babel_port+'/annotations?'+querystring.stringify(options),
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
                babelError.http_code = 404;
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
 */
BabelClient.prototype.log = function (severity, message) {
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
    this.log(DEBUG, message);
};
BabelClient.prototype.error = function (message) {
    this.log(ERROR, message);
};

/**
 * The only way to get an instance of the Babel Client is through this method
 * @param config
 * @returns {NodeClient}
 */
exports.createClient = function (config) {
    return new BabelClient(config);
};