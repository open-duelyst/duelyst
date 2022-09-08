const Batch = require('./Batch');

/** **************************************************************************
 BatchLighting
 var BatchLighting = Batch
 BatchLighting.create()
 - BatchLighting only records the occluder verts/uv per light, and always matches the maximum number of lights.
 - Uses the global FX lights array buffers to supply per light info, which saves space and centralizes.
 *************************************************************************** */
const BatchLighting = Batch.extend({
  // sprite that will use the lights to calculate lighting or shadows
  occluder: null,

  // default vertex attributes:
  // a_position -> occluder pos(xyz)
  // a_texCoord -> occluder tex(uv)
  attributeCount: 5,
  stride: 5 * Float32Array.BYTES_PER_ELEMENT,

  release() {
    Batch.prototype.release.call(this);
    this.occluder = null;
  },

  setOccluder(occluder) {
    this.occluder = occluder;
    this.setDirty();
  },

  // rebuilding buffers

  getBatchSize() {
    const fx = this.getFX();
    if (fx) {
      return Math.max(0, fx.batchLights.getBatchSize(), fx.batchShadowCastingLights.getBatchSize());
    }
    return 0;
  },
  insertObjects() {
    const batchSize = this.getBatchSize();
    const { attributeCount } = this;
    for (let i = 0; i < batchSize; i++) {
      this.insertObjectVertices(this.occluder, i * attributeCount * 4);
    }
  },
  insertObjectVertices(occluder, offset) {
    const { attributeCount } = this;
    const quad = occluder.getQuad();
    const { tl } = quad;
    const { tr } = quad;
    const { bl } = quad;
    const { br } = quad;

    this.insertVertexAttributes(offset + attributeCount * 0, tl.vertices.x, tl.vertices.y, tl.vertices.z, tl.texCoords.u, tl.texCoords.v); // tl
    this.insertVertexAttributes(offset + attributeCount * 1, bl.vertices.x, bl.vertices.y, bl.vertices.z, bl.texCoords.u, bl.texCoords.v); // bl
    this.insertVertexAttributes(offset + attributeCount * 2, tr.vertices.x, tr.vertices.y, tr.vertices.z, tr.texCoords.u, tr.texCoords.v); // tr
    this.insertVertexAttributes(offset + attributeCount * 3, br.vertices.x, br.vertices.y, br.vertices.z, br.texCoords.u, br.texCoords.v); // br
  },
  insertVertexAttributes(offset, x, y, z, u, v) {
    const { vertices } = this;
    vertices[offset + 0] = x;
    vertices[offset + 1] = y;
    vertices[offset + 2] = z;
    vertices[offset + 3] = u;
    vertices[offset + 4] = v;
  },

  // drawing

  renderWithLights(batchSize, offset) {
    this.render(this.getFX().batchLights, batchSize, offset);
  },
  renderWithShadowCastingLights(batchSize, offset) {
    this.render(this.getFX().batchShadowCastingLights, batchSize, offset);
  },

  render(sharedBatch, batchSize, offset) {
    if (sharedBatch) {
      if (sharedBatch.getDirty()) {
        sharedBatch.rebuild();
      }
      const batchSizeMax = sharedBatch.getBatchSize();
      batchSize = Math.min(batchSize || batchSizeMax, batchSizeMax);
      if (batchSize > 0 && this.occluder) {
        offset || (offset = 0);

        const gl = cc._renderContext;

        if (this.getDirty() || batchSize > (this.indices.length / 6)) {
          this.rebuild();
        }

        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);
        // have to enable custom attributes manually
        gl.enableVertexAttribArray(cc.VERTEX_ATTRIB_ORIGIN_RADIUS);

        // use own vertices and texture coords
        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, false, this.stride, 0);
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, this.stride, 3 * Float32Array.BYTES_PER_ELEMENT);

        // get colors and properties from shared batch lights
        gl.bindBuffer(gl.ARRAY_BUFFER, sharedBatch.verticesBuffer);
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, gl.FLOAT, false, sharedBatch.stride, 5 * Float32Array.BYTES_PER_ELEMENT);
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_ORIGIN_RADIUS, 4, gl.FLOAT, false, sharedBatch.stride, 9 * Float32Array.BYTES_PER_ELEMENT);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);

        gl.drawElements(gl.TRIANGLES, batchSize * 6, gl.UNSIGNED_SHORT, offset * 6 * this.indices.BYTES_PER_ELEMENT);
        cc.incrementGLDraws(1);

        // and don't forget to disable custom attributes manually
        gl.disableVertexAttribArray(cc.VERTEX_ATTRIB_ORIGIN_RADIUS);
      }
    }
  },
});

BatchLighting.create = function (occluder, batch) {
  var batch = Batch.create(batch || new BatchLighting());
  if (batch) {
    batch.setOccluder(occluder);
    return batch;
  }
};

module.exports = BatchLighting;
