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



Co.prototype.tryCatch = function(func, receiver, arg) {
  try {
    return func.call(receiver, arg);
  } catch (err) {
    return err;
  }  
}


Co.prototype.next = function(value) {
  this.continue(
    this.tryCatch(this.gen.next, this.gen, value)
  );
}


Co.prototype.throw = function(err) {
  this.continue(
    this.tryCatch(this.gen.throw, this.gen, err)
  );
}



Co.prototype.continue = function(res) {
  var self = this;

  if (res instanceof Error) {
    return self.done(res);
  }

  if (res.done) {
    return self.done(null, res.value);
  } else {
    res.value._then(self.next, self.throw, void 0, self);
  }
}


module.exports = function(generatorFunction) {
  var co = new Co(generatorFunction);
  return function(done) {
    co.run(done);
  }
}

