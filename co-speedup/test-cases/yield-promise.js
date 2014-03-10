var Promise = require('bluebird');


makePromise = function() {
  return new Promise(function(resolve, reject){
    setTimeout(resolve, 1);
  });
};


module.exports = function*() {
  yield makePromise();
  yield makePromise();
};


