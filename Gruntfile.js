module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jscs: {
      src: ['*.js', 'src/**/*.js', 'test/**/*.js'],
      options: {
        config: '.jscsrc.json'
      }
    },
    jshint: {
      all: ['*.js', 'src/**/*.js', 'test/**/*.js']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jscs');

  grunt.registerTask('default', ['jshint', 'jscs']);

};
