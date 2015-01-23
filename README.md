Node Client for Babel

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

### Target Feeds

### Annotations



## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

0.1.0 - added the ability to request a target feed and annotations

## License
Copyright (c) 2015 Talis Education Limited.