import PopUpComponent from "./popupcomponent";
import GameModel from "../gamemodel";


const { ccclass, property } = cc._decorator;

@ccclass
export default class GameOverWinPopup extends PopUpComponent {

    @property(cc.Label)
    lbGameplayScore: cc.Label = null;

    @property(cc.Label)
    lbTimeBonus: cc.Label = null;

    @property(cc.Label)
    lbDifficultyBonus: cc.Label = null;

    @property(cc.Label)
    lbStreakBonus: cc.Label = null;

    @property(cc.Label)
    lbTotalScore: cc.Label = null;


    onOpen(model: GameModel) {
        this.lbGameplayScore.string = `Gameplay Score: ${(model.score).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
        this.lbTimeBonus.string = `Time Bonus: ${(model.timeBonus).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
        this.lbDifficultyBonus.string = `Difficulty Bonus: ${(model.difficultyBonus).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
        this.lbStreakBonus.string = `Streak Bonus: ${(model.streakBonus).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
        this.lbTotalScore.string = `Your Total Score: ${(model.score+model.timeBonus+model.difficultyBonus+model.streakBonus).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    }

    onClose() {
        this.close(true);
    }
}
