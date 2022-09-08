const CONFIG = require('app/common/config');
const UtilsJavascript = require('app/common/utils/utils_javascript');
const _ = require('underscore');

/**
 * Base label class for displaying text.
 * @see cc.LabelTTF
 */
var BaseLabel = cc.LabelTTF.extend({

  /**
   * Map of fonts to use by formatting tag
   * @example
   * var fontNamesByFormattingTag = {};
   * fontNamesByFormattingTag[CONFIG.FORMATTING_TAGS.boldStart] = RSX.fontBold.name;
   */
  _fontNamesByFormattingTag: null,

  /**
   * Map of colors to use by formatting tag
   * @example
   * var colorsByFormattingTag = {};
   * colorsByFormattingTag[CONFIG.FORMATTING_ENGINE.emphasisStart] = {r: 255, g: 0, b: 0};
   */
  _colorsByFormattingTag: null,

  setFontNamesByFormattingTag(val) {
    this._fontNamesByFormattingTag = val;
    this._setUpdateTextureDirty();
  },

  getFontNamesByFormattingTag() {
    return this._fontNamesByFormattingTag;
  },

  setColorsByFormattingTag(val) {
    this._colorsByFormattingTag = val;
    this._setUpdateTextureDirty();
  },

  getColorsByFormattingTag() {
    return this._colorsByFormattingTag;
  },

  _createRenderCmd() {
    if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
      return this._super();
    }
    return new BaseLabel.WebGLRenderCmd(this);
  },

});

BaseLabel.WebGLRenderCmd = function (renderable) {
  cc.LabelTTF.WebGLRenderCmd.call(this, renderable);
};

const proto = BaseLabel.WebGLRenderCmd.prototype = Object.create(cc.LabelTTF.WebGLRenderCmd.prototype);
proto.constructor = BaseLabel.WebGLRenderCmd;

proto._updateTTF = function () {
  const node = this._node;
  const context = this._getLabelContext();
  const locDimensionsWidth = node._dimensions.width;
  const locDimensionsHeight = node._dimensions.height;

  // reset
  this._strings.length = 0;
  this._lineWidths.length = 0;

  // reset font style for measurements
  context.font = this._fontStyleStr;

  // split string into words
  const spaceSeparatedChunks = node._string.split(' ');
  let line = [];
  let lineBeginsWithBullet = '';
  let lineIndent = 0;
  let lineWidth = 0;
  let maxLineWidth = 0;
  const formattingStack = [];
  for (let i = 0, il = spaceSeparatedChunks.length; i < il; i++) {
    const chunk = spaceSeparatedChunks[i];
    if (chunk.length > 0) {
      const words = chunk.split(/[\r\n]/);
      const numWordsInChunk = words.length;
      for (let j = 0; j < numWordsInChunk; j++) {
        const word = words[j];
        const formattedString = new FormattedString(node, word + (((numWordsInChunk === 1 || j === numWordsInChunk - 1) && i < il - 1) ? ' ' : ''));

        // merge formatting from top of formatting stack
        if (formattingStack.length > 0) {
          formattedString.mergeFormatting(formattingStack[formattingStack.length - 1]);
        }

        // pop top of formatting stack when string is end of formatting
        const numFormatsEndedByString = BaseLabel.numFormatsEndedByString(word);
        if (numFormatsEndedByString > 0) {
          for (let k = Math.min(numFormatsEndedByString, formattingStack.length) - 1; k >= 0; k--) {
            formattingStack.pop();
          }
        }

        // add formatted string to stack when has non-normal formatting
        if (formattedString.getHasSpecialFormatting() && numFormatsEndedByString == 0) {
          formattingStack.push(formattedString);
        }

        let stringWidth = formattedString.getWidth();
        if (j > 0 || (locDimensionsWidth > 0 && lineWidth + stringWidth > locDimensionsWidth)) {
          // end line and start new
          this._strings.push(line);
          this._lineWidths.push(lineWidth);
          if (lineWidth > maxLineWidth) { maxLineWidth = lineWidth; }
          line = [];
          lineWidth = 0;
          if (j > 0) {
            // reset indent whenever a newline is forced
            lineBeginsWithBullet = '';
            lineIndent = 0;
          }
        }

        if (line.length === 0) {
          if (lineBeginsWithBullet && lineIndent > 0) {
            // apply indent from bullet
            formattedString.setIndent(lineIndent);
            stringWidth += lineIndent;
          } else {
            // check for bullets at start of line
            const bullet = word.match(/(^-|^\*|^\d\.|^\d\))/);
            if (bullet != null) {
              lineBeginsWithBullet = `${bullet[0]} `;
              lineIndent = BaseLabel.measureString(context, formattedString.getFont(), lineBeginsWithBullet);
            }
          }
        }

        // add to line
        line.push(formattedString);
        lineWidth += stringWidth;
      }
    }
  }
  // add last line
  this._strings.push(line);
  this._lineWidths.push(lineWidth);
  if (lineWidth > maxLineWidth) { maxLineWidth = lineWidth; }
  this._isMultiLine = this._strings.length > 0;

  // text shadow
  let locSize; let locStrokeShadowOffsetX = 0; let
    locStrokeShadowOffsetY = 0;
  if (node._strokeEnabled) locStrokeShadowOffsetX = locStrokeShadowOffsetY = node._strokeSize * 2;
  if (node._shadowEnabled) {
    const locOffsetSize = node._shadowOffset;
    locStrokeShadowOffsetX += Math.abs(locOffsetSize.x) * 2;
    locStrokeShadowOffsetY += Math.abs(locOffsetSize.y) * 2;
  }

  // get content size
  locSize = cc.size(
    (locDimensionsWidth > 0 ? Math.ceil(locDimensionsWidth + locStrokeShadowOffsetX) : Math.ceil(maxLineWidth + locStrokeShadowOffsetX)),
    (locDimensionsHeight > 0 ? Math.ceil(locDimensionsHeight + locStrokeShadowOffsetY) : Math.ceil(node.getLineHeight() * this._strings.length + locStrokeShadowOffsetY)),
  );

  // add width for 'italic' and 'oblique'
  if (node._getFontStyle() != 'normal') {
    locSize.width = Math.ceil(locSize.width + node._fontSize * 0.3);
  }

  // set node's content size
  node.setContentSize(locSize);
  node._strokeShadowOffsetX = locStrokeShadowOffsetX;
  node._strokeShadowOffsetY = locStrokeShadowOffsetY;

  // need computing _anchorPointInPoints
  const locAP = node._anchorPoint;
  this._anchorPointInPoints.x = (locStrokeShadowOffsetX * 0.5) + ((locSize.width - locStrokeShadowOffsetX) * locAP.x);
  this._anchorPointInPoints.y = (locStrokeShadowOffsetY * 0.5) + ((locSize.height - locStrokeShadowOffsetY) * locAP.y);
};

