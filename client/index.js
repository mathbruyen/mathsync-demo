(function () {
  'use strict';

  var startClient = require('./client');

  startClient(document.getElementById('client1'), 'http://localhost:4000/summary');
  startClient(document.getElementById('client2'), 'http://localhost:4000/summary');
})();
