const gulp = require('gulp');
const babel = require('gulp-babel');
//browser loader
var browserSync = require('browser-sync').create();
//webp images for optimization on some browsers
const webp = require('gulp-webp');
//responsive images!
const responsive = require('gulp-responsive-images');
//gulp delete for cleaning
const del = require('del');
//run sequence to make sure each gulp command completes in the right order.
const runSequence = require('run-sequence');
//minify css
const minify = require('gulp-minify');
//no whitespaces html
const htmlmin = require('gulp-htmlmin');
//hot module pack reloading for pros
//css minify toolset
const cleanCSS = require('gulp-clean-css');

// =======================================================================// 
// !                Default and bulk tasks                                //        
// =======================================================================//  

//main task for building production dir
gulp.task('build',function(callback){
    runSequence('clean','webp',['responsive-jpg','responsive-webp','copy-data','copy-sw'],'scripts'),callback
});

//delete build to start over from scratch
gulp.task('clean',function(){
    return del.sync('build');
});

//for easy reference
gulp.task('dev',function(callback){
    runSequence('scripts'),callback
});

// =======================================================================// 
//                  Images and fonts                                      //        
// =======================================================================//  

gulp.task('responsive-jpg',function(){
    gulp.src('src/images/*')
    .pipe(responsive({
        '*.jpg':[
        {width:1600, suffix: '_large_1x', quality:40},
        {width:800, suffix: '_medium_1x', quality:70},
        {width:550, suffix: '_small_1x', quality:100}
    ]
    }))
    .pipe(gulp.dest('build/images'));
});

gulp.task('responsive-webp',function(){
    gulp.src('src/images/*')
    .pipe(responsive({
        '*.webp':[
        {width:1600, suffix: '_large_1x', quality:40},
        {width:800, suffix: '_medium_1x', quality:70},
        {width:550, suffix: '_small_1x', quality:80}
    ]
    }))
    .pipe(gulp.dest('build/images'));
});

gulp.task('webp', () =>
    gulp.src('src/images/*.jpg')
        .pipe(webp())
        .pipe(gulp.dest('src/images'))
);

// =======================================================================// 
//                  Gulp tasks                                            //        
// =======================================================================//  

gulp.task('scripts', function(callback) {
    runSequence('watch','browse',callback);
  });

gulp.task('minify-html', function() {
    return gulp.src('src/public/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('build/public'))
    .pipe(browserSync.reload({
        stream: true
      }))
});

gulp.task('minify-css', () => {
    return gulp.src('src/css/*.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('build/css'))
    .pipe(browserSync.reload({
        stream: true
      }))
});

gulp.task('watch', ['minify-css','minify-html','babel'], function (){
    gulp.watch('src/css/**/*.css', ['minify-css']);
    gulp.watch('src/js/**/*.js', ['babel']); 
    gulp.watch('src/public/*.html', ['minify-html']);  
});

gulp.task('babel', () =>
gulp.src('src/js/*.js')
.pipe(babel({
    presets: ['env']
}))
.pipe(minify({
    exclude: ['node_module']
}))
.pipe(gulp.dest('build/js'))
.pipe(browserSync.reload({
    stream: true
  }))
);

// =======================================================================// 
//                  copy stuff                                            //        
// =======================================================================// 
gulp.task('copy-data', function () {
    gulp.src('./src/data/*.json')
        .pipe(gulp.dest('/build/data'));
});

gulp.task('copy-sw', function () {
    gulp.src('./src/sw.js')
        .pipe(gulp.dest('/build/'));
});

// =======================================================================// 
//                   Servers                                              //        
// =======================================================================//  

gulp.task('browse', function() {
    browserSync.init({
      server: {
        baseDir: 'build/public'
      },
    })
  })