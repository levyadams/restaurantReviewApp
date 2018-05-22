var gulp = require('gulp');
var browserify = require('browserify');
//sass, html and css operations
var sass = require('gulp-sass');
var concatCss = require('gulp-concat-css');
var htmlMin = require('gulp-htmlmin');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
//babel for polyfill es6
var babelify = require("babelify");
//uglify to remove spaces and indents!
var uglify = require('gulp-uglify');
//source-maps for easy debug
var sourcemaps = require('gulp-sourcemaps');
//responsive images!
var responsive = require('gulp-responsive-images');
//gulp delete for cleaning
var del = require('del');
//run sequence to make sure each gulp command completes in the right order.
var runSequence = require('run-sequence');
//browser-sync for live server/editing/basic dev
var browserSync = require('browser-sync').create('BS-server');

// =======================================================================// 
// !                Default and bulk tasks                                //        
// =======================================================================//  

//default runs when the user types 'gulp' into CLI
gulp.task('default',function(callback){
    runSequence('watch'),callback
});
//distribution command, 'gulp dist', will create a production ready folder and spin up a server to view the assets.
//We optimize our scripts first, then copy over JSON data, convert images for responsiveness, copy over fonts.
//the dist server runs only after everything is completed before it.

gulp.task('dist',function(callback){
    runSequence('scripts',['responsive','fonts','copy-data'],'dist-server',callback)
});
//first the dist folder is cleaned completely, then compile sass and finish it before loading the other plugins async.
gulp.task('scripts',function(callback){
    runSequence('clean','sass',['browserify','css','html'],callback)
});

// =======================================================================// 
//                  Script plugins                                        //        
// =======================================================================//  


gulp.task('browserify',()=>{
    return browserify(
        {
          entries: './js/main.js',
          debug: true
        })
        .transform(babelify, {
          sourceMaps: true
        })
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourcemaps.write('./srcmaps'))
        .pipe(gulp.dest('dist/js'));
});

// gulp.task('transpile', () =>
//     //set the source of the files we want to load. If you glob wrong here, it will try to go into node_modules
//     gulp.src('./js/*.js')
//     //init sourcemaps to collect data on the scripts
//     .pipe(sourcemaps.init())
//     //babel env prefix recommended for transpiling es6 to es2015/other things as well
//     .pipe(babel({
//     //using gulp-babel documentation settings will break this
//     presets: ["env"]
//     }))
//     // Removes spaces and indentation
//     .pipe(uglify())
//     //merge all js files into one
//     // .pipe(concat('main.min.js'))
//     // write all info to sourcemaps
//     .pipe(sourcemaps.write('./sourceMaps'))
//     //pipe to our distribution destination.
//     .pipe(gulp.dest('dist/js'))
// );
gulp.task('sass', ()=>
    gulp.src('sass/**/*.+(scss|sass)')
    .pipe(sass())
    .pipe(gulp.dest('css'))
);
gulp.task('css',()=>
    gulp.src('css/*.css',{base: 'c:/git/project'})
    .pipe(concatCss('css/styles.css'))
    .pipe(gulp.dest('dist'))
);
gulp.task('html',()=>
    gulp.src('*.html')
    // .pipe(htmlMin({collapseWhitespace:true}))
    .pipe(gulp.dest('dist'))
);

// =======================================================================// 
//                  Images and fonts                                      //        
// =======================================================================//  
gulp.task('fonts', function(){
    return gulp.src('app/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'))
});
gulp.task('responsive',function(){
    gulp.src('images/*')
    .pipe(responsive({
        '*.jpg':[
        {width:1600, suffix: '_large_1x', quality:40},
        {width:800, suffix: '_medium_1x', quality:70},
        {width:550, suffix: '_small_1x', quality:100}
    ]
    }))
    .pipe(gulp.dest('dist/images'));
});

// =======================================================================// 
//                  Gulp tasks                                            //        
// =======================================================================//  

//watch directories
gulp.task('watch',['dev-server'],function(){
    //we use the stream:true parameter to stream the sass files into the css before the reload.
    gulp.watch('./sass/**/*.+(scss|sass)',['sass',browserSync.reload({stream:true})]);
    gulp.watch('./css/*.css',browserSync.reload);
    gulp.watch('./js/**/*.js',browserSync.reload);
    gulp.watch('*.html',browserSync.reload);
})
gulp.task('copy-data',()=>
    gulp.src('data/*.json')
    .pipe(gulp.dest('dist/data'))
);
gulp.task('clean',function(){
    return del.sync('dist');
});

// =======================================================================// 
//                  Browser-sync Servers                                  //        
// =======================================================================//  

gulp.task('dev-server', function() {
    browserSync.init({
            port: 8000,
            server: "./"
        })
});
gulp.task('dist-server', function() {
    browserSync.init({
      server: "./dist",
      port: 8000
    })
    browserSync.stream()
});



