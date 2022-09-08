import gulp from 'gulp';
import rev from 'gulp-rev';
import revReplace from 'gulp-rev-replace';
import { exec } from 'child_process';
import { config, production, staging } from './shared';

export function generate() {
  return gulp.src(['dist/src/**/*.css', 'dist/src/**/*.js'])
    .pipe(rev({ merge: true }))
    .pipe(gulp.dest('dist/src'))
    .pipe(rev.manifest({ merge: true }))
    .pipe(gulp.dest('dist/src'));
}

export function replace() {
  let prefix = '';
  if (production || staging) {
    prefix = `${config.get('cdn')}/`;
  }
  const manifest = gulp.src('dist/src/rev-manifest.json');
  return gulp.src(['dist/src/**/*.css', 'dist/src/**/*.js', 'dist/src/index.html', 'dist/src/register.html'])
    .pipe(revReplace({
      prefix,
      manifest,
    }))
    .pipe(gulp.dest('dist/src'));
}
