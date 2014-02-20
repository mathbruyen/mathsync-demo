module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint : {
      options : {
        curly : true,
        bitwise : true,
        camelcase : true,
        eqeqeq : true,
        forin : true,
        immed : true,
        latedef : true,
        newcap : true,
        noarg : true,
        noempty : true,
        typed : true,
        nonew : true,
        plusplus : false,
        indent : 2,
        undef : true,
        quotmark : 'single',
        unused : true,
        strict : true,
        trailing : true,
        esnext : true,

        node : true,
        browser : true,
        globals : {
          describe : false,
          it : false,
          before : false
        }
      },
      all : [ 'Gruntfile.js', 'src/**/*.js', 'client/**/*.js' ]
    },
    browserify : {
      dist  : {
        files: {
          'statics/js/index.js': 'client/index.js'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.registerTask('default', ['jshint', 'browserify']);
};
