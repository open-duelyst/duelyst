import del from 'del';
import gulp from 'gulp';
import * as desktop from './gulp/desktop';
import { production, staging } from './gulp/shared';

function validateConfigForDesktop(cb) {
  if (!production && !staging) {
    return cb(new Error('Current NODE_ENV not supported'));
  }
  return cb();
}

gulp.task('clean:all', () => del(['dist', 'node_modules']));

// Manually define platforms and architectures for build tasks.
gulp.task('desktop:build:darwin:x64', (cb) => desktop.build({ platform: 'darwin', arch: 'x64' }, cb));
gulp.task('desktop:build:darwin:arm64', (cb) => desktop.build({ platform: 'darwin', arch: 'arm64' }, cb));
gulp.task('desktop:build:win32', (cb) => desktop.build({ platform: 'win32' }, cb));

// Automatically define platforms for Steam & packaging tasks.
['darwin', 'win32'].forEach((platform) => {
  // Temporarily disable Steam & packaging steps.
  // gulp.task(`desktop:build:steam:${platform}`, (cb) => desktop.build({ platform, steam: true }, cb));
  // gulp.task(`desktop:zip:${platform}`, (cb) => desktop.zip(platform, cb));
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
  // 'source',
  // 'rsx:codex_urls',
  // 'rsx:copy',
  'desktop:setup',
  'desktop:yarn',
  'desktop:copy',
  'desktop:build:darwin:x64',
  // 'desktop:build:darwin:arm64', // Requires Electron v11.
  // 'desktop:build:win32',
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
  // 'rsx:packages',
  // 'source',
  // 'rsx:copy',
  'desktop:copy',
));
