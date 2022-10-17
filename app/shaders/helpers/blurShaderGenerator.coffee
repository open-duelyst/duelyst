template = require './blurShaderTemplate.hbs'
_ = require 'underscore'
glslify = require 'glslify'

# nvidia suggests kernel size = sigma * 3
# we'll use sigma * 2 for increased performance
SIGMA_KERNEL_RATIO = 2.0

# kernel size shouldn't dip below 5x5
MIN_KERNEL_SIZE = 5.0

class BlurShaderGenerator

  @compileShader: (name,sigma=2.0,kernelSize=null)->
    blurProgram = new cc.GLProgram()
    blurProgram.initWithVertexShaderByteArray(glslify("./PosTexVertex.glsl"), @.generateFragmentShaderCode(sigma,kernelSize))
    blurProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION)
    blurProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS)
    blurProgram.link()
    blurProgram.updateUniforms()
    blurProgram.loc_xStep = blurProgram.getUniformLocationForName("u_xStep")
    blurProgram.loc_yStep = blurProgram.getUniformLocationForName("u_yStep")
    cc.shaderCache.addProgram(blurProgram, name)

  @generateFragmentShaderCode: (sigma, kernelSize=null)->
    if !kernelSize?
      # calculate kernel size from sigma
      kernelSize = sigma * SIGMA_KERNEL_RATIO

    # kernel size must always be odd and never below minimum
    kernelSize = Math.max(MIN_KERNEL_SIZE, kernelSize + 1.0 - kernelSize % 2)

    # generate brightness from sigma and kernel size
    # blur shaders are low-pass and tend to reduce brightness
    # we'll roughly approximate a boost to brightness
    # where the higher the sigma and kernel size, the higher the boost
    expectedKernelSize = Math.max(MIN_KERNEL_SIZE, sigma * SIGMA_KERNEL_RATIO + 1.0 - (sigma * SIGMA_KERNEL_RATIO) % 2.0)
    brightness = parseFloat(1.0 + (sigma/4/100.0) + kernelSize * ((kernelSize / expectedKernelSize) - 1.0) / 2000.0)

    # generate kernel
    kernel = @.generateKernel(sigma,kernelSize,1000)
    kernel1d = _.map(kernel, (kColumn) => return @.roundTo(kColumn[1], 6))
    kernelRows = _.map kernel1d, (value,i) ->
      offset = i - Math.ceil(kernelSize/2)
      return {
        "offset": parseFloat(Math.abs(offset)).toFixed(1)
        "value": parseFloat(value).toFixed(6)
        "operator": if (offset < 0) then "-" else "+"
      }

    # generate code from template
    shaderCode = template(
      "kernelRows":kernelRows
      "brightness": brightness.toFixed(3)
    )

    return shaderCode

  @gaussianDistribution = (x, mu, sigma) ->
    d = x - mu
    n = 1.0 / (Math.sqrt(2 * Math.PI) * sigma)
    Math.exp(-d * d / (2 * sigma * sigma)) * n

  @sampleInterval = (f, minInclusive, maxInclusive, sampleCount) ->
    result = []
    stepSize = (maxInclusive - minInclusive) / (sampleCount - 1)
    s = 0
    while s < sampleCount
      x = minInclusive + s * stepSize
      y = f(x)
      result.push [
        x
        y
      ]
      ++s
    result

  @integrateSimphson = (samples) ->
    result = samples[0][1] + samples[samples.length - 1][1]
    s = 1
    while s < samples.length - 1
      sampleWeight = if s % 2 == 0 then 2.0 else 4.0
      result += sampleWeight * samples[s][1]
      ++s
    h = (samples[samples.length - 1][0] - (samples[0][0])) / (samples.length - 1)
    result * h / 3.0

  @roundTo = (num, decimals) ->
    shift = 10 ** decimals
    Math.round(num * shift) / shift

  @calcSamplesForRange = (sigma, minInclusive, maxInclusive, samplesPerBin) ->
    f = (x) => @.gaussianDistribution(x, 0, sigma)
    return @.sampleInterval(f, minInclusive, maxInclusive, samplesPerBin)

  @generateKernel = (sigma, kernelSize, sampleCount) ->
    samplesPerBin = Math.ceil(sampleCount / kernelSize)
    if samplesPerBin % 2 == 0
      ++samplesPerBin
    weightSum = 0
    kernelLeft = -Math.floor(kernelSize / 2)

    # get samples left and right of kernel support first
    outsideSamplesLeft = @.calcSamplesForRange(sigma ,-5 * sigma, kernelLeft - 0.5,samplesPerBin)
    outsideSamplesRight = @.calcSamplesForRange(sigma, -kernelLeft + 0.5, 5 * sigma,samplesPerBin)
    allSamples = [ [
      outsideSamplesLeft
      0
    ] ]
    # now sample kernel taps and calculate tap weights
    tap = 0
    while tap < kernelSize
      left = kernelLeft - 0.5 + tap
      tapSamples = @.calcSamplesForRange(sigma, left, left + 1,samplesPerBin)
      tapWeight = @.integrateSimphson(tapSamples)
      allSamples.push [
        tapSamples
        tapWeight
      ]
      weightSum += tapWeight
      ++tap
    allSamples.push [
      outsideSamplesRight
      0
    ]
    # renormalize kernel and round to 6 decimals
    i = 0
    while i < allSamples.length
      allSamples[i][1] = @.roundTo(allSamples[i][1] / weightSum, 6)
      ++i

    return allSamples

module.exports = BlurShaderGenerator
