import gulp from 'gulp';
import gutil from 'gulp-util';
import size from 'gulp-size';
import changed from 'gulp-changed';
import replace from 'gulp-replace';
import _ from 'underscore';
import fs from 'fs';
import { exec } from 'child_process';
import { config } from './shared';

export function consolidate(locale) {
  const all = require('require-dir')(`${__dirname}/../app/localization/locales/${locale}`);
  // exclude data from any previous index.json
  delete all.index;

  fs.writeFileSync(`${__dirname}/../app/localization/locales/${locale}/index.json`, JSON.stringify(all), 'utf8');
}

export function copy() {
  // consolidate all individual language parts into index.json
  consolidate('en');
  return gulp.src('app/localization/locales/**/index.json')
    .pipe(gulp.dest('dist/src/resources/locales'));
}
