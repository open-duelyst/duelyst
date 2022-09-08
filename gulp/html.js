import gulp from 'gulp';
import gutil from 'gulp-util';
import gif from 'gulp-if';
import rename from 'gulp-rename';
import htmlmin from 'gulp-minify-html';
import hbs from 'gulp-hb';
import {
  opts, config, version, development,
} from './shared';

export function main() {
  return gulp.src('./app/index.hbs')
    .pipe(hbs({
      data: {
        version,
        development,
        zendeskEnabled: config.get('zendeskEnabled'),
        analyticsEnabled: config.get('analyticsEnabled'),
        gaId: config.get('gaId'),
        cdn: config.get('cdn'),
      },
    }))
    .pipe(rename((p) => {
      p.extname = '.html';
      return p.extname;
    }))
    .pipe(gif(opts.minify, htmlmin()))
    .pipe(gulp.dest('dist/src'));
}

export function register() {
  return gulp.src('./app/index.register.hbs')
    .pipe(hbs({
      data: {
        version,
        development,
        zendeskEnabled: config.get('zendeskEnabled'),
        analyticsEnabled: config.get('analyticsEnabled'),
        gaId: config.get('gaId'),
        cdn: config.get('cdn'),
      },
    }))
    .pipe(rename((p) => {
      p.extname = '.html';
      p.basename = 'register';
    }))
    .pipe(gif(opts.minify, htmlmin()))
    .pipe(gulp.dest('dist/src'));
}
