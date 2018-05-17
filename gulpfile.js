var gulp = require('gulp');
//browser-sync for live reloading.
var browserSync = require('browser-sync').create();
//babel for polyfill es6
var babel = require('gulp-babel');
//babel source-maps
var sourcemaps = require('gulp-sourcemaps');
//useref for piping
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var pump = require('pump');
//gulp-if for ensuring file extensions.
var gulpIf = require('gulp-if');
//css concationator
var cssnano = require('gulp-cssnano');
//image optimization! Each one is a plugin below imagemin in this section.
var imagemin = require('gulp-imagemin');
var imageminPngquant = require('imagemin-pngquant');
var imageminZopfli = require('imagemin-zopfli');
var imageminMozjpeg = require('imagemin-mozjpeg'); //need to run 'brew install libpng'
var imageminGiflossy = require('imagemin-giflossy');
//responsive images!
var responsive = require('gulp-responsive-images');
//gulp cache
var cache = require('gulp-cache');
//gulp delete for cleaning
var del = require('del');
//run sequence to make sure each gulp command completes in the right order.
var runSequence = require('run-sequence');

//directory to watch file changes with live-reload
var watchDirectory = [
    'app/**/*.js'
]
gulp.task('default',function(callback){
    runSequence(['sync','watch']),callback
});
gulp.task('build',function(callback){
    runSequence('clean','babel',['minify','useref','responsive','fonts'],'imagemin',callback)
});
gulp.task('babel', () =>
    gulp.src('app/**/*.js')
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(gulp.dest('dist'))
);
//Minify/uglify/concatonate files
gulp.task('useref',function(){
    return gulp.src('app/*.html')
    .pipe(useref())
    .pipe(gulpIf('dist/**/*.js',uglify()))
    .pipe(gulpIf('app/**/*.css',cssnano()))
    .pipe(gulp.dest('dist'));
});
gulp.task('minify', function (cb) {
    pump([
          gulp.src('dist/**/*.js'),
          uglify(),
          gulp.dest('dist')
      ],
      cb
    );
  });
gulp.task('imagemin', function() {
    return gulp.src(['app/**/*.{gif,png,jpg}'])
        .pipe(cache(imagemin([
            //png
            imageminPngquant({
                speed: 1,
                quality: 98 //lossy settings
            }),
            imageminZopfli({
                more: true
            }),
            imageminGiflossy({
                optimizationLevel: 3,
                optimize: 3, 
                lossy: 2
            }),
            //jpg lossless
            imagemin.jpegtran({
                progressive: true
            }),
            //jpg very light lossy, use vs jpegtran
            imageminMozjpeg({
                quality: 90
            })
        ])))
        .pipe(gulp.dest('dist/images'));
});
gulp.task('responsive',function(){
    gulp.src('app/images/**/*')
    .pipe(responsive({
        '*.jpg':[
        {width:1600, suffix: '_large_1x', quality:100},
        {width:800, suffix: '_medium_1x', quality:100},
        {width:550, suffix: '_small_1x', quality:100}
    ]
    }))
    .pipe(gulp.dest('dist/images'));
});
gulp.task('sync',function(){
    browserSync.init({
        server:{
            baseDir:'app'
        }
    })
});
//watch directories
gulp.task('watch',['sync'],function(){
    gulp.watch(watchDirectory,browserSync.reload);
})
gulp.task('fonts', function(){
    return gulp.src('app/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'))
});
gulp.task('clean',function(){
    return del.sync('dist');
});

