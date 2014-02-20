(function () {
  'use strict';

  var ms = require('mathsync-generator');
  var when = require('when');

  function startStore(data, web) {
    var serialize = ms.serialize.fromString();

    var local = ms.summarizer.fromGenerator(function* () {
      for (var k in data) {
        if (data.hasOwnProperty(k)) {
          yield (k + ':' + data[k]);
        }
      }
    }, serialize);

    web.get('/summary/:level', function* (level) {
      this.body = yield local(level);
    });

    web.post('/set/:key/:value', function* (key, value) {
      data[key] = value;
      this.body = 'Ok';
    });

    web.post('/delete/:key', function* (key) {
      delete data[key];
      this.body = 'Ok';
    });

    return when();
  }

  module.exports = startStore;

})();
