import minimist from 'minimist'
import config from '../config/config'
import desktopPkgJson from '../desktop/package.json'

// Re-export version and config
export {version} from '../version'
export {config}
export {desktopPkgJson}

// Export helpers
export const env = config.get('env')
export const production = env === 'production'
export const staging = env === 'staging'
export const development = !production && !staging

// Flags for watch and minify
const knownOpts = {
  boolean: ['watch','minify'],
	alias: { w: 'watch', m: 'minify' },
  default: {
		watch: development,
		minify: production || staging
	}
}

// Export opts flags
export const opts = minimist(process.argv.slice(2), knownOpts)
