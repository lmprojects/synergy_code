import GameState from "./gamestate";
import GamePlayState from "./gameplaystate";
import Config from "../../../domain/config";
import { BrainHealthNet, BRAIN_HEALTH_GAME_STATUS } from "../../../net/brainhealthnet";

export default class GameInitState extends GameState{
    isFirstPlay:boolean = false;
    async onStart(args: Array<any>) {
        super.onStart(args);

        this.isFirstPlay = args.length > 0 ? args[0] : false;
        this.view.loader.active = true;
        this.reset();
        
    }

    reset(){
        const self = this;

        this.model.curQuestion = 0;
        this.model.score = 0;
        this.model.correctAnswers = 0;
        this.model.correctSequence = 0;
        this.model.maxCorrectSequence = 0;
        this.model.isPreviousCorrect = true;
        this.view.itemsForOpen = 0;
        this.view.timerStopTime = 0;
        this.view.isTimerOn = false;

        if(Config.levels.length == 0){
            cc.resources.load("config", cc.JsonAsset,  (err, json:cc.JsonAsset) =>{
                if(err){
                    cc.error(err);
                }else{
                    Config.levels.push(json.json.Level1);
                    Config.levels.push(json.json.Level2);
                    Config.levels.push(json.json.Level3);
                    Config.levels.push(json.json.Level4);
                    Config.levels.push(json.json.Level5);

                    self.onPlay();
                }
            });
        }else
            this.onPlay();
    }
    onPlay(){
        this.view.tileController.ClearTiles();
        this.model.initialize(this.model.currentStage);
        this.view.node.emit("resettimer");
        this.view.tileController.node.emit("settimer", false);
        this.model.gameFinishAt = this.model.gameTotalSeconds * 1000 + new Date().getTime();

        this.view.loader.active = false;

        this.controller.stateMachine.applyState(GamePlayState,[true, false, this.isFirstPlay]);
    }
}
