'use strict'
import gulp from 'gulp';

// named task
export function build() {
  return gulp.src('src/*.js')
    .pipe(babel())
    .pipe(gulp.dest('lib'));
}

// default task
export default function dev() {
  gulp.watch('src/*.js', ['build']);
}
