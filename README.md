Node Client for Babel
==============

![Build status](https://travis-ci.org/talis/babel-node-client.svg?branch=master)

## Getting Started
Install the module by adding the following line to `packages.json`:

```
"babel_client": "git://github.com/talis/babel-node-client.git#0.1.0"
```

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
out the [Persona node client](https://github.com/talis/persona-node-client).

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

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

0.1.0 - added the ability to request a target feed and annotations

## License
Copyright (c) 2015 Talis Education Limited.