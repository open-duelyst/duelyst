const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../'));
require('coffeescript/register');
const assert = require('power-assert');
const jwtDecode = require('jwt-decode');

const s = require('../../../app/common/session2.coffee');

// These states are currently stateful (because of db) and run against localhost
describe('session', () => {
  //
  // beforeEach(function() {
  //   // session has a global error emitter
  //   s.on('error', err => {
  //     Logger.module("UNITTEST").log(`[${err.status} ${err.message}] ${err.innerMessage}`)
  //   })
  //   // ensure props are clean
  //   assert.equal(s.fbRef, null)
  //   assert.equal(s.token, null)
  //   assert.equal(s.expires, null)
  //   assert.equal(s.userId, null)
  //   assert.equal(s.email, null)
  //   assert.equal(s.username, null)
  // })
  //
  // afterEach(function() {
  //   s.removeAllListeners()
  //   // since session is a singleton, logout will reset it
  //   // it is safe to call on an already logged out session
  //   s.logout()
  //   // ensure props are clean
  //   assert.equal(s.fbRef, null)
  //   assert.equal(s.token, null)
  //   assert.equal(s.expires, null)
  //   assert.equal(s.userId, null)
  //   assert.equal(s.email, null)
  //   assert.equal(s.username, null)
  // })
  //
  // it('should exist', function() {
  //   assert(s)
  //   assert(s.url)
  //   assert(s.fbUrl)
  //   assert.equal(s.fbRef, null)
  //   assert.equal(s.token, null)
  //   assert.equal(s.expires, null)
  //   assert.equal(s.userId, null)
  //   assert.equal(s.email, null)
  //   assert.equal(s.username, null)
  // })
  //
  // it('factory should create new instances', function() {
  //   const s1 = require('app/common/session2').create({})
  //   const s2 = require('app/common/session2').create({})
  //   assert.notEqual(s, s1)
  //   assert.notEqual(s, s2)
  //   assert.notEqual(s1, s2)
  // })
  //
  // it('should fail to login and emit error event', function(done) {
  //   s.once('error', () => done())
  //   s.login('fuk','password2').catch(() => {})
  // })
  //
  // it('should fail to login and reject with error', function() {
  //   return s.login('fuk','password2')
  //   .catch(e => assert(e))
  // })
  //
  // it('should login and emit loggin event', function() {
  //   s.once('login', () => done())
  //   s.login('fuk','password').catch(() => {})
  // })
  //
  // it('should login and resolve with data', function(done) {
  //   s.login('fuk','password')
  //   .then(res => {
  //     assert(res.token)
  //     assert(res.userId)
  //     done()
  //   })
  // })
  //
  // it('should logout and emit logout event', function(done) {
  //   s.once('logout', () => done())
  //   s.logout()
  // })
  //
  // it('should be safe to logout again', function() {
  //   s.logout()
  // })
  //
  // it('should login and resolve with a valid token', function() {
  //   return s.login('fuk','password')
  //   .then(res => {
  //     assert(res.token)
  //     assert(res.userId)
  //     const token = jwtDecode(res.token)
  //     assert(token.d.id)
  //     assert(token.d.email)
  //     assert.equal(token.d.username, 'fuk')
  //     assert(token.iat)
  //     assert(token.exp)
  //     assert.equal(token.v, 0)
  //     return
  //   })
  // })
  //
  // it('should register and resolve with the data used', function() {
  //   // TODO: this is dumb but temp solution
  //   const email = `mhilmi+${Math.round(Math.random()*100)}!@gmail.com`
  //   const username = `mhilmi${Math.round(Math.random()*100)}d`
  //   const password = 'password'
  //   return s.register(email, username, password)
  //   .then(res => {
  //     assert(s.justRegistered)
  //     assert(res)
  //     assert.equal(res.username, username)
  //     assert.equal(res.email, email)
  //     assert.equal(res.password, password)
  //   })
  // })
  //
  // it('should register and then be able to login with username', function() {
  //   // TODO: this is dumb but temp solution
  //   const email = `mhilmi+${Math.round(Math.random()*100)}@gmail.com`
  //   const username = `mhilmi${Math.round(Math.random()*100)}`
  //   const password = 'password'
  //   return s.register(email, username, password)
  //   .then(() => s.login(username, password))
  // })
  //
  // it('should register and then be able to login with email', function() {
  //   // TODO: this is dumb but temp solution
  //   const email = `mhilmi+${Math.round(Math.random()*100)}@gmail.com`
  //   const username = `mhilmi${Math.round(Math.random()*100)}`
  //   const password = 'password'
  //   return s.register(email, username, password)
  //   .then(() => s.login(email, password))
  // })
  //
  // it('should register and login with justRegistered flag set', function() {
  //   // TODO: this is dumb but temp solution
  //   const email = `mhilmi+${Math.round(Math.random()*100)}@gmail.com`
  //   const username = `mhilmi${Math.round(Math.random()*100)}`
  //   const password = 'password'
  //   return s.register(email, username, password)
  //   .then(() => {
  //     assert(s.justRegistered)
  //     return s.login(username, password)
  //   })
  //   .then(() => {
  //     assert(s.justRegistered)
  //   })
  // })
  //
  // it('should trigger a forgot password email', function() {
  //   return s.forgot('mhilmi@gmail.com')
  // })
});
