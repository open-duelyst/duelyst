qs = require 'querystring'
prettyjson = require 'prettyjson'
moment = require 'moment'

module.exports = {}
module.exports.paypalNvpSearchResponseToObjects = (data)->

  response = qs.parse(data.toString())
  if response["L_TYPE100"]
    throw new Error("possibly too many responses")

  items = []

  if (response.ACK == 'Failure')
    console.log('ERROR'.red)
    console.log prettyjson.render response
  else
    for i in [0...100]
      if response["L_TYPE#{i}"]?
        items.push
          type: response["L_TYPE#{i}"]
          amount: response["L_AMT#{i}"]
          email: response["L_EMAIL#{i}"]
          status: response["L_STATUS#{i}"]
          id: response["L_TRANSACTIONID#{i}"]
          currency: response["L_CURRENCYCODE#{i}"]
          name: response["L_NAME#{i}"]
          date: moment(response["L_TIMESTAMP#{i}"])

  return items

module.exports.paypalNvpTransactionResponseToObject = (data)->

  response = qs.parse(data.toString())
  return response
