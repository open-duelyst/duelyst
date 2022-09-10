const CONFIG = require('app/common/config');
const Batch = require('./Batch');

/** **************************************************************************
 BatchLights
 var BatchLights = Batch
 BatchLights.create()
 *************************************************************************** */
const BatchLights = Batch.extend({
  // default vertex attributes:
  // a_position -> pos(xyz)
  // a_texCoord -> tex(uv)
  // a_color -> color(rgba)
  // a_originRadius -> center xyz + radius
  attributeCount: 13,
  stride: 13 * Float32Array.BYTES_PER_ELEMENT,
  _maxIntensity: 1.0,

  getFilteredObjects(objects) {
    objects = Batch.prototype.getFilteredObjects.call(this, objects);

    // filter lights that are effectively invisible
    objects = _.filter(objects, (object) => object.getEffectiveIntensity() > 0.0);

    // sort low to high effective intensity
    this._maxIntensity = 1.0;
    objects = _.sortBy(objects, (object) => {
      const intensity = object.getEffectiveIntensity();
      this._maxIntensity = Math.max(intensity, this._maxIntensity);
      return intensity;
    });

    return objects;
  },
  insertObjectVertices(object, offset) {
    const { attributeCount } = this;
    const mvPosition3D = object.getMVPosition3D();
    const cx = mvPosition3D.x;
    const cy = mvPosition3D.y;
    const cz = mvPosition3D.z;
    const radius = object.getRadius() * CONFIG.globalScale;
    const vertices = object.getMVVertices();
    const texCoords = object.getMVTexCoords();
    // TODO: allow colors to be updated separately gl.bufferSubData, instead of rebuilding entire vbo
    const color = object.getColor();
    const r = color.r / 255.0;
    const g = color.g / 255.0;
    const b = color.b / 255.0;
    let a = object.getEffectiveAlpha();

    // we're applying the alpha twice here when accounting for intensity range
    // but it gives a much better effect than only applying once
    if (this._maxIntensity !== 1.0) {
      a *= (object.getEffectiveIntensity() / this._maxIntensity) ** 0.5;
    }

    this.insertVertexAttributes(offset, vertices.tl.x, vertices.tl.y, vertices.tl.z, texCoords.tl.u, texCoords.tl.v, r, g, b, a, cx, cy, cz, radius); // tl
    this.insertVertexAttributes(offset + attributeCount, vertices.bl.x, vertices.bl.y, vertices.bl.z, texCoords.bl.u, texCoords.bl.v, r, g, b, a, cx, cy, cz, radius); // bl
    this.insertVertexAttributes(offset + attributeCount * 2, vertices.tr.x, vertices.tr.y, vertices.tr.z, texCoords.tr.u, texCoords.tr.v, r, g, b, a, cx, cy, cz, radius); // tr
    this.insertVertexAttributes(offset + attributeCount * 3, vertices.br.x, vertices.br.y, vertices.br.z, texCoords.br.u, texCoords.br.v, r, g, b, a, cx, cy, cz, radius); // br
  },
  insertVertexAttributes(offset, x, y, z, u, v, r, g, b, a, cx, cy, cz, radius) {
    const { vertices } = this;
    vertices[offset + 0] = x;
    vertices[offset + 1] = y;
    vertices[offset + 2] = z;
    vertices[offset + 3] = u;
    vertices[offset + 4] = v;
    vertices[offset + 5] = r;
    vertices[offset + 6] = g;
    vertices[offset + 7] = b;
    vertices[offset + 8] = a;
    vertices[offset + 9] = cx;
    vertices[offset + 10] = cy;
    vertices[offset + 11] = cz;
    vertices[offset + 12] = radius;
  },

  // drawing

  render(batchSize, offset) {
    batchSize || (batchSize = this.getBatchSize());
    if (batchSize > 0) {
      offset || (offset = 0);

      const gl = cc._renderContext;
      const { stride } = this;

      if (this.getDirty()) {
        this.rebuild();
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
      cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);
      // have to enable custom attributes manually
      gl.enableVertexAttribArray(cc.VERTEX_ATTRIB_ORIGIN_RADIUS);
      gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, false, stride, 0);
      gl.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, stride, 3 * Float32Array.BYTES_PER_ELEMENT);
      gl.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, gl.FLOAT, false, stride, 5 * Float32Array.BYTES_PER_ELEMENT);
      gl.vertexAttribPointer(cc.VERTEX_ATTRIB_ORIGIN_RADIUS, 4, gl.FLOAT, false, stride, 9 * Float32Array.BYTES_PER_ELEMENT);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);

      gl.drawElements(gl.TRIANGLES, batchSize * 6, gl.UNSIGNED_SHORT, offset * 6 * this.indices.BYTES_PER_ELEMENT);
      cc.incrementGLDraws(1);

      // and don't forget to disable custom attributes manually
      gl.disableVertexAttribArray(cc.VERTEX_ATTRIB_ORIGIN_RADIUS);
    }
  },
});

BatchLights.create = function (batch) {
  return Batch.create(batch || new BatchLights());
};

module.exports = BatchLights;
