import fs from 'fs';
import gulp from 'gulp';
import awspublish from 'gulp-awspublish';
import parallelize from 'concurrent-transform';
import filter from 'gulp-filter';
import rename from 'gulp-rename';
import size from 'gulp-size';
import semver from 'semver';
import {
  config, env, production, staging,
} from './shared';

// GZIP ENABLED
// If version is provided, upload will be written to subdir, ie: /staging/v54x/
// Otherwise it is dumped into root directory, ie: /staging/
export function main(version, cb) {
  if (!production && !staging) {
    throw new Error('Current NODE_ENV not supported');
  }
  const publisher = awspublish.create(config.get('s3'));
  const filtered = filter(['**/*', '!**/*.mp4', '!**/*.m4a']);
  return gulp.src(['dist/src/**/*'])
    .pipe(filtered)
    .pipe(rename((p) => {
      if (semver.valid(version)) {
        p.dirname = `/${env}/v${version}/${p.dirname}`;
        return p.dirname;
      }
      p.dirname = `/${env}/${p.dirname}`;
      return p.dirname;
    }))
    .pipe(awspublish.gzip())
    .pipe(parallelize(publisher.publish(), 10))
    .pipe(publisher.cache())
    .pipe(awspublish.reporter());
}

// NO GZIP
// If version is provided, upload will be written to subdir, ie: /staging/v54x/
// Otherwise it is dumped into root directory, ie: /staging/
export function audio(version, cb) {
  if (!production && !staging) {
    throw new Error('Current NODE_ENV not supported');
  }
  const publisher = awspublish.create(config.get('s3'));
  const filtered = filter(['**/*.mp4', '**/*.m4a']);
  return gulp.src(['dist/src/**/*'])
    .pipe(filtered)
    .pipe(rename((p) => {
      if (semver.valid(version)) {
        p.dirname = `/${env}/v${version}/${p.dirname}`;
        return p.dirname;
      }
      p.dirname = `/${env}/${p.dirname}`;
      return p.dirname;
    }))
    .pipe(parallelize(publisher.publish(), 2))
    .pipe(publisher.cache())
    .pipe(awspublish.reporter());
}

export function stagingcdn() {
  const publisher = awspublish.create({
    region: config.get('assetsBucket.region'),
    params: {
      Bucket: config.get('assetsBucket.name'),
    },
    credentials: {
      accessKeyId: config.get('assetsBucket.accessKey'),
      secretAccessKey: config.get('assetsBucket.secretKey'),
      signatureVersion: 'v3',
    },
  });
  return gulp.src(['dist/src/**/*'])
    .pipe(rename((p) => {
      p.dirname = `/staging/${p.dirname}`;
      return p.dirname;
    }))
    .pipe(parallelize(publisher.publish(), 2))
    .pipe(publisher.cache())
    .pipe(awspublish.reporter());
}
