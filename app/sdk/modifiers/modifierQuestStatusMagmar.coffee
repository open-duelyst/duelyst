ModifierQuestStatus = require './modifierQuestStatus'

i18next = require('i18next')

class ModifierQuestStatusMagmar extends ModifierQuestStatus

  type:"ModifierQuestStatusMagmar"
  @type:"ModifierQuestStatusMagmar"

  @createContextObject: (questCompleted, numBuffSpells) ->
    contextObject = super()
    contextObject.questCompleted = questCompleted
    contextObject.numBuffSpells = numBuffSpells
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      if modifierContextObject.questCompleted
        return i18next.t("modifiers.quest_completed_applied_desc")
      else
        return i18next.t("modifiers.magmarquest_counter_applied_desc",{spell_count: modifierContextObject.numBuffSpells})

  @getName: (modifierContextObject) ->
    return i18next.t("modifiers.magmarquest_counter_applied_name")

module.exports = ModifierQuestStatusMagmar
