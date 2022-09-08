const store = require('store2');

function createNamespace() {
  return `duelyst-${process.env.NODE_ENV}`;
}

const namespace = createNamespace();
const storage = store.namespace(namespace);
module.exports = storage;
