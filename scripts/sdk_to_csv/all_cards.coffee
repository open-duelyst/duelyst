

SDK = require "../../app/sdk"

console.log "running"

str = "id,factionid,factionname,rarity,name\n"
for card in SDK.CardFactory.getAllCards(SDK.GameSession.current())
  str += "#{card.id},#{card.factionId},#{SDK.FactionFactory.factionForIdentifier(card.factionId).name},\"#{SDK.RarityFactory.rarityForIdentifier(card.rarityId).name}\",\"#{card.name}\" \n"

console.log str
process.exit(1)
