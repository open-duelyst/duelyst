config 		= require '../../config/config'
google = require 'googleapis'

Google = {}
# Client ID and client secret are available at
# https://code.google.com/apis/console
Google.CLIENT_ID = '447888120262-2musdbth6trn01ptr1qs9t5rpulv2n1l.apps.googleusercontent.com'
Google.CLIENT_SECRET = 'Ip0JakMdJzaWMr5fcLI6VC0_'
Google.REDIRECT_URL = 'https://play.duelyst.com/'
# Android Google Play Application ID
Google.APPLICATION_ID = '447888120262'
Google.plus = google.plus('v1')
Google.games = google.games('v1')
Google.oauth2Client = new google.auth.OAuth2(Google.CLIENT_ID, Google.CLIENT_SECRET, Google.REDIRECT_URL)

module.exports = Google