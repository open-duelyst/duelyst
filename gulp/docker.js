import gulp from 'gulp';
import gutil from 'gulp-util';
import { exec } from 'child_process';
import { env, production, staging } from './shared';

const containerRegistry = 'quay.io/marwanhilmi';
const containerName = 'duelyst';

export function isDockerWorking() {
}

export function build(cb) {
  gutil.log('-----> Building docker image ...');
  const build = exec(
    `docker build -t=${containerName} -f Dockerfile.main .`,
    { maxBuffer: 10 * 1024 * 1024 },
    (err) => {
      if (err !== null) {
        gutil.log(`docker build error: ${err}`);
        return cb(err);
      }
      return cb();
    },
  );
  build.stdout.pipe(process.stdout);
}

export function tag(cb) {
  gutil.log('-----> Tagging docker image ...');
  const tag = exec(
    `docker tag $(docker images | grep "^${containerName} " |  awk '{print $3}') ${containerRegistry}/${containerName}:${env}`,
    { maxBuffer: 10 * 1024 * 1024 },
    (err) => {
      if (err !== null) {
        gutil.log(`docker tag error: ${err}`);
        return cb(err);
      }
      return cb();
    },
  );
  tag.stdout.pipe(process.stdout);
}

export function push(cb) {
  gutil.log(`-----> Docker pushing ${containerName}:${env} to ${containerRegistry}...`);
  const push = exec(
    `docker push ${containerRegistry}/${containerName}:${env}`,
    { maxBuffer: 10 * 1024 * 1024 },
    (err) => {
      if (err !== null) {
        gutil.log(`docker push error: ${err}`);
        return cb(err);
      }
      return cb();
    },
  );
  push.stdout.pipe(process.stdout);
}
