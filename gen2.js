/**
 * Custom co-routine
 */

module.exports = function(generatorFunction) {

  return function(done) {
    var gen = generatorFunction();
    var res;

    var _next = function(err, answer) {
      if (err) {
        try {
          res = gen.throw(err);
        } catch (genErr) {
          return done(err);
        }
      }

      try {
        res = gen.next(answer);
      } catch (genErr) {
        return done(genErr);
      }

      if (!res.done) {
        res.value
          .then(function(newAnswer) {
            _next(null, newAnswer);
          })
          .catch(_next);
      } else {
        return done(null, res.value);
      }
    };

    _next();
  }
  
}

