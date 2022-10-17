path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../'))

Promise = require 'bluebird'
Canvas = require 'canvas'
moment = require 'moment'
Image = Canvas.Image
Font = Canvas.Font
fs = require 'fs'
path = require "path"
colors = require 'colors'
plist = require 'plist'
csv = require 'csv'
mkdirp = require 'mkdirp'
_ = require 'underscore'

Promise.promisifyAll(fs)

###
fontFile = (name) ->
  return path.join(__dirname, '/../../app/resources/fonts/', name)

latoFont = new Font('Lato', fontFile("Lato-Regular.ttf"));
latoFont.addFace(fontFile("Lato-Regular.ttf"), 'normal');
latoFont.addFace(fontFile("Lato-Bold.ttf"), 'bold');
latoFont.addFace(fontFile("Lato-Light.ttf"), 'light');
####
exportKeysImage = (key,imgData,dirName)->
  # draw img
  img = new Image
  img.src = imgData

  # generate canvas based on img size
  canvas = new Canvas(img.width, img.height)
  ctx = canvas.getContext('2d')
  # ctx.addFont(latoFont)
  ctx.imageSmoothingEnabled = false

  # clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  # draw img
  ctx.drawImage(img, 0, 0, img.width, img.height)

  # key
  keyText = key.split("").join(" ")
  ctx.textAlign = "center"
  ctx.font = "bold 35px Lato"
  ctx.fillStyle = 'rgba(255,255,255,1)'
  ctx.fillText(keyText, 525, 500)

  fileName = key + ".png"
  console.log "saving #{fileName}"

  return new Promise (resolve,reject)->
    # png stream write
    stream = canvas.pngStream()
    out = fs.createWriteStream("#{__dirname}/#{dirName}/#{fileName}")
    stream.on('data', (chunk)->
      out.write(chunk)
    )
    stream.on('end', ()->
      resolve()
    )

fs.readFileAsync(__dirname + '/sarlac_prime.png')
.then (imgData) ->
  parser = csv.parse({delimiter: ';'}, (err, data) ->
    # generate 5000 keys
    # already generated first 10k
    data = data.slice(10000, 15000)
    Promise.map(data, ((keyData, index) ->
      key = keyData[0]
      return exportKeysImage(key,imgData,"images/",true)
    ), {concurrency: 1})
  )
  fs.createReadStream(__dirname+'/sarlac_prime_codes.csv').pipe(parser)

###
  ImageMagick command:
  montage "images/*.png" -tile 2x5 -geometry 1050x600 -density 300x300 -units PixelsPerInch "pages/keys.png" && mogrify -border 225x150 -density 300x300 -units PixelsPerInch "pages/*.png"
###
