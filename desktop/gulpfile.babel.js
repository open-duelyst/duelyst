import gulp from 'gulp';
import * as clean from './gulp/clean';
import * as desktop from './gulp/desktop';
import { production, staging } from './gulp/shared';

const desktopPlatforms = ['darwin', 'win32'];

function validateConfigForDesktop(cb) {
  if (!production && !staging) {
    return cb(new Error('Current NODE_ENV not supported'));
  }
  return cb();
}

gulp.task('clean:all', clean.all);

desktopPlatforms.forEach((platform) => {
  gulp.task(`desktop:build:${platform}`, (cb) => desktop.build({ platform }, cb));
  // Temporarily disable Steam & packaging steps.
  //gulp.task(`desktop:build:steam:${platform}`, (cb) => desktop.build({ platform, steam: true }, cb));
  //gulp.task(`desktop:zip:${platform}`, (cb) => desktop.zip(platform, cb));
});

gulp.task('desktop:copy', desktop.copy);
gulp.task('desktop:yarn', desktop.yarn);
gulp.task('desktop:shasums', desktop.shasums);
gulp.task('desktop:setup', desktop.setup);

/* Git tasks temporarily disabled.
gulp.task('desktop:git:clone', git.desktopClone);
gulp.task('desktop:git:sync', git.desktopSync);
gulp.task('desktop:git:commit', git.desktopCommit);
gulp.task('desktop:git:push', git.desktopPush);
gulp.task('desktop:git:diff', git.desktopDiff);
gulp.task('desktop:git:publish', git.desktopPublish);
gulp.task('desktop:git', gulp.series(
  'clean:git',
  'desktop:git:clone',
  'desktop:git:sync',
  'desktop:git:commit',
  'desktop:git:push',
  'desktop:git:diff',
));
*/

gulp.task('desktop:build', gulp.series(
  validateConfigForDesktop,
  'clean:all',
  //'source',
  //'rsx:codex_urls',
  //'rsx:copy',
  'desktop:setup',
  'desktop:yarn',
  'desktop:copy',
  'desktop:build:darwin',
  //'desktop:build:win32',
));

/* Steam & packaging tasks temporarily disabled.
gulp.task('desktop:build:steam', gulp.series(
  validateConfigForDesktop,
  'clean:all',
  'source',
  'rsx:codex_urls',
  'rsx:copy',
  'desktop:setup',
  'desktop:yarn',
  'desktop:copy',
  'desktop:build:steam:darwin',
  'desktop:build:steam:win32',
));

gulp.task('desktop:package', gulp.series(
  'desktop:zip:darwin',
  'desktop:zip:win32',
  'desktop:git',
  'desktop:shasums',
  'desktop:git:publish',
));

gulp.task('desktop:package:steam', gulp.series(
  desktop.steamPrep,
  desktop.steamUpload,
));
*/

gulp.task('desktop:build:dev', gulp.series(
  //'rsx:packages',
  //'source',
  //'rsx:copy',
  'desktop:copy',
));
