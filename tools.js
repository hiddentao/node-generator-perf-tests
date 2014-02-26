var program = require('commander');
program
  .option('-c, --concurrency <num>', 'Concurrency factor.')
  .parse(process.argv);

console.log('Concurrency factor: ' + program.concurrency);


/**
 * Run given asynchronous function X no. of times concurrently.
 * @param {Function} fn function to execute (takes single callback parameter)
 * @param {Function} cb callback once done
 */
exports.run = function(fn, cb) {
  var yetToReturn = numCallsToMake = program.concurrency;

  var fnCb = function() {
    if (0 === --yetToReturn) cb();
  };

  while (0 < numCallsToMake--) {
    fn(fnCb);
  }
};






