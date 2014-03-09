/**
 * Custom co-routine
 */



var Co = function(generatorFunction) {
  this.generatorFunction = generatorFunction;
}

Co.prototype.run = function(done) {
  this.gen = this.generatorFunction();
  this.done = done;
  this.next();
}

Co.prototype.next = function(err, answer) {
  var self = this;
  var res;

  if (err) {
    try {
      res = self.gen.throw(err);
    } catch (genErr) {
      return self.done(err);
    }
  }

  try {
    res = self.gen.next(answer);
  } catch (genErr) {
    return self.done(genErr);
  }

  if (!res.done) {
    res.value
      .then(function(newAnswer) {
        self.next(null, newAnswer);
      })
      .catch(self.next);
  } else {
    return self.done(null, res.value);
  }
}


module.exports = function(generatorFunction) {
  var co = new Co(generatorFunction);
  return function(done) {
    co.run(done);
  }
}

