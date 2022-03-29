const store = require('store2')

function createNamespace() {
	if (window.isSteam) {
		return 'duelyst-steam-' + process.env.NODE_ENV
	} else if (window.isKongregate) {
		return 'duelyst-kongregate-' + process.env.NODE_ENV
	} else {
		return 'duelyst-' + process.env.NODE_ENV
	}
}

const namespace = createNamespace()
const storage = store.namespace(namespace)
module.exports = storage