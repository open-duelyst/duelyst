import gulp from 'gulp';
import del from 'del';

// Cleans out all build output folders folder
export function all() {
  return del([
    'src',
    'node_modules',
  ]);
}
