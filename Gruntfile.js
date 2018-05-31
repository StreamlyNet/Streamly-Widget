module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                mangle: {
                    reserved: ['jQuery']
                }
            },
            my_target: {
                files: [
                    {
                        src: ['app/public/js/main.js', 'app/public/js/chatEvents.js', 'app/public/js/videoEvents.js'],
                        dest: 'app/public/out/js/main.min.js'

                    },
                    {
                        expand: true,
                        src: ['**/*.js', '!**/libs/*', '!main.js', '!chatEvents.js', '!videoEvents.js'],
                        cwd: 'app/public/js/',
                        filter: 'isFile',
                        dest: 'app/public/out/js/',
                        ext: '.min.js'
                    }
                ]
            }
        },
        cssmin: {
            target: {
                files: [{
                    expand: true,
                    cwd: 'app/public/stylesheets',
                    src: ['**/*.css'],
                    dest: 'app/public/out/css',
                    ext: '.min.css'
                }]
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.registerTask('minify', ['uglify', 'cssmin']);
};