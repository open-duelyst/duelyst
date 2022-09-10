const _ = require('underscore');
const Canvas = require('canvas');

/**
 * Copyright (c) 2011 Pere Monfort Pàmies (http://www.pmphp.net)
 * Official site: http://www.canvastext.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit
 * persons to whom the Software is furnished to do so, subject to the
 * following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
 * NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
function CanvasText() {
  // The property that will contain the ID attribute value.
  this.canvasId = null;
  // The property that will contain the Canvas element.
  this.canvas = null;
  // The property that will contain the canvas context.
  this.context = null;
  // The property that will contain the buffer/cache canvas.
  this.bufferCanvas = null;
  // The property that will contain the cacheCanvas context.
  this.bufferContext = null;
  // The property that will contain all cached canvas.
  this.cacheCanvas = [];
  // The property that will contain all cached contexts.
  this.cacheContext = [];
  // The property that will contain the created style class.
  this.savedClasses = [];

  /*
   * Default values.
   */
  this.fontFamily = 'Verdana';
  this.fontWeight = 'normal';
  this.fontSize = '12px';
  this.fontColor = '#000';
  this.fontStyle = 'normal';
  this.textAlign = 'start';
  this.textBaseline = 'alphabetic';
  this.verticalAlign = 'start'; // "start", "top", "center", "end", "bottom"
  this.lineHeight = '16';
  this.textShadow = null;

  /**
   * Benckmark variables.
   */
  this.initTime = null;
  this.endTime = null;

  /**
   * Set the main values.
   * @param object config Text properties.
   */
  this.config = function (config) {
    let property;
    /*
     * A simple check. If config is not an object popup an console.error.
     */
    if (typeof (config) !== 'object') {
      console.error('¡Invalid configuration!');
      return false;
    }
    /*
     * Loop the config properties.
     */
    for (property in config) {
      // If it's a valid property, save it.
      if (this[property] !== undefined) {
        this[property] = config[property];
      }
    }
  };

  /**
   * @param object textInfo Contains the Text string, axis X value and axis Y value.
   */
  this.drawText = function (textInfo) {
    this.initTime = new Date().getTime();
    /*
     * If this.canvas doesn't exist we will try to set it.
     * This will be done the first execution time.
     */
    if (this.canvas == null) {
      if (!this.getCanvas()) {
        console.error('Incorrect canvas ID!');
        return false;
      }
    }
    /**
     *
     */
    if (this.bufferCanvas == null) {
      this.getBufferCanvas();
    }
    /**
     * Get or set the cache if a cacheId exist.
     */
    if (textInfo.cacheId !== undefined) {
      // We add a prefix to avoid name conflicts.
      textInfo.cacheId = `ct${textInfo.cacheId}`;
      // If cache exists: draw text and stop script execution.
      if (this.getCache(textInfo.cacheId)) {
        if (!textInfo.returnImage) {
          this.context.drawImage(this.cacheCanvas[textInfo.cacheId], 0, 0);
        } else if (textInfo.returnImage) {
          return this.cacheCanvas[textInfo.cacheId];
        }

        this.endTime = new Date().getTime();
        // console.log("cache",(this.endTime-this.initTime)/1000);
        return false;
      }
    }
    // A simple check.
    if (typeof (textInfo) !== 'object') {
      console.error('Invalid text format!');
      return false;
    }
    // Another simple check
    if (!this.isNumber(textInfo.x) || !this.isNumber(textInfo.y)) {
      console.error('You should specify a correct "x" & "y" axis value.');
      return false;
    }
    // Reset our cacheCanvas.
    this.bufferCanvas.width = this.bufferCanvas.width;
    // Set the color.
    this.bufferContext.fillStyle = this.fontColor;
    // Set the size & font family.
    this.bufferContext.font = `${this.fontWeight} ${this.fontSize} ${this.fontFamily}`;
    // Parse and draw the styled text.
    this.drawStyledText(textInfo);
    // Cache the result.
    if (textInfo.cacheId != undefined) {
      this.setCache(textInfo.cacheId);
    }

    this.endTime = new Date().getTime();
    // console.log((this.endTime-this.initTime)/1000);
    // Draw or return the final image.
    if (!textInfo.returnImage) {
      this.context.drawImage(this.bufferCanvas, 0, 0);
    } else if (textInfo.returnImage) {
      return this.bufferCanvas;
    }
  };

  /**
   * The "painter". This will draw the styled text.
   */
  this.drawStyledText = function (textInfo) {
    // Save the textInfo into separated vars to work more comfortably.
    const { text } = textInfo;
    let { x } = textInfo;
    let { y } = textInfo;
    // Needed vars for automatic line break;
    let words; const
      { boxWidth } = textInfo;
    // Declaration of needed vars.
    let proFont = []; let properties; let property; let propertyName; let propertyValue; let
      atribute;
    let classDefinition; let proColor; let proText; let
      proShadow;
    // Loop vars
    var i; var j; var k; let
      n;

    // The main regex. Looks for <style>, <class> or <br /> tags.
    const match = text.match(/<\s*br\s*\/>|<\s*class=["|']([^"|']+)["|']\s*\>([^>]+)<\s*\/class\s*\>|<\s*style=["|']([^"|']+)["|']\s*\>([^>]+)<\s*\/style\s*\>|[^<]+/g);
    let innerMatch = null;

    const lines = [];
    let lineIndex = 0;
    const addChunkToCurrentLine = function (chunkText, chunkStyle, chunkWidth) {
      let line = lines[lineIndex];
      if (line == null) {
        line = lines[lineIndex] = {
          chunks: [],
          width: 0,
          height: parseInt(this.lineHeight, 10),
          x,
          y,
        };
      }
      const measuredText = this.bufferContext.measureText(chunkText);
      if (chunkWidth == null) {
        chunkWidth = measuredText.width;
      }
      line.chunks.push({ text: chunkText, style: chunkStyle, width: chunkWidth });
      line.width += chunkWidth;
      x += chunkWidth;
    }.bind(this);

    // Let's draw something for each match found.
    for (i = 0; i < match.length; i++) {
      // Save the current context.
      this.bufferContext.save();
      // Default color
      proColor = this.fontColor;
      // Default font
      proFont.style = this.fontStyle;
      proFont.weight = this.fontWeight;
      proFont.size = this.fontSize;
      proFont.family = this.fontFamily;

      // Default shadow
      proShadow = this.textShadow;

      // Check if current fragment is an style tag.
      if (/<\s*style=/i.test(match[i])) {
        // Looks the attributes and text inside the style tag.
        innerMatch = match[i].match(/<\s*style=["|']([^"|']+)["|']\s*\>([^>]+)<\s*\/style\s*\>/);

        // innerMatch[1] contains the properties of the attribute.
        properties = innerMatch[1].split(';');

        // Apply styles for each property.
        for (j = 0; j < properties.length; j++) {
          // Each property have a value. We split them.
          property = properties[j].split(':');
          // A simple check.
          if (this.isEmpty(property[0]) || this.isEmpty(property[1])) {
            // Wrong property name or value. We jump to the
            // next loop.
            continue;
          }
          // Again, save it into friendly-named variables to work comfortably.
          propertyName = property[0];
          propertyValue = property[1];

          switch (propertyName) {
            case 'font':
              proFont = propertyValue;
              break;
            case 'font-family':
              proFont.family = propertyValue;
              break;
            case 'font-weight':
              proFont.weight = propertyValue;
              break;
            case 'font-size':
              proFont.size = propertyValue;
              break;
            case 'font-style':
              proFont.style = propertyValue;
              break;
            case 'text-shadow':
              proShadow = this.trim(propertyValue);
              proShadow = proShadow.split(' ');
              if (proShadow.length != 4) {
                proShadow = null;
              }
              break;
            case 'color':
              if (this.isHex(propertyValue)) {
                proColor = propertyValue;
              }
              break;
          }
        }
        proText = innerMatch[2];
      } else if (/<\s*class=/i.test(match[i])) { // Check if current fragment is a class tag.
        // Looks the attributes and text inside the class tag.
        innerMatch = match[i].match(/<\s*class=["|']([^"|']+)["|']\s*\>([^>]+)<\s*\/class\s*\>/);

        classDefinition = this.getClass(innerMatch[1]);
        /*
         * Loop the class properties.
         */
        for (atribute in classDefinition) {
          switch (atribute) {
            case 'font':
              proFont = classDefinition[atribute];
              break;
            case 'fontFamily':
              proFont.family = classDefinition[atribute];
              break;
            case 'fontWeight':
              proFont.weight = classDefinition[atribute];
              break;
            case 'fontSize':
              proFont.size = classDefinition[atribute];
              break;
            case 'fontStyle':
              proFont.style = classDefinition[atribute];
              break;
            case 'fontColor':
              if (this.isHex(classDefinition[atribute])) {
                proColor = classDefinition[atribute];
              }
              break;
            case 'textShadow':
              proShadow = this.trim(classDefinition[atribute]);
              proShadow = proShadow.split(' ');
              if (proShadow.length != 4) {
                proShadow = null;
              }
              break;
          }
        }
        proText = innerMatch[2];
      } else if (/<\s*br\s*\/>/i.test(match[i])) {
        // Check if current fragment is a line break.
        y += parseInt(this.lineHeight, 10);
        x = textInfo.x;
        lineIndex++;
        continue;
      } else {
        // Text without special style.
        proText = match[i];
      }

      // store styling properties
      // set styling properties for measurements
      var style = {};
      this.bufferContext.textBaseline = this.textBaseline;
      style.fillStyle = this.bufferContext.fillStyle = proColor;
      if (proFont instanceof Array) {
        // style.font = this.bufferContext.font = proFont.style + " " + proFont.weight + " " + proFont.size + " " + proFont.family;
        style.font = this.bufferContext.font = `${proFont.weight} ${proFont.size} ${proFont.family}`;
      } else {
        style.font = this.bufferContext.font = proFont;
      }
      if (proShadow != null) {
        style.shadowOffsetX = this.bufferContext.shadowOffsetX = proShadow[0].replace('px', '');
        style.shadowOffsetY = this.bufferContext.shadowOffsetY = proShadow[1].replace('px', '');
        style.shadowBlur = this.bufferContext.shadowBlur = proShadow[2].replace('px', '');
        style.shadowColor = this.bufferContext.shadowColor = proShadow[3];
      }

      // cleanup text
      proText = this.trim(proText.replace(/\s*\n\s*/g, ' '));
      if (lines[lineIndex] != null && !/[\s.,:;\/\\]/.test(proText.slice(0))) {
        proText = ` ${proText}`;
      }

      if (boxWidth == null) {
        // add chunk to line as is
        addChunkToCurrentLine(proText, style);
      } else {
        // max width exists, check if any line break is needed
        const spaceWidth = this.bufferContext.measureText(' ').width;
        if (!this.checkLineBreak(proText, (boxWidth + textInfo.x), x)) {
          addChunkToCurrentLine(proText, style);
        } else {
          // Split text by words.
          words = proText.split(' ');
          // it seems like the new word in a styled chunk will be considered as if current chunk width and text dont exist
          let currentChunkText = null;
          let currentChunkWidth = 0;

          // measure each word until line break is found
          for (k = 0; k < words.length; k++) {
            const word = words[k];
            let currentLineWidth = 0;
            if (lines[lineIndex] != null) {
              currentLineWidth = lines[lineIndex].width;
            }

            // If there's something already in the chunk, and the line, it becomes additive
            if (this.checkLineBreak(word, (boxWidth + textInfo.x), x + currentChunkWidth)) {
              // add current chunk to line
              if (currentChunkText != null) {
                addChunkToCurrentLine(currentChunkText, style, currentChunkWidth);
              }

              // reset for next line
              currentChunkText = null;
              currentChunkWidth = 0;
              lineIndex++;
              x = textInfo.x;
              y += parseInt(this.lineHeight, 10);
            }

            // add word to current chunk
            const wordWidth = this.bufferContext.measureText(word).width;
            if (currentChunkText == null) {
              currentChunkText = word;
              currentChunkWidth = wordWidth;
              if (lines[lineIndex] != null && !/[\s.,:;\/\\]/.test(word.slice(0))) {
                currentChunkText = ` ${currentChunkText}`;
                currentChunkWidth += spaceWidth;
              }
            } else {
              currentChunkText += ` ${word}`;
              currentChunkWidth += spaceWidth + wordWidth;
            }
          }

          // add last of current chunk
          if (currentChunkText != null) {
            if (lines[lineIndex] != null && this.checkLineBreak(currentChunkText, (boxWidth + textInfo.x), x + currentChunkWidth)) {
              lineIndex++;
              x = textInfo.x;
              y += parseInt(this.lineHeight, 10);
            }
            addChunkToCurrentLine(currentChunkText, style, currentChunkWidth);
          }
        }
      }

      // restore style
      this.bufferContext.restore();
    }

    // determine vertical offset
    let offsetY;
    if (this.verticalAlign === 'center') {
      offsetY = -parseInt(this.lineHeight, 10) * lines.length * 0.5;
    } else if (this.verticalAlign === 'end' || this.verticalAlign === 'bottom') {
      offsetY = -parseInt(this.lineHeight, 10) * lines.length;
    } else {
      offsetY = 0;
    }

    // draw all lines
    for (var i = 0, il = lines.length; i < il; i++) {
      const line = lines[i];
      const { chunks } = line;
      const lineWidth = line.width;
      let chunkX = line.x;
      if (this.textAlign == 'center') {
        chunkX -= lineWidth * 0.5;
      } else if (this.textAlign == 'right' || this.textAlign == 'end') {
        chunkX -= lineWidth;
      }
      const chunkY = line.y + offsetY;
      for (var j = 0, jl = chunks.length; j < jl; j++) {
        const chunk = chunks[j];
        var { style } = chunk;

        // draw chunk
        let ligatureSplit = chunk.text.replace('fi', 'f|i');
        ligatureSplit = ligatureSplit.split('|');
        for (var k = 0, kl = ligatureSplit.length; k < kl; k++) {
          // save the current context
          this.bufferContext.save();

          // set style on context
          this.bufferContext.textAlign = 'left';
          this.bufferContext.textBaseline = this.textBaseline;
          this.bufferContext.font = style.font;
          this.bufferContext.fillStyle = style.fillStyle;
          if (style.shadowOffsetX != null) { this.bufferContext.shadowOffsetX = style.shadowOffsetX; }
          if (style.shadowOffsetY != null) { this.bufferContext.shadowOffsetY = style.shadowOffsetY; }
          if (style.shadowBlur != null) { this.bufferContext.shadowBlur = style.shadowBlur; }
          if (style.shadowColor != null) { this.bufferContext.shadowColor = style.shadowColor; }

          const ligatureLessText = ligatureSplit[k];
          this.bufferContext.fillText(ligatureLessText, chunkX, chunkY);
          chunkX += this.bufferContext.measureText(ligatureLessText).width;

          // restore style
          this.bufferContext.restore();
        }
      }
    }
  };

  /**
   * Save a new class definition.
   */
  this.defineClass = function (id, definition) {
    // A simple check.
    if (typeof (definition) !== 'object') {
      console.error('¡Invalid class!');
      return false;
    }
    // Another simple check.
    if (this.isEmpty(id)) {
      console.error('You must specify a Class Name.');
      return false;
    }

    // Save it.
    this.savedClasses[id] = definition;
    return true;
  };

  /**
   * Returns a saved class.
   */
  this.getClass = function (id) {
    if (this.savedClasses[id] !== undefined) {
      return this.savedClasses[id];
    }
  };

  this.getCanvas = function () {
    // We need a valid ID
    if (this.canvas == null) {
      console.error('You must specify the canvas ID!');
      return false;
    }
    return true;
  };

  this.getBufferCanvas = function () {
    // We will draw the text into the cache canvas
    this.bufferCanvas = new Canvas(this.canvas.width, this.canvas.height);
    this.bufferCanvas.width = this.canvas.width;
    this.bufferCanvas.height = this.canvas.height;
    this.bufferContext = this.bufferCanvas.getContext('2d');
  };
  /**
   * Check if the cache canvas exist.
   */
  this.getCache = function (id) {
    if (this.cacheCanvas[id] === undefined) {
      return false;
    }
    return true;
  };
  /**
   * We create a new canvas element for each cache element.
   */
  this.setCache = function (id) {
    this.cacheCanvas[id] = new Canvas(this.bufferCanvas.width, this.bufferCanvas.height);
    this.cacheCanvas[id].width = this.bufferCanvas.width;
    this.cacheCanvas[id].height = this.bufferCanvas.height;
    this.cacheContext[id] = this.cacheCanvas[id].getContext('2d');
    this.cacheContext[id].drawImage(this.bufferCanvas, 0, 0);
  };
  /**
   * Check if a line break is needed.
   */
  this.checkLineBreak = function (text, boxWidth, x) {
    // Don't line break on a period
    if (text == '.') {
      return false;
    }

    // Don't line break on a colon
    if (text == ':') {
      return false;
    }

    return (this.bufferContext.measureText(text).width + x > boxWidth);
  };

  /**
   * A simple function to validate a Hex code.
   */
  this.isHex = function (hex) {
    return (/^(#[a-fA-F0-9]{3,6})$/i.test(hex));
  };
  /**
   * A simple function to check if the given value is a number.
   */
  this.isNumber = function (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  };
  /**
   * A simple function to check if the given value is empty.
   */
  this.isEmpty = function (str) {
    // Remove white spaces.
    str = str.replace(/^\s+|\s+$/, '');
    return str.length == 0;
  };
  /**
   * A simple function clear whitespaces.
   */
  this.trim = function (str) {
    let ws; let
      i;
    str = str.replace(/^\s\s*/, '');
    ws = /\s/;
    i = str.length;
    while (ws.test(str.charAt(--i))) {
      continue;
    }
    return str.slice(0, i + 1);
  };
}
module.exports = CanvasText;
