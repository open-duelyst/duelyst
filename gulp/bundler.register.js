import path from 'path';
import gulp from 'gulp';
import gutil from 'gulp-util';
import gif from 'gulp-if';
import rename from 'gulp-rename';
import uglify from 'uglify-es';
import composer from 'gulp-uglify/composer';
import notify from 'gulp-notify';

// Browserify
// https://github.com/gulpjs/gulp/blob/master/docs/recipes/fast-browserify-builds-with-watchify.md
import browserify from 'browserify';
import watchify from 'watchify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import coffeeify from 'coffeeify';
import glslify from 'glslify';
import hbsfy from 'hbsfy';
import envify from 'envify/custom';
import babelify from 'babelify';
import uglifyify from 'uglifyify';
import bundleCollapser from 'bundle-collapser/plugin';
import {
  opts, config, env, version, production, staging, development,
} from './shared';

const minify = composer(uglify, console);

// Browserify options
// https://github.com/substack/node-browserify#usage
// if env == 'production' || env == 'staging' then false else true,
const bundlerOpts = {
  paths: [path.join(__dirname, '..')],
  debug: development,
  cache: {},
  packageCache: {},
  extensions: ['.coffee', '.js'],
  // ignoreMissing: true,
  // detectGlobals: false
};

const entries = ['./app/index.register'];

// Initialize bundler
let bundler = browserify(entries, bundlerOpts);
if (opts.watch) {
  bundler = watchify(bundler);
}

// Apply bundler transforms
// bundler.transform(aliasify, aliasConfig)
bundler.transform(coffeeify);
bundler.transform(hbsfy);
bundler.transform(glslify);
bundler.transform(envify({
  NODE_ENV: env,
  VERSION: version,
  API_URL: config.get('api'),
  FIREBASE_URL: config.get('firebase.url'),
  ALL_CARDS_AVAILABLE: config.get('allCardsAvailable'),
  AI_TOOLS_ENABLED: config.get('aiToolsEnabled'),
  RECORD_CLIENT_LOGS: config.get('recordClientLogs'),
  INVITE_CODES_ACTIVE: config.get('inviteCodesActive'),
  RECAPTCHA_ACTIVE: config.get('recaptcha.enabled'),
  BUGSNAG_WEB: config.get('bugsnag.web_key'),
  BUGSNAG_DESKTOP: config.get('bugsnag.desktop_key'),
  RECAPTCHA_SITE_KEY: config.get('recaptcha.siteKey'),
  REGISTER_STANDALONE: true,
}));
// bundler.transform(babelify, {
//   compact: false
// })
if (opts.minify) {
  gutil.log('[BROWSERIFY] Minifying bundle');
  bundler.transform(uglifyify);
  // bundler.plugin(bundleCollapser)
}

// Re-bundle on update
bundler.on('update', bundle);

// Log bundler updates
bundler.on('update', (files) => {
  gutil.log('[BROWSERIFY] Bundle updating');
  files.map((file) => gutil.log(` [CHANGED] ${file}`));
});

// Log bundler output
bundler.on('log', gutil.log.bind(gutil, '[BROWSERIFY]'));

// export bundle function
export default function bundle() {
  return bundler.bundle()
  // log errors if they happen
    .on('error', (e) => {
      gutil.log(`[BROWSERIFY] Error: ${e.message}`);
      notify.onError('Error: <%= error.message %>');
    })
    .pipe(source('index.js'))
    .pipe(buffer())
    .pipe(gif(opts.minify, minify({ mangle: true })))
    .pipe(rename((p) => {
      p.basename = 'register';
      return p.basename;
    }))
    .pipe(notify())
    .pipe(gulp.dest('dist/src'));
}
