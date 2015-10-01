var fs    = require('fs');
var _path = require('path');
var unzip = require('unzip');
var temp  = require('temp');

module.exports = function ZipMapper(path, onMemory, cb){
  var that = this;
  if (onMemory instanceof Function){
    cb = onMemory;
    onMemory = false;
  }
  path = path !== undefined && path !== '' ? _path.resolve(path) : path;
  var err = validateParameters(path, onMemory, cb);

  if (!err){
    if (onMemory){
      memoryOutput(path, cb);
    }else{
      temp.mkdir(_path.basename(path), function(err, dirPath) {
        that.tempDir = dirPath;
        tempOutput(path, dirPath, cb);
      });
    }
  }
};

module.exports.prototype.tempDir = '';
module.exports.prototype.cleanTemp = function(cb){
  var that = this;
  if (that.tempDir !== ''){
    fs.unlink(that.tempDir, function(){
      that.tempDir = '';
      if (cb){
        cb
      }
    });
  }
};

function tempOutput(zipPath, tempDir, cb) {
  var outStream = unzip.Extract({ path: tempDir });
  outStream.on('close', function(err){
    if (err){
      cb(err);
    }
    deepStat(tempDir, cb);
  });
  fs.createReadStream(zipPath).pipe(outStream);
}

function deepStat(dir, done) {
  var results = {};
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(undefined, results);
    list.forEach(function(_file) {
      file = _path.resolve(dir, _file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          deepStat(file, function(err, res) {
            results[_file] = res;
            if (!--pending) done(undefined, results);
          });
        } else {
          results[_file] = file;
          if (!--pending) done(undefined, results);
        }
      });
    });
  });
}

function setSubKey(obj, arr, value) {
  arr.forEach(function(part, index){
    if (part in obj) {
      obj = obj[part];
    } else {
      obj[part] = (index == arr.length - 1) ? value : {};
      obj = obj[part];
    }
  });
}

function memoryOutput(zipPath, cb) {
  var response = {};
  var count = 0;
  var done = false;
  fs.createReadStream(zipPath)
  .pipe(unzip.Parse())
  .on('entry', function (entry) {
    var fileName = entry.path;
    var type = entry.type; // 'Directory' or 'File'
    var size = entry.size;
    if (type === 'File'){
      count++;
      var buf = new Buffer([]);
      entry.on('data', function(chunk){
        buf = Buffer.concat([buf, chunk]);
      });
      entry.on('end', function(){
        count--;
        setSubKey(response, entry.path.split('/'), buf);
        entry.autodrain();
        if (done && count === 0){
          cb(undefined, response);
        }
      });
      entry.read();
      //entry.autodrain();
    }
  }).on('close', function(){
    done = true;
    if (count === 0){
      cb(undefined, response);
    }
  });
}

function validateParameters(path, onMemory, cb){
  var err;
  if (path === undefined || path == ''){
    err = new Error('The zip file is empty.');
  }else{
    var stat = fs.statSync(path);
    if (stat === null){
      err = new Error('The aip file path is invalid.');
    }
  }
  if (err){
    if (cb){
      cb(err)
    }else{
      throw err;
    }
  }
  return err;
}
