// Adds currency to users.
// Requires Postgres, Redis, and FIREBASE_URL env var.
const path = require('path');
const _ = require('underscore');
require('app-module-path').addPath(path.join(__dirname, '../'));
require('coffeescript/register');

const config = require('../config/config');
const knex = require('../server/lib/data_access/knex.coffee');
const InventoryModule = require('../server/lib/data_access/inventory.coffee');
const UsersModule = require('../server/lib/data_access/users.coffee');

if (process.argv.length !== 6) {
  console.log('Usage: node manage_user_wallet.js <username> <add|subtract> <amount> <currencyType>');
  process.exit(1);
}

const username = process.argv[2];
const action = process.argv[3];
let amount = parseFloat(process.argv[4]);
const currencyType = process.argv[5];
console.log(action, 'ing ', amount, ' ', currencyType, ' to user ', username);

if (action === 'subtract') {
  amount = -amount;
}

UsersModule.userIdForUsername(username)
  .then((userId) => {
    if (!userId) {
      throw new Error('userid not found');
    }

    knex.transaction((tx) => {
      switch (currencyType) {
      case 'gold':
        return InventoryModule.giveUserGold(null, tx, userId, amount, 'manual script run');
      case 'premium':
        return InventoryModule.giveUserPremium(null, tx, userId, amount, 'manual script run');
      case 'spirit':
        return InventoryModule.giveUserSpirit(null, tx, userId, amount, 'manual script run');
      default:
        return Promise.reject(new Error('unsupported currency type'));
      }
    });
  })
  .then(() => {
    console.log('currency added to wallet');
    return process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    return process.exit(1);
  });
