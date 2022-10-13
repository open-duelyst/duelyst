import gulp from 'gulp';
import gutil from 'gulp-util';
import { exec, execSync } from 'child_process';
import async from 'async';
import git from 'gulp-git';
import readPkg from 'read-pkg';
import semver from 'semver';
import _ from 'underscore';
import changelogGenerator from 'gulp-conventional-changelog';
// import githubRelease from 'gulp-github-release';
// This package was removed, but is available in git history:
// - https://github.com/open-duelyst/duelyst/tree/fd4347a/packages/git-latest-semver-tag
// import latestTag from '@counterplay/git-latest-semver-tag';
import {
  env, version, production, staging,
} from './shared';

// clone the desktop repos
export function desktopClone(cb) {
  if (!production && !staging) {
    return cb(new Error('Current NODE_ENV not supported'));
  }
  let remote;
  if (staging) { remote = 'git@github.com:88dots/desktop-rls-staging.git'; }
  if (production) { remote = 'git@github.com:88dots/desktop-rls.git'; }
  return git.clone(remote, { args: `./dist/git-remotes/${env}`, quiet: false, maxBuffer: Infinity }, cb);
}

// sync the desktop app folder to the git folder for committing
export function desktopSync(cb) {
  if (!production && !staging) {
    return cb(new Error('Current NODE_ENV not supported'));
  }
  execSync(`rsync -av --delete --exclude=.git desktop/ dist/git-remotes/${env}`);
  return cb();
}

// commit changes to desktop
export function desktopCommit(cb) {
  if (!production && !staging) {
    return cb(new Error('Current NODE_ENV not supported'));
  }
  const pkg = readPkg.sync('./desktop');
  const { version } = pkg;
  const msg = `[v${version}][desktop]`;
  return gulp.src(`./dist/git-remotes/${env}`)
    .pipe(git.add({ cwd: `./dist/git-remotes/${env}` }))
    .pipe(git.commit(msg, { cwd: `./dist/git-remotes/${env}`, maxBuffer: Infinity }));
}

/*
Desktop Git Tasks
- uses standalone git repos containing only the desktop source
- one for staging and one for production
- diffs between releases are produced using built-in git archive command
*/

// git push to desktop target to remote
export function desktopPush(cb) {
  if (!production && !staging) {
    return cb(new Error('Current NODE_ENV not supported'));
  }
  return git.push('origin', 'main', { cwd: `./dist/git-remotes/${env}`, maxBuffer: Infinity }, cb);
}

/* Disabled.
 * - Dependency `git-latest-semver-tag` has security vulnterability:
 *   https://security.snyk.io/vuln/SNYK-JS-TRIMNEWLINES-1298042
// produce a diff zip between current version and previous tag
export function desktopDiff(cb) {
  if (!production && !staging) {
    return cb(new Error('Current NODE_ENV not supported'));
  }
  const pkg = readPkg.sync('./desktop');
  const { version } = pkg;
  return latestTag({ cwd: `./dist/git-remotes/${env}` }, (err, latestTag) => {
    gutil.log(`latest tag: ${latestTag}`);
    if (err) {
      return cb(err);
    }
    if (latestTag === '') {
      gutil.log('diff not possible, no previous tag found');
      return cb();
    }
    const newTag = `v${version}`;
    gutil.log(`git diff ${latestTag}..${newTag}`);
    execSync(`cd ./dist/git-remotes/${env} && git diff --name-only ${latestTag} --diff-filter=ACMRTUXB | xargs git archive -o ${latestTag}-${newTag}.patch.zip HEAD`);
    execSync('mkdir -p ./dist/desktop/');
    execSync(`mv ./dist/git-remotes/${env}/${latestTag}-${newTag}.patch.zip ./dist/desktop/`);
    return cb();
  });
}
*/

/* Disabled.
 * - Github token is not valid.
// publish github release
export function desktopPublish(cb) {
  if (!production && !staging) {
    return cb(new Error('Current NODE_ENV not supported'));
  }
  const pkg = readPkg.sync('./desktop');
  const { version } = pkg;
  const tag = `v${version}`;
  const msg = `[v${version}][${env}]`;
  const owner = '88dots';
  let repo;
  if (env === 'staging') {
    repo = 'desktop-rls-staging';
  }
  if (env === 'production') {
    repo = 'desktop-rls';
  }
  return gulp.src('dist/desktop/*.{zip,SHA1SUM}')
    .pipe(githubRelease({
      token: undefined,
      owner,
      repo,
      tag,
      name: msg,
      notes: msg,
      draft: false,
      prerelease: false,
    }));
}
*/

/*
Git Helper Tasks
Will reset your current working directory so do not run with unsaved changes.
Can fail if commit is empty (nothing to merge).
Can fail if tag already exists (must be unique).
`merge-` -> merges cleanly (--no-commit --no-ff)
`commit-` -> commits changes with formatted message
`checkout-` -> checkout branch
`push-` -> push to origin
`tag-` -> generate and push tag
`changelog-` -> generate changelog
*/
export function merge(target, cb) {
  let source;
  if (target === 'main') { return cb(); }
  if (target === 'staging') { source = 'main'; }
  if (target === 'production') { source = 'staging'; }
  return async.series([
    // Reset and fetch
    async.apply(git.reset, 'HEAD', { args: '--hard' }),
    async.apply(git.fetch, '', '', { args: '--all', maxBuffer: Infinity }),
    // Checkout source and pull
    async.apply(git.checkout, source),
    async.apply(git.pull, 'origin', source, { args: '--rebase', maxBuffer: Infinity }),
    // Checkout target and pull
    async.apply(git.checkout, target),
    async.apply(git.pull, 'origin', target, { args: '--rebase', maxBuffer: Infinity }),
    // Merge
    async.apply(git.merge, source, { args: '--no-ff --no-commit', maxBuffer: Infinity }),
  ], cb);
}

export function commit(target) {
  const pkg = readPkg.sync();
  const { version } = pkg;
  const isRelease = (semver.patch(version) === 0);
  let msg = `[${version}]=>[${target}]`;
  if (target === 'main') {
    if (isRelease) { msg = `[${version}][release]`; } else { msg = `[${version}][patch]`; }
  }
  return gulp.src('.')
    .pipe(git.commit(msg, { args: '-a' }));
}

export function checkout(target, cb) {
  git.checkout(target, cb);
}

export function push(target, cb) {
  git.push('origin', target, cb);
}

export function tag(target, cb) {
  const pkg = readPkg.sync();
  const { version } = pkg;
  const msg = `[${target}][v${version}]`;
  let tag;
  if (target === 'main') { tag = `main-v${version}`; }
  if (target === 'staging') { tag = `staging-v${version}`; }
  if (target === 'production') { tag = `v${version}`; }
  async.series([
    async.apply(git.tag, tag, msg),
    async.apply(git.push, 'origin', target, { args: '--tags', maxBuffer: Infinity }),
  ], cb);
}

export function changelog() {
  return gulp.src('CHANGELOG.md', { buffer: false })
    .pipe(changelogGenerator({ preset: 'atom' }))
    .pipe(gulp.dest('./'));
}

/*
validateBranch = (branches, cb) ->
  git.exec {args: 'rev-parse --abbrev-ref HEAD'}, (err, stdout) ->
    if err then return cb(new Error('Unable to parse current git branch'))
    branch = stdout.trim()
    if _.contains(branches, branch)
      cb(null,branch)
    else
      cb(new Error('Must be on one of following branches: ' + branches))
*/
