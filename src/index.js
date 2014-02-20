(function () {
  'use strict';

  var path = require('path');
  var makeServer = require('./web');
  var startStore = require('./store');

  var port = process.env.PORT;
  var statics = path.join(path.dirname(__dirname), '/statics');

  makeServer(statics).then(function (web) {
    return startStore({}, web).then(function () {
      return web.listen(port);
    });
  }).then(function () {
    console.log('Server started on port ' + port);
  }, function (err) {
    console.log(err);
  });

})();
