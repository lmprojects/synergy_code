import GameView from "../gameview";
import GameModel from "../gamemodel";
import Command from "../../../meliorgames/command";
import StateMachine from "../../../../sources/meliorgames/statemachine";

export default class GameState extends Command{
    controller:any;
    view:GameView;
    model:GameModel;
    stateMachine:StateMachine;

    onStart(args: Array<any>) {
        super.onStart(args);

        this.controller = this.getComponent("gamecontroller");
        this.model = this.controller.model;
        this.view = this.controller.view;
        this.stateMachine = this.controller.stateMachine;
    }
}
