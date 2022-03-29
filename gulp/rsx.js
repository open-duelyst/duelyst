'use strict'
import gulp from 'gulp'
import gutil from 'gulp-util'
import debug from 'gulp-debug'
import size from 'gulp-size'
import changed from 'gulp-changed'
import replace from 'gulp-replace'
import _ from 'underscore'
import {exec} from 'child_process'
import {config,development} from './shared'

// images
import imagemin from 'gulp-imagemin'
import pngquant from 'imagemin-pngquant'
import optipng from 'imagemin-optipng'
import mozjpeg from 'imagemin-mozjpeg'
import zopfli from 'imagemin-zopfli'
import jpegtran from 'imagemin-jpegtran'

export function imageMin() {
	return gulp.src('app/original_resources/**/*.{jpg,png}')
	.pipe(changed('app/resources', {hasChanged: changed.compareSha1Digest}))
	.pipe(imagemin([mozjpeg(), zopfli()], {verbose: true}))
	.pipe(size())
	.pipe(gulp.dest('app/resources'))
}

export function imageMinLossy() {
	return gulp.src(['app/resources/**/*.{jpg,png}', '!app/resources/{maps,maps/**}'])
	.pipe(changed('app/resources', {hasChanged: changed.compareSha1Digest}))
	.pipe(imagemin([pngquant({nofs: true})], {verbose: true}))
	.pipe(size())
	.pipe(gulp.dest('app/resources'))
}

// Copy non-cdn flagged resources over to the dist folder
// Used before packaging the desktop application
export function copy() {
	const pkgsAll = require('../app/data/packages.js').all
	const pkgsFiltered = pkgsAll.filter(rsx => !rsx.cdn)
	gutil.log(gutil.colors.magenta(`${pkgsFiltered.length} non-cdn resources detected`))
	let paths = pkgsFiltered.reduce((paths, rsx) => {
		if (rsx.img) {
			paths.push(`app/${rsx.img}`)
		}
		if (rsx.imgPosX) { paths.push(`app/${rsx.imgPosX}`) }
		if (rsx.imgNegX) { paths.push(`app/${rsx.imgNegX}`) }
		if (rsx.imgPosY) { paths.push(`app/${rsx.imgPosY}`) }
		if (rsx.imgNegY) { paths.push(`app/${rsx.imgNegY}`) }
		if (rsx.imgPosZ) { paths.push(`app/${rsx.imgPosZ}`) }
		if (rsx.imgNegZ) { paths.push(`app/${rsx.imgNegZ}`) }
		if (rsx.audio) {
			paths.push(`app/${rsx.audio}`)
		}
		if (rsx.plist) {
			paths.push(`app/${rsx.plist}`)
		}
		if (rsx.font) {
			paths.push(`app/${rsx.font}`)
		}
		return paths
	}, [])
	paths = _.uniq(paths)
	//paths.forEach(path => gutil.log(gutil.colors.bgMagenta.white(path)))
	gutil.log(gutil.colors.magenta(`${paths.length} paths being copied for packaging`))
	return gulp.src(paths, {base: 'app'})
		.pipe(gulp.dest('dist/src'))
}

// Copy cdn flagged resources over to the dist folder
// Used before uploading to S3
export function copyCdn() {
	const pkgsAll = require('../app/data/packages.js').all
	const pkgsFiltered = pkgsAll.filter(rsx => rsx.cdn)
	gutil.log(gutil.colors.magenta(`${pkgsFiltered.length} cdn resources detected`))
	let paths = pkgsFiltered.reduce((paths, rsx) => {
		if (rsx.img) {
			paths.push(`app/${rsx.img}`)
		}
		if (rsx.imgPosX) { paths.push(`app/${rsx.imgPosX}`) }
		if (rsx.imgNegX) { paths.push(`app/${rsx.imgNegX}`) }
		if (rsx.imgPosY) { paths.push(`app/${rsx.imgPosY}`) }
		if (rsx.imgNegY) { paths.push(`app/${rsx.imgNegY}`) }
		if (rsx.imgPosZ) { paths.push(`app/${rsx.imgPosZ}`) }
		if (rsx.imgNegZ) { paths.push(`app/${rsx.imgNegZ}`) }
		if (rsx.audio) {
			paths.push(`app/${rsx.audio}`)
		}
		if (rsx.plist) {
			paths.push(`app/${rsx.plist}`)
		}
		if (rsx.font) {
			paths.push(`app/${rsx.font}`)
		}
		return paths
	}, [])
	paths = _.uniq(paths)
	//paths.forEach(path => gutil.log(gutil.colors.bgMagenta.white(path)))
	gutil.log(gutil.colors.magenta(`${paths.length} paths being copied for upload`))
	return gulp.src(paths, {base: 'app'})
		.pipe(gulp.dest('dist/src'))
}

// Wholesale copy everything from /resources folder
// Used for testing
export function copyAll() {
	return gulp.src('./app/resources/**', {base: 'app'})
		.pipe(debug())
		.pipe(gulp.dest('dist/src'))
}

// Generate Packages
// https://github.com/gulpjs/gulp/blob/4.0/docs/recipes/running-shell-commands.md
// https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback
export function packages(cb) {
	const pkgs = exec('node scripts/generate_packages.js -d' + (development ? ' -fa' : ''), err => {
		if (err != null) {
			gutil.log('generate_packages.js error: ' + err)
			return cb(err)
		}
		cb()
	})
	pkgs.stdout.pipe(process.stdout)
}

// replace URLs in the source code with the CDN url
export function buildUrls() {
	return gulp.src('dist/src/**/*.js')
		.pipe(replace(/(\/?)resources\/([^"|'|)]+)/g, config.get('cdn') + '/resources/$2'))
		.pipe(gulp.dest('dist/src'))
}

// replace codex URLs in the source code with the CDN url
// used for desktop build to link codex assets to CDN
export function codexUrls() {
	return gulp.src('dist/src/**/*.js')
		.pipe(replace(/(\/?)resources\/codex\/([^"|'|)]+)/g, config.get('cdn') + '/resources/codex/$2'))
		.pipe(gulp.dest('dist/src'))
}

// replace URLS in the source code with the CDN url
export function sourceUrls() {
	return gulp.src('app/data/resources.js')
		.pipe(replace(/(\/?)resources\/([^"|'|)]+)/g, config.get('cdn') + '/resources/$2'))
		.pipe(gulp.dest('dist/src'))
}
