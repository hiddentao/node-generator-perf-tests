
/**
 * toString() reference.
 */

var toString = Object.prototype.toString;

/**
 * slice() reference.
 */

var slice = Array.prototype.slice;




var bind = function(func, receiver) {
  return function() {
    func.apply(receiver, arguments);
  }
};




/**
 * Check if `obj` is a generator function.
 *
 * @param {Function} obj
 * @return {Boolean}
 * @api private
 */

function isGeneratorFunction(obj) {
  return 'GeneratorFunction' == obj.constructor.name;
}


/**
 * Throw `err` in a new stack.
 *
 * This is used when co() is invoked
 * without supplying a callback, which
 * should only be for demonstrational
 * purposes.
 *
 * @param {Error} err
 * @api private
 */

function error(err) {
  if (!err) return;
  setImmediate(function(){
    throw err;
  });
}




var Coroutine = function(generator) {
  this.gen = generator;
  this.nextB = bind(this.next, this);
  this.throwB = bind(this.throw, this);
}

Coroutine.prototype.run = function(ctx, done, errorCb) {
  this.ctx = ctx;
  this.done = done;
  this.errorCb = errorCb;
  this.next();
}



Coroutine.prototype.success = function(result) {
  if (!this.errorCb) {
    this.done(null, result);
  } else {
    this.done(result);
  }
}



Coroutine.prototype.error = function(err) {
  if (!this.errorCb) {
    this.done(err);
  } else {
    this.errorCb(err);
  }
}



Coroutine.prototype.tryCatch = function(func, receiver, arg) {
  try {
    return func.call(receiver, arg);
  } catch (err) {
    return err;
  }  
}


Coroutine.prototype.next = function(value) {
  // multiple values as result?
  if (1 < arguments.length) {
    value = slice.call(arguments, 1);
  }

  this.continue(
    this.tryCatch(this.gen.next, this.gen, value)
  );
}




Coroutine.prototype.throw = function(err) {
  this.continue(
    this.tryCatch(this.gen.throw, this.gen, err)
  );
}



Coroutine.prototype.executePromise = function(promise) {
  promise.then(this.nextB, this.throwB);
}


Coroutine.prototype.executeGenerator = function(generator) {
  new Coroutine(generator).run(this.ctx, this.nextB, this.throwB);
}


Coroutine.prototype.executeGeneratorFunction = function(generatorFunction) {
  new Coroutine(generatorFunction.call(this.ctx)).run(this.ctx, this.nextB, this.throwB);
}


Coroutine.prototype.executeThunk = function(thunk) {
  var self = this;

  thunk.call(this.ctx, function(err) {
    if (err) {
      self.throw(err);
    } else {
      self.next.apply(self, slice.call(arguments, 1));
    }    
  });
}

Coroutine.prototype.executeObject = function(obj) {
  var self = this;

  var keys = Object.keys(obj);
  var pending = keys.length;
  var results = new obj.constructor();
  var finished;

  if (!pending) {
    setImmediate(function(){
      self.next(results);
    });
    return;
  }




    for (var i = 0; i < keys.length; i++) {
      run(obj[keys[i]], keys[i]);
    }

    function run(fn, key) {
      if (finished) return;
      try {
        fn = toThunk(fn, ctx);

        if ('function' != typeof fn) {
          results[key] = fn;
          return --pending || done(null, results);
        }

        fn.call(ctx, function(err, res){
          if (finished) return;

          if (err) {
            finished = true;
            return done(err);
          }

          results[key] = res;
          --pending || done(null, results);
        });
      } catch (err) {
        finished = true;
        done(err);
      }
    }

}

Coroutine.prototype.execute = function(value) {
  var self = this;

  try {

    if (value) {
      // promise
      if ('function' === typeof value.then) {
        this.executePromise(value);
        return;
      } 
      // generator
      else if ('function' === typeof value.next && 'function' == typeof value.throw) {
        this.executeGenerator(value);
        return;
      }
      // is a function
      else if ('function' === typeof value) {
        // generator function
        if (isGeneratorFunction(value)) {
          this.executeGeneratorFunction(value);
          return;
        } 
        // assume it's a thunk
        else {
          this.executeThunk(value);
          return;
        }
      } 
    }

    this.error(new Error('yield a function, promise, generator, array, or object'));      

  } catch (err) {
    setImmediate(function(){
      self.throw(err);
    });    
  }
}



Coroutine.prototype.continue = function(res) {
  var self = this;

  if (res instanceof Error) {
    self.error(res);
    return;
  }

  if (res.done) {
    self.success(res.value);
  } else {
    self.execute(res.value);
  }
}




/**
 * Wrap the given generator `fn` and
 * return a thunk.
 *
 * @param {Function} fn
 * @return {Function}
 * @api public
 */

function co(fn) {
  var isGenFun = isGeneratorFunction(fn);

  return function (done) {
    var ctx = this;

    // in toThunk() below we invoke co()
    // with a generator, so optimize for
    // this case
    var gen = fn;

    // we only need to parse the arguments
    // if gen is a generator function.
    if (isGenFun) {
      if (1 < arguments.length) {
        var args = slice.call(arguments), len = args.length;
        var hasCallback = len && 'function' == typeof args[len - 1];
        done = hasCallback ? args.pop() : null;
        gen = fn.apply(ctx, args);
      } else {
        gen = fn.apply(ctx);
      }
    }

    new Coroutine(gen).run(ctx, done || error);
  }
}




module.exports = co;

