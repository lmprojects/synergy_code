import PopUpComponent from "./popupcomponent";
import GameModel from "../gamemodel";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameOverPopUp extends PopUpComponent{

    @property(cc.Label)
    lbScore:cc.Label = null;

    @property(cc.Label)
    lbMessage:cc.Label = null;

    onOpen(model: GameModel) {
        this.lbScore.string = "Your score:" + model.score;
        this.lbScore.node.active = false;

        this.lbMessage.string = "Nice try!\nPlay again to improve your skills and train your brain to perform. Good luck and aim for a high score!";

    }

    onClose(){
        this.close(true);
    }
}
