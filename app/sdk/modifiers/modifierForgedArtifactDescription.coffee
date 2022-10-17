Modifier = require 'app/sdk/modifiers/modifier'

i18next = require('i18next')

class ModifierForgedArtifactDescription extends Modifier

  type:"ModifierForgedArtifactDescription"
  @type:"ModifierForgedArtifactDescription"

  @modifierName: ""
  @isHiddenToUI: false
  isRemovable: false
  isInherent: true # show description on card text

  maxStacks: 1

  @createContextObject: (factionId, attack) ->
    contextObject = super()
    contextObject.factionId = factionId
    contextObject.attack = attack
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      if modifierContextObject.factionId is 1
        return i18next.t("modifiers.forged_artifact_lyonar",{numericValue: modifierContextObject.attack})
      else if modifierContextObject.factionId is 2
        return i18next.t("modifiers.forged_artifact_songhai",{numericValue: modifierContextObject.attack})
      else if modifierContextObject.factionId is 3
        return i18next.t("modifiers.forged_artifact_vetruvian",{numericValue: modifierContextObject.attack})
      else if modifierContextObject.factionId is 4
        return i18next.t("modifiers.forged_artifact_abyssian",{numericValue: modifierContextObject.attack})
      else if modifierContextObject.factionId is 5
        return i18next.t("modifiers.forged_artifact_magmar",{numericValue: modifierContextObject.attack})
      else if modifierContextObject.factionId is 6
        return i18next.t("modifiers.forged_artifact_vanar",{numericValue: modifierContextObject.attack})
      else
        return i18next.t("modifiers.forged_artifact_neutral",{numericValue: modifierContextObject.attack})

module.exports = ModifierForgedArtifactDescription
