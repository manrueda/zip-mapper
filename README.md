# zip-mapper [![Build Status](https://travis-ci.org/ManRueda/zip-mapper.svg)](https://travis-ci.org/ManRueda/zip-mapper) [![Coverage Status](https://coveralls.io/repos/ManRueda/zip-mapper/badge.svg?branch=master&service=github)](https://coveralls.io/github/ManRueda/zip-mapper?branch=master)
Unzip a .zip file and map the structure in an object

## Usage
The ZipMapper mapper has 3 parameters, only 2 required.
ZipMapper(filePath, [onMemory], cb);
* filePath (string): Relative or absolute path to the zip file.
* onMemory (bool): Define of the files content will be loaded in memory or not.
* cb (Function): Callback, receive 2 parameters. First err object and second the mapped zip.

```javascript
var ZipMapper = require('zip-mapper');

var mapper = new ZipMapper(filePath, true, function(err, map){
  //(...)
});
```
