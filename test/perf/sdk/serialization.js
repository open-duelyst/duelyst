const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../'));
require('coffeescript/register');
const Promise = require('bluebird');
const Benchmark = require('benchmark');
const Logger = require('../../../app/common/logger.coffee');
const SDK = require('../../../app/sdk.coffee');
const UtilsSDK = require('../../utils/utils_sdk');

module.exports = new Promise((resolve, reject) => {
  const suite = new Benchmark.Suite('Serialization');

  // disable the logger for cleaner test output
  Logger.enabled = false;

  // add tests

  suite.add('Serialize empty session', {
    fn() {
      SDK.GameSession.getInstance().serializeToJSON(SDK.GameSession.getInstance());
    },
    onStart(event) {
      SDK.GameSession.reset();
      SDK.GameSession.getInstance();
    },
    onComplete(event) {
      console.log(`${String(event.target)} w/ size ${SDK.GameSession.getInstance().serializeToJSON(SDK.GameSession.getInstance()).length}`);
    },
  });

  suite.add('Serialize new session', {
    fn() {
      SDK.GameSession.getInstance().serializeToJSON(SDK.GameSession.getInstance());
    },
    onStart(event) {
      // setup session with starter decks and skip mulligan
      UtilsSDK.setupSession(SDK.FactionFactory.starterDeckForFactionLevel(1, 30), SDK.FactionFactory.starterDeckForFactionLevel(2, 30), true);
    },
    onComplete(event) {
      console.log(`${String(event.target)} w/ size ${SDK.GameSession.getInstance().serializeToJSON(SDK.GameSession.getInstance()).length}`);
    },
  });

  suite.add('Deserialize new session', {
    fn() {
      SDK.GameSession.getInstance().deserializeSessionFromFirebase(JSON.parse(SDK.GameSession.getInstance()._rollbackSnapshot));
    },
    onStart(event) {
      // setup session with starter decks and skip mulligan
      UtilsSDK.setupSession(SDK.FactionFactory.starterDeckForFactionLevel(1, 30), SDK.FactionFactory.starterDeckForFactionLevel(2, 30), true);
      SDK.GameSession.getInstance()._rollbackSnapshot = SDK.GameSession.getInstance().generateGameSessionSnapshot();
    },
    onComplete(event) {
      console.log(String(event.target));
    },
  });

  suite.add('Serialize card', {
    fn() {
      SDK.GameSession.getInstance().serializeToJSON(SDK.GameSession.getInstance().getGeneralForPlayer1());
    },
    onStart(event) {
      // setup session with starter decks and skip mulligan
      UtilsSDK.setupSession(SDK.FactionFactory.starterDeckForFactionLevel(1, 30), SDK.FactionFactory.starterDeckForFactionLevel(2, 30), true);
    },
    onComplete(event) {
      console.log(`${String(event.target)} w/ size ${SDK.GameSession.getInstance().serializeToJSON(SDK.GameSession.getInstance().getGeneralForPlayer1()).length}`);
    },
  });

  suite.add('Deserialize card', {
    fn() {
      SDK.GameSession.getInstance().deserializeCardFromFirebase(JSON.parse(SDK.GameSession.getInstance()._rollbackSnapshot));
    },
    onStart(event) {
      // setup session with starter decks and skip mulligan
      UtilsSDK.setupSession(SDK.FactionFactory.starterDeckForFactionLevel(1, 30), SDK.FactionFactory.starterDeckForFactionLevel(2, 30), true);
      SDK.GameSession.getInstance()._rollbackSnapshot = SDK.GameSession.getInstance().serializeToJSON(SDK.GameSession.getInstance().getGeneralForPlayer1());
    },
    onComplete(event) {
      console.log(String(event.target));
    },
  });

  suite.add('Serialize modifier', {
    fn() {
      SDK.GameSession.getInstance().serializeToJSON(SDK.GameSession.getInstance().getCurrentPlayer().getDeck().getCardInHandAtIndex(0)
        .getModifiers()[0]);
    },
    onStart(event) {
      // setup session with planar scout and skip mulligan
      UtilsSDK.setupSession([{ id: SDK.Cards.Faction1.General }, { id: SDK.Cards.Neutral.PlanarScout }], [{ id: SDK.Cards.Faction1.General }, { id: SDK.Cards.Neutral.PlanarScout }], true);
    },
    onComplete(event) {
      console.log(`${String(event.target)} w/ size ${SDK.GameSession.getInstance().serializeToJSON(SDK.GameSession.getInstance().getCurrentPlayer().getDeck().getCardInHandAtIndex(0)
        .getModifiers()[0]).length}`);
    },
  });

  suite.add('Deserialize modifier', {
    fn() {
      SDK.GameSession.getInstance().deserializeModifierFromFirebase(JSON.parse(SDK.GameSession.getInstance()._rollbackSnapshot));
    },
    onStart(event) {
      // setup session with planar scout and skip mulligan
      UtilsSDK.setupSession([{ id: SDK.Cards.Faction1.General }, { id: SDK.Cards.Neutral.PlanarScout }], [{ id: SDK.Cards.Faction1.General }, { id: SDK.Cards.Neutral.PlanarScout }], true);
      SDK.GameSession.getInstance()._rollbackSnapshot = SDK.GameSession.getInstance().serializeToJSON(SDK.GameSession.getInstance().getCurrentPlayer().getDeck().getCardInHandAtIndex(0)
        .getModifiers()[0]);
    },
    onComplete(event) {
      console.log(String(event.target));
    },
  });

  suite.add('Serialize session w/ 100 ended turns', {
    fn() {
      SDK.GameSession.getInstance().serializeToJSON(SDK.GameSession.getInstance());
    },
    onStart(event) {
      // setup session with starter decks and skip mulligan
      UtilsSDK.setupSession(SDK.FactionFactory.starterDeckForFactionLevel(1, 30), SDK.FactionFactory.starterDeckForFactionLevel(2, 30), true);

      // execute some actions
      const gameSession = SDK.GameSession.getInstance();
      const numTurns = 100;
      for (let i = 0; i < numTurns; i++) {
        // put first card in current player's hand back into deck
        // this way players will continue to draw cards every turn
        // in order to do this we also need to disable validators
        // because these actions aren't valid explicit player actions
        const player = gameSession.getCurrentPlayer();
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, player.getPlayerId(), player.getDeck().getCardIndexInHandAtIndex(0)));

        // end turn
        gameSession.executeAction(gameSession.actionEndTurn());
      }
    },
    onComplete(event) {
      console.log(`${String(event.target)} w/ size ${SDK.GameSession.getInstance().serializeToJSON(SDK.GameSession.getInstance()).length}`);
    },
  });

  suite.add('Deserialize session w/ 100 ended turns', {
    fn() {
      SDK.GameSession.getInstance().deserializeSessionFromFirebase(JSON.parse(SDK.GameSession.getInstance()._rollbackSnapshot));
    },
    onStart(event) {
      // setup session with starter decks and skip mulligan
      UtilsSDK.setupSession(SDK.FactionFactory.starterDeckForFactionLevel(1, 30), SDK.FactionFactory.starterDeckForFactionLevel(2, 30), true);

      // execute some actions
      const gameSession = SDK.GameSession.getInstance();
      const numTurns = 100;
      for (let i = 0; i < numTurns; i++) {
        // put first card in current player's hand back into deck
        // this way players will continue to draw cards every turn
        // in order to do this we also need to disable validators
        // because these actions aren't valid explicit player actions
        const player = gameSession.getCurrentPlayer();
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, player.getPlayerId(), player.getDeck().getCardIndexInHandAtIndex(0)));

        // end turn
        gameSession.executeAction(gameSession.actionEndTurn());
      }

      SDK.GameSession.getInstance()._rollbackSnapshot = SDK.GameSession.getInstance().generateGameSessionSnapshot();
    },
    onComplete(event) {
      console.log(String(event.target));
    },
  });

  suite.add('Serialize end turn step', {
    fn() {
      SDK.GameSession.getInstance().serializeToJSON(SDK.GameSession.getInstance().getLastStep());
    },
    onStart(event) {
      // setup session with starter decks and skip mulligan
      UtilsSDK.setupSession(SDK.FactionFactory.starterDeckForFactionLevel(1, 30), SDK.FactionFactory.starterDeckForFactionLevel(2, 30), true);

      // end one turn
      SDK.GameSession.getInstance().executeAction(SDK.GameSession.getInstance().actionEndTurn());
    },
    onComplete(event) {
      console.log(`${String(event.target)} w/ size ${SDK.GameSession.getInstance().serializeToJSON(SDK.GameSession.getInstance().getLastStep()).length}`);
    },
  });

  suite.add('Serialize replace card step', {
    fn() {
      SDK.GameSession.getInstance().serializeToJSON(SDK.GameSession.getInstance().getLastStep());
    },
    onStart(event) {
      // setup session with starter decks and skip mulligan
      UtilsSDK.setupSession(SDK.FactionFactory.starterDeckForFactionLevel(1, 30), SDK.FactionFactory.starterDeckForFactionLevel(2, 30), true);

      // replace a card
      SDK.GameSession.getInstance().executeAction(SDK.GameSession.getInstance().getPlayer1().actionReplaceCardFromHand(0));
    },
    onComplete(event) {
      console.log(`${String(event.target)} w/ size ${SDK.GameSession.getInstance().serializeToJSON(SDK.GameSession.getInstance().getLastStep()).length}`);
    },
  });

  suite.add('Serialize spawn unit step', {
    fn() {
      SDK.GameSession.getInstance().serializeToJSON(SDK.GameSession.getInstance().getLastStep());
    },
    onStart(event) {
      // setup session with planar scout and skip mulligan
      UtilsSDK.setupSession([{ id: SDK.Cards.Faction1.General }, { id: SDK.Cards.Neutral.PlanarScout }], [{ id: SDK.Cards.Faction1.General }, { id: SDK.Cards.Neutral.PlanarScout }], true);

      // play planar scout from hand index 0 to position 0, 0
      SDK.GameSession.getInstance().executeAction(SDK.GameSession.getInstance().getCurrentPlayer().actionPlayCardFromHand(0, 0, 0));
    },
    onComplete(event) {
      console.log(`${String(event.target)} w/ size ${SDK.GameSession.getInstance().serializeToJSON(SDK.GameSession.getInstance().getLastStep()).length}`);
    },
  });

  suite.add('Serialize play spell and kill unit step', {
    fn() {
      SDK.GameSession.getInstance().serializeToJSON(SDK.GameSession.getInstance().getLastStep());
    },
    onStart(event) {
      // setup session with planar scout and a damage spell and skip mulligan
      UtilsSDK.setupSession(
        [
          { id: SDK.Cards.Faction1.General },
          { id: SDK.Cards.Neutral.PlanarScout },
          { id: SDK.Cards.Spell.TrueStrike },
        ],
        [
          { id: SDK.Cards.Faction1.General },
          { id: SDK.Cards.Neutral.PlanarScout },
          { id: SDK.Cards.Spell.TrueStrike },
        ],
        true,
      );

      // set remaining mana to max to allow any cards to be played
      SDK.GameSession.getInstance().getCurrentPlayer().remainingMana = 9;

      // play planar scout from hand index 0 to position 0, 0
      SDK.GameSession.getInstance().executeAction(SDK.GameSession.getInstance().getCurrentPlayer().actionPlayCardFromHand(0, 0, 0));

      // play true strike on planar scout from hand index 1 to position 0, 0
      SDK.GameSession.getInstance().executeAction(SDK.GameSession.getInstance().getCurrentPlayer().actionPlayCardFromHand(1, 0, 0));
    },
    onComplete(event) {
      console.log(`${String(event.target)} w/ size ${SDK.GameSession.getInstance().serializeToJSON(SDK.GameSession.getInstance().getLastStep()).length}`);
    },
  });

  suite.add('Deserialize end turn step', {
    fn() {
      SDK.GameSession.getInstance().deserializeStepFromFirebase(JSON.parse(SDK.GameSession.getInstance()._rollbackSnapshot));
    },
    onStart(event) {
      // setup session with starter decks and skip mulligan
      UtilsSDK.setupSession(SDK.FactionFactory.starterDeckForFactionLevel(1, 30), SDK.FactionFactory.starterDeckForFactionLevel(2, 30), true);
      SDK.GameSession.getInstance().executeAction(SDK.GameSession.getInstance().actionEndTurn());
      SDK.GameSession.getInstance()._rollbackSnapshot = SDK.GameSession.getInstance().serializeToJSON(SDK.GameSession.getInstance().getLastStep());
    },
    onComplete(event) {
      console.log(String(event.target));
    },
  });

  // add complete listener
  suite.on('complete', resolve);

  // run tests
  suite.run({ async: false });
});