proto._drawTTFInCanvas = function (context) {
  if (!context) return;
  const node = this._node;
  const locStrokeShadowOffsetX = node._strokeShadowOffsetX; const
    locStrokeShadowOffsetY = node._strokeShadowOffsetY;
  const locContentSizeHeight = node._contentSize.height - locStrokeShadowOffsetY; const locVAlignment = node._vAlignment;
  const locHAlignment = node._hAlignment; const
    locStrokeSize = node._strokeSize;

  // transform canvas to account for pixel scale
  context.setTransform(CONFIG.pixelScaleEngine, 0, 0, CONFIG.pixelScaleEngine, Math.ceil((locStrokeShadowOffsetX * 0.5) * CONFIG.pixelScaleEngine), Math.ceil((locContentSizeHeight + locStrokeShadowOffsetY * 0.5) * CONFIG.pixelScaleEngine));

  // fill style setup
  context.fillStyle = this._fillColorStr;

  let xOffset = 0; let
    yOffset = 0;
  // stroke style setup
  const locStrokeEnabled = node._strokeEnabled;
  if (locStrokeEnabled) {
    context.lineWidth = locStrokeSize * 2;
    context.strokeStyle = this._strokeColorStr;
  }

  // shadow style setup
  if (node._shadowEnabled) {
    const locShadowOffset = node._shadowOffset;
    context.shadowColor = this._shadowColorStr;
    context.shadowOffsetX = locShadowOffset.x;
    context.shadowOffsetY = -locShadowOffset.y;
    context.shadowBlur = node._shadowBlur;
  }

  context.textBaseline = cc.LabelTTF._textBaseline[locVAlignment];

  // always set context's text align to left
  // lines will be drawn with correct alignment
  context.textAlign = 'left';

  const locContentWidth = node._contentSize.width - locStrokeShadowOffsetX;

  // lineHeight
  const lineHeight = node.getLineHeight();
  const transformTop = (lineHeight - this._fontClientHeight) / 2;

  // horizontal alignment
  if (locHAlignment === cc.TEXT_ALIGNMENT_RIGHT) {
    xOffset += locContentWidth;
  } else if (locHAlignment === cc.TEXT_ALIGNMENT_CENTER) {
    xOffset += locContentWidth / 2;
  }

  // draw text
  const lines = this._strings;
  const locStrLen = lines.length;
  if (locVAlignment === cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM) {
    yOffset = lineHeight - transformTop * 2 + locContentSizeHeight - lineHeight * locStrLen;
  } else if (locVAlignment === cc.VERTICAL_TEXT_ALIGNMENT_CENTER) {
    yOffset = (lineHeight - transformTop * 2) / 2 + (locContentSizeHeight - lineHeight * locStrLen) / 2;
  }

  for (let i = 0; i < locStrLen; i++) {
    const line = lines[i];

    // get offsets for line
    let tmpOffsetX = xOffset;
    if (node._hAlignment === cc.TEXT_ALIGNMENT_RIGHT) {
      tmpOffsetX -= this._lineWidths[i];
    } else if (node._hAlignment === cc.TEXT_ALIGNMENT_CENTER) {
      tmpOffsetX -= this._lineWidths[i] * 0.5;
    }
    const tmpOffsetY = -locContentSizeHeight + (lineHeight * i + transformTop) + yOffset;
    this._drawTTFLineInCanvas(context, line, tmpOffsetX, tmpOffsetY, locStrokeEnabled);
  }
};

