const gulp = require('gulp');
const gulpif = require('gulp-if');
const babel = require('gulp-babel');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const order = require('gulp-order');
const jasmine = require('gulp-jasmine');

const eslint = require('gulp-eslint');

// Concatenate JS in test bundle and run tests
function test() {
  return gulp.src(['spec/testSetup.js', 'src/js/states.js', 'src/js/stateMachine.js', 'src/js/chatbot.js', 'spec/*.js'])
        .pipe(sourcemaps.init())
        .pipe(order([
            'spec/testSetup.js',         // Setup file
            'src/js/states.js',          // Base module
            'src/js/stateMachine.js',    // Depends on states.js
            'src/js/*.js',               // Other JS files
            'spec/*Spec.js'              // Spec files last to ensure dependencies are loaded first
        ], { base: './' }))
        .pipe(concat('testBundle.js'))
        .pipe(gulp.dest('spec/test/'))
        .pipe(jasmine())                 // Run Jasmine tests
        .on('error', function() {
            console.error(err);
            process.exit(1);
        });
}

// // Run Jasmine Unit Tests
// function runTests() {
//   return gulp.src('spec/**/*[sS]pec.js')
//       .pipe(jasmine());
// }

// Process, prefix, and minify CSS files
function styles() {
  return gulp.src('src/scss/**/*.scss') // Gets all files ending with .scss in src/scss and children dirs
    .pipe(gulpif(process.env.NODE_ENV === 'development', sourcemaps.init()))//.pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError)) // Converts Sass to CSS with gulp-sass
    .pipe(cleanCSS()) // Minifies the CSS
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulpif(process.env.NODE_ENV === 'development', sourcemaps.write('./')))//.pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist/css')) // Outputs the CSS to dist/css
}

// Copy HTML files from source to dist
function html() {
  return gulp.src('src/**/*.html')
    .pipe(gulp.dest('dist'));
}

// ESLint task
function lint() {
  return gulp.src(['src/js/**/*.js'])
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
}


// Process, transpile, and minify JavaScript files
function js() {
    return gulp.src('src/js/**/*.js') // Gets all files ending with .js in src/js and children dirs
        .pipe(gulpif(process.env.NODE_ENV === 'development', sourcemaps.init()))//.pipe(sourcemaps.init())
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
        .pipe(gulpif(process.env.NODE_ENV === 'development', sourcemaps.write('./')))//.pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist/js'));
}

// Watch for changes in files to re-run tasks
function watch() {
  gulp.watch('src/scss/**/*.scss', styles);
  gulp.watch('src/**/*.html', html);
  gulp.watch('src/js/**/*.js', gulp.series(lint, js));
}

// Define tasks
exports.build = gulp.series(lint, html, styles, js);
exports.default = gulp.series(gulp.parallel(lint, html, styles, js), watch);
exports.test = test;
