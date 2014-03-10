(function () {
  'use strict';

  var ms = require('mathsync');
  var when = require('when');
  var http = require('http');

  function startClient(root, baseUrl, log) {

    var data = {};
    var toPush = [];
    var toDelete = [];

    // Server summary
    function fetchSummary(level) {
      if (log !== false) {
        console.log('Fetching server summary for up to ' + Math.pow(2, level) + ' differences');
      }

      var deferred = when.defer();

      http.get(baseUrl + '/' + level, function (res) {
        var chunks = [];
        res.on('data', function(chunk) {
          chunks.push(chunk);
        });
        res.on('end', function() {
          deferred.resolve(chunks);
        });
      }).on('error', deferred.reject);

      return deferred.promise.then(Buffer.concat).then(JSON.parse);
    }
    var remote = ms.summarizer.fromJSON(fetchSummary);

    // Synchronization
    var serialize = ms.serialize.fromString();
    var deserialize = ms.serialize.toString();
    var resolve = ms.resolver.fromGenerator(function* () {
      for (var k in data) {
        if (data.hasOwnProperty(k)) {
          yield (k + ':' + data[k]);
        }
      }
    }, remote, serialize, deserialize);

    function pushOne(key, value) {
      if (log !== false) {
        console.log('Setting ' + key + ' to ' + value + ' on the server');
      }
      var deferred = when.defer();
      var options = {
        hostname: 'localhost',
        port: 4000,
        path: '/set/' + key + '/' + value,
        method: 'POST'
      };
      var req = http.request(options, function(res) {
        res.on('end', deferred.resolve);
      });
      req.on('error', deferred.reject);
      req.end();
      return deferred.promise;
    }

    function deleteOne(key) {
      if (log !== false) {
        console.log('Deleting ' + key + ' on the server');
      }
      var deferred = when.defer();
      var options = {
        hostname: 'localhost',
        port: 4000,
        path: '/delete/' + key,
        method: 'POST'
      };
      var req = http.request(options, function(res) {
        res.on('end', deferred.resolve);
      });
      req.on('error', deferred.reject);
      req.end();
      return deferred.promise;
    }

    function push() {
      var p = when();
      var key, i;
      /* TODO: this does not work well if someone deletes a value locally and then sets it back */
      for (i = 0; i < toPush.length; i++) {
        key = toPush[i];
        p.then(pushOne.bind(null, key, data[key]));
      }
      for (i = 0; i < toDelete.length; i++) {
        p.then(deleteOne.bind(null, toDelete[i]));
      }
      return p.then(function () {
        toPush = [];
        toDelete = [];
      });
    }

    function sync() {
      when().then(push).then(resolve).then(function (difference) {
        difference.removed.forEach(function (i) {
          var item = i.split(':');
          delete data[item[0]];
        });
        difference.added.forEach(function (i) {
          var item = i.split(':');
          data[item[0]] = item[1];
        });
        if (log !== false) {
          console.log('Found ' + difference.added.length + ' added items and ' + difference.removed.length + ' deleted items');
        }
      }).then(refreshUI).catch(function (err) {
        console.log('Error during synchronization: ', err);
      });
    }

    function refreshUI() {
      var list = root.querySelector('.items');
      while (list.firstChild) {
        list.removeChild(list.firstChild);
      }
      var item;
      for (var k in data) {
        if (data.hasOwnProperty(k)) {
          item = document.createElement('li');
          item.textContent = k + ' => ' + data[k];
          list.appendChild(item);
        }
      }
    }

    function setValue() {
      var key = root.querySelector('.key').value;
      var value = root.querySelector('.value').value;
      data[key] = value;
      toPush.push(key);
      refreshUI();
    }

    function deleteKey() {
      var key = root.querySelector('.key').value;
      delete data[key];
      toDelete.push(key);
      refreshUI();
    }

    // UI
    root.querySelector('.startsync').addEventListener('click', sync);
    root.querySelector('.setvalue').addEventListener('click', setValue);
    root.querySelector('.deletekey').addEventListener('click', deleteKey);
  }

  module.exports = startClient;

})();
