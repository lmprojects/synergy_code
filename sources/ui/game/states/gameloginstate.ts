import GameState from "./gamestate";
import GamePlayState from "./gameplaystate";
import GameModel from "../gamemodel";
import {
  BrainHealthNet,
  BRAIN_HEALTH_GAME_STATUS,
} from "../../../net/brainhealthnet";
import GameInitState from "./gameinitstate";
import HowToPlayPopUp from "../popups/howtoplaypopup";

export default class GameLoginState extends GameState {
  async onStart(args: Array<any>) {
    super.onStart(args);

    cc.log("BRAINHEALTHNET STATUS")
    console.log(BrainHealthNet.isFirstGame)
    /**
     * Checking is BUILD
     * when BrainHealthNet.instance.id is undefined - the first game
     **/
    if (!!BrainHealthNet.get()) {
      if (!BrainHealthNet.get().auth().currentUser) {
        console.log("need signin");
        await BrainHealthNet.signin();
      }

      if (BrainHealthNet.instance.difficultyLevel) {
        let n = BrainHealthNet.instance.difficultyLevel;
        this.model.currentStage = 4;

        if (n < 21) {
          this.model.currentStage = 0;
        } else if (n < 41) {
          this.model.currentStage = 1;
        } else if (n < 61) {
          this.model.currentStage = 2;
        } else if (n < 81) {
          this.model.currentStage = 3;
        }
        
        this.model.difficultyLevel = BrainHealthNet.instance.difficultyLevel;

      } else {
        this.model.currentStage = 0;
        this.model.difficultyLevel = 0;
      }

      const isFirst = await BrainHealthNet.isFirstGame();
      // integration dec.1.2020
      if (isFirst) {
        // this.view.loader.active = false;
        BrainHealthNet.changeGameStatus(BRAIN_HEALTH_GAME_STATUS.Play);
        this.stateMachine.applyState(GameInitState, [true]);
        await this.controller.openPopUp(HowToPlayPopUp, this.model);
      } else {
        await BrainHealthNet.waitForUser();
        BrainHealthNet.changeGameStatus(BRAIN_HEALTH_GAME_STATUS.Play);
      }
      // ================
    }

    this.model.setChanged();

    //this.model.currentStage = GameModel.randomInt(0,this.model.levels.length);

    this.stateMachine.applyState(GameInitState);
  }
}
