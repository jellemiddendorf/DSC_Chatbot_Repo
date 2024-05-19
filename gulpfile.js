const gulp = require('gulp');
const babel = require('gulp-babel');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const order = require('gulp-order');

// Process, prefix, and minify CSS files
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

// Copy HTML files from source to distribution folder
function html() {
  return gulp.src('src/**/*.html')
    .pipe(gulp.dest('dist'));
}

// Process, transpile, and minify JavaScript files
function js() {
    return gulp.src('src/js/**/*.js') // Gets all files ending with .js in src/js and children dirs
        .pipe(sourcemaps.init())
        .pipe(order([
          'src/js/chatbotTest.js',    // defines 'html elements'
          'src/js/states.js',         // defines 'stateIDs'
          'src/js/stateMachine.js',   // This depends on 'stateIDs' from 'states.js'
          'src/js/headerLoader.js',   // loads 'header.html'
          'src/js/mainInit.js',       // Initialization script
          'src/js/*.js'
        ], { base: './' }))
        .pipe(babel())
        .pipe(concat('app.js'))
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist/js'));
}

// Watch for changes in files to re-run tasks
function watch() {
    gulp.watch('src/**/*.html', html);
    gulp.watch('src/scss/**/*.scss', styles);
    gulp.watch('src/js/**/*.js', js);
}

// Define tasks
exports.build = gulp.series(html, styles, js);
exports.default = gulp.series(gulp.parallel(html, styles, js), watch);
