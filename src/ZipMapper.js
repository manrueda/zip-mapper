var fs    = require('fs');
var _path = require('path');
var unzip = require('unzip');
var temp  = require('temp');

module.exports = function ZipMapper(path, onMemory, cb){
  var that = this;
  //normalize the parameters
  if (onMemory instanceof Function){
    cb = onMemory;
    onMemory = false;
  }
  //resolve the relative parameters
  path = path !== undefined && path !== '' ? _path.resolve(path) : path;
  //validate the parameters
  var err = validateParameters(path, onMemory, cb);

  if (!err){
    if (onMemory){
      memoryOutput(path, cb);
    }else{
      //create a temp directory
      temp.mkdir(_path.basename(path), function(err, dirPath) {
        //unzip the file to that directory and map the zip
        that.tempDir = dirPath;
        tempOutput(path, dirPath, cb);
      });
    }
  }
};

module.exports.prototype.tempDir = '';
module.exports.prototype.cleanTemp = function(cb){
  var that = this;
  //Delete the temp folder if exist
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
  //unzip the file into a temporal folder
  var outStream = unzip.Extract({ path: tempDir });
  outStream.on('close', function(err){
    if (err){
      cb(err);
    }
    //map the temp folder and call the callback
    deepStat(tempDir, cb);
  });
  fs.createReadStream(zipPath).pipe(outStream);
}

function deepStat(dir, done) {
  var results = {};
  //read all the folder elements
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    //put the pending in the length of items
    var pending = list.length;
    //if there are no pending items, call the callback
    if (!pending) return done(undefined, results);
    list.forEach(function(_file) {
      //get the absolute path
      file = _path.resolve(dir, _file);
      fs.stat(file, function(err, stat) {
        //read the stat of the file
        if (stat && stat.isDirectory()) {
          //when the item is a directory, call to deepStat again
          deepStat(file, function(err, res) {
            //add the file to results and remove 1 from items
            results[_file] = res;
            if (!--pending) done(undefined, results);
          });
          //add the file to results and remove 1 from items
        } else {
          results[_file] = file;
          if (!--pending) done(undefined, results);
        }
      });
    });
  });
}

//get the sub-object based of an array of keys. If the obejct don't exist, create it.
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
  //load the zip elements in memory
  fs.createReadStream(zipPath)
  .pipe(unzip.Parse())
  .on('entry', function (entry) {
    //on each item in the zip. Files and DIrectories
    var fileName = entry.path;
    var type = entry.type; // 'Directory' or 'File'
    var size = entry.size;
    if (type === 'File'){
      count++;
      //create a new Buffer and load all the file data to that buffer.
      //when it ends put the Buffer in the response object and drain the memory
      var buf = new Buffer([]);
      entry.on('data', function(chunk){
        buf = Buffer.concat([buf, chunk]);
      });
      entry.on('end', function(){
        count--;
        setSubKey(response, entry.path.split('/'), buf);
        entry.autodrain();
        if (done && count === 0){
          //if ends and there is no more pending items, call the callback
          cb(undefined, response);
        }
      });
      entry.read();
      //entry.autodrain();
    }
  }).on('close', function(){
    //if ends and there is no more pending items, call the callback
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
