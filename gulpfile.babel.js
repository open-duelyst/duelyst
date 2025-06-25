// fix for EMFILE issues on windows, linux, and mac
import 'coffeescript/register';
import 'app-module-path/register';

import gulp from 'gulp';
import gutil from 'gulp-util';
// import autowatch from 'gulp-autowatch';
import bundle from './gulp/bundler';
import bundleRegister from './gulp/bundler.register';
import css from './gulp/css';
import * as html from './gulp/html';
import vendor from './gulp/vendor';
import bump from './gulp/bump';
import * as clean from './gulp/clean';
import * as rsx from './gulp/rsx';
import * as revision from './gulp/revision';
import * as cdn from './gulp/cdn';
import * as git from './gulp/git';
import * as docker from './gulp/docker';
import * as localization from './gulp/localization';
import {
  opts, config, env, version, production, staging, development,
} from './gulp/shared';

const os = require('os');

if (os.platform() === 'win32' || os.platform() === 'linux' || os.platform() === 'darwin') {
  const fs = require('fs');
  const gracefulFs = require('graceful-fs');
  gracefulFs.gracefulify(fs);
}

gutil.log(`${gutil.colors.red(`GULP :: env: ${env} :: version: ${version}`)}`);
// gutil.log(`${gutil.colors.yellow(`GULP :: watch = ${opts.watch}`)}`);
gutil.log(`${gutil.colors.yellow(`GULP :: minification = ${opts.minify}`)}`);

// Define main tasks
gulp.task('clean:all', clean.all);
gulp.task('clean:app', clean.app);
gulp.task('clean:web', clean.web);
gulp.task('clean:locales', clean.locales);
gulp.task('clean:git', clean.git);
gulp.task('css', css);
gulp.task('html', html.main);
gulp.task('html:register', html.register);
gulp.task('js', bundle);
gulp.task('js:register', bundleRegister);
gulp.task('vendor', vendor);
gulp.task('rsx:imagemin', rsx.imageMin);
gulp.task('rsx:imagemin:lossy', rsx.imageMinLossy);
gulp.task('rsx:copy', rsx.copy);
gulp.task('rsx:copy:web', rsx.copyWeb);
gulp.task('rsx:copy:cdn', gulp.series(rsx.copyCdn, rsx.copyWeb));
gulp.task('rsx:copy:all', rsx.copyAll);
gulp.task('rsx:packages', rsx.packages);
gulp.task('rsx', gulp.series(rsx.packages, rsx.copy));
gulp.task('rsx:source_urls', rsx.sourceUrls);
gulp.task('rsx:build_urls', rsx.buildUrls);
gulp.task('rsx:codex_urls', rsx.codexUrls);
gulp.task('revision:generate', revision.generate);
gulp.task('revision:replace', revision.replace);
gulp.task('cdn:upload:main', cdn.main);
gulp.task('cdn:upload:audio', cdn.audio);
gulp.task('cdn:upload:main:versioned', () => cdn.main(version));
gulp.task('cdn:upload:audio:versioned', () => cdn.audio(version));
gulp.task('cdn:upload:all', cdn.allAssets);
gulp.task('cdn:upload:web', cdn.webAssets);
gulp.task('changelog', git.changelog);
gulp.task('docker:build', docker.build);
gulp.task('docker:tag', docker.tag);
gulp.task('docker:push', docker.push);
gulp.task('localization:copy', localization.copy);

// Define git helper tasks (master,staging,production)
const branches = ['master', 'staging', 'production'];
branches.forEach((branch) => {
  gulp.task(`git:checkout:${branch}`, (cb) => git.checkout(branch, cb));
  gulp.task(`git:commit:${branch}`, () => git.commit(branch));
  gulp.task(`git:push:${branch}`, (cb) => git.push(branch, cb));
  gulp.task(`git:tag:${branch}`, (cb) => git.tag(branch, cb));
  if (branch !== 'master') {
    gulp.task(`git:merge:${branch}`, (cb) => git.merge(branch, cb));
    gulp.task(`git:${branch}`, gulp.series(
      `git:merge:${branch}`,
      `git:commit:${branch}`,
      `git:push:${branch}`,
      `git:tag:${branch}`,
    ));
  }
});

