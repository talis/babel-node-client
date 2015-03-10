Node Client for Babel
==============

![Build status](https://travis-ci.org/talis/babel-node-client.svg?branch=master)

## Getting Started
Install the module:

```npm install node_client@git://github.com/talis/babel-node-client.git#0.1.0 --save```

Create a babel client as follows:

```javascript
var babel = require('babel_client');
var babelClient = babel.createClient({
    babel_host:"localhost",
    babel_port:3000,
    enable_debug: true
});
```

## Documentation

To use any of the Babel client functions, you must have a Persona token. Read the [Persona docs](http://docs.talispersona.apiary.io/), or try
out the [Persona node client](https://github.com/talis/persona-node-client). You might also want to look at the [Babel docs](http://docs.talisbabel.apiary.io/) too.

### Target Feeds
Get a feed based on a target
```javascript
var target = 'stay-on-target';
var token = req.personaClient.getToken(req);
babelClient.getTargetFeed(target, token, {}, function(error, results){
    // do stuff
});
```

If the token is invalid, the ```error``` object will have an http_code of 401.
If the feed cannot be found in babel, the ```error``` object will have an http_code of 404.

#### Options to use
* hydrate: Populate feed with data


### Annotations
Get a feed of annotations back
```javascript
var token = req.personaClient.getToken(req);
babelClient.getAnnotations(token, {}, function(error, results){
    // do stuff
});
```

If the token is invalid, the ```error``` object will have an http_code of 401.

Create an annotation
```javascript
var token = req.personaClient.getToken(req);
var data = {};
babelClient.createAnnotations(token, data, function(error, results){
    // do stuff
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

0.3.1 - Fixes
  * Now correctly validates hasTarget property when creating annotations. hasTarget can be a single object or an array of objects.
  * createAnnotations now takes an optional third parameter called 'options'. You can use this to set X-Ingest-Synchronously header. If you leave this out of the call, it assumes the third parameter is the callback.

0.3.0 - Added support for querying multiple feeds at once

0.2.0 - Added ability to create annotations

0.1.0 - Added the ability to request a target feed and annotations

## License
Copyright (c) 2015 Talis Education Limited.
