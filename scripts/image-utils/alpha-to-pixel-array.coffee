util = require('util')
getPixels = require("get-pixels")

getPixels("#{__dirname}/../../app/resources/scenes/shimzar/lights_right.jpg", (err, pixels)->
  if(err)
    console.log("Bad image path")
    return
  console.log("got pixels", pixels.shape.slice())

  arr = []

  for x in [0..pixels.shape[0]]
    for y in [0..pixels.shape[1]]
      r = pixels.get(x,y,0)
      g = pixels.get(x,y,1)
      b = pixels.get(x,y,2)
      val = (r + g + b) / 3
      if (val > 50)
        arr.push({x:x,y:pixels.shape[1] - y})

  console.log(util.inspect(arr, { maxArrayLength: null }))
)
