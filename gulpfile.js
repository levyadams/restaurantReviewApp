const gulp = require('gulp');
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
//minify js 
const uglify = require('gulp-uglify');
//no whitespaces html
const htmlmin = require('gulp-htmlmin');
//hot module pack reloading for pros
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');
const babelify = require('babelify');
var minifyCss = require('gulp-minify-css');
//incline css into html
var inline = require('gulp-inline');

// =======================================================================// 
// !                Default and bulk tasks                                //        
// =======================================================================//  

//main task for building production dir
gulp.task('build', function (callback) {
    runSequence('clean', ['responsive-jpg', 'responsive-webp', 'copy-sw', 'copy-manifest', 'copy-svg', 'copy-data'], 'scripts'), callback
});

//delete build to start over from scratch
gulp.task('clean', function () {
    return del.sync('build');
});


//for easy reference
gulp.task('dev', function (callback) {
    runSequence('scripts'), callback
});

// =======================================================================// 
//                  Images and fonts                                      //        
// =======================================================================//  

gulp.task('images', function (callback) {
    runSequence('clean', ['responsive-jpg', 'responsive-webp'], callback);
})
gulp.task('webp', () =>
    gulp.src('src/images/*.jpg')
    .pipe(webp())
    .pipe(gulp.dest('src/images'))
);

gulp.task('webp-jpg', () =>
    gulp.src(['src/images/*.jpg'])
    .pipe(webp())
    .pipe(gulp.dest('src/images'))
);
gulp.task('responsive-jpg', function () {
    gulp.src(['src/images/**/*'])
        .pipe(responsive({
            '*.jpg': [{
                    width: 1600,
                    suffix: '_large_1x',
                    quality: 40
                },
                {
                    width: 800,
                    suffix: '_medium_1x',
                    quality: 70
                },
                {
                    width: 550,
                    suffix: '_small_1x',
                    quality: 100
                }
            ]
        }))
        .pipe(gulp.dest('build/images'));
});

gulp.task('responsive-webp', function () {
    gulp.src(['src/images/**/*'])
        .pipe(responsive({
            '*.webp': [{
                    width: 1600,
                    suffix: '_large_1x',
                    quality: 40
                },
                {
                    width: 800,
                    suffix: '_medium_1x',
                    quality: 70
                },
                {
                    width: 550,
                    suffix: '_small_1x',
                    quality: 80
                }
            ]
        }))
        .pipe(gulp.dest('build/images'));
});


// =======================================================================// 
//                  Gulp tasks                                            //        
// =======================================================================//  

gulp.task('scripts', function (callback) {
    runSequence('watch', 'browse', callback);
});

gulp.task('browserify', function (callback) {
    runSequence(['b-main', 'b-products', 'b-about'], callback);
});

gulp.task('css', function (callback) {
    runSequence(['inline', 'inline2','inline3'],'b-main', callback);
});


gulp.task('watch', (['browserify', 'css']), function () {
    gulp.watch('src/css/*.css', ['css']);
    gulp.watch('src/*.html', ['css']);
    gulp.watch('src/js/*.js', ['browserify']);
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
    return gulp.src('src/products.html')
        .pipe(inline({
            base: 'src/',
            css: [minifyCss],
            disabledTypes: ['svg', 'img', 'js'] // Only inline css files
        }))
        .pipe(gulp.dest('build/'));
});

gulp.task('inline3', function () {
        return gulp.src('src/about.html')
            .pipe(inline({
                base: 'src/',
                css: [minifyCss],
                disabledTypes: ['svg', 'img', 'js'] // Only inline css files
            }))
            .pipe(gulp.dest('build/'));
            
    })
    

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
gulp.task("b-products", function () {
    return browserify({
            entries: "./src/js/products.js"
        })
        .transform(babelify.configure({
            presets: ["@babel/preset-env"]
        }))
        .bundle()
        .pipe(source("products.js"))
        .pipe(buffer())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest("./build/js"))
        .pipe(browserSync.reload({
            stream: true
        }))
});
gulp.task("b-about", function () {
    return browserify({
            entries: "./src/js/about.js"
        })
        .transform(babelify.configure({
            presets: ["@babel/preset-env"]
        }))
        .bundle()
        .pipe(source("about.js"))
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

gulp.task('copy-svg', function () {
    gulp.src('src/images/svg/*.svg')
        .pipe(gulp.dest('build/images/svg'));
});

gulp.task('copy-data', function () {
    gulp.src('src/data/posts.json')
        .pipe(gulp.dest('build/data/'));
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