import GameState from "./gamestate";
import GameInitState from "./gameinitstate";
import GameOverState from "./gameoverstate";
import GamePauseState from "./gamepausestate";
import GameProcessState from "./gameprocessstate";
import TileComponent from "../components/tilecomponent";

export default class GamePlayState extends GameState{

    // processAction:cc.Action = null;
    // isStartProcessing:boolean = false;

    correctQuestionNumber:number = 0;
    selectCnt:number = 0;
    onStart(args: Array<any>) {
        super.onStart(args);

        cc.log("this.model.selectedTilesPerRound ===========> ", this.selectCnt)
        cc.log("this.model.itemsForOpen ===========> ", this.view.itemsForOpen)
        let isRestart = args[0];
        let continueProcessing = args[1];
        let isFirstPlay = args.length > 2 ? args[2] : false;

        this.view.node.on("menu",this.onMenu,this);
        this.view.node.on("next",this.onNextLevel,this)
        this.view.node.on("gameover", this.onGameOver, this);
        this.view.tileController.node.on("select",this.onSelect,this);
        this.view.tileController.node.on("wronganswer",this.onWrongAnswer,this);

        if(isRestart) {
            this.model.setChanged();

            console.log("Current question " + this.model.curQuestion);
            this.view.CreateTiles(this.model.curQuestion, isFirstPlay);

            //this.scheduleOnce(this.onGameOver,(this.model.gameFinishAt - new Date().getTime())/1000)
        }
        if(continueProcessing){
            this.ToProcessState();
        }
    }

    onGameOver(){
        this.controller.stateMachine.applyState(GameOverState);
    }

    onMenu(){
        this.controller.stateMachine.applyState(GamePauseState);
    }

    // for test
    onNextLevel(){
        if (this.model.currentStage === 4){
            this.model.currentStage = 0;
        }else {
            this.model.currentStage +=1
        }

        this.controller.stateMachine.applyState(GameInitState);
    }

    onReleaseResources() {
        super.onReleaseResources();

        this.unscheduleAllCallbacks();

        this.view.node.off("menu",this.onMenu,this);
        this.view.node.off('next',this.onNextLevel,this)
        this.view.node.off("gameover", this.onGameOver, this);
        this.view.tileController.node.off("select",this.onSelect,this);
    }

    onSelect(tile:TileComponent){
        if(tile.isFocused) {
            if(tile.isOpened){   // ===== if tile was opened => do nothing
                return
            }
            this.model.selectedTilesPerRound++;
            this.view.soundManager.playEffect(this.view.soundManager.clipOk);  // ====== play sound on TRUE

        }
        else {
            this.view.ShowWrongBg();
            this.view.soundManager.playEffect(this.view.soundManager.clipNo);  // ====== play sound on TRUE
            this.ToProcessState();
        }

        if(this.model.selectedTilesPerRound == this.model.itemsForOpen){
            this.ToProcessState()
        }
        
    }

    onWrongAnswer()
    {
        this.view.ShowWrongBg();
        this.ToProcessState();
    }

    ToProcessState()
    {
        this.view.blocker.active = true;
        
        this.model.processAction = cc.sequence(
            cc.delayTime(1.5), 
            cc.callFunc(() => {
                cc.log("=============> this in processing action", this)
                this.model.isProcessing = false;
                this.controller.stateMachine.applyState(GameProcessState, [this.model.isCorrectAnswer])
            })
        );
        this.view.tileController.onTilesBlocked();
        this.view.tileController.node.emit("settimer", false);
        this.view.tileController.node.off("wronganswer", this.onWrongAnswer, this);
        // let isCorrectAnswer = this.model.selectedTilesPerRound == this.view.itemsForOpen;
        if(this.model.isCorrectAnswer) {
            this.view.ShowCorrectBg();
            this.model.isProcessing = true;
            this.node.runAction(this.model.processAction);
        }
        else
            this.controller.stateMachine.applyState(GameProcessState, [this.model.isCorrectAnswer]);
    }
}
