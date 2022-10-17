moment = require('moment')
changeCase = require('change-case')


module.exports.updateCounterWithGameOutcome = (counter,isWinner,isDraw,isUnscored)->

  counter = counter || {}
  counter.game_count ?= 0
  counter.win_count ?= 0
  counter.loss_count ?= 0
  counter.draw_count ?= 0
  counter.unscored_count ?= 0
  counter.win_streak ?= 0
  counter.loss_streak ?= 0
  counter.top_win_streak ?= 0
  counter.top_loss_streak ?= 0

  counter.game_count += 1

  # update counts
  if isDraw
    counter.draw_count += 1
  else if isWinner
    counter.win_count += 1
  else
    counter.loss_count += 1

  # update streaks unless draw
  if !isDraw
    if isWinner
      counter.loss_streak = 0
      counter.win_streak += 1
    else
      counter.win_streak = 0
      counter.loss_streak += 1

  if isUnscored
    counter.unscored_count += 1

  if counter.win_streak > counter.top_win_streak
    counter.top_win_streak = counter.win_streak

  if counter.loss_streak > counter.top_loss_streak
    counter.top_loss_streak = counter.loss_streak

  return counter

module.exports.restifyData = (data)->

  if data instanceof Array

    for item,i in data
      data[i] = module.exports.restifyData(item)

  else

    for key,val of data
      if val instanceof Date
        data[key] = moment.utc(val).valueOf()

  return data

module.exports.camelCaseData = (data)->

  newData = {}
  for key,val of data
    newData[changeCase.camelCase(key)] = val

  return newData

module.exports.snakeCaseData = (data)->

  newData = {}
  for key,val of data
    newData[changeCase.snakeCase(key)] = val

  return newData
