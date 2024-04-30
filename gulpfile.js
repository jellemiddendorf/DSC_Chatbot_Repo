const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
//const imagemin = require('gulp-imagemin');
const sourcemaps = require('gulp-sourcemaps');

function styles() {
  return gulp.src('src/scss/**/*.scss') // Gets all files ending with .scss in src/scss and children dirs
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError)) // Converts Sass to CSS with gulp-sass
    .pipe(cleanCSS()) // Minifies the CSS
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist/css')) // Outputs the CSS to dist/css
}

function html() {
  return gulp.src('src/**/*.html')
    .pipe(gulp.dest('dist'));
}

// Uglify JavaScript
function scripts() {
    return gulp.src('src/js/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist/js'));
}

// Optimize images
// function images() {
//     return gulp.src('src/assets/images/**/*')
//         .pipe(imagemin())
//         .pipe(gulp.dest('dist/assets/images'));
// }

// Watch files
function watch() {
    gulp.watch('src/**/*.html', html);
    gulp.watch('src/scss/**/*.scss', styles);
    gulp.watch('src/js/**/*.js', scripts);
    // gulp.watch('src/assets/images/**/*', images);
}

exports.build = gulp.series(html, styles, scripts); // images
exports.default = gulp.series(gulp.parallel(html, styles, scripts), watch); // images
