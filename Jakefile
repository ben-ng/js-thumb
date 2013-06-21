var utils = require('utilities')
  , path = require('path')
  , envoy = require('envoy')
  , watchr = require('watchr')
  , fs = require('fs')
  , DEMO_DIR = 'demosite'
  , DEMO_PATH = path.join(__dirname, DEMO_DIR)
  , DEMO_INDEX = path.join(__dirname, DEMO_DIR, 'index.html');

task('cleandemo', function () {
  utils.file.rmRf(DEMO_DIR);
});

desc('Builds the demo site');
task('demo', ['cleandemo'], function () {
  console.log("Rebuilding Demo Site");
  
  //Copy over demo files
  utils.file.cpR('test', DEMO_PATH, {silent:false});
  
  //Replace references to "../lib" with "lib"
  fs.writeFileSync(DEMO_INDEX, fs.readFileSync(DEMO_INDEX).toString().replace(/\.\.\/lib/,'lib'));
  
  //Copy over lib
  utils.file.cpR('lib', path.join(DEMO_PATH,'lib'), {silent:false});
});

desc('Watches for changes and rebuilds the demo site');
task('watch', ['demo'], {async: true}, function () {
  var rebuildTimeout
    , opts = {
        filter: function (filePath) {
          var test = filePath.indexOf(DEMO_PATH) < 0;
          
          console.log((test ? "   ": "NO ") + filePath);
          
          return test;
        }
      };
  
  watchr.watch({
    interval: 500
  , duplicateDelay: false
  , paths: [
      'docs'
    , 'lib'
    , 'node_modules'
    , 'test'
    ]
  , listener: function() {
      clearTimeout(rebuildTimeout);
      
      rebuildTimeout = setTimeout(function () {
        jake.Task['demo'].reenable();
        jake.Task['demo'].invoke();
      }, 500);
    }
  });
});