proto._drawTTFLineInCanvas = function (context, line, xOffset, yOffset, stroke) {
  // draw each substring with special formatting
  for (let i = 0, il = line.length; i < il; i++) {
    const formattedString = line[i];
    const width = formattedString.getWidth();
    const indent = formattedString.getIndent();
    const font = formattedString.getFont();
    const fillColor = formattedString.getFillColor();
    context.font = font;
    context.fillStyle = fillColor;
    this._drawTTFStringInCanvas(context, formattedString.getString(), xOffset + indent, yOffset, stroke);
    xOffset += width;
  }
};

proto._drawTTFStringInCanvas = function (context, string, xOffset, yOffset, stroke) {
  // stroke text
  if (stroke) {
    context.strokeText(string, xOffset, yOffset);
  }

  // fill text
  context.fillText(string, xOffset, yOffset);
};

BaseLabel._cachedMeasurmentsByFont = {};
BaseLabel.measureString = function (context, font, string) {
  // cached string measurements by font style
  let measurements = BaseLabel._cachedMeasurmentsByFont[font];
  if (measurements == null) {
    measurements = BaseLabel._cachedMeasurmentsByFont[font] = {};
    if (/bold/.test(font)) {
      // bold string needs slightly more space
      measurements.widthModifier = 1.05;
    } else {
      measurements.widthModifier = 1.0;
    }
  }
  let measurement = measurements[string];
  if (measurement == null) {
    if (context.font != font) { context.font = font; }
    measurement = measurements[string] = context.measureText(string).width * measurements.widthModifier;
  }
  return measurement;
};

// TODO: make this automatically process CONFIG.FORMATTING_ENGINE to convert into regexes instead of hardcoding
BaseLabel.FORMATTING_BOLD_START = UtilsJavascript.escapeStringForRegexSearch(CONFIG.FORMATTING_ENGINE.boldStart);
BaseLabel.FORMATTING_BOLD_END = UtilsJavascript.escapeStringForRegexSearch(CONFIG.FORMATTING_ENGINE.boldEnd);
BaseLabel.FORMATTING_EMPHASIS_START = UtilsJavascript.escapeStringForRegexSearch(CONFIG.FORMATTING_ENGINE.emphasisStart);
BaseLabel.FORMATTING_EMPHASIS_END = UtilsJavascript.escapeStringForRegexSearch(CONFIG.FORMATTING_ENGINE.emphasisEnd);
BaseLabel.FORMATTING_ALL_START = `${BaseLabel.FORMATTING_BOLD_START
}|${BaseLabel.FORMATTING_EMPHASIS_START}`;
BaseLabel.FORMATTING_ALL_END = `${BaseLabel.FORMATTING_BOLD_END
}|${BaseLabel.FORMATTING_EMPHASIS_END}`;
BaseLabel.FORMATTING_ALL = `${BaseLabel.FORMATTING_BOLD_START
}|${BaseLabel.FORMATTING_BOLD_END
}|${BaseLabel.FORMATTING_EMPHASIS_START
}|${BaseLabel.FORMATTING_EMPHASIS_END}`;
BaseLabel.getFormatsFromString = function (string) {
  return string.match(new RegExp(BaseLabel.FORMATTING_ALL_START, 'g'));
};
BaseLabel.stripFormattingFromString = function (string) {
  return string.replace(new RegExp(BaseLabel.FORMATTING_ALL, 'g'), '');
};
BaseLabel.numFormatsEndedByString = function (string) {
  const matches = string.match(new RegExp(BaseLabel.FORMATTING_ALL_END, 'g'));
  return matches != null ? matches.length : 0;
};

