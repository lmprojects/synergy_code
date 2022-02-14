import GameState from "./gamestate";
import GamePlayState from "./gameplaystate";
import HowToPlayPopUp from "../popups/howtoplaypopup";
import MenuPopUp from "../popups/menupopup";
import GameInitState from "./gameinitstate";
import GameProcessState from "./gameprocessstate";
import { BrainHealthNet,BRAIN_HEALTH_GAME_STATUS } from "../../../net/brainhealthnet";

export default class GamePauseState extends GameState{

    pauseStartTime:number
    restart:boolean = false

    async onStart(args: Array<any>) {
        await super.onStart(args);

        let isProcess:boolean = false;
        if(args.length > 0)
            isProcess = true;

        cc.log("pause node =====> ", this.node)
        this.node.on("help",this.onHelp,this)

        this.pauseStartTime = new Date().getTime()
        cc.log("================ before pause ON");
        this.view.OnPauseGameOn();
        cc.log("================ after pause ON");
        BrainHealthNet.changeGameStatus(BRAIN_HEALTH_GAME_STATUS.Pause)
        let popUp = await this.controller.openPopUp(MenuPopUp);
        cc.log("popup ================> ", popUp)
        if(popUp.isRestart){
            this.model.gameFinishAt = 0;
            this.controller.stateMachine.applyState(GameInitState,[this.restart]);
        }

        if(this.model.curQuestion < this.model.allQuestions){
            this.view.OnPauseGameOff();
            if(this.view.isTimerOn)
                this.model.gameFinishAt += new Date().getTime() - this.pauseStartTime;
            if(isProcess){
                cc.log("Process state ======> ")
                this.controller.stateMachine.applyState(GameProcessState, [false, false]);
            }else{
                cc.log("play state ======> ")
                if(this.model.isProcessing){
                    cc.log("=>is processing")
                    /** Do this, if in GamePlayState run action <model.processAction>, during 
                     *  1,5 sec after correct answer
                     */
                    this.controller.stateMachine.applyState(GamePlayState,[false, true]);
                }else{
                    cc.log("=>is not processing")
                    this.controller.stateMachine.applyState(GamePlayState,[false, false]);
                }
            }
        }
        else{
            cc.log("init state ======> ")
            this.controller.stateMachine.applyState(GameInitState,[this.restart]);
        }
        BrainHealthNet.changeGameStatus(BRAIN_HEALTH_GAME_STATUS.Play)
    }

    async onHelp(){
        await this.controller.openPopUp(HowToPlayPopUp,this.model)
    }

    onReleaseResources() {
        super.onReleaseResources();

        this.node.off("help",this.onHelp,this)
    }
}
