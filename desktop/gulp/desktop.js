import os from 'os';
import path from 'path';
import gulp from 'gulp';
import gutil from 'gulp-util';
import rename from 'gulp-rename';
import jeditor from 'gulp-json-editor';
import tap from 'gulp-tap';
import ncp from 'ncp';
// import hasha from 'hasha';
import readPkg from 'read-pkg';
import packager from 'electron-packager';
import rebuild from 'electron-rebuild';
import { exec, execSync } from 'child_process';
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
    arch: opts.arch || 'all',
    electronVersion: '2.0.18', // First version with JS Exponentiation support.
    // electronVersion: '11.5.0', // First version with support for darwin-arm64.
    // electronVersion: '21.0.1', // Latest version.
    asar: false,
    prune: true,
    overwrite: true,
    icon: 'icon',
    appCopyright: 'Creative Commons CC0 1.0 Universal',
    appVersion: desktopPkgJson.version,
    // windows
    win32metadata: {
      CompanyName: 'OpenDuelyst',
      ProductName: desktopPkgJson.productName,
      FileDescription: desktopPkgJson.productName,
      OriginalFilename: `${desktopPkgJson.productName}.exe`,
    },
    // macos
    appBundleId: desktopPkgJson.productName,
    appCategoryType: 'public.app-category.games',
    helperBundleId: `${desktopPkgJson.productName} Helper`,
    protocols: [
      /*
      {
        name: 'discord-duelyst',
        schemes: ['discord-357706468843061258'],
      },
      */
      {
        name: 'duelyst',
        schemes: ['duelyst'],
      },
    ],
    // afterCopy does not work with Electron 1.2.3. Works on v11+.
    /*
    afterCopy: [(buildPath, electronVersion, platform, arch, callback) => {
      rebuild({ buildPath, electronVersion, arch, force: true })
      .then(() => {
        gutil.log(`Electron native modules rebuilt for ${platform}-${arch}`)
        callback()
     })
      .catch((error) => callback(error))
    }]
    */
  };
  return packager(packagerOpts, cb);
}

// Build the desktop app for the desired platform
export function zip(opts, cb) {
  if (os.platform() !== 'darwin') {
    gutil.log('This task currently only works on Mac');
    return cb();
  }

  // Use 'friendly' names for platforms.
  const friendlyNames = {
    darwin: 'mac',
    linux: 'linux',
    win32: 'windows',
  };

  const desktopPkgJson = readPkg.sync('package.json');
  const baseDir = `dist/build/${desktopPkgJson.productName}-${opts.platform}-${opts.arch}`;
  const zipTarget = `dist/build/${desktopPkgJson.name}-v${desktopPkgJson.version}-${friendlyNames[opts.platform]}-${opts.arch}.zip`;

  if (opts.platform === 'darwin') {
    // Add symlink named 'Electron' to actual binary
    const macAppDir = `${baseDir}/${desktopPkgJson.productName}.app`;
    execSync(`cd ${macAppDir}/Contents/MacOS/ && ln -fs ${desktopPkgJson.productName} Electron`);

    const dittoCmd = `ditto -c -k --sequesterRsrc --keepParent ${macAppDir} ${zipTarget}`;
    return exec(dittoCmd, cb);
  }
  if (opts.platform === 'linux' || opts.platform === 'win32') {
    const dittoCmd = `ditto -c -k --sequesterRsrc ${baseDir} ${zipTarget}`;
    return exec(dittoCmd, cb);
  }
  console.log(`Unrecognized platform ${opts.platform}; doing nothing`);
  return cb();
}

/*
// Create new .SHA1SUM file, contains SHA1 hash + '  ' + filename
// eg: duelyst-staging-v1.0.38-darwin-x64.zip.SHA1SUM contains
// 10406a22124b4a0a9c32b34e3682ba601c6578ce  duelyst-staging-v1.0.38-darwin-x64.zip
export function shasums(cb) {
  if (!production && !staging) {
    return cb(new Error('Current NODE_ENV not supported'));
  }
  return gulp.src('dist/build/*.zip')
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
    .pipe(gulp.dest('dist/build'));
}
*/
