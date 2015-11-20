module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),
//    concat: {
//      options: {
//        separator: ';'
//      },
//      dist: {
//        src: ['src/sui.js','src/suibase.js'],
//        dest: 'js/sui.js'
//      }
//    }
//    ,
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy hh:mm") %> */\n'
      },
      dist: {
        files: {
          'js/sui.min.js': ['js/sui.js'],
          'js/suibase.min.js': ['js/suibase.js'],
          'js/base.min.js': ['js/layout.js']
        }
      }
    }
    ,
//    qunit: {
//      files: ['test/**/*.html']
//    },
//    jshint: {
//      files: ['gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
//      options: {
//        // options here to override JSHint defaults
//        globals: {
//          jQuery: true,
//          console: true,
//          module: true,
//          document: true
//        }
//      }
//    },
//    watch: {
//      files: ['<%= jshint.files %>'],
//      tasks: ['jshint', 'qunit']
//    }
      cssmin:{
          options:{
              keepSpecialComments:0,
              banner:'/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy hh:mm") %> */\n'
          },
          compress:{
              files:{
                  "css/sui.all.css":[
                      "css/base.css",
                      "css/default.css",
                      "css/skin1.css",
                      "css/sui.base.css",
                      "css/sui.form.triggerfield.css",
                      "css/sui.form.spinner.css",
                      "css/sui.form.timefield.css",
                      "css/sui.form.list.css",
                      "css/sui.form.droplist.css",
                      "css/sui.form.date.css",
                      "css/sui.form.datefield.css",
                      "css/sui.tab.css",
                      "css/sui.toolbar.css",
                      "css/sui.tree.css",
                      "css/sui.table.css",
                      "css/sui.extable.css",
                      "css/sui.menu.css",
                      "css/sui.treetable.css",
                      "css/sui.navigator.css",
                      "css/sui.ctrlbar.css"
                  ]
              }
          }
      }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
//  grunt.loadNpmTasks('grunt-contrib-jshint');
//  grunt.loadNpmTasks('grunt-contrib-qunit');
//  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');

//  grunt.registerTask('test', ['jshint', 'qunit']);

//  grunt.registerTask('default', ['jshint', 'qunit', 'concat', 'uglify']);
  grunt.registerTask('default', ['cssmin','uglify']);
};
 