var test      = require('tape');
var ZipMapper = require('../src/ZipMapper.js');
var filePath  = 'test/simpleTest.zip';

test('should throws an error, the path is empty', function onTest(t) {
  t.plan(1);
  t.throws(function onThrows(){
    ZipMapper('');
  });
});

test('should generate an error callback, the path is incorrect', function onTest(t) {
  t.plan(3);
  ZipMapper('', function(err, map){
    t.notEqual(err, undefined, 'The first parameter must be an error');
    t.notEqual(err.message, undefined, 'The error must have a descriptive message');
    t.equal(map, undefined, 'The second parameter must not be an object');
  });
});

test('should export the files into a temp folder and return a object represent it', function onTest(t) {
  t.plan(6);
  var mapper = new ZipMapper(filePath, function(err, map){
    t.equal(err, undefined, 'The first parameter must be undefined');
    t.notEqual(map, undefined, 'The second parameter must be an object');
    t.true(map instanceof Object, 'The second parameter must be an object');
    t.true(map.folder1 instanceof Object, 'This property must be an object with the child files');
    t.equal(typeof map['file1.js'], 'string', 'This property must be a string with the path to the file');
    t.equal(typeof map.folder1['file1.js'], 'string', 'This property must be a string with the path to the file');

    mapper.cleanTemp();
  });
});

test('should export the files to memory and return a object represent it', function onTest(t) {
  t.plan(8);
  var mapper = new ZipMapper(filePath, true, function(err, map){
    t.equal(err, undefined, 'The first parameter must be undefined');
    t.notEqual(map, undefined, 'The second parameter must be an object');
    t.true(map instanceof Object, 'The second parameter must be an object');
    t.true(map.folder1 instanceof Object, 'This property must be an object with the child files');
    t.true(map['file1.js'] instanceof Buffer, 'This property must be a Buffer with the file content');
    t.equal(map['file1.js'].toString('UTF-8'), 'File1 Content\n', 'The file content must be \'File1 Content\n\'');
    t.true(map.folder1['file1.js'] instanceof Buffer, 'This property must be a Buffer with the file content');
    var auxMsg = 'The file content must be \'File1 in folder1 content\n\'';
    t.equal(map.folder1['file1.js'].toString('UTF-8'), 'File1 in folder1 content\n', auxMsg);
  });
});
