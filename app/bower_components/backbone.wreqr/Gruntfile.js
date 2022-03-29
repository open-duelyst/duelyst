/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      version: '<%= pkg.version %>',
      banner:
        '// Backbone.Wreqr (Backbone.Marionette)\n' +
        '// ----------------------------------\n' +
        '// v<%= pkg.version %>\n' +
        '//\n' +
        '// Copyright (c)<%= grunt.template.today("yyyy") %> Derick Bailey, Muted Solutions, LLC.\n' +
        '// Distributed under MIT license\n' +
        '//\n' +
        '// http://github.com/marionettejs/backbone.wreqr\n' +
        '\n\n'
    },

    lint: {
      files: ['src/wreqr*.js']
    },

    preprocess: {
      umd: {
        src: 'src/build/backbone.wreqr.js',
        dest: 'lib/backbone.wreqr.js'
      }
    },

    template: {
      options: {
        data: {
          version: '<%= meta.version %>'
        }
      },
      umd: {
        src: '<%= preprocess.umd.dest %>',
        dest: '<%= preprocess.umd.dest %>'
      }
    },

    concat: {
      options: {
        banner: "<%= meta.banner %>"
      },
      umd: {
        src: '<%= preprocess.umd.dest %>',
        dest: '<%= preprocess.umd.dest %>'
      }
    },

    uglify : {
      options: {
        banner: "<%= meta.banner %>"
      },
      umd : {
        src : 'lib/backbone.wreqr.js',
        dest : 'lib/backbone.wreqr.min.js',
        options : {
          sourceMap : 'lib/backbone.wreqr.map',
          sourceMappingURL : 'backbone.wreqr.map',
          sourceMapPrefix : 2
        }
      }
    },

    jasmine : {
      options : {
        helpers : 'spec/javascripts/helpers/*.js',
        specs : 'spec/javascripts/**/*.spec.js',
        vendor : [
          'public/javascripts/json2.js',
          'public/javascripts/jquery.js',
          'node_modules/underscore/underscore.js',
          'node_modules/backbone/backbone.js',
          'node_modules/sinon/pkg/sinon.js',
          'node_modules/jasmine-sinon/lib/jasmine-sinon.js',
        ],
        keepRunner: true,
      },
      coverage : {
        src : '<%= jasmine.wreqr.src %>',
        options : {
          template : require('grunt-template-jasmine-istanbul'),
          templateOptions: {
            coverage: 'reports/coverage.json',
            report: 'reports/coverage'
          }
        }
      },
      wreqr: {
        src : [
          'src/build/backbone.wreqr.js',
          'spec/javascripts/support/wreqrHelper.js',
          'src/wreqr.handlers.js',
          'src/wreqr.*.js'
        ],
      }
    },

    jshint: {
      options: {
        jshintrc : '.jshintrc'
      },
      wreqr : [ 'src/*.js' ]
    },
    plato: {
      wreqr : {
        src : 'src/*.js',
        dest : 'reports',
        options : {
          jshint : grunt.file.readJSON('.jshintrc')
        }
      }
    },
    watch: {
      wreqr : {
        files : ['src/*.js', 'spec/**/*.js'],
        tasks : ['jshint', 'jasmine:wreqr']
      },
      server : {
        files : ['src/*.js', 'spec/**/*.js'],
        tasks : ['jasmine:wreqr:build']
      }
    },

    connect: {
      server: {
        options: {
          port: 8888
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-preprocess');
  grunt.loadNpmTasks('grunt-template');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-plato');

  grunt.registerTask('test', ['jshint', 'jasmine:wreqr']);

  grunt.registerTask('dev', ['test', 'watch:wreqr']);

  grunt.registerTask('server', ['jasmine:wreqr:build', 'connect:server', 'watch:server']);

  // Default task.
  grunt.registerTask('default', ['jshint', 'jasmine:coverage', 'preprocess', 'template', 'concat', 'uglify']);

};
