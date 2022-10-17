Promise = require 'bluebird'
_ = require 'underscore'
r = require '../r-client'
ts = require '../r-timeseries'

t = new ts(r)

hits = []
for i in [0..999]
  hits.push(t.hit())

Promise.all(hits).then () ->
  console.log "1000 hits created."
  
  t.query(2).then (scores) ->
    console.log "Scores:"
    console.log scores

  t.countHits().then (count) ->
    console.log "Hits: #{count}"