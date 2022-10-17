# region Requires
# Configuration object
config = require("../../config/config.js")
Firebase = require("firebase")
_ = require("underscore")
moment = require('moment')
fbRef = new Firebase(config.get("firebase"))
util = require('util')
fs = require 'fs'


# Firebase secure token for duelyst-dev.firebaseio.com
firebaseToken = config.get("firebaseToken")
DuelystFirebase= require("../../server/lib/duelyst_firebase_module")
fbUtil = require '../../app/common/utils/utils_firebase.js'
# endregion Requires

# Begin script execution

DuelystFirebase.connect().getRootRef()
.then (fbRootRef) ->

  newsItem =
    title: "March 2016 Season Patch" # "News Title #{moment().format("HH:mm:ss")}"
    type: "announcement"
    content: fs.readFileSync(__dirname + '/content.md').toString()
    created_at: moment().valueOf()

  console.log("adding news item: ", util.inspect(newsItem))

  item = fbRootRef.child("news").child("index").push()
  created_at = moment().valueOf()
  item.setWithPriority(
    title:newsItem.title
    type:newsItem.type
    created_at:newsItem.created_at
  , newsItem.created_at)
  fbRootRef.child("news").child("content").child(item.key()).setWithPriority(
    title:newsItem.title
    content:newsItem.content
    created_at:newsItem.created_at
  , newsItem.created_at)
