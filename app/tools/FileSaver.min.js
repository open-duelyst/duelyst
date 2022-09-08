/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */
var saveAs = saveAs || typeof navigator !== 'undefined' && navigator.msSaveOrOpenBlob && navigator.msSaveOrOpenBlob.bind(navigator) || (function (a) {
  if (typeof navigator === 'undefined' || !/MSIE [1-9]\./.test(navigator.userAgent)) {
    const k = a.document; const n = k.createElementNS('http://www.w3.org/1999/xhtml', 'a'); const w = 'download' in n; const x = function (c) { const e = k.createEvent('MouseEvents'); e.initMouseEvent('click', !0, !1, a, 0, 0, 0, 0, 0, !1, !1, !1, !1, 0, null); c.dispatchEvent(e); }; const q = a.webkitRequestFileSystem; const u = a.requestFileSystem || q || a.mozRequestFileSystem;
    const y = function (c) { (a.setImmediate || a.setTimeout)(() => { throw c; }, 0); }; let r = 0; const s = function (c) { const e = function () { typeof c === 'string' ? (a.URL || a.webkitURL || a).revokeObjectURL(c) : c.remove(); }; a.chrome ? e() : setTimeout(e, 10); }; const t = function (c, a, d) { a = [].concat(a); for (let b = a.length; b--;) { const l = c[`on${a[b]}`]; if (typeof l === 'function') try { l.call(c, d || c); } catch (f) { y(f); } } }; const m = function (c, e) {
      const d = this; const b = c.type; let l = !1; let f; let p; const k = function () { t(d, ['writestart', 'progress', 'write', 'writeend']); }; const g = function () {
        if (l || !f) {
          f = (a.URL || a.webkitURL
|| a).createObjectURL(c);
        }p ? p.location.href = f : void 0 == a.open(f, '_blank') && typeof safari !== 'undefined' && (a.location.href = f); d.readyState = d.DONE; k(); s(f);
      }; const h = function (a) { return function () { if (d.readyState !== d.DONE) return a.apply(this, arguments); }; }; const m = { create: !0, exclusive: !1 }; let v; d.readyState = d.INIT; e || (e = 'download'); if (w)f = (a.URL || a.webkitURL || a).createObjectURL(c), n.href = f, n.download = e, x(n), d.readyState = d.DONE, k(), s(f); else {
        a.chrome && b && b !== 'application/octet-stream' && (v = c.slice || c.webkitSlice, c = v.call(
          c,
          0,
          c.size,
          'application/octet-stream',
        ), l = !0); q && e !== 'download' && (e += '.download'); if (b === 'application/octet-stream' || q)p = a; u ? (r += c.size, u(a.TEMPORARY, r, h((a) => {
          a.root.getDirectory('saved', m, h((a) => {
            const b = function () {
              a.getFile(e, m, h((a) => {
                a.createWriter(h((b) => {
                  b.onwriteend = function (b) { p.location.href = a.toURL(); d.readyState = d.DONE; t(d, 'writeend', b); s(a); }; b.onerror = function () { const a = b.error; a.code !== a.ABORT_ERR && g(); }; ['writestart', 'progress', 'write', 'abort'].forEach((a) => {
                    b[`on${
                      a}`] = d[`on${a}`];
                  }); b.write(c); d.abort = function () { b.abort(); d.readyState = d.DONE; }; d.readyState = d.WRITING;
                }), g);
              }), g);
            }; a.getFile(e, { create: !1 }, h((a) => { a.remove(); b(); }), h((a) => { a.code === a.NOT_FOUND_ERR ? b() : g(); }));
          }), g);
        }), g)) : g();
      }
    }; const b = m.prototype; b.abort = function () { this.readyState = this.DONE; t(this, 'abort'); }; b.readyState = b.INIT = 0; b.WRITING = 1; b.DONE = 2; b.error = b.onwritestart = b.onprogress = b.onwrite = b.onabort = b.onerror = b.onwriteend = null; return function (a, b) { return new m(a, b); };
  }
}(typeof self !== 'undefined'
&& self || typeof window !== 'undefined' && window || this.content)); typeof module !== 'undefined' && module !== null ? module.exports = saveAs : typeof define !== 'undefined' && define !== null && define.amd != null && define([], () => saveAs);
