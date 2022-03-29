var FirebaseTokenGenerator = require("firebase-token-generator");
var tokenGenerator = new FirebaseTokenGenerator("...");
// expires 2020
var token = tokenGenerator.createToken({id:"..."},{expires:1603941632});
// deploy token used to set system-status
// var token = tokenGenerator.createToken({uid:"1372d9b92f1e",continous_integration_user: true},{expires:1603941632});

console.log(token);

process.exit(0);
