const test = require('blue-tape')
const fs = require('fs-extra')
const steamcmd = require('../')

test('exports correctly', t => {
  t.equal(typeof steamcmd.appBuild, 'function')
  t.equal(typeof steamcmd.appPrep, 'function')
  t.end()
})

test('appPrep throws when missing required args', t => {
  t.throws(() => {
    steamcmd.appPrep({source: undefined, appId: undefined})
  })
  t.end()
})

test('appPrep handles creating directories', t => {
  fs.removeSync('./test/fixtures/dest')
  return steamcmd.appPrep({
    appId: 291410,
    source: './test/fixtures/Electron.app',
    destination: './test/fixtures/dest'
  })
  .then(() => {
    t.doesNotThrow(() => {
      fs.statSync('./test/fixtures/dest')
    })
  })
})

test('appPrep handles clearing directories', t => {
  return steamcmd.appPrep({
    force: true,
    appId: 291410,
    source: './test/fixtures/Electron.app',
    destination: './test/fixtures/dest'
  })
})

test('appPrep handles creates Steam ready app with installscript file', t => {
  return steamcmd.appPrep({
    force: true,
    appId: 291410,
    source: './test/fixtures/Electron.app',
    destination: './test/fixtures/dest',
    executable: 'Contents/MacOS/Electron API Demos'
  })
  .then(() => {
    t.doesNotThrow(() => {
      fs.statSync('./test/fixtures/dest/Electron.app/installscript_osx.vdf')
    })
  })
})

test('appBuild handles creates Steam upload', t => {
  return steamcmd.appBuild({
    username: process.env.STEAM_USERNAME
    password: process.env.STEAM_PASSWORD
    appVdf: './test/fixtures/app_291410.vdf'
  })
})

