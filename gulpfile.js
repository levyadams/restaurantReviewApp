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
//minify js apparently
const minify = require('gulp-minify');
const uglify = require('gulp-uglify');
//no whitespaces html
const htmlmin = require('gulp-htmlmin');
//hot module pack reloading for pros
//css minify toolset
const cleanCSS = require('gulp-clean-css');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');
const babelify = require('babelify');
var gutil = require('gulp-util');
var minifyCss = require('gulp-minify-css');
var inline = require('gulp-inline');
var autoprefixer = require('gulp-autoprefixer');
var inlineCss = require('gulp-inline-css');

// =======================================================================// 
// !                Default and bulk tasks                                //        
// =======================================================================//  

//main task for building production dir
gulp.task('build', function (callback) {
    runSequence('clean', ['responsive-jpg', 'responsive-webp', 'copy-sw','copy-manifest'], 'scripts'), callback
});
gulp.task('webp', function (callback) {
    runSequence('webp'), callback
});

//delete build to start over from scratch
gulp.task('clean', function () {
    return del.sync('build');
});
gulp.task('clean-css', function () {
    return del.sync('build/css');
});

//for easy reference
gulp.task('dev', function (callback) {
    runSequence('scripts'), callback
});

// =======================================================================// 
//                  Images and fonts                                      //        
// =======================================================================//  

gulp.task('images', function (callback) {
    runSequence('clean', 'webp', ['responsive-jpg', 'responsive-webp'], callback);
})
gulp.task('responsive-jpg', function () {
    gulp.src('src/images/*')
        .pipe(responsive({
            '*.jpg': [
                { width: 1600, suffix: '_large_1x', quality: 40 },
                { width: 800, suffix: '_medium_1x', quality: 70 },
                { width: 550, suffix: '_small_1x', quality: 100 }
            ]
        }))
        .pipe(gulp.dest('build/images'));
});

gulp.task('responsive-webp', function () {
    gulp.src('src/images/*')
        .pipe(responsive({
            '*.webp': [
                { width: 1600, suffix: '_large_1x', quality: 40 },
                { width: 800, suffix: '_medium_1x', quality: 70 },
                { width: 550, suffix: '_small_1x', quality: 80 }
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

gulp.task('scripts', function (callback) {
    runSequence('watch', 'browse', callback);
});

gulp.task('browserify', function (callback) {
    runSequence(['b-main', 'b-info'], callback);
});

gulp.task('css', function (callback) {
    runSequence('inline','inline2', callback);
});


gulp.task('watch', (['browserify', 'css']), function () {
    gulp.watch('src/css/*.css', ['css']);
    gulp.watch('src/*.html', ['css']);
    gulp.watch('src/js/**/*.js', ['browserify']);
    gulp.watch('src/images/', ['images']);
});

gulp.task('inline', function () {
   return gulp.src('src/index.html')
  .pipe(inline({
    base: 'src/',
    css: [minifyCss],
    disabledTypes: ['svg', 'img', 'js'] // Only inline css files
  }))
  .pipe(gulp.dest('build/'));
});
gulp.task('inline2', function () {
    return gulp.src('src/restaurant.html')
   .pipe(inline({
     base: 'src/',
     css: [minifyCss],
     disabledTypes: ['svg', 'img', 'js'] // Only inline css files
   }))
   .pipe(gulp.dest('build/'));
 });

// gulp.task('minify-html', function() {
//     return gulp.src('src/restaurant.html')
//       .pipe(htmlmin({collapseWhitespace: true}))
//       .pipe(gulp.dest('build'))
//       .pipe(browserSync.reload({
//         stream: true
//     }));
//   });

// =======================================================================// 
//                  javascript functions                                  //        
// =======================================================================//  

gulp.task("b-main", function () {
    return browserify({
        entries: "./src/js/main.js"
    })
        .transform(babelify.configure({
            presets: ["@babel/preset-env"]
        }))
        .bundle()
        .pipe(source("main.js"))
        .pipe(buffer())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest("./build/js"))
        .pipe(browserSync.reload({
            stream: true
        }))
});

gulp.task("b-info", function () {
    return browserify({
        entries: "./src/js/restaurant_info.js"
    })
        .transform(babelify.configure({
            presets: ["@babel/preset-env"]
        }))
        .bundle()
        .pipe(source("restaurant_info.js"))
        .pipe(buffer())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest("./build/js"))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// =======================================================================// 
//                  copy stuff                                            //        
// =======================================================================// 

gulp.task('copy-sw', function () {
    gulp.src('src/sw.js')
        .pipe(gulp.dest('build/'));
});
gulp.task('copy-manifest', function () {
    gulp.src('src/manifest.json')
        .pipe(gulp.dest('build/'));
});
// =======================================================================// 
//                   Server                                               //        
// =======================================================================//  

gulp.task('browse', function () {
    browserSync.init({
        server: {
            baseDir: 'build'
        },
    })
})
