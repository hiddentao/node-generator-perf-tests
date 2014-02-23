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

var bluebirdCoroutine = Promise.coroutine(gen);
var coCoroutine = co(gen);



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
.add('Bluebird-Promise.coroutine (prepared)', {
  defer: true,
  fn: function(deferred) {
    bluebirdCoroutine().then(function() {
      deferred.resolve();
    });
  }
})
.add('co (prepared)', {
  defer: true,
  fn: function(deferred) {
    coCoroutine(function() {
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