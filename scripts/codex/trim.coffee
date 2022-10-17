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
exec = require('child_process').exec
ProgressBar = require 'progress'

Promise.promisifyAll(fs)

exportAnimatedGIF = (animationRsxKey)->

  scaleFactor = 1.0
  padding = 0

  # grab the animation resource
  animationResource = RSX[animationRsxKey]

  if !animationResource?
    console.log("ERROR loading anim resourse for key #{animationRsxKey}")
    return Promise.resolve()

  # where to save the file
  filePath = process.cwd() + "/#{animationResource.framePrefix.slice(0,-1)}.gif"
  tmpFilePath = process.cwd() + "/#{animationResource.framePrefix.slice(0,-1)}.gif~"

  # if file already exists, skip
  try
    if fs.statSync(filePath)
      return Promise.resolve(filePath)
  catch error

  # console.log "saving #{filePath}"

  # GIF encoder
  gifencoder = null
  if fs.existsSync(tmpFilePath)
    fs.unlinkSync(tmpFilePath)
  writeStream = fs.createWriteStream(tmpFilePath)

  # start by loading the PLIST file for the animation resource
  return fs.readFileAsync("#{__dirname}/../../app/#{animationResource.plist}",'utf-8')
  .then (plistFileXml)->
    return Promise.all([
      plist.parse(plistFileXml),
      fs.readFileAsync("#{__dirname}/../../app/#{animationResource.img}")
    ])
  .spread (animationData,spriteSheetImage)->

    # console.log "parsed data for #{filePath}"

    cardImg = new Image
    cardImg.src = spriteSheetImage

    _.chain(animationData["frames"]).keys().each (k)->
      if k.indexOf(animationResource.framePrefix) != 0 || k.replace(animationResource.framePrefix,"").length > 8
        delete animationData["frames"][k]

    allFrameKeys = _.keys(animationData["frames"])

    if not animationData["frames"][allFrameKeys[0]]
      console.log "ERROR: #{animationResource.framePrefix} missing"
      return Promise.resolve()

    frameSize = JSON.parse(animationData["frames"][allFrameKeys[0]].sourceSize.replace(/{/g,"[").replace(/}/g,"]"))

    width = frameSize[0]
    height = frameSize[1]

    gifencoder = new GIFEncoder(width + padding*2, height + padding*2)
    gifencoder.createReadStream().pipe(writeStream)
    gifencoder.start()
    gifencoder.setRepeat(0)
    gifencoder.setDelay(1000/16)
    gifencoder.setQuality(1)
    # gifencoder.setTransparent(0xff00ff)

    saved = false

    return Promise.each allFrameKeys, (idleFrameKey)->

      # console.log "drawing frame for #{filePath}"

      # generate canvas based on bg size
      canvas = new Canvas(width + padding*2, height + padding*2)
      ctx = canvas.getContext('2d')
      ctx.imageSmoothingEnabled = false

      idleFrame = JSON.parse(animationData["frames"][idleFrameKey]["frame"].replace(/{/g,"[").replace(/}/g,"]"))

      # clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#043247' #'rgba(4,50,71,255)'
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      # draw card img
      ctx.drawImage(
        cardImg,
        idleFrame[0][0], # sX
        idleFrame[0][1], # sY
        idleFrame[1][0], # sWidth
        idleFrame[1][1], # sHeight
        canvas.width/2 - scaleFactor*idleFrame[1][0]/2, # dx
        canvas.height - scaleFactor*idleFrame[1][1], # dy
        scaleFactor*idleFrame[1][0], # dw
        scaleFactor*idleFrame[1][1] # dh
      )
      # add frame to animated gif
      gifencoder.addFrame(ctx)
      return Promise.resolve()
  .then ()->
    return new Promise (resolve,reject)->
      writeStream.on('close',()->
        # console.log "closed #{filePath}"
        resolve()
      )
      gifencoder?.finish()
  .then ()->
    # console.log "renaming #{filePath}"
    return fs.renameAsync(tmpFilePath, filePath)
  .then ()->
    console.log "done: #{filePath}"
    return filePath
  .catch (e)->
    console.error "error exporting animation #{animationRsxKey}", e
    throw e

group = "units"

animationKeys = _.keys(RSX)
animationKeys = _.filter(animationKeys,(k)-> return RSX[k].framePrefix? and RSX[k].img?.indexOf('.png') > 0 )
animationKeys = _.filter(animationKeys,(k)-> return RSX[k].img.indexOf("/#{group}") > 0 )
animationKeys = _.sortBy(animationKeys,(k)-> return RSX[k].plist )