// Define bump tasks (patch,minor,major)
const bumps = ['patch', 'minor', 'major'];
bumps.forEach((type) => {
  gulp.task(`bump:${type}`, () => bump(type));
  gulp.task(`git:master:${type}`, gulp.series(
    'git:checkout:master',
    `bump:${type}`,
    'git:commit:master',
    'git:push:master',
    'git:tag:master',
  ));
});

// watchPaths Does not apply to Browserify bundler
// only for css, html, vendor
const watchPaths = {
  html: './app/index.hbs',
  css: './app/ui/**/*.scss',
  vendor: [
    './node_modules/jquery/dist/jquery.js',
    './node_modules/velocity-animate/velocity.js',
    './node_modules/bootstrap-sass/assets/javascripts/bootstrap.js',
    './node_modules/underscore/underscore.js',
    './node_modules/backbone/backbone.js',
    './packages/backfire/dist/backfire.min.js',
    './node_modules/backbone.marionette/lib/backbone.marionette.js',
    './app/vendor/jquery_ui/jquery-ui.min.js',
    './app/vendor/ccConfig.js',
    './app/vendor/cocos2d-html5/lib/cocos2d-js-v3.3-beta0.js',
    './app/vendor/aws/aws-sdk.min.js',
    './app/vendor/aws/aws-sdk-mobile-analytics.min.js',
  ],
};

/* Disable autowatch for now (--watch=false conflicts with --watch in Node.js v18+).
gulp.task('autowatch', (cb) => {
  if (opts.watch) {
    autowatch(gulp, watchPaths);
  }
  cb();
});
*/

// Define aliases for task groupings
gulp.task('source', gulp.series(
  validateFirebase,
  gulp.parallel('vendor', 'css', 'html'),
  'localization:copy',
  'rsx:packages',
  'js',
));
gulp.task('build', gulp.series(
  'clean:all',
  'source',
  'rsx:copy',
  'rsx:copy:web',
  // 'autowatch',
));
gulp.task('build:withallrsx', gulp.series(
  'clean:all',
  'source',
  'rsx:copy:all',
  'rsx:copy:web',
  // 'autowatch',
));
gulp.task('build:app', gulp.series(
  validateFirebase,
  'clean:app',
  'js',
));
gulp.task('build:web', gulp.series(
  'clean:web',
  'clean:locales',
  'html',
  'css',
  'vendor',
  'localization:copy',
));

// register standalone page
gulp.task('source:register', gulp.series(gulp.parallel('vendor', 'css', 'html:register'), 'localization:copy', 'rsx:packages', 'js:register'));
gulp.task('build:register', gulp.series(
  'clean:all',
  'source:register',
  'rsx:copy',
  'rsx:copy:cdn',
  // 'autowatch',
));
gulp.task('default', gulp.series('build'));

// Release Builds (CI ready tasks)
const ciTargets = ['staging', 'production'];

function validateFirebase(cb) {
  // Ensure FIREBASE_URL is set and valid when building the app.
  if (process.env.FIREBASE_URL === undefined) {
    return cb(new Error('FIREBASE_URL must be set'));
  }
  if (!process.env.FIREBASE_URL.endsWith('firebaseio.com/')) {
    return cb(new Error('FIREBASE_URL must end in firebaseio.com/'));
  }
  return cb();
}

function validateConfig(cb) {
  // Ensure running build:release:${target} matches running config environemnt
  // ie staging => config.get('env') === staging => staging.json
  if (!production && !staging) {
    return cb(new Error('Current NODE_ENV not supported'));
  }
  return cb();
}

gulp.task('build:release', gulp.series(
  validateConfig,
  'clean:all',
  'source',
  'source:register',
  'rsx:build_urls',
  'revision:generate',
  'revision:replace',
  'rsx:source_urls',
));
gulp.task('cdn:upload:release', gulp.series(
  'rsx:copy',
  'rsx:copy:cdn',
  'cdn:upload:main',
  'cdn:upload:audio',
));
gulp.task('build:release:versioned', gulp.series(
  validateConfig,
  'clean:all',
  'source',
  'source:register',
  'rsx:build_urls',
  'revision:generate',
  'revision:replace',
  'rsx:source_urls',
));
gulp.task('cdn:upload:release:versioned', gulp.series(
  'rsx:copy',
  'rsx:copy:cdn',
  'cdn:upload:main:versioned',
  'cdn:upload:audio:versioned',
));
