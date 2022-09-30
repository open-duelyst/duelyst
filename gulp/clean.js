import gulp from 'gulp';
import del from 'del';

// Cleans out all build output folders folder
export function all() {
  return del([
    'dist',
  ]);
}

// Cleans out app code only
export function app() {
  return del('dist/src/duelyst.js');
}

// Cleans out HTML/CSS only
export function web() {
  return del([
    'dist/src/duelyst.css',
    'dist/src/index.html',
    'dist/src/vendor.js',
  ]);
}

// Cleans out localization files only
export function locales() {
  return del('dist/src/resources/locales');
}

// Cleans out git remotes from the dist folder
export function git() {
  return del('dist/git-remotes');
}
