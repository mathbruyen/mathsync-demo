(function () {
  'use strict';

  var koa = require('koa');
  var serve = require('koa-static');
  var route = require('koa-route');
  var when = require('when');

  function makeServer(statics, log) {
    var app = koa();

    if (log !== false) {
      app.use(function* (next) {
        var start = new Date();
        yield next;
        var ms = new Date() - start;
        console.log('%s %s - %s', this.method, this.url, ms);
      });
    }

    app.use(serve(statics));

    function get(path, handler) {
      app.use(route.get(path, handler));
      if (log !== false) {
        console.log('Listening to GET ' + path);
      }
    }

    function post(path, handler) {
      app.use(route.post(path, handler));
      if (log !== false) {
        console.log('Listening to POST ' + path);
      }
    }

    function listen(port) {
      var deferred = when.defer();
      app.listen(port, function(err) {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve();
        }
      });
      return deferred.promise;
    }

    return when({
      get : get,
      post : post,
      listen : listen
    });
  }

  module.exports = makeServer;

})();
