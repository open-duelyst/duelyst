// fix for EMFILE issues on windows, linux, and mac
import 'coffee-script/register';
import 'app-module-path/register';

import gulp from 'gulp';
import gutil from 'gulp-util';
import autowatch from 'gulp-autowatch';
import bundle from './gulp/bundler';
import bundleRegister from './gulp/bundler.register';
import css from './gulp/css';
import * as html from './gulp/html';
import vendor from './gulp/vendor';
import bump from './gulp/bump';
import * as clean from './gulp/clean';
import * as rsx from './gulp/rsx';
import * as revision from './gulp/revision';
import * as upload from './gulp/upload';
import * as desktop from './gulp/desktop';
import * as git from './gulp/git';
import * as docker from './gulp/docker';
import * as localization from './gulp/localization';
// import * as cdn from './gulp/cdn'
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
gutil.log(`${gutil.colors.yellow(`GULP :: watch = ${opts.watch}`)}`);
gutil.log(`${gutil.colors.yellow(`GULP :: minification = ${opts.minify}`)}`);

// Define main tasks
gulp.task('clean:all', clean.all);
gulp.task('clean:app', clean.app);
gulp.task('clean:web', clean.web);
gulp.task('clean:locales', clean.locales);
gulp.task('clean:desktop', clean.desktop);
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
// gulp.task('rsx:copy:cdn', rsx.copyCdn)
gulp.task('rsx:copy:all', rsx.copyAll);
gulp.task('rsx:packages', rsx.packages);
gulp.task('rsx', gulp.series(rsx.packages, rsx.copy));
gulp.task('rsx:source_urls', rsx.sourceUrls);
gulp.task('rsx:build_urls', rsx.buildUrls);
gulp.task('rsx:codex_urls', rsx.codexUrls);
gulp.task('revision:generate', revision.generate);
gulp.task('revision:replace', revision.replace);
gulp.task('upload:main', upload.main);
gulp.task('upload:audio', upload.audio);
gulp.task('upload:main:versioned', () => upload.main(version));
gulp.task('upload:audio:versioned', () => upload.audio(version));
gulp.task('changelog', git.changelog);
gulp.task('docker:build', docker.build);
gulp.task('docker:tag', docker.tag);
gulp.task('docker:push', docker.push);
gulp.task('localization:copy', localization.copy);
// gulp.task('cdn:purgeAll', cdn.purgeAll)
// gulp.task('cdn:purgeLocalization', cdn.purgeLocalization)

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

// Define desktop tasks
const desktopPlatforms = ['darwin', 'win32'];
desktopPlatforms.forEach((platform) => {
  gulp.task(`desktop:build:${platform}`, (cb) => desktop.build({ platform }, cb));
  gulp.task(`desktop:build:steam:${platform}`, (cb) => desktop.build({ platform, steam: true }, cb));
  gulp.task(`desktop:zip:${platform}`, (cb) => desktop.zip(platform, cb));
});
gulp.task('desktop:copy', desktop.copy);
gulp.task('desktop:npm', desktop.npm);
gulp.task('desktop:shasums', desktop.shasums);
gulp.task('desktop:setup', desktop.setup);
gulp.task('desktop:git:clone', git.desktopClone);
gulp.task('desktop:git:sync', git.desktopSync);
gulp.task('desktop:git:commit', git.desktopCommit);
gulp.task('desktop:git:push', git.desktopPush);
// gulp.task('desktop:git:diff', git.desktopDiff);
// gulp.task('desktop:git:publish', git.desktopPublish);
gulp.task('desktop:git', gulp.series(
  'clean:git',
  'desktop:git:clone',
  'desktop:git:sync',
  'desktop:git:commit',
  'desktop:git:push',
  // 'desktop:git:diff',
));

// watchPaths Does not apply to Browserify bundler
// only for css, html, vendor
const watchPaths = {
  html: './app/index.hbs',
  css: './app/ui/**/*.scss',
  vendor: [
    './node_modules/@bower_components/jquery/jquery.js',
    './node_modules/@bower_components/velocity/velocity.js',
    './node_modules/@bower_components/bootstrap-sass-official/assets/javascripts/bootstrap.js',
    './node_modules/@bower_components/underscore/underscore.js',
    './node_modules/@bower_components/backbone/backbone.js',
    './node_modules/@bower_components/backfire/dist/backfire.js',
    './node_modules/@bower_components/backbone.marionette/lib/backbone.marionette.js',
    './app/vendor/jquery_ui/jquery-ui.min.js',
    './app/vendor/ccConfig.js',
    './app/vendor/cocos2d-html5/lib/cocos2d-js-v3.3-beta0.js',
    './app/vendor/aws/aws-sdk.min.js',
    './app/vendor/aws/aws-sdk-mobile-analytics.min.js',
  ],
};
gulp.task('autowatch', (cb) => {
  if (opts.watch) {
    autowatch(gulp, watchPaths);
  }
  cb();
});

