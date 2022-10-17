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
SDK = null
RSX = require '../../app/data/resources'
colors = require 'colors'
prettyjson = require 'prettyjson'
ProgressBar = require 'progress'
plist = require 'plist'
GIFEncoder = require 'gifencoder'
_ = require 'underscore'

Promise.promisifyAll(fs)

i18next = null

#### Main
Promise.resolve()
.bind {}
.then ()->
  return require './localization_index.coffee'
.then ()->
  i18next = require('i18next')
  return Promise.resolve()
.then ()->

  SDK = require '../../app/sdk'

  if (fs.existsSync("#{__dirname}/images"))
    count = 1
    while true
      if not fs.existsSync("#{__dirname}/images-#{count}")
        console.log("Moving previous images directory to #{"images-#{count}"}".green)
        fs.renameSync("#{__dirname}/images","#{__dirname}/images-#{count}")
        break
      count++
  fs.mkdirSync("#{__dirname}/images")
  return Promise.resolve()
.then ()->

 @.cards = [
   SDK.CardFactory.cardForIdentifier(454, SDK.GameSession.current())
 ]

  manualAdditions = [
  ]


  #@.cards = SDK.GameSession.getCardCaches().getIsCollectible(true).getCardSet(SDK.CardSet.Wartech).getIsPrismatic(false).getCards()

  ###
  @.cards = _.filter SDK.CardFactory.getAllCards(SDK.GameSession.current()), (c)->
    if _.contains(manualAdditions,c.id)
      return true

    coreSet = c.getCardSetId() == SDK.CardSet.Core
    shimzarSet = c.getCardSetId() == SDK.CardSet.Shimzar
    bloodstormSet = c.getCardSetId() == SDK.CardSet.Bloodborn
    firstWatchSet = c.getCardSetId() == SDK.CardSet.FirstWatch
    warTechSet = c.getCardSetId() == SDK.CardSet.Wartech
    notPrismatic = not SDK.Cards.getIsPrismaticCardId(c.id)
    notSkinned = not SDK.Cards.getIsSkinnedCardId(c.id)
    notTutorial = c.getFactionId() != SDK.Factions.Tutorial
    notHiddenInCollection = not c.getIsHiddenInCollection()
    notTile = not (c.getType() == SDK.CardType.Tile)
    notBoss = c.getFactionId() != SDK.Factions.Boss
    isToken = c.rarityId == SDK.Rarity.TokenUnit
    return notPrismatic and notSkinned and notTutorial and notBoss and notTile and warTechSet
  ###

  @.cardsJson = _.map @.cards, (c)->
    cardData = {
      id: c.id
      cardSetId: c.getCardSetId()
      cardSetName: SDK.CardSetFactory.cardSetForIdentifier(c.getCardSetId()).title
      faction: SDK.FactionFactory.factionForIdentifier(c.getFactionId()).name
      rarity: SDK.RarityFactory.rarityForIdentifier(c.getRarityId()).name
      name: c.name
      description: c.getDescription()
      manaCost: c.getManaCost()
      type: SDK.CardType.getNameForCardType(c.getType())
      race: SDK.RaceFactory.raceForIdentifier(c.getRaceId()).name.toUpperCase()
    }

    if c.getATK?
      cardData.attack = c.getATK()
      cardData.health = c.getHP()

    return cardData

.then ()->
  bar = new ProgressBar("Generating images [:bar] :current/:total :percent :etas :elapsed", {
    complete: '=',
    incomplete: ' ',
    width: 20,
    total: @.cards.length
  })
  Promise.map(@.cards, (card)=>
    alphaNumericName = card.name.replace(/\W/g, '')
    # console.log("processing #{card.id} - #{alphaNumericName}")

    # create target directory
    directory = "#{__dirname}/images/card-set-#{card.getCardSetId()}"
    if (!fs.existsSync(directory))
      fs.mkdirSync(directory)

    # write card set if not exists
    cardSetFileName = "#{__dirname}/images/card-set-#{card.getCardSetId()}/#{SDK.CardSetFactory.cardSetForIdentifier(card.getCardSetId()).devName}.json"
    if (!fs.existsSync(cardSetFileName))
      jsonSet = _.filter @.cardsJson, (jsonCard)-> return jsonCard.cardSetId == card.getCardSetId()
      fs.writeFileSync("#{__dirname}/images/card-set-#{card.getCardSetId()}/#{SDK.CardSetFactory.cardSetForIdentifier(card.getCardSetId()).devName}.json", JSON.stringify(jsonSet), 'utf8');

    console.log @.cardsJson

    ###
    Card with description
    ###
    # return Promise.all([
    #   exportCardImage(cardId,true)
    # ])


    ###
    Card without description
    ###
    # return Promise.all([
    #   exportCardImage(cardId,false)
    # ])

    ###
    Cards for Website
    ###
    # NOTE: for any GIFs you will have to run imagemagick convert to remove the fuscia background and turn it transparent
    # $ mogrify -transparent "#ff00ff" -set dispose previous *.gif
    return Promise.all([
      # exportAnimatedGIF(card.id, "idle"),
      # exportAnimatedGIF(card.id, "active"),
      # exportCardDescriptionImage(card.id),
      exportCardImage(card.id,true)
    ])
    .then ()->
      bar.tick()
      return Promise.resolve()
  ,{concurrency:1})
.then ()->
  # we're done
  console.log "DONE".green
  return Promise.resolve()
# endregion main


# region Helpers
###
fontFile = (name) ->
  return path.join(__dirname, '/../../app/resources/fonts/', name)

latoFont = new Font('Lato', fontFile("Lato-Regular.ttf"));
latoFont.addFace(fontFile("Lato-Regular.ttf"), 'normal');
latoFont.addFace(fontFile("Lato-Bold.ttf"), 'bold');
latoFont.addFace(fontFile("Lato-Light.ttf"), 'light');
####
exportCardImage = (cardIdentifier,showDetails=true,gif=false)->

  scaleFactor = 2.0
  padding = 90

  # set up card info
  card = SDK.CardFactory.cardForIdentifier(cardIdentifier, SDK.GameSession.current())

  # if file already exists, skip
  filePath = "#{__dirname}/images/card-set-#{card.getCardSetId()}/#{cardIdentifier}.png"
  try
    if fs.statSync(filePath)
      return Promise.resolve()
  catch error

  # idle animation resource name
  idleAnimationName = null
  if card.type == SDK.CardType.Unit
    idleAnimationName = card.getBaseAnimResource()["breathing"]
  if card.type == SDK.CardType.Spell
    idleAnimationName = card.getBaseAnimResource()["idle"]
  if card.type == SDK.CardType.Artifact
    idleAnimationName = card.getBaseAnimResource()["idle"]

  # idle animation resource
  idleAnimationResource = RSX[idleAnimationName]

  # card background asset file name
  cardBackgroundFile = if SDK.Cards.getIsPrismaticCardId(card.getId()) then "neutral_prismatic" else "neutral"
  if card.type == SDK.CardType.Unit
    cardBackgroundFile += "_unit"
  if card.type == SDK.CardType.Spell
    cardBackgroundFile += "_spell"
  if card.type == SDK.CardType.Artifact
    cardBackgroundFile += "_artifact"

  # rarity asset name
  cardRarityName = "basic"
  switch card.getRarityId()
    when SDK.Rarity.Common then cardRarityName = "common"
    when SDK.Rarity.Rare then cardRarityName = "rare"
    when SDK.Rarity.Epic then cardRarityName = "epic"
    when SDK.Rarity.Legendary then cardRarityName = "legendary"
    when SDK.Rarity.TokenUnit then cardRarityName = "token"
    when SDK.Rarity.Mythron then cardRarityName = "mythron"
    else cardRarityName = "basic"

  cardRarityFileReadPromise = Promise.resolve()
  if cardRarityName != "basic" and cardRarityName != "token"
    cardRarityFileReadPromise = fs.readFileAsync("#{__dirname}/../../app/resources/ui/collection_card_rarity_#{cardRarityName}@2x.png")

  # GIF encoder
  gifencoder = null

  if !idleAnimationResource?
    console.log("ERROR loading anim resourse for #{card.getName()}")
    return Promise.resolve()

  # start by loading the PLIST file for the animation resource
  return fs.readFileAsync("#{__dirname}/../../app/#{idleAnimationResource.plist}",'utf-8')
  .then (plistFileXml)->
    #console.log "loaded PLIST".cyan
    return Promise.all([
      plist.parse(plistFileXml),
      fs.readFileAsync("#{__dirname}/../../app/#{idleAnimationResource.img}"),
      fs.readFileAsync("#{__dirname}/../../app/resources/card_backgrounds/#{cardBackgroundFile}@2x.png"),
      fs.readFileAsync(__dirname + '/../../app/resources/ui/icon_mana.png'),
      fs.readFileAsync(__dirname + '/../../app/resources/card_backgrounds/stats_atk_bg.png'),
      fs.readFileAsync(__dirname + '/../../app/resources/card_backgrounds/stats_hp_bg.png'),
      fs.readFileAsync(__dirname + '/../../app/resources/ui/unit_shadow.png'),
      cardRarityFileReadPromise
    ])
  .spread (animationData,cardSpriteSheet,cardBg,manaCrystal,atk,hp,shadow,rarityIcon)->

    # draw card bg
    bgImg = new Image
    bgImg.src = cardBg

    # draw shadow bg
    shadowImg = new Image
    shadowImg.src = shadow

    # draw card bg
    cardImg = new Image
    cardImg.src = cardSpriteSheet

    # draw mana crystal
    manaCrystalImg = new Image
    manaCrystalImg.src = manaCrystal

    # rarity icon
    if rarityIcon
      rarityIconImage = new Image
      rarityIconImage.src = rarityIcon

    _.chain(animationData["frames"]).keys().each (k)->
      if k.indexOf(idleAnimationResource.framePrefix) != 0
        delete animationData["frames"][k]

    # idleAnimationFrames = _.filter(animationData["frames"],(v,k)->
    #   return k.indexOf(idleAnimationResource.framePrefix) == 0
    # )

    if gif
      gifencoder = new GIFEncoder(bgImg.width + padding*2, bgImg.height + padding*2)
      gifencoder.createReadStream().pipe(fs.createWriteStream("#{__dirname}/images/#{card.name}.gif"))
      gifencoder.start()
      gifencoder.setRepeat(0)
      gifencoder.setDelay(80)

    allFrameKeys = _.keys(animationData["frames"])

    # allFrameKeys = [allFrameKeys[0]]
    # idleFrameKey = allFrameKeys[0]

    saved = false

    return Promise.each allFrameKeys, (idleFrameKey)->

      # no need to process other frames if gif export not active
      if saved and not gif
        return

      # generate canvas based on bg size
      canvas = new Canvas(bgImg.width + padding*2, bgImg.height + padding*2)
      ctx = canvas.getContext('2d')
      # ctx.addFont(latoFont)
      ctx.imageSmoothingEnabled = false

      #console.log "processing frame #{idleFrameKey}"

      idleFrame = JSON.parse(animationData["frames"][idleFrameKey]["frame"].replace(/{/g,"[").replace(/}/g,"]"))

      # clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      # draw card bg
      ctx.drawImage(bgImg, padding, padding, bgImg.width, bgImg.height)

      # draw shadow bg
      shadowImgYPosition = if card.type == SDK.CardType.Unit then padding + scaleFactor*91 else padding + scaleFactor*90
      ctx.drawImage(shadowImg, 0, 0, shadowImg.width, shadowImg.height, canvas.width/2 - scaleFactor*shadowImg.width/2.0, shadowImgYPosition, scaleFactor*100, scaleFactor*30)

      # draw card img
      cardImgYPosition = padding + scaleFactor*139 - scaleFactor*idleFrame[1][1]*2
      if card.type != SDK.CardType.Unit then cardImgYPosition = padding+scaleFactor*25
      ctx.drawImage(cardImg, idleFrame[0][0], idleFrame[0][1], idleFrame[1][0], idleFrame[1][1], canvas.width/2-scaleFactor*idleFrame[1][0], cardImgYPosition, scaleFactor*idleFrame[1][0]*2, scaleFactor*idleFrame[1][1]*2)

      # draw mana crystal
      if (not card.isGeneral)
        ctx.drawImage(manaCrystalImg, padding-scaleFactor*20, padding-scaleFactor*20, scaleFactor*manaCrystalImg.width, scaleFactor*manaCrystalImg.height)

      # mana cost
      if showDetails
        ctx.textAlign = "center"
        ctx.font = "bold #{Math.round(24*scaleFactor)}px Lato"
        ctx.fillStyle = 'rgba(0,33,59,1)'


        if (not card.isGeneral)
          # ctx.fillText(card.getManaCost(), padding + scaleFactor * 9, padding + scaleFactor * 20)
          ctx.fillText(card.getManaCost(), padding+scaleFactor*14-14, padding+scaleFactor*20)

      # rarity icon
      if rarityIcon
        ctx.imageSmoothingEnabled = true
        ctx.drawImage(rarityIconImage, canvas.width/2 - scaleFactor*rarityIconImage.width/4, padding + scaleFactor*152, scaleFactor*rarityIconImage.width/2, scaleFactor*rarityIconImage.height/2)
        ctx.imageSmoothingEnabled = false

      # card name
      cardNamePositionY = padding + scaleFactor*135
      ctx.textAlign = "center"
      ctx.font = "bold #{Math.round(13*scaleFactor)}px Lato"
      ctx.fillStyle = 'rgba(255,255,255,1)'
      ctx.fillText(card.getName().toUpperCase(), canvas.width/2, cardNamePositionY)

      # card specific info
      cardTypeText = ""
      if SDK.CardType.getIsEntityCardType(card.getType())
        if card.getIsGeneral()
          cardTypeText = "GENERAL"
        else if card.getRaceId() != SDK.Races.Neutral
          cardTypeText = SDK.RaceFactory.raceForIdentifier(card.getRaceId()).name.toUpperCase()
        else
          cardTypeText = "MINION"

        if showDetails
          ctx.font = "bold #{Math.round(24*scaleFactor)}px Lato"
          ctx.fillStyle = 'rgba(255,255,0,1)'
          ctx.fillText(card.getATK(), padding + scaleFactor*51, padding + scaleFactor*187)
          ctx.fillStyle = 'rgba(255,0,0,1)'
          ctx.fillText(card.getHP(), padding + scaleFactor*171, padding + scaleFactor*187)

      else if card.getType() == SDK.CardType.Spell
        cardTypeText = "SPELL"
      else if card.getType() == SDK.CardType.Artifact
        cardTypeText = "ARTIFACT"

      # card type
      ctx.font = "#{Math.round(12*scaleFactor)}px Lato"
      ctx.fillStyle = '#90cacf'
      ctx.fillText(cardTypeText, canvas.width/2, cardNamePositionY + scaleFactor*15)

      # description
      if card.getDescription() && showDetails

        canvasText = new CanvasText()
        canvasText.config({
          canvas: canvas,
          textAlign: "center",
          verticalAlign: "center",
          context: ctx,
          fontFamily: "Lato",
          fontSize: "#{Math.round(10*scaleFactor)}px",
          fontWeight: "lighter",
          fontColor: "#90cacf",
          lineHeight: "#{Math.round(12*scaleFactor)}"
        })

        canvasText.defineClass("bold",{
          # fontSize: "#{Math.round(14*scaleFactor)}px",
          fontColor: "#90cacf" #ff0000",
          fontFamily: "Lato",
          fontWeight: "bold"
        })

        cardDescription = card.getDescription({
          boldStart:'<class="bold">',
          boldEnd:"</class>",
          entryDelimiter: "<br />"
        })
        textBoxWidth = bgImg.width - scaleFactor*60
        canvasText.drawText({
          text: cardDescription,
          x: canvas.width / 2,
          y: padding + scaleFactor*252,
          # boxWidth: bgImg.width - scaleFactor*50
          boxWidth: textBoxWidth
        })

      # add frame to animated gif
      if gif
        gifencoder.setQuality(1)
        gifencoder.addFrame(ctx)

      if not saved
        saved = true
        # console.log "saving #{filePath}"

        # png stream write
        stream = canvas.pngStream()
        detailsKey = if showDetails then "" else "_no_details"
        out = fs.createWriteStream(filePath)
        stream.on('data', (chunk)->
          out.write(chunk)
        )

        return new Promise (resolve,reject)->

          stream.on('end', ()->
            resolve()
          )
      else
        return Promise.resolve()

  .then ()->
    if gif
      gifencoder.finish()
  .catch (e)->
    console.error "error exporting card #{card.name}", e
    throw e

exportAnimatedGIF = (cardIdentifier,animationType="idle")->

  scaleFactor = 1.0
  padding = 0
  width = 120
  height = 120

  # set up card info
  card = SDK.CardFactory.cardForIdentifier(cardIdentifier, SDK.GameSession.current())

  # if file already exists, skip
  filePath = "#{__dirname}/images/card-set-#{card.getCardSetId()}/#{card.id}_#{animationType}.gif"
  try
    if fs.statSync(filePath)
      return Promise.resolve()
  catch error

  # idle animation resource name
  idleAnimationName = null
  if animationType == "idle"
    if card.type == SDK.CardType.Unit
      idleAnimationName = card.getBaseAnimResource()["breathing"]
    if card.type == SDK.CardType.Spell
      idleAnimationName = card.getBaseAnimResource()["idle"]
    if card.type == SDK.CardType.Artifact
      idleAnimationName = card.getBaseAnimResource()["idle"]
  if animationType == "active"
    if card.type == SDK.CardType.Unit
      idleAnimationName = card.getBaseAnimResource()["idle"]
    if card.type == SDK.CardType.Spell
      idleAnimationName = card.getBaseAnimResource()["active"]
    if card.type == SDK.CardType.Artifact
      idleAnimationName = card.getBaseAnimResource()["active"]

  # idle animation resource
  idleAnimationResource = RSX[idleAnimationName]

  if !idleAnimationResource?
    console.log("ERROR loading anim resourse for #{card.getName()}")
    return Promise.resolve()

  # card background asset file name
  cardBackgroundFile = if SDK.Cards.getIsPrismaticCardId(card.getId()) then "neutral_prismatic" else "neutral"
  if card.type == SDK.CardType.Unit
    cardBackgroundFile += "_unit"
  if card.type == SDK.CardType.Spell
    cardBackgroundFile += "_spell"
  if card.type == SDK.CardType.Artifact
    cardBackgroundFile += "_artifact"

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

    gifencoder = new GIFEncoder(width + padding*2, height + padding*2)
    gifencoder.createReadStream().pipe(fs.createWriteStream(filePath))
    gifencoder.start()
    gifencoder.setRepeat(0)
    gifencoder.setDelay(80)
    gifencoder.setQuality(1)
    # gifencoder.setTransparent(0xff00ff)

    allFrameKeys = _.keys(animationData["frames"])

    saved = false

    return Promise.each allFrameKeys, (idleFrameKey)->

      # generate canvas based on bg size
      canvas = new Canvas(width + padding*2, height + padding*2)
      ctx = canvas.getContext('2d')
      # ctx.addFont(latoFont)
      ctx.imageSmoothingEnabled = false

      #console.log "processing frame #{idleFrameKey}"

      idleFrame = JSON.parse(animationData["frames"][idleFrameKey]["frame"].replace(/{/g,"[").replace(/}/g,"]"))

      # clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = 'rgba(255,0,255,255)'
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

exportCardDescriptionImage = (cardIdentifier)->

  scaleFactor = 2.0
  padding = 90

  # set up card info
  card = SDK.CardFactory.cardForIdentifier(cardIdentifier, SDK.GameSession.current())

  # if file already exists, skip
  filePath = "#{__dirname}/images/card-set-#{card.getCardSetId()}/#{cardIdentifier}_description.png"
  try
    if fs.statSync(filePath)
      return Promise.resolve()
  catch error

  # set up card info
  card = SDK.CardFactory.cardForIdentifier(cardIdentifier, SDK.GameSession.current())

  # card background asset file name
  cardBackgroundFile = if SDK.Cards.getIsPrismaticCardId(card.getId()) then "neutral_prismatic" else "neutral"
  if card.type == SDK.CardType.Unit
    cardBackgroundFile += "_unit"
  if card.type == SDK.CardType.Spell
    cardBackgroundFile += "_spell"
  if card.type == SDK.CardType.Artifact
    cardBackgroundFile += "_artifact"

  # rarity asset name
  cardRarityName = "basic"
  switch card.getRarityId()
    when SDK.Rarity.Common then cardRarityName = "common"
    when SDK.Rarity.Rare then cardRarityName = "rare"
    when SDK.Rarity.Epic then cardRarityName = "epic"
    when SDK.Rarity.Legendary then cardRarityName = "legendary"
    when SDK.Rarity.TokenUnit then cardRarityName = "token"
    when SDK.Rarity.Mythron then cardRarityName = "mythron"
    else cardRarityName = "basic"

  cardRarityFileReadPromise = Promise.resolve()
  if cardRarityName != "basic" and cardRarityName != "token"
    cardRarityFileReadPromise = fs.readFileAsync("#{__dirname}/../../app/resources/ui/collection_card_rarity_#{cardRarityName}@2x.png")

  return Promise.all([
    cardRarityFileReadPromise
    fs.readFileAsync("#{__dirname}/../../app/resources/card_backgrounds/#{cardBackgroundFile}@2x.png"),
  ])
  .spread (rarityIcon,cardBg)->

    # draw card bg
    bgImg = new Image
    bgImg.src = cardBg

    # rarity icon
    if rarityIcon
      rarityIconImage = new Image
      rarityIconImage.src = rarityIcon

    # generate canvas based on bg size
    canvas = new Canvas(bgImg.width + padding*2, bgImg.height + padding*2)
    ctx = canvas.getContext('2d')
    # ctx.addFont(latoFont)
    ctx.imageSmoothingEnabled = false

    # clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    # mana cost
    ctx.textAlign = "center"
    ctx.font = "bold #{Math.round(24*scaleFactor)}px Lato"
    ctx.fillStyle = 'rgba(0,33,59,1)'
    ctx.fillText(card.getManaCost(), padding+scaleFactor*14-14, padding+scaleFactor*20)

    # rarity icon
    if rarityIcon
      ctx.imageSmoothingEnabled = true
      ctx.drawImage(rarityIconImage, canvas.width/2 - scaleFactor*rarityIconImage.width/4, padding + scaleFactor*152, scaleFactor*rarityIconImage.width/2, scaleFactor*rarityIconImage.height/2)
      ctx.imageSmoothingEnabled = false

    # card name
    cardNamePositionY = padding + scaleFactor*135
    ctx.textAlign = "center"
    ctx.font = "bold #{Math.round(14*scaleFactor)}px Lato"
    ctx.fillStyle = 'rgba(255,255,255,1)'
    ctx.fillText(card.getName().toUpperCase(), canvas.width/2, cardNamePositionY)

    # card specific info
    cardTypeText = ""
    if SDK.CardType.getIsEntityCardType(card.getType())
      if card.getIsGeneral()
        cardTypeText = "GENERAL"
      else if card.getRaceId() != SDK.Races.Neutral
        cardTypeText = SDK.RaceFactory.raceForIdentifier(card.getRaceId()).name.toUpperCase()
      else
        cardTypeText = "MINION"

      ctx.font = "bold #{Math.round(24*scaleFactor)}px Lato"
      ctx.fillStyle = 'rgba(255,255,0,1)'
      ctx.fillText(card.getATK(), padding + scaleFactor*51, padding + scaleFactor*187)
      ctx.fillStyle = 'rgba(255,0,0,1)'
      ctx.fillText(card.getHP(), padding + scaleFactor*171, padding + scaleFactor*187)

    else if card.getType() == SDK.CardType.Spell
      cardTypeText = "SPELL"
    else if card.getType() == SDK.CardType.Artifact
      cardTypeText = "ARTIFACT"

    # card type
    ctx.font = "#{Math.round(12*scaleFactor)}px Lato"
    ctx.fillStyle = '#90cacf'
    ctx.fillText(cardTypeText, canvas.width/2, cardNamePositionY + scaleFactor*15)

    # description
    if card.getDescription()

      canvasText = new CanvasText()
      canvasText.config({
        canvas: canvas,
        textAlign: "center",
        verticalAlign: "center",
        context: ctx,
        fontFamily: "Lato",
        fontSize: "#{Math.round(13*scaleFactor)}px",
        fontWeight: "lighter",
        fontColor: "#90cacf",
        lineHeight: "#{Math.round(15*scaleFactor)}"
      })

      canvasText.defineClass("bold",{
        # fontSize: "#{Math.round(14*scaleFactor)}px",
        fontColor: "#90cacf" #ff0000",
        fontFamily: "Lato",
        fontWeight: "bold"
      })

      cardDescription = card.getDescription({
        boldStart:'<class="bold">',
        boldEnd:"</class>",
        entryDelimiter: "<br />"
      })
      canvasText.drawText({
        text: cardDescription,
        x: canvas.width / 2,
        y: padding + scaleFactor*252,
        boxWidth: bgImg.width - scaleFactor*20
      })

    # png stream write
    stream = canvas.pngStream()
    out = fs.createWriteStream(filePath)
    stream.on 'data', (chunk)->
      out.write(chunk)

    return new Promise (resolve,reject)->
      stream.on 'end', ()->
        resolve()

  .catch (e)->
    console.error "error exporting card #{card.name}", e
    throw e
# endregion helpers
