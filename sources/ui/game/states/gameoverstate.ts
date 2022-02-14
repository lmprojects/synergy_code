import GameState from "./gamestate";
import GameOverPopUp from "../popups/gameoverpopup";
import GameInitState from "./gameinitstate";
import GameOverWinPopup from "../popups/gameoverwinpopup";
import { BrainHealthNet } from "../../../net/brainhealthnet";

const DifficultyBonus:number = 7250;
const TimeBonusSecond:number = 60;
const TimeBonusVal:number = 100;

export default class GameOverState extends GameState{
    async onStart(args: Array<any>) {
        super.onStart(args);
        this.view.soundManager.playEffect(this.view.soundManager.clipGameOver);  // ====== play sound on Game Over
        /**set  playGameTapped to false in firestore*/
        BrainHealthNet.playTappedToFalse();

        switch (this.model.maxCorrectSequence)
        {
            default:
                this.model.streakBonus = 0;
                break;
            case 3:
                this.model.streakBonus = 150;
                break;
            case 4:
                this.model.streakBonus = 200;
                break;
            case 5:
                this.model.streakBonus = 250;
                break;
            case 6:
                this.model.streakBonus = 300;
                break;
            case 7:
                this.model.streakBonus = 350;
                break;
            case 8:
                this.model.streakBonus = 400;
                break;
            case 9:
                this.model.streakBonus = 450;
                break;
            case 10:
                this.model.streakBonus = 500;
                break;
        }

        // this.model.difficultyBonus = 0//(this.model.currentStage+1) * DifficultyBonus;

        this.model.gameFinishAt += new Date().getTime() - this.view.timerStopTime;
        let timeLeft = this.model.gameTotalSeconds - Math.round((this.model.gameFinishAt - new Date().getTime()) / 1000);
        this.model.timeBonus = (TimeBonusSecond - timeLeft) * TimeBonusVal;
        if(this.model.timeBonus < 0)
            this.model.timeBonus = 0;
        else if(this.model.timeBonus > 5000)
            this.model.timeBonus = 5000;
        console.log("Timeleft " + Math.round((this.model.gameFinishAt - new Date().getTime()) / 1000) + " time " + timeLeft + " score " + this.model.timeBonus);

        BrainHealthNet.setGame({
            totalQuestions: this.model.allQuestions,
            gameScore: this.model.score,
            correctAnswers: this.model.correctAnswers,
            longestStreak: this.model.maxCorrectSequence,
            totalScore: this.model.getTotalBonus(),
            streakBonus: this.model.streakBonus,
            difficultBonus: this.model.difficultyBonus,
            timeBonus: this.model.timeBonus,
            errorMade:this.model.wrongCount,
        }).catch(console.log);

        if(this.model.curQuestion == this.model.allQuestions) {
            await this.controller.openPopUp(GameOverWinPopup, this.model);
        }
        else{
            await this.controller.openPopUp(GameOverPopUp,this.model);
        }
        this.controller.stateMachine.applyState(GameInitState);
    }
}
