/**
 * Run given asynchronous function X no. of times concurrently.
 * @param {Function} fn function to execute (takes single callback parameter)
 * @param {Function} cb callback once done
 * @param {Integer} concurrency Concurrent executions to perform.
 * @author 
 */
exports.run = function(fn, cb, concurrency) {
  var yetToReturn = numCallsToMake = concurrency;

  var fnCb = function() {
    if (0 === --yetToReturn) cb();
  };

  while (0 < numCallsToMake--) {
    fn(fnCb);
  }
};






