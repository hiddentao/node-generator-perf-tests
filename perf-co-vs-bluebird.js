var Benchmark = require('benchmark'),
  co = require('co'),
  Promise = require('bluebird');


// thunk
var setTimeoutPromise = function(ms) {
  return new Promise(function(resolve, reject){
    setTimeout(resolve, ms);
  });
};


var gen = function*() {
  yield setTimeoutPromise(1);
  yield setTimeoutPromise(1);
  yield setTimeoutPromise(1);
  yield setTimeoutPromise(1);
};




var suite = new Benchmark.Suite;

// add tests
suite.add('Bluebird-Promise.spawn', {
  defer: true,
  fn: function(deferred) {
    Promise.spawn(gen).then(function() {
      deferred.resolve();
    });
  }
})
.add('co', {
  defer: true,
  fn: function(deferred) {
    co(gen)(function() {
      deferred.resolve();
    });
  }
})
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').pluck('name'));
})
.run({ 'async': true });