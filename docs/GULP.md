# Workflow Automation with Gulp

## Tasks

The main `gulpfile.babel.js` defines the task names and groupings.
Tasks are saved in different files in the `/gulp` folder.  
A task is a function that when complete either:
- calls a callback
- returns a Promise
- returns a stream

Print a list of available tasks by running `gulp --tasks`.  
To run a task, run `gulp <taskname>`.  

### Task [clean.js]

The clean tasks wipe the output build folders. There are 3 variations:
- `gulp clean:all`: removes all output files
- `gulp clean:desktop`: removes only output files related to desktop build
- `gulp clean:git`: removes git remotes used for desktop git mirrors

### Task [css.js]

`gulp css`  
The css task compiles our SASS files into plain css. Note here, based on our target build environment (staging, production), we replace URLs found in our css with CDN urls.
```
.pipe(gif(production || staging,
	rework(reworkUrl(url => {
		if (url.indexOf('resources') >= 0 && config.get('cdn') !== '') {
			return config.get('cdn') + '/' + url
		}
		return url
	}))
))
```

### Task [html.js]

`gulp html`  
The html task compiles the handlebars `index.hbs` file into plain html. Note here we inject some configuration variables so they are available in the output html.
```
data: {
	version: version,
	development: development,
	analyticsEnabled: config.get('analyticsEnabled'),
	analyticsId: config.get('analyticsId'),
	bugsnagId: config.get('bugsnag.client_key'),
	bugsnagDesktopId: config.get('bugsnag.desktop_key'),
	gaId: config.get('gaId'),
	cdn: config.get('cdn')
}
```

### Task [vendor.js]

`gulp vendor`  
The vendor task concats our external javascript files (outside the main bundle) into a single vendor.js file which is included prior to the main bundle. This includes `cocos` and other external dependencies which are not Browserified. Note that ordering matters and they are concatenated in order specified.
```
const vendorFiles = [
	'./node_modules/jquery/dist/jquery.js',
	'./node_modules/velocity-animate/velocity.js',
	'./node_modules/bootstrap-sass/assets/javascripts/bootstrap.js',
	'./node_modules/underscore/underscore.js',
	'./node_modules/backbone/backbone.js',
	'./packages/backfire/dist/backfire.min.js',
	'./node_modules/backbone.marionette/lib/backbone.marionette.js',
	'./app/vendor/jquery_ui/jquery-ui.min.js',
	'./app/vendor/ccConfig.js',
	'./app/vendor/cocos2d-html5/lib/cocos2d-js-v3.3-beta0.js',
	'./app/vendor/aws/aws-sdk.min.js',
	'./app/vendor/aws/aws-sdk-mobile-analytics.min.js'
]
```

### Task [bundle.js]

`gulp js`  
The bundle task is our main javascript packager using Browserify. Browserify allows us to use node.js `require` syntax (aka `common.js`) in the browser. Browserify also allows us to define `transforms` which are applied to our source code:
```
bundler.transform(coffeeify) // transforms .coffee to .js
bundler.transform(hbsfy) // transforms client .hbs to .html fragments
bundler.transform(glslify) // transforms shader files into .js
bundler.transform(envify()) // turns specified variables into process.env.*
```
Browserify also has a built in file watcher called `watchify` which is enabled during development to allow for faster incremental builds.

### Task [rsx.js]

The rsx tasks are used to prepare our resource files for distribution.
- `gulp rsx:packages`: generates the client resource packages in `app/data`
- `gulp rsx:copy`: moves files from `app/resources` into `dist/resources`
- `gulp rsx:build_urls`: modifies the `dist/*.js` files to use CDN urls
- `gulp rsx:source_urls`: modifies the `app/resources` files to use CDN urls
- `gulp rsx:imagemin`: minifies images (.jpg, .png) with lossless compression from `app/original_resources` into `app/resources`
- `gulp rsx:imagemin:lossy`: minifies images (.jpg, .png) with lossy (pngquant) compression from `app/original_resources` into `app/resources`

### Task [revision.js]

The revision tasks are used to prepare our source files for distribution. The `js` and `css` files get renamed using content-based hashes. This allows each file to be cached on the CDN with a unique name.
- `gulp revision:generate`: creates manifest with versioned source files based on their content
- `gulp revision:replace`: replaces references in source files using manifest

### Task [upload.js]

This task uploads the `dist` content to S3.
- `gulp upload:main`: uploads all source files and assets with GZIP (except audio)
- `gulp upload:audio`: uploads audio files (GZIP disabled)
- `gulp upload:main:versioned`: same as main but uploads to `/${version}` subfolder
- `gulp upload:audio:versioned`: same as audio but uploads to `/${version}` subfolder

### Task [docker.js]

This task builds, tags, and pushes our Docker container (used by servers/worker). Docker must be available and ready.
- `gulp docker:build`: builds the docker container
- `gulp docker:tag`: tags the docker container
- `gulp docker:push`: push the docker container to the registry (quay.io)

### Task [bump.js]

This task bumps version numbers in our `version.json` and `package.json` files. Note that **ALL** version numbers should be in sync (across are files):
```
const paths = [
	'./version.json',
	'./package.json',
	'./desktop/package.json'
]
```
- `gulp bump:patch`: patch bump, ie, 0.0.x
- `gulp bump:minor`: minor bump, ie 0.x.0
- `gulp bump:major`: major bump, ie x.0.0

### Task [git.js]

The git tasks are helpers for managing git pushes/commit. Note the git tasks will perform a `commit -am` so ensure remove unused files or commit before proceeding. To be safe, ensure you are already on latest `main` branch and that your changes are safe to commit before proceeding.

There are several subtasks here but the relevant tasks to run are:  
- `gulp git:main:{patch,minor,major}`: these tasks will bump the version numbers, commit the changes, create a git tag, and push. The commit msg will be like `[2.1.7][patch]` and the tag will be like `main-v2.1.14`.

- `gulp git:staging`: this task will merge main => staging, create a tag, and push. The commit msg will be like `[2.1.14]=>[staging]` and the tag will be like `staging-v2.1.14`.

- `gulp git:production`: this task will merge staging => production, create a tag, and push. The commit msg will be like `[2.1.14]=>[production]` and the tag will be like `v2.1.14`.

### Task [desktop.js]

The desktop task operates on the `desktop` subfolder. The desktop has its own `package.json` and `node_modules` used for the Electron client build.

- `desktop:build`: builds the source code and the Electron exe and app binaries.
- `desktop:package`: zips the binaries, creates a diff against the previous release, and publishes to github

## Building win32 client from osx

Works from OSX with Wine.
```
$ brew install wine
$ brew install winetricks
$ winetricks mfc42
```

## Electron Dev Tools

Toggle Dev Tools.

OS X: Cmd Alt I
Windows: Ctrl Shift I
Reload

Force reload the window.

OS X: Cmd R
Windows: Ctrl R

## Directory Structure  

The root of the desktop application is the `/desktop/app` folder. The main entry is `desktop.js` and the source is copied from `/dist/src` into `/desktop/src`.

## Setup Source  

Copies source from cleancoco parent `/dist/src` folder into `/desktop/src`. Run `setup:#{environment}` to prepare the desktop app's `package.json` with build metadata.
```
$ npm run clean && npm run copy
$ npm run setup:#{environment}
```
