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

//
// NEW CODE BELOW.
// This is what we use in Yarn scripts.
//

function getPublisher() {
  if (process.env.AWS_ACCESS_KEY === undefined) {
    throw new Error('AWS_ACCESS_KEY must be set');
  }
  if (process.env.AWS_SECRET_KEY === undefined) {
    throw new Error('AWS_SECRET_KEY must be set');
  }
  if (process.env.AWS_REGION === undefined) {
    throw new Error('AWS_REGION must be set');
  }
  if (process.env.S3_ASSETS_BUCKET === undefined) {
    throw new Error('S3_ASSETS_BUCKET must be set');
  }
  return awspublish.create({
    region: config.get('aws.region'),
    params: {
      Bucket: config.get('aws.assetsBucketName'),
    },
    credentials: {
      accessKeyId: config.get('aws.accessKey'),
      secretAccessKey: config.get('aws.secretKey'),
      signatureVersion: 'v3',
    },
  });
}

// Uploads web assets (HTML, CSS, JS, and locales).
export function webAssets() {
  if (!(['staging', 'production'].includes(process.env.NODE_ENV))) {
    throw new Error('NODE_ENV must be either staging or production');
  }
  const publisher = getPublisher();
  const filesToUpload = [
    'dist/src/*.css',
    'dist/src/*.html',
    'dist/src/*.js',
    'dist/src/**/*.json',
  ];
  return gulp.src(filesToUpload)
    .pipe(rename((p) => {
      p.dirname = `/${process.env.NODE_ENV}/${p.dirname}`;
      return p.dirname;
    }))
    .pipe(parallelize(publisher.publish(), 2))
    .pipe(publisher.cache())
    .pipe(awspublish.reporter());
}

// Uploads all assets, including resources.
export function allAssets() {
  if (!(['staging', 'production'].includes(process.env.NODE_ENV))) {
    throw new Error('NODE_ENV must be either staging or production');
  }
  const publisher = getPublisher();
  return gulp.src(['dist/src/**/*'])
    .pipe(rename((p) => {
      p.dirname = `/${process.env.NODE_ENV}/${p.dirname}`;
      return p.dirname;
    }))
    .pipe(parallelize(publisher.publish(), 2))
    .pipe(publisher.cache())
    .pipe(awspublish.reporter());
}
