import GameState from "./gamestate";
import GamePlayState from "./gameplaystate";
import GameOverState from "./gameoverstate";
import GamePauseState from "./gamepausestate";

const CorrectScore:number = 725;
const WrongScore:number = 345;
export default class GameProcessState extends GameState{
    async onStart(args: Array<any>) {
        super.onStart(args);

        this.model.selectedTilesPerRound = 0;
        if(args.length == 1) {
            let answer = args[0];

            if (answer) {

                this.model.score += CorrectScore;
                console.log("Score " + CorrectScore);
                this.model.correctAnswers++;

                if (this.model.isPreviousCorrect) {
                    this.model.correctSequence++;
                }
                this.model.maxCorrectSequence = Math.max(this.model.maxCorrectSequence, this.model.correctSequence);
                this.model.isPreviousCorrect = true;
            } else {
                this.model.score -= WrongScore;
                if (this.model.score < 0)
                    this.model.score = 0;
                this.model.isPreviousCorrect = false;
                this.model.correctSequence = 0;
                this.model.wrongCount++
            }
            this.model.curQuestion++;

            this.model.setChanged();

            if (answer)
                this.GoToNextQuestion();
            else
                this.view.node.emit("msgwrongshow");
        }else{
            this.view.tileController.onTilesBlocked();
        }

        this.view.node.on("gotonextquestion", this.GoToNextQuestion, this);
        this.view.node.on("gameover", this.onGameOver, this);
        this.view.node.on("menu",this.onMenu,this);
    }


    onMenu(){
        this.controller.stateMachine.applyState(GamePauseState, [false, false]);
    }

    onGameOver(){
        this.controller.stateMachine.applyState(GameOverState);
    }

    GoToNextQuestion()
    {
        if(this.model.curQuestion < this.model.allQuestions) {
            this.view.tileController.ClearTiles();
            this.controller.stateMachine.applyState(GamePlayState, ["process"]);
        }
        else
            this.controller.stateMachine.applyState(GameOverState);
    }

    onReleaseResources() {
        super.onReleaseResources();

        this.unscheduleAllCallbacks();

        this.view.node.off("gotonextquestion", this.GoToNextQuestion, this);
        this.view.node.off("gameover", this.onGameOver, this);
        this.view.node.off("menu",this.onMenu,this);
    }
}
