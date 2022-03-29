'use strict'
import gulp from 'gulp'
import gutil from 'gulp-util'
import {exec, execSync} from 'child_process'
import async from 'async'
import git from 'gulp-git'
import readPkg from 'read-pkg'
import semver from 'semver'
import _ from 'underscore'
import changelogGenerator from 'gulp-conventional-changelog'
import githubRelease from 'gulp-github-release'
import gitRevSync from 'git-rev-sync'
import latestTag from '@counterplay/git-latest-semver-tag'
import {env,version,production,staging} from './shared'

// sync method to just return current git branch
export function getCurrentBranch() {
	return gitRevSync.branch()
}

// clone the desktop repos
export function desktopClone(cb) {
	if (!production && !staging) {
		return cb(new Error('Current NODE_ENV not supported'))
	}
	let remote
	if (staging) {remote = 'git@github.com:88dots/desktop-rls-staging.git'}
	if (production) {remote = 'git@github.com:88dots/desktop-rls.git'}
	git.clone(remote, {args: `./dist/git-remotes/${env}`, quiet: false, maxBuffer: Infinity}, cb)
}

// sync the desktop app folder to the git folder for committing
export function desktopSync(cb) {
	if (!production && !staging) {
		return cb(new Error('Current NODE_ENV not supported'))
	}
	execSync(`rsync -av --delete --exclude=.git desktop/ dist/git-remotes/${env}`)
	cb()
}

// commit changes to desktop
export function desktopCommit(cb) {
	if (!production && !staging) {
		return cb(new Error('Current NODE_ENV not supported'))
	}
	const pkg = readPkg.sync('./desktop')
	const version = pkg.version
	const msg = `[v${version}][desktop]`
	return gulp.src(`./dist/git-remotes/${env}`)
		.pipe(git.add({cwd: `./dist/git-remotes/${env}`}))
		.pipe(git.commit(msg, {cwd: `./dist/git-remotes/${env}`, maxBuffer: Infinity}))
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
		return cb(new Error('Current NODE_ENV not supported'))
	}
	git.push('origin', 'master', {cwd: `./dist/git-remotes/${env}`, maxBuffer: Infinity}, cb)
}

// produce a diff zip between current version and previous tag
export function desktopDiff(cb) {
	if (!production && !staging) {
		return cb(new Error('Current NODE_ENV not supported'))
	}
	const pkg = readPkg.sync('./desktop')
	const version = pkg.version
	latestTag({cwd: `./dist/git-remotes/${env}`}, (err, latestTag) => {
		gutil.log(`latest tag: ${latestTag}`)
		if (err) {
			return cb(err)
		}
		if (latestTag === '') {
			gutil.log('diff not possible, no previous tag found')
			return cb()
		}
		const newTag = `v${version}`
		gutil.log(`git diff ${latestTag}..${newTag}`)
		execSync(`cd ./dist/git-remotes/${env} && git diff --name-only ${latestTag} --diff-filter=ACMRTUXB | xargs git archive -o ${latestTag}-${newTag}.patch.zip HEAD`)
		execSync('mkdir -p ./dist/desktop/')
		execSync(`mv ./dist/git-remotes/${env}/${latestTag}-${newTag}.patch.zip ./dist/desktop/`)
		cb()
	})
}

// publish github release
export function desktopPublish(cb) {
	if (!production && !staging) {
		return cb(new Error('Current NODE_ENV not supported'))
	}
	const pkg = readPkg.sync('./desktop')
	const version = pkg.version
	const tag = `v${version}`
	const msg = `[v${version}][${env}]`
	let owner = '88dots'
	let repo
	if (env == 'staging') {
		repo = 'desktop-rls-staging'
	}
	if (env == 'production') {
		repo = 'desktop-rls'
	}
	return gulp.src('dist/desktop/*.{zip,SHA1SUM}')
		.pipe(githubRelease({
			token: 'd26b52d4518a4abd48803edbc57a56def3df8da0',
			owner: owner,
			repo: repo,
			tag: tag,
			name: msg,
			notes: msg,
			draft: false,
			prerelease: false
		}))
}

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
	let source
	if (target === 'master') {return cb()}
	if (target === 'staging') {source = 'master'}
	if (target === 'production') {source = 'staging'}
	async.series([
		// Reset and fetch
		async.apply(git.reset, 'HEAD', {args:'--hard'}),
		async.apply(git.fetch, '', '', {args: '--all', maxBuffer: Infinity}),
		// Checkout and pull
		async.apply(git.checkout, source),
		async.apply(git.pull, 'origin', source, {args: '--rebase', maxBuffer: Infinity}),
		// Checkout and pull
		async.apply(git.checkout, target),
		async.apply(git.pull, 'origin', target, {args: '--rebase', maxBuffer: Infinity}),
		// Merge
		async.apply(git.merge, source, {args: '--no-ff --no-commit', maxBuffer: Infinity})
	], cb)
}

export function commit(target) {
	const pkg = readPkg.sync()
	const version = pkg.version
	const isRelease = (semver.patch(version) === 0)
	let msg = `[${version}]=>[${target}]`
	if (target === 'master') {
		if (isRelease) {msg = `[${version}][release]`}
		else {msg = `[${version}][patch]`}
	}
	return gulp.src('.')
		.pipe(git.commit(msg, {args: '-a'}))
}

export function checkout(target, cb) {
	git.checkout(target, cb)
}

export function push(target, cb) {
	git.push('origin', target, cb)
}

export function tag(target, cb) {
	const pkg = readPkg.sync()
	const version = pkg.version
	const msg = `[${target}][v${version}]`
	let tag
	if (target === 'master') {tag = `master-v${version}`}
	if (target === 'staging') {tag = `staging-v${version}`}
	if (target === 'production') {tag = `v${version}`}
	async.series([
		async.apply(git.tag, tag, msg),
		async.apply(git.push, 'origin', target, {args: '--tags', maxBuffer: Infinity})
	], cb)
}

export function changelog() {
	return gulp.src('CHANGELOG.md', {buffer: false})
		.pipe(changelogGenerator({preset: 'atom'}))
		.pipe(gulp.dest('./'))
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
