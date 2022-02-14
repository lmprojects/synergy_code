import GameView from "./gameview";
import GameModel from "./gamemodel";
import StateMachine from "../../meliorgames/statemachine";
import GameInitState from "./states/gameinitstate";
import PopUpComponent from "./popups/popupcomponent";
import { BrainHealthNet, BRAIN_HEALTH_GAME_STATUS } from "../../net/brainhealthnet";
import GameLoginState from "./states/gameloginstate";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameController extends cc.Component{
    @property(GameView)
    view:GameView = null;
    model:GameModel = null;
    stateMachine:StateMachine = null;

    protected onLoad(): void {
        this.stateMachine = new StateMachine(this.node);
    }

    protected start(): void {
        this.model = new GameModel();
        this.view.applyModel(this.model);

        this.stateMachine.applyState(GameLoginState);
    }

    openPopUp(type,args = null){
        let popUp:PopUpComponent = this.node.getComponentInChildren(type)
        popUp.parent = this;

        return popUp.open(args)
    }

    
    onQuit(){
        BrainHealthNet.changeGameStatus(BRAIN_HEALTH_GAME_STATUS.Quit)
    }
    onPreview(){
        BrainHealthNet.changeGameStatus(BRAIN_HEALTH_GAME_STATUS.Preview)
        BrainHealthNet.playTappedToFalse();
    }
}
