var gulp = require('gulp');
//webp images for optimization on some browsers
const webp = require('gulp-webp');
//responsive images!
var responsive = require('gulp-responsive-images');
//gulp delete for cleaning
var del = require('del');
//run sequence to make sure each gulp command completes in the right order.
var runSequence = require('run-sequence');
// =======================================================================// 
// !                Default and bulk tasks                                //        
// =======================================================================//  
//default runs when the user types 'gulp' into CLI
gulp.task('default',function(callback){
    runSequence('clean','webp',['responsive-jpg','responsive-webp','copy-data','copy-sw']),callback
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
gulp.task('copy-data', function () {
    gulp.src('./src/data/*.json')
        .pipe(gulp.dest('./build/data'));
});
gulp.task('copy-sw', function () {
    gulp.src('./src/sw.js')
        .pipe(gulp.dest('./build/'));
});
// =======================================================================// 
//                  Gulp tasks                                            //        
// =======================================================================//  
gulp.task('clean',function(){
    return del.sync('build/images');
});
// =======================================================================// 
//                  Browser-sync Servers                                  //        
// =======================================================================//  
// // gulp.task('dev-server', function() {
// //     browserSync.init({
// //             port: 8000,
// //             server: "./"
// //         })
// // });
// gulp.task('dist-server', function() {
//     browserSync.init({
//       server: "./dist",
//       port: 8000
//     })
//     browserSync.stream()
// });