groupedKeys = _.groupBy(animationKeys,(k)-> return path.basename(RSX[k].plist,'.plist') )

# console.log(groupedKeys)
console.log('Starting directory: ' + process.cwd());
process.chdir('./images/parts')
process.chdir(group)
console.log('changed to directory: ' + process.cwd());

bar = new ProgressBar('generating [:bar] :percent :etas', {
  complete: '=',
  incomplete: ' ',
  width: 20,
  total: _.keys(groupedKeys).length
})

borked = [
  "neutral_shadowranged"
  "neutral_shadowcaster"
  "neutral_shadow3"
  "neutral_shadow2"
  "neutral_mob_shadow01"
  "neutral_mercranged1"
  "neutral_mercmelee4"
  "neutral_mercmelee3"
  "neutral_mercmelee2"
  "neutral_mercmelee1"
  "neutral_merccaster1"
  "neutral_golemstone"
  "neutral_golemsteel"
  "neutral_golemice"
  "f3_zodiac02"
  "f3_zodiac"
  "f2_hammonbladeseeker"
  "f1_ranged"
  "f1_general_skinroguelegacy"
  "f5_tank"
  "f5_support"
  "f5_vindicator"
]

Promise.map(_.keys(groupedKeys), (k)->

  if fs.existsSync(process.cwd() + "/#{k}.plist")
    bar.tick()
  else if not _.include(borked,k)
    bar.tick()
  else
    return Promise.map(groupedKeys[k],(animationKey)->
      return exportAnimatedGIF(animationKey)
      .then (filePath)->
        return new Promise (resolve,reject)->
          exec "mogrify -fuzz 1% -transparent \"#043247\" -set dispose previous #{filePath}", (error, stdout, stderr)->
            if error then reject(error) else resolve(stdout)
    )
    # .then ()->
    #   return new Promise (resolve,reject)->
    #     exec "mogrify -fuzz 1% -transparent \"#043247\" -set dispose previous #{animationKey}.gif", (error, stdout, stderr)->
    #       if error then reject(error) else resolve(stdout)
    .then ()->
      animationFiles = _.map(groupedKeys[k], (r)-> return "#{RSX[r].framePrefix.slice(0,-1)}.gif")
      command = '/Applications/ShoeBox.app/Contents/MacOS/ShoeBox --args "plugin=shoebox.plugin.spriteSheet::PluginCreateSpriteSheet" "files='
      for animationFileName in animationFiles
        command += process.cwd() + "/" + animationFileName + ","
      command = command.slice(0,-1)
      command += '" "animationMaxFrames=100" "fileFormatOuter=<plist><dict><key>frames</key><dict>@loop</dict><key>metadata</key><dict><key>format</key><integer>2</integer><key>size</key><string>{@W,@H}</string><key>textureFileName</key><string>@TexName</string></dict></dict></plist>" "animationFrameIdStart=0" "scale=1" "useCssOverHack=false" "texCropAlpha=true" "fileFormatLoop=<key>@id</key><dict><key>frame</key><string>{{@x,@y},{@w,@h}}</string><key>offset</key><string>{0,0}</string><key>rotated</key><false/><key>sourceColorRect</key><string>{{@fx,@fy},{@w,@h}}</string><key>sourceSize</key><string>{@fw,@fh}</string></dict>" "texPadding=1" "renderDebugLayer=false" "texPowerOfTwo=true" "texMaxSize=2048" "fileGenerate2xSize=false" "texSquare=false" "fileName='+k+'.plist" "texExtrudeSize=0" "animationNameIds=@name_###.png"'
      return new Promise (resolve,reject)->
        exec command, (error, stdout, stderr)->
          if error then reject(error) else resolve(stdout)
    .then ()->
      console.log "shoebox done (#{k})"
      bar.tick()

, {concurrency:1})

