var UtilsJavascript = require('app/common/utils/utils_javascript');

/****************************************************************************
 Batch
 var Batch = cc.Class
 Batch.create()
 // this batch is intended for more flexible or non-standard batching
 // (see cc.SpriteBatchNode for basic sprite batching, it is probably faster for that)
 ****************************************************************************/
var Batch = cc.Class.extend({
	// list of objects to be batch drawn
	objects: null,
	// default vertex attributes: object(xy + uv + rgba)
	attributeCount: 8,
	stride: 8 * Float32Array.BYTES_PER_ELEMENT,

	// it is not recommended to modify these
	verticesBuffer: null,
	vertices: null,
	indicesBuffer: null,
	indices: null,
	arrayBuffer: null,
	_filteredObjects: null,
	_dirty: false,

	ctor: function () {
		var gl = cc._renderContext;

		// initialize properties that may be required in init
		this.objects = [];
		this._filteredObjects = [];
		this.verticesBuffer = gl.createBuffer();
		this.indicesBuffer = gl.createBuffer();
	},

	// initializers

	release: function () {
		var gl = cc._renderContext;
		gl.deleteBuffer(this.verticesBuffer);
		gl.deleteBuffer(this.indicesBuffer);
		this.reset();
	},
  reset: function () {
		this.objects.length = 0;
		this._filteredObjects.length = 0;
		this.vertices = null;
		this.indices = null;
		this.setDirty();
  },

	// objects list handling

	setObjects: function (objects) {
		// TODO: allow entire objects to be updated separately using gl.bufferSubData, instead of rebuilding entire vbo
		this.objects = objects;
		this.setDirty();
	},

	addObject: function (object) {
		var modified = UtilsJavascript.arrayCautiousAdd(this.objects, object);
		if(modified === -1) {
			// TODO: allow entire objects to be updated separately using gl.bufferSubData, instead of rebuilding entire vbo
			this.setDirty();
		}
		return modified;
	},
	removeObject: function (object) {
		var modified = UtilsJavascript.arrayCautiousRemove(this.objects, object);
		if(modified !== -1) {
			// TODO: allow entire objects to be updated separately using gl.bufferSubData, instead of rebuilding entire vbo
			this.setDirty();
		}
		return modified;
	},

	// rebuilding buffers

	getDirty: function () {
		return this._dirty;
	},
	setDirty: function () {
		this._dirty = true;
	},

	rebuild: function () {
		this._dirty = false;
		this._filteredObjects = this.getFilteredObjects(this.objects.slice(0));
		this.resize(this.attributeCount);
		this.insertObjects();
		this.insertIndices();
		this.resendBufferData();
	},
	resize: function (attributeCount) {
		this.attributeCount = attributeCount;
		this.stride = attributeCount * Float32Array.BYTES_PER_ELEMENT;
		var batchSize = this.getBatchSize();
		this.arrayBuffer = new ArrayBuffer(batchSize * this.stride * 4);
		this.vertices = new Float32Array(this.arrayBuffer);
		this.indices = new Uint16Array(batchSize * 6);
	},
	getBatchSize: function () {
		 return this._filteredObjects.length;
	},
	resendBufferData: function () {
		var gl = cc._renderContext;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
	},
	getFilteredObjects: function (objects) {
		// override and filter/sort objects
		return objects;
	},
	insertObjects: function () {
		var objects = this._filteredObjects;
		var batchSize = this.getBatchSize();
		var attributeCount = this.attributeCount;
		for(var i = 0; i < batchSize; i++) {
			this.insertObjectVertices(objects[i], i * attributeCount * 4);
		}
	},
	insertIndices: function () {
		var batchSize = this.getBatchSize();
		var indices = this.indices;

		for(var i = 0; i < batchSize; i++) {
			var index = i * 4;
			var count = i * 6;
			indices[count + 0] = index + 0;
			indices[count + 1] = index + 1;
			indices[count + 2] = index + 2;
			indices[count + 3] = index + 3;
			indices[count + 4] = index + 2;
			indices[count + 5] = index + 1;
		}
	},
	insertObjectVertices: function (object, offset) {
		var attributeCount = this.attributeCount;
		var quad = object.getQuad();
		var tl = quad.tl;
		var tr = quad.tr;
		var bl = quad.bl;
		var br = quad.br;

		// tl
		this.insertVertexAttributes( offset,
			tl.vertices.x, tl.vertices.y, tl.texCoords.u, tl.texCoords.v,
			tl.colors.r / 255.0, tl.colors.g / 255.0, tl.colors.b / 255.0, tl.colors.a / 255.0
		);

		// bl
		this.insertVertexAttributes( offset + attributeCount,
			bl.vertices.x, bl.vertices.y, bl.texCoords.u, bl.texCoords.v,
			bl.colors.r / 255.0, bl.colors.g / 255.0, bl.colors.b / 255.0, bl.colors.a / 255.0
		);

		// tr
		this.insertVertexAttributes( offset + attributeCount * 2,
			tr.vertices.x, tr.vertices.y, tr.texCoords.u, tr.texCoords.v,
			tr.colors.r / 255.0, tr.colors.g / 255.0, tr.colors.b / 255.0, tr.colors.a / 255.0
		);

		// br
		this.insertVertexAttributes( offset + attributeCount * 3,
			br.vertices.x, br.vertices.y, br.texCoords.u, br.texCoords.v,
			br.colors.r / 255.0, br.colors.g / 255.0, br.colors.b / 255.0, br.colors.a / 255.0
		);
	},
	insertVertexAttributes: function (offset, x, y, u, v, r, g, b, a) {
		var vertices = this.vertices;
		vertices[offset + 0] = x;
		vertices[offset + 1] = y;
		vertices[offset + 2] = u;
		vertices[offset + 3] = v;
		vertices[offset + 4] = r;
		vertices[offset + 5] = g;
		vertices[offset + 6] = b;
		vertices[offset + 7] = a;
	},

	// render assumes framebuffer, shader, and texture has already been set

	render: function (batchSize, offset) {
		batchSize || ( batchSize = this.getBatchSize() );
		if(batchSize > 0) {
			offset || ( offset = 0 );
			var stride = this.stride;

			var gl = cc._renderContext;

			if (this.getDirty()) {
				this.rebuild();
			}

			gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
			cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);
			gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, gl.FLOAT, false, stride, 0);
			gl.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT);
			gl.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT);

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);

			gl.drawElements(gl.TRIANGLES, batchSize * 6, gl.UNSIGNED_SHORT, offset * 6 * this.indices.BYTES_PER_ELEMENT);
			cc.incrementGLDraws(1);
		}
	}
});

Batch.create = function (batch) {
	return batch || new Batch();
};

module.exports = Batch;
