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
gulp.task('desktop:copy', desktop.copy);
gulp.task('desktop:yarn', desktop.yarn);
// gulp.task('desktop:shasums', desktop.shasums);
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

// Build the Mac desktop client.
gulp.task('desktop:build:darwin:x64', (cb) => desktop.build({ platform: 'darwin', arch: 'x64' }, cb));
gulp.task('desktop:zip:darwin:x64', (cb) => desktop.zip({ platform: 'darwin', arch: 'x64' }, cb));
gulp.task('desktop:build:mac', gulp.series(
  validateConfigForDesktop,
  'clean:all',
  'desktop:setup',
  'desktop:yarn',
  'desktop:copy',
  'desktop:build:darwin:x64',
));

// Build the Mac M1 desktop client.
gulp.task('desktop:build:darwin:arm64', (cb) => desktop.build({ platform: 'darwin', arch: 'arm64' }, cb));
gulp.task('desktop:zip:darwin:arm64', (cb) => desktop.zip({ platform: 'darwin', arch: 'arm64' }, cb));
gulp.task('desktop:build:macm1', gulp.series(
  validateConfigForDesktop,
  'clean:all',
  'desktop:setup',
  'desktop:yarn',
  'desktop:copy',
  'desktop:build:darwin:arm64',
));

// Build the Linux desktop client.
gulp.task('desktop:build:linux:x64', (cb) => desktop.build({ platform: 'linux', arch: 'x64' }, cb));
gulp.task('desktop:zip:linux:x64', (cb) => desktop.zip({ platform: 'linux', arch: 'x64' }, cb));
gulp.task('desktop:build:linux', gulp.series(
  validateConfigForDesktop,
  'clean:all',
  'desktop:setup',
  'desktop:yarn',
  'desktop:copy',
  'desktop:build:linux:x64',
));

// Build the Windows desktop client.
gulp.task('desktop:build:win32:x64', (cb) => desktop.build({ platform: 'win32', arch: 'x64' }, cb));
gulp.task('desktop:zip:win32:x64', (cb) => desktop.zip({ platform: 'win32', arch: 'x64' }, cb));
gulp.task('desktop:build:windows', gulp.series(
  validateConfigForDesktop,
  'clean:all',
  'desktop:setup',
  'desktop:yarn',
  'desktop:copy',
  'desktop:build:win32:x64',
));

// Build all available desktop clients.
gulp.task('desktop:build', gulp.series(
  validateConfigForDesktop,
  'clean:all',
  'desktop:setup',
  'desktop:yarn',
  'desktop:copy',
  'desktop:build:darwin:x64',
  // 'desktop:build:darwin:arm64', // Requires Electron v11.
  'desktop:build:linux:x64',
  'desktop:build:win32:x64',
));

gulp.task('desktop:package', gulp.series(
  'desktop:zip:darwin:x64',
  // 'desktop:zip:darwin:arm64',
  'desktop:zip:linux:x64',
  'desktop:zip:win32:x64',
  // 'desktop:git',
  // 'desktop:shasums',
  // 'desktop:git:publish',
));
