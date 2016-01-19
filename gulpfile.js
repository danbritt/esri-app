var gulp = require('gulp');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
//var bower = require('gulp-bower');
var minifyhtml = require('gulp-minify-html');
var minifyinline = require('gulp-minify-inline');

// Dev build
gulp.task('transpile', function() {
    return gulp.src(['src/**/*.es6'])
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('staging'));
});

// gulp.task('copy-package-json', function() {
//     return gulp.src('package.json')
//         .pipe(gulp.dest('staging'));
// });

// gulp.task('copy-vendor-libs', function() {
//     return gulp.src(['src/public/bower_components/**/*.*', 'src/public/vendor/**/*.*'])
//         .pipe(gulp.dest('staging/public/vendor'));
// });

// gulp.task('copy-vendor-libs', function() {
//     return gulp.src('src/public/vendor/**/*.*')
//         .pipe(gulp.dest('staging/public/vendor'));
// });

// gulp.task('copy-bower-json', function() {
//     return gulp.src('src/public/bower.json')
//         .pipe(gulp.dest('staging/public'));
// });

gulp.task('copy-html', function() {
     return gulp.src(['src/public/**/*.html', '!src/public/{bower_components,bower_components/**}', '!src/public/{vendor,vendor/**}'])
         .pipe(gulp.dest('staging/public'));
});

gulp.task('copy-css', function() {
     return gulp.src('src/public/**/*.css')
         .pipe(gulp.dest('staging/public'));
});

// gulp.task('copy-images', function() {
//      return gulp.src('src/public/images/**/*.*')
//          .pipe(gulp.dest('staging/public/images'));
// });

gulp.task('copy-images', function() {
     return gulp.src(['src/public/**/*.png', 'src/public/**/*.jpg', 'src/public/**/*.gif', 'src/public/**/*.svg'])
         .pipe(gulp.dest('staging/public'));
});

gulp.task('copy-js', function() {
     return gulp.src('src/**/*.js')
         .pipe(gulp.dest('staging'));
});

gulp.task('copy-json', function() {
     return gulp.src('src/public/**/*.json')
         .pipe(gulp.dest('staging/public'));
});

gulp.task('copy-xml', function() {
     return gulp.src('src/public/**/*.xml')
         .pipe(gulp.dest('staging/public'));
});

gulp.task('watch', function() {
    gulp.watch('src/**/*.es6', ['transpile']);
    gulp.watch('src/public/**/*.html', ['copy-html']);
    gulp.watch('src/public/**/*.css', ['copy-css']);
    gulp.watch('src/public/images/**/*.*', ['copy-images']);
    gulp.watch('src/public/js/**/*.js', ['copy-js']);
    gulp.watch('src/public/**/*.json', ['copy-json']);
});

//gulp.task('copycss', function() {
//    return gulp.src('src/**/*.css')
//        .pipe(gulp.dest('dist'));
//});

// gulp.task('copyimages', function() {
//     return gulp.src('src/images/**/*.*')
//         .pipe(gulp.dest('dist/images'));
// });
//
// gulp.task('copylibdist', function() {
//     return gulp.src('src/lib/*.*')
//         .pipe(gulp.dest('dist/lib'));
// });
//
// gulp.task('bower', function() {
//     return bower()
//         .pipe(gulp.dest('dist/lib'));
// });
//
// gulp.task('watch', function() {
//     gulp.watch('src/**/*.ts', ['compilets']);
//     gulp.watch('src/**/*.html', ['copyhtml']);
//     gulp.watch('src/**/*.css', ['copycss']);
//     gulp.watch('src/images/**/*.*', ['copyimages']);
// });
//
// // Prod build
// gulp.task('bowerprod', function() {
//     return bower()
//         .pipe(gulp.dest('prod/lib'));
// });
//
// gulp.task('vulcanize', function() {
//     return gulp.src('dist/index.html')
//         .pipe(vulcanize({
//             excludes: [],
//             stripExcludes: false,
//             inlineScripts: true
//         }))
//         .pipe(minifyinline())
//         .pipe(minifyhtml())
//         .pipe(gulp.dest('prod'));
// });

gulp.task('default', ['transpile', 'copy-html', 'copy-css', 'copy-images', 'copy-js', 'copy-json', 'copy-xml', 'watch']);
//gulp.task('default', ['compilets', 'copyhtml', 'copyimages', 'copycss', 'copylibdist', 'bower', 'watch']);
//gulp.task('prod', ['bowerprod', 'copylibdist', 'vulcanize']);
