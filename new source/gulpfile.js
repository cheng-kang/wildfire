var gulp = require("gulp");
var uglify = require("gulp-uglify")
var babel  = require('gulp-babel')
var watch = require('gulp-watch')
var vueify = require('gulp-vueify')

gulp.task("default", () => {
  return gulp.src(['src/*.js'])
      .pipe(babel({presets: ['es2015']}))
      .pipe(uglify().on('error', (e) => {
           console.log(e);
      }))
      .pipe(gulp.dest("dist"))
})

gulp.task("watch", () => {
  return gulp.src(['src/*.js'])
      .pipe(watch('src/*.js'))
      .pipe(babel({presets: ['es2015']}))
      .pipe(uglify().on('error', (e) => {
           console.log(e);
      }))
      .pipe(gulp.dest('dist'))
})
 
gulp.task('vueify', function () {
  return gulp.src('src/components/*.vue')
    .pipe(vueify())
    .pipe(gulp.dest('dist/components'));
});