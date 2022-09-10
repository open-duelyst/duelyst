import gulp from 'gulp';
import gutil from 'gulp-util';
import bump from 'gulp-bump';

const paths = [
  './version.json',
  './package.json',
  './desktop/package.json',
];

export default function (type) {
  return gulp.src(paths, { base: './' })
    .pipe(bump({ type }))
    .pipe(gulp.dest('.'));
}