# Promise.map(animationKeys, (k)->
#   unless fs.existsSync(process.cwd() + "/#{k}.plist")
#     return exportAnimatedGIF(k)
# , {concurrency:1})
# .bind {}
# .then ()->
#   # we're done... time to run mogrify
#   return new Promise (resolve,reject)->
#     exec('mogrify -fuzz 1% -transparent "#043247" -set dispose previous *.gif', (error, stdout, stderr)->
#       if error then reject(error) else resolve(stdout)
#     )
# .then ()->
#   # return process.exit(0)
#   filenames = _.keys(groupedKeys)
#   commands = []
#   # let's put together a shoebox command for each set of files
#   for filename in filenames
#     animationFiles = _.map(groupedKeys[filename], (r)-> return "#{RSX[r].framePrefix.slice(0,-1)}.gif")
#     command = 'open /Applications/ShoeBox.app --args "plugin=shoebox.plugin.spriteSheet::PluginCreateSpriteSheet" "files='
#     for animationFileName in animationFiles
#       command += process.cwd() + "/" + animationFileName + ","
#     command = command.slice(0,-1)
#     command += '" "animationMaxFrames=100" "fileFormatOuter=<plist><dict><key>frames</key><dict>@loop</dict><key>metadata</key><dict><key>format</key><integer>2</integer><key>size</key><string>{@W,@H}</string><key>textureFileName</key><string>@TexName</string></dict></dict></plist>" "animationFrameIdStart=0" "scale=1" "useCssOverHack=false" "texCropAlpha=true" "fileFormatLoop=<key>@id</key><dict><key>frame</key><string>{{@x,@y},{@w,@h}}</string><key>offset</key><string>{0,0}</string><key>rotated</key><false/><key>sourceColorRect</key><string>{{@fx,@fy},{@w,@h}}</string><key>sourceSize</key><string>{@fw,@fh}</string></dict>" "texPadding=1" "renderDebugLayer=false" "texPowerOfTwo=true" "texMaxSize=2048" "fileGenerate2xSize=false" "texSquare=false" "fileName='+filename+'.plist" "texExtrudeSize=0" "animationNameIds=@name_###.png"'
#     commands.push command
#   # let's shoebox each set of files
#   # open /Applications/ShoeBox.app --args "plugin=shoebox.plugin.spriteSheet::PluginCreateSpriteSheet" "files=/Users/emil/Dropbox/Sprite Trim Project with Kevin/source assets/F1 Lyonar/f1_altgeneral_attack.gif,/Users/emil/Dropbox/Sprite Trim Project with Kevin/source assets/F1 Lyonar/f1_altgeneral_breathing.gif,/Users/emil/Dropbox/Sprite Trim Project with Kevin/source assets/F1 Lyonar/f1_altgeneral_cast.gif,/Users/emil/Dropbox/Sprite Trim Project with Kevin/source assets/F1 Lyonar/f1_altgeneral_castend.gif,/Users/emil/Dropbox/Sprite Trim Project with Kevin/source assets/F1 Lyonar/f1_altgeneral_castloop.gif,/Users/emil/Dropbox/Sprite Trim Project with Kevin/source assets/F1 Lyonar/f1_altgeneral_caststart.gif,/Users/emil/Dropbox/Sprite Trim Project with Kevin/source assets/F1 Lyonar/f1_altgeneral_death.gif,/Users/emil/Dropbox/Sprite Trim Project with Kevin/source assets/F1 Lyonar/f1_altgeneral_hit.gif,/Users/emil/Dropbox/Sprite Trim Project with Kevin/source assets/F1 Lyonar/f1_altgeneral_idle.gif,/Users/emil/Dropbox/Sprite Trim Project with Kevin/source assets/F1 Lyonar/f1_altgeneral_run.gif" "animationMaxFrames=100" "fileFormatOuter=<plist><dict><key>frames</key><dict>@loop</dict><key>metadata</key><dict><key>format</key><integer>2</integer><key>size</key><string>{@W,@H}</string><key>textureFileName</key><string>@TexName</string></dict></dict></plist>" "animationFrameIdStart=0" "scale=1" "useCssOverHack=false" "texCropAlpha=true" "fileFormatLoop=<key>@id</key><dict><key>frame</key><string>{{@x,@y},{@w,@h}}</string><key>offset</key><string>{0,0}</string><key>rotated</key><false/><key>sourceColorRect</key><string>{{@fx,@fy},{@w,@h}}</string><key>sourceSize</key><string>{@fw,@fh}</string></dict>" "texPadding=1" "renderDebugLayer=false" "texPowerOfTwo=true" "texMaxSize=2048" "fileGenerate2xSize=false" "texSquare=false" "fileName=f1_altgeneral_CMD.plist" "texExtrudeSize=0" "animationNameIds=@name_###.png"
#   return Promise.map(commands,(c)->
#     console.log "      "
#     console.log "executing shoebox command: #{c}"
#     return new Promise (resolve,reject)->
#       exec(c, (error, stdout, stderr)->
#         if error then reject(error) else resolve(stdout)
#       )
#     .then ()-> return Promise.delay(2000)
#   ,{concurrency:1})
.then ()->
  # validate

  console.log "DONE".green
