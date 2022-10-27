import minimist from 'minimist';
import config from '../config/config';

// Re-export version and config
export { version } from '../version.json';
export { config };

// Export helpers
export const env = config.get('env');
export const production = env === 'production';
export const staging = env === 'staging';
export const development = !production && !staging;

// Flags for watch and minify
const knownOpts = {
  boolean: ['watch', 'minify'],
  alias: { w: 'watch', m: 'minify' },
  default: {
    watch: false,
    minify: production || staging,
  },
};

// Export opts flags
export const opts = minimist(process.argv.slice(2), knownOpts);