/**
 * Formatted string.
 * @type {Function}
 */
var FormattedString = cc.Class.extend({
  _label: null,
  _formats: null,
  _mergedFormats: null,
  _string: '',
  _needsRebuild: true,

  _width: 0,
  _indent: 0,
  _fillColor: null,
  _font: null,
  _fontStyle: null,
  _fontWeight: null,
  _fontSize: null,
  _fontName: null,
  _fontNameFromLabel: null,

  ctor(label, string, indent) {
    this._label = label;
    this._formats = this._mergedFormats = BaseLabel.getFormatsFromString(string);
    this._string = BaseLabel.stripFormattingFromString(string);
    this._indent = indent || 0;
  },

  rebuild() {
    this._needsRebuild = false;

    const label = this._label;
    const labelRenderCmd = label._renderCmd;
    const context = labelRenderCmd._getLabelContext();
    const fontNamesByFormattingTag = label.getFontNamesByFormattingTag();
    const colorsByFormattingTag = label.getColorsByFormattingTag();

    // check formatting
    let fontName;
    let fontWeight;
    let color;
    if (this.getHasMergedSpecialFormatting() && (fontNamesByFormattingTag != null || colorsByFormattingTag != null)) {
      for (let i = 0, il = this._mergedFormats.length; i < il; i++) {
        const format = this._mergedFormats[i];

        if (format === CONFIG.FORMATTING_ENGINE.boldStart) {
          fontWeight = 'bold';
        }

        if (fontNamesByFormattingTag != null) {
          const fontNameForFormat = fontNamesByFormattingTag[format];
          if (fontNameForFormat != null) {
            fontName = fontNameForFormat;
          }
        }

        if (colorsByFormattingTag != null) {
          const colorForFormat = colorsByFormattingTag[format];
          if (colorForFormat != null) {
            color = colorForFormat;
          }
        }
      }
    } else {
      fontWeight = 'normal';
    }

    // get font name
    if (fontName == null) {
      fontName = label._fontName;
    } else {
      fontWeight = 'normal';
    }

    // store font style
    this._fontStyle = label._fontStyle;
    this._fontSize = label._fontSize;
    this._fontWeight = fontWeight || label._fontWeight;
    this._fontName = fontName;

    // calculate font
    this._font = `${this._fontStyle} ${this._fontWeight} ${this._fontSize}px '${this._fontName}'`;

    // calculate fill color
    if (color == null) {
      this._fillColor = labelRenderCmd._fillColorStr;
    } else {
      const displayedColor = labelRenderCmd._displayedColor;
      this._fillColor = `rgba(${0 | (displayedColor.r / 255 * color.r)}, ${0 | (displayedColor.g / 255 * color.g)}, ${0 | (displayedColor.b / 255 * color.b)}, 1)`;
    }

    // calculate width
    this._width = this._indent + BaseLabel.measureString(context, this.getFont(), this._string);
  },

  setNeedsRebuild() {
    this._needsRebuild = true;
  },
  getNeedsRebuild() {
    return this._needsRebuild;
  },

  mergeFormatting(formattedString) {
    this._mergedFormats = _.union(this._formats || [], formattedString.getMergedFormats() || []);
    this.setNeedsRebuild();
  },
  getFormats() {
    return this._formats;
  },
  getHasSpecialFormatting() {
    return this._formats && this._formats.length > 0;
  },
  getMergedFormats() {
    return this._mergedFormats;
  },
  getHasMergedSpecialFormatting() {
    return this._mergedFormats && this._mergedFormats.length > 0;
  },

  getString() {
    return this._string;
  },
  getWidth() {
    if (this._needsRebuild) { this.rebuild(); }
    return this._width;
  },
  getFillColor() {
    if (this._needsRebuild) { this.rebuild(); }
    return this._fillColor;
  },
  getFont() {
    if (this._needsRebuild) { this.rebuild(); }
    return this._font;
  },
  getFontStyle() {
    return this._fontStyle;
  },
  getFontWeight() {
    return this._fontWeight;
  },
  getFontSize() {
    return this._fontSize;
  },
  getFontName() {
    return this._fontName;
  },
  setIndent(val) {
    if (this._indent !== val) {
      this._indent = val;
      this.setNeedsRebuild();
    }
  },
  getIndent() {
    return this._indent;
  },
});

BaseLabel.create = function () {
  return new BaseLabel();
};

module.exports = BaseLabel;