// Define aliases for task groupings
gulp.task('source', gulp.series(gulp.parallel('vendor', 'css', 'html'), 'localization:copy', 'rsx:packages', 'js'));
gulp.task('build', gulp.series(
  'clean:all',
  'source',
  'rsx:copy',
  // Instead of copying web assets to CDN, copy to dist.
  // 'rsx:copy:cdn',
  'rsx:copy:web',
  'autowatch',
));
gulp.task('build:app', gulp.series(
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
  // 'rsx:copy:cdn',
  'autowatch',
));
gulp.task('default', gulp.series('build'));

// Release Builds (CI ready tasks)
const ciTargets = ['staging', 'production'];
// const cdnUrl = config.get('cdn')

function validateConfig(cb) {
  // Ensure running build:release:${target} matches running config environemnt
  // ie staging => config.get('env') === staging => staging.json
  if (!production && !staging) {
    return cb(new Error('Current NODE_ENV not supported'));
  }
  // Can check if current working branch matches env
  // ie staging => git branch is staging
  // if (env !== git.getCurrentBranch()) {
  //   return cb(new Error('Branch does not match NODE_ENV'))
  // }
  return cb();
}
function validateConfigForDesktop(cb) {
  if (!production && !staging) {
    return cb(new Error('Current NODE_ENV not supported'));
  }
  return cb();
}

/*
function overrideCdnUrl(cb) {
  // We override the CDN url here
  // to prevent the CSS task from using for desktop app
  config.set('cdn', '')
  cb()
}
function restoreCdnUrl(cb) {
  // We restore the CDN url here in case other tasks need it
  config.set('cdn', cdnUrl)
  cb()
}
function versionedCdnUrl(cb) {
  // We override the CDN url with a version specific one
  const cdnUrl = `${config.get('cdn')}/v${version}`
  config.set('cdn', cdnUrl)
  cb()
}
*/

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
gulp.task('upload:release', gulp.series(
  'rsx:copy',
  // 'rsx:copy:cdn',
  'upload:main',
  'upload:audio',
));
gulp.task('build:release:versioned', gulp.series(
  validateConfig,
  'clean:all',
  // versionedCdnUrl,
  'source',
  'source:register',
  'rsx:build_urls',
  'revision:generate',
  'revision:replace',
  'rsx:source_urls',
));
gulp.task('upload:release:versioned', gulp.series(
  'rsx:copy',
  // 'rsx:copy:cdn',
  'upload:main:versioned',
  'upload:audio:versioned',
));
gulp.task('desktop:build', gulp.series(
  validateConfigForDesktop,
  'clean:all',
  // overrideCdnUrl,
  'source',
  // restoreCdnUrl,
  'rsx:codex_urls',
  'rsx:copy',
  'desktop:setup',
  'desktop:npm',
  'desktop:copy',
  'desktop:build:darwin',
  'desktop:build:win32',
));
gulp.task('desktop:build:steam', gulp.series(
  validateConfigForDesktop,
  'clean:all',
  // overrideCdnUrl,
  'source',
  // restoreCdnUrl,
  'rsx:codex_urls',
  'rsx:copy',
  'desktop:setup',
  'desktop:npm',
  'desktop:copy',
  'desktop:build:steam:darwin',
  'desktop:build:steam:win32',
));
gulp.task('desktop:package', gulp.series(
  'desktop:zip:darwin',
  'desktop:zip:win32',
  'desktop:git',
  'desktop:shasums',
  // 'desktop:git:publish',
));
gulp.task('desktop:package:steam', gulp.series(
  desktop.steamPrep,
  desktop.steamUpload,
));
gulp.task('desktop:build:dev', gulp.series(
  'rsx:packages',
  'source',
  'rsx:copy',
  'desktop:copy',
));
