var Benchmark = require('benchmark'),
  coOriginal = require('../node_modules/co'),
  coSpeedup = require('./co-classes'),
  tools = require('../tools');

var program = require('commander');
program
  .option('-c, --concurrency [num]', 'Concurrency factor [10000]', 10000)
  .option('-t, --test <name>', 'Test-case to run')
  .parse(process.argv);

console.log('Test: ' + program.test + ' (concurrency: ' + program.concurrency + ')');
console.log('---------------------------------------------');

var testFn = require('./test-cases/' + program.test + '.js');


var suite = new Benchmark.Suite;


// add tests
suite.add('co-original', {
  defer: true,
  fn: function(deferred) {
    return tools.run(function(cb) {
      coOriginal(testFn)(cb);
    }, function(err) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve();
      }
    }, program.concurrency);
  }
})
.add('co-classes', {
  defer: true,
  fn: function(deferred) {
    return tools.run(function(cb) {
      coSpeedup(testFn)(cb);
    }, function(err) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve();
      }
    }, program.concurrency);
  }
})
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').pluck('name'));
  console.log("\n");
})
.run({ 'async': true });
