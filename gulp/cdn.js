import Promise from 'bluebird';
import gulp from 'gulp';
import gutil from 'gulp-util';
import fastly from 'fastly-promises';
import { env, config } from './shared';

const cdn = fastly(config.get('fastly.token'), config.get('fastly.serviceId'));

export function purgeLocalization() {
  const localizationFiles = [
    '/resources/locales/en/index.json',
    '/resources/locales/de/index.json',
  ];
  return Promise.map(localizationFiles, (localizationFile) => {
    const url = config.get('cdn') + localizationFile;
    return cdn.purgeIndividual(url);
  })
    .then((res) => {
      gutil.log(`${gutil.colors.green('CDN PURGED')}`);
      res.forEach((res) => {
        gutil.log(res.data);
      });
    })
    .catch((err) => {
      gutil.log(`${gutil.colors.green('CDN PURGE FAILED')}: ${err.message}`);
      throw err;
    });
}

export function purgeAll() {
  return cdn.purgeAll()
    .then((res) => {
      gutil.log(`${gutil.colors.green('CDN PURGED')}`);
      gutil.log(res.data);
    })
    .catch((err) => {
      gutil.log(`${gutil.colors.green('CDN PURGE FAILED')}: ${err.message}`);
      throw err;
    });
}
