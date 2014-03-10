var Benchmark = require('benchmark'),
  coOriginal = require('./co-original'),
  coSpeedup = require('./co-speedup');

var tools = require('../tools');


makePromise = function() {
  return new Promise(function(resolve, reject){
    setTimeout(resolve, 1);
  });
};

var yieldPromise = function*() {
  yield makePromise;
}


var suite = new Benchmark.Suite;


// add tests
suite.add('co-original', {
  defer: true,
  fn: function(deferred) {
    return tools.run(function(cb) {
      coOriginal(yieldPromise)(cb);
    }, function() {
      deferred.resolve();
    });
  }
})
.add('co-speedup', {
  defer: true,
  fn: function(deferred) {
    return tools.run(function(cb) {
      coSpeedup(yieldPromise)(cb);
    }, function() {
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

