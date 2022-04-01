const Promise = require('bluebird')
const spawn = require('child_process').spawn
const fs = require('fs-extra')
const merge = require('lodash.merge')
const path = require('path')

function appPrep (opts) {
  const defaults = {
    appId: process.env.STEAM_APPID,
    verbose: false,
    bin: './bin/contentprep/contentprep.py',
    destination: './dest',
    force: true
  }
  opts = merge({}, defaults, opts)
  if (!opts.source) {
    throw new Error('source directory required')
  }
  if (!opts.appId) {
    throw new Error('Steam appId required')
  }
  if (opts.force) {
    fs.removeSync(opts.destination)
  }
  fs.mkdirp(opts.destination)

  return new Promise((resolve, reject) => {
    var args = [
      '--console',
      '-s',
      opts.source,
      '-d',
      opts.destination,
      '-a',
      opts.appId
    ]
    if (opts.verbose) {
      args.push('-v')
    }
    if (opts.executable) {
      args.push('-e', opts.executable)
    }

    const contentPrep = spawn(opts.bin, args)

    contentPrep.stdout.on('data', (data) => {
      process.stdout.write(data)
    })

    contentPrep.stderr.on('data', (data) => {
      process.stderr.write(data)
    })

    contentPrep.on('close', code => {
      if (code !== 0) {
        reject(new Error(`contentPrep exited with code ${code}`))
      }
      resolve()
    })
  })
}

function appBuild (opts) {
  const defaults = {
    username: process.env.STEAM_USERNAME,
    password: process.env.STEAM_PASSWORD,
    bin: './bin/contentbuilder/steamcmd.sh'
  }
  opts = merge({}, defaults, opts)
  if (!opts.username) {
    throw new Error('Steam username required')
  }
  if (!opts.password) {
    throw new Error('Steam password required')
  }
  if (!opts.appVdf) {
    throw new Error('Steam app.vdf script required')
  }
  return new Promise((resolve, reject) => {
    var args = [
      '+login',
      opts.username,
      opts.password,
      '+run_app_build_http',
      path.resolve(opts.appVdf),
      '+quit'
    ]

    const contentBuilder = spawn(opts.bin, args)

    contentBuilder.stdout.on('data', (data) => {
      process.stdout.write(data)
    })

    contentBuilder.stderr.on('data', (data) => {
      process.stderr.write(data)
    })

    contentBuilder.on('close', code => {
      if (code !== 0) {
        reject(new Error(`contentBuilder exited with code ${code}`))
      }
      resolve()
    })
  })
}

module.exports = {appPrep, appBuild}
