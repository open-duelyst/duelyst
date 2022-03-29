'use strict'
import gulp from 'gulp'
import gif from 'gulp-if'
import uglify from 'uglify-es'
import composer from 'gulp-uglify/composer'
import concat from 'gulp-concat'
import {opts} from './shared'

const minify = composer(uglify, console)

const vendorFiles = [
	'./app/bower_components/jquery/jquery.js',
	'./app/bower_components/velocity/velocity.js',
	'./app/bower_components/bootstrap-sass-official/assets/javascripts/bootstrap.js',
	'./app/bower_components/underscore/underscore.js',
	'./app/bower_components/backbone/backbone.js',
	'./app/bower_components/backfire/dist/backfire.js',
	'./app/bower_components/backbone.marionette/lib/backbone.marionette.js',
	'./app/vendor/jquery_ui/jquery-ui.min.js',
	'./app/vendor/ccConfig.js',
	'./app/vendor/cocos2d-html5/lib/cocos2d-js-v3.3-beta0.js',
	'./app/vendor/aws/aws-sdk.min.js',
	'./app/vendor/aws/aws-sdk-mobile-analytics.min.js'
]

export default function vendor() {
	return gulp.src(vendorFiles)
	.pipe(concat('vendor.js'))
	.pipe(gif(opts.minify, minify({mangle: true})))
	.pipe(gulp.dest('dist/src'))
}
