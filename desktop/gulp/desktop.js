import os from 'os';
import path from 'path';
import gulp from 'gulp';
import gutil from 'gulp-util';
import rename from 'gulp-rename';
import jeditor from 'gulp-json-editor';
import tap from 'gulp-tap';
import ncp from 'ncp';
import async from 'async';
import hasha from 'hasha';
import readPkg from 'read-pkg';
import packager from 'electron-packager';
import rebuild from 'electron-rebuild';
import { exec, execSync } from 'child_process';
import steamcmd from '@counterplay/steamcmd';
import Promise from 'bluebird';
import {
  config, version, production, staging,
} from './shared';

const ncpAsync = Promise.promisify(ncp);

// Installs the desktop's Yarn packages
export function yarn(cb) {
  execSync('yarn install');
  cb();
}

// Rewrites the desktop package.json based on env
export function setup(cb) {
  if (!production && !staging) {
    return cb(new Error('Current NODE_ENV not supported'));
  }
  return gulp.src('package.json')
    .pipe(jeditor((json) => {
      if (staging) { json.name = 'duelyst-staging'; }
      if (production) { json.name = 'duelyst'; }
      return json;
    }))
    .pipe(gulp.dest('dist/'));
}

// Copy over the /dist source to the /desktop folder for packaging
export function copy() {
  gutil.log('Using parent directory ../dist/ as input for desktop build');
  gutil.log('Ensure ../dist/ is compiled correctly');
  gutil.log('Ensure ../dist/resources/ is present (gulp rsx:copy before)');
  return ncpAsync('../dist/src/', 'dist/src');
}

// Build the desktop app for the desired platform
export function build(opts, cb) {
  const desktopPkgJson = readPkg.sync('.');
  const packagerOpts = {
    dir: '.',
    out: 'dist/build',
    name: desktopPkgJson.productName,
    platform: opts.platform,
    // by default symlinks are removed, we need to preserve for macOS
    derefSymlinks: opts.platform !== 'darwin',
    arch: 'all',
    electronVersion: '1.2.3',
    asar: false,
    prune: true,
    overwrite: true,
    icon: 'desktop/icon',
    appCopyright: '2016 Counterplay Games Inc.',
    appVersion: desktopPkgJson.version,
    // windows
    win32metadata: {
      CompanyName: 'Counterplay Games Inc.',
      ProductName: desktopPkgJson.productName,
      FileDescription: desktopPkgJson.productName,
      OriginalFilename: `${desktopPkgJson.productName}.exe`,
    },
    // macos
    appBundleId: desktopPkgJson.productName,
    appCategoryType: 'public.app-category.games',
    helperBundleId: `${desktopPkgJson.productName} Helper`,
    protocols: [
      {
        name: 'discord-duelyst',
        schemes: ['discord-357706468843061258'],
      },
      {
        name: 'duelyst',
        schemes: ['duelyst'],
      },
    ],
    // afterCopy: [(buildPath, electronVersion, platform, arch, callback) => {
    //   rebuild({ buildPath, electronVersion, arch, force: true })
    //   .then(() => {
    //     gutil.log(`Electron native modules rebuilt for ${platform}-${arch}`)
    //     callback()
    //   })
    //   .catch((error) => callback(error))
    // }]
  };
  return packager(packagerOpts, cb);
}

// Build the desktop app for the desired platform
export function zip(platform, cb) {
  if (os.platform() !== 'darwin') {
    gutil.log('This task currently only works on Mac');
    return cb();
  }
  const desktopPkgJson = readPkg.sync('./desktop');
  if (platform === 'darwin') {
    // Add symlink named 'Electron' to actual binary
    execSync(`cd dist/desktop/${desktopPkgJson.productName}-darwin-x64/${desktopPkgJson.productName}.app/Contents/MacOS/ && ln -fs ${desktopPkgJson.productName} Electron`);
    const execPath = `ditto -c -k --sequesterRsrc --keepParent dist/desktop/${desktopPkgJson.productName}-darwin-x64/${desktopPkgJson.productName}.app dist/desktop/${desktopPkgJson.name}-v${desktopPkgJson.version}-darwin-x64.zip`;
    return exec(execPath, cb);
  }
  if (platform === 'win32') {
    const execPath1 = `ditto -c -k --sequesterRsrc dist/desktop/${desktopPkgJson.productName}-win32-x64 dist/desktop/${desktopPkgJson.name}-v${desktopPkgJson.version}-win32-x64.zip`;
    const execPath2 = `ditto -c -k --sequesterRsrc dist/desktop/${desktopPkgJson.productName}-win32-ia32 dist/desktop/${desktopPkgJson.name}-v${desktopPkgJson.version}-win32-ia32.zip`;
    return async.series([
      (cb) => exec(execPath1, cb),
      (cb) => exec(execPath2, cb),
    ], cb);
  }
  return cb();
}

// Build the desktop app for the desired platform
// Create new .SHA1SUM file, contains SHA1 hash + '  ' + filename
// eg: duelyst-staging-v1.0.38-darwin-x64.zip.SHA1SUM contains
// 10406a22124b4a0a9c32b34e3682ba601c6578ce  duelyst-staging-v1.0.38-darwin-x64.zip
export function shasums(cb) {
  if (!production && !staging) {
    return cb(new Error('Current NODE_ENV not supported'));
  }
  return gulp.src('dist/desktop/*.zip')
    .pipe(tap((file) => {
      file.contents = Buffer.concat([
        Buffer.from(hasha(file.contents, { encoding: 'hex', algorithm: 'sha1' })),
        Buffer.from('  '),
        Buffer.from(path.basename(file.path)),
      ]);
      return file.contents;
    }))
    .pipe(rename((p) => {
      p.extname = '.zip.SHA1SUM';
      return p.extname;
    }))
    .pipe(gulp.dest('dist/desktop'));
}

// Prep the macOS app for Steam
export function steamPrep() {
  const desktopPkgJson = readPkg.sync('./desktop');
  return steamcmd.appPrep({
    force: true,
    appId: config.get('steam').appId,
    source: `./dist/desktop/${desktopPkgJson.productName}-darwin-x64/${desktopPkgJson.productName}.app`,
    destination: `./dist/desktop/${desktopPkgJson.productName}-darwin-x64-steam/`,
    executable: `Contents/MacOS/${desktopPkgJson.productName}`,
  });
}

// Upload the app to Steam using our .vdf config files
export function steamUpload() {
  return steamcmd.appBuild({
    username: process.env.STEAM_USERNAME,
    password: process.env.STEAM_PASSWORD,
    appVdf: production ? './config/steam/app_291410.vdf' : './config/steam/app_staging_291410.vdf',
  });
}
