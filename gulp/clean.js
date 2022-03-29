'use strict'
import gulp from 'gulp'
import del from 'del'

// Cleans out all build output folders folder
export function all() {
	return del([
		'dist',
		'desktop/src',
		'desktop/node_modules'
	])
	return del('dist')
}

// Cleans out desktop specific parts output folders
// (leaves /dist/src intact)
export function desktop() {
	return del([
		'desktop/src',
		'desktop/node_modules',
		'dist/desktop',
		'dist/git-remotes'
	])
}

// Cleans out git remotes from the dist folder
export function git() {
	return del('dist/git-remotes')
}
