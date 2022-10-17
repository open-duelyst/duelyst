path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../'))

Promise = require 'bluebird'
Canvas = require 'canvas'
moment = require 'moment'
CanvasText = require './CanvasText-0.4.1'
Image = Canvas.Image
Font = Canvas.Font
fs = require 'fs'
path = require "path"
SDK = require '../../app/sdk'
RSX = require '../../app/data/resources'
colors = require 'colors'
prettyjson = require 'prettyjson'
plist = require 'plist'
GIFEncoder = require 'gifencoder'
_ = require 'underscore'

Promise.promisifyAll(fs)

exportAnimatedGIF = (cardIdentifier,animationType="idle")->

  scaleFactor = 1.0
  padding = 0

  # set up card info
  card = SDK.CardFactory.cardForIdentifier(cardIdentifier, SDK.GameSession.current())

  console.log(_.keys(card.getBaseAnimResource()))

  # idle animation resource name
  idleAnimationName = card.getBaseAnimResource()[animationType]

  # idle animation resource
  idleAnimationResource = RSX[idleAnimationName]

  # if file already exists, skip
  filePath = "#{__dirname}/images/parts/#{idleAnimationResource.framePrefix.slice(0,-1)}.gif"
  try
    if fs.statSync(filePath)
      return Promise.resolve()
  catch error

  if !idleAnimationResource?
    console.log("ERROR loading anim resourse for #{card.getName()}")
    return Promise.resolve()

  # GIF encoder
  gifencoder = null

  # start by loading the PLIST file for the animation resource
  return fs.readFileAsync("#{__dirname}/../../app/#{idleAnimationResource.plist}",'utf-8')
  .then (plistFileXml)->
    #console.log "loaded PLIST".cyan
    return Promise.all([
      plist.parse(plistFileXml),
      fs.readFileAsync("#{__dirname}/../../app/#{idleAnimationResource.img}")
    ])
  .spread (animationData,cardSpriteSheet)->

    # draw card bg
    cardImg = new Image
    cardImg.src = cardSpriteSheet

    #console.log(idleAnimationResource.framePrefix)

    _.chain(animationData["frames"]).keys().each (k)->
      if k.indexOf(idleAnimationResource.framePrefix) != 0 || k.replace(idleAnimationResource.framePrefix,"").length > 8
        #console.log("found frame to delete at #{k}")
        delete animationData["frames"][k]

    # idleAnimationFrames = _.filter(animationData["frames"],(v,k)->
    #   return k.indexOf(idleAnimationResource.framePrefix) == 0
    # )

    allFrameKeys = _.keys(animationData["frames"])

    frameSize = JSON.parse(animationData["frames"][allFrameKeys[0]].sourceSize.replace(/{/g,"[").replace(/}/g,"]"))

    width = frameSize[0]
    height = frameSize[1]

    gifencoder = new GIFEncoder(width + padding*2, height + padding*2)
    gifencoder.createReadStream().pipe(fs.createWriteStream(filePath))
    gifencoder.start()
    gifencoder.setRepeat(0)
    gifencoder.setDelay(1000/16)
    gifencoder.setQuality(1)
    # gifencoder.setTransparent(0xff00ff)

    saved = false

    return Promise.each allFrameKeys, (idleFrameKey)->

      # generate canvas based on bg size
      canvas = new Canvas(width + padding*2, height + padding*2)
      ctx = canvas.getContext('2d')
      ctx.imageSmoothingEnabled = false

      idleFrame = JSON.parse(animationData["frames"][idleFrameKey]["frame"].replace(/{/g,"[").replace(/}/g,"]"))

      # clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = 'rgba(4,50,71,255)'
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      # draw card img
      cardImgYPosition = padding + scaleFactor*0 # - scaleFactor*idleFrame[1][1]*2
      if card.type != SDK.CardType.Unit then cardImgYPosition = padding+scaleFactor*25
      ctx.drawImage(
        cardImg,
        idleFrame[0][0], # sX
        idleFrame[0][1], # sY
        idleFrame[1][0], # sWidth
        idleFrame[1][1], # sHeight
        canvas.width/2 - scaleFactor*idleFrame[1][0]/2, # dx
        canvas.height - scaleFactor*idleFrame[1][1], # dy
        # cardImgYPosition, # dy
        scaleFactor*idleFrame[1][0], # dw
        scaleFactor*idleFrame[1][1] # dh
      )
      # add frame to animated gif
      gifencoder.addFrame(ctx)
      return Promise.resolve()
  .then ()->
    gifencoder.finish()
  .catch (e)->
    console.error "error exporting card #{card.name}", e
    throw e

cards = _.filter SDK.CardFactory.getAllCards(SDK.GameSession.current()), (c)->
  return c.getFactionId() == SDK.Factions.Faction5

processCard = (card)->
  Promise.all([
    exportAnimatedGIF(card.id,"attack")
    exportAnimatedGIF(card.id,"breathing")
    exportAnimatedGIF(card.id,"death")
    exportAnimatedGIF(card.id,"damage")
    exportAnimatedGIF(card.id,"idle")
    exportAnimatedGIF(card.id,"walk")
  ])

Promise.map([
  {id:SDK.Cards.Faction5.Gro},
  {id:SDK.Cards.Faction2.Xho},
], processCard, {concurrency:5}).then ()->
  # we're done
  # time to run mogrify -transparent "#043247" -set dispose previous *.gif
  console.log "DONE".green
