module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({

        pkg : grunt.file.readJSON('package.json'),

        dir : {
            webapp : 'webapp',
            dist : 'dist',
            bower_components : 'bower_components'
        },

        uglify : {
            options : {
                banner : '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            ComponentPreload : {
                files : {
                    'dist/Component-preload.js' : ['dist/Component-preload.js']
                }
            }
        },

        connect : {
            options : {
                port : 8080,
                hostname : '*'
            },
            src : {},
            dist : {}
        },

        openui5_connect : {
            options : {
                resources : [
                    '<%= dir.bower_components %>/openui5-sap.ui.core/resources',
                    '<%= dir.bower_components %>/openui5-sap.ui.layout/resources',
                    '<%= dir.bower_components %>/openui5-sap.ui.unified/resources',
                    '<%= dir.bower_components %>/openui5-sap.m/resources',
                    '<%= dir.bower_components %>/openui5-themelib_sap_belize/resources',
                    '<%= dir.bower_components %>/openui5-themelib_sap_bluecrystal/resources'
                ]
            },
            src : {
                options : {
                    appresources : '<%= dir.webapp %>'
                }
            },
            dist : {
                options : {
                    appresources : '<%= dir.dist %>'
                }
            }
        },

        openui5_preload : {
            component : {
                options : {
                    resources : {
                        cwd : '<%= dir.webapp %>',
                        prefix : 'todo'
                    },
                    dest : '<%= dir.dist %>'
                },
                components : true
            }
        },

        clean : {
            dist : '<%= dir.dist %>/'
        },

        copy : {
            dist : {
                files : [{
                        expand : true,
                        cwd : '<%= dir.webapp %>',
                        src : [
                            '**'
                        ],
                        dest : '<%= dir.dist %>'
                    }
                ]
            }
        },

        eslint : {
            webapp : ['<%= dir.webapp %>']
        }

    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-openui5');
    grunt.loadNpmTasks('grunt-eslint');

    // Server task
    grunt.registerTask('serve', function (target) {
        grunt.task.run('openui5_connect:' + (target || 'src') + ':keepalive');
    });

    // Linting task
    grunt.registerTask('lint', ['eslint']);

    // Build task
    grunt.registerTask('build', ['openui5_preload', 'copy']);

    // Minify task
    grunt.registerTask('minify', ['uglify']);

    // Default task
    grunt.registerTask('default', [
            'lint',
            'clean',
            'build',
            //'minify:ComponentPreload',
            'serve:dist'
        ]);
};
