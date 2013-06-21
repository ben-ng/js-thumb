module.exports = function(grunt) {
	  grunt.loadNpmTasks('grunt-contrib-qunit');
	  
    grunt.initConfig({
        qunit: {
            all: ['test/index.html']
        }
    });

    // Task to run tests
    grunt.registerTask('test', 'qunit');
    grunt.registerTask('default', ['test']);
};
