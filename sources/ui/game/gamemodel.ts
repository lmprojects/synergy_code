import Observable from "../../meliorgames/observable";
import LevelScenario from "../../domain/levelscenario";
import Config from "../../domain/config";

export default class GameModel extends Observable
{
    gameFinishAt:number = 0;
    gameTotalSeconds:number = 75;

    currentStage:number = 0;
    curScenario:LevelScenario = null;
    curQuestion:number = 0;
    allQuestions:number = 10;

    score:number = 0;
    streakBonus:number = 0;
    timeBonus:number = 0;

    wrongCount:number = 0;
    correctAnswers:number = 0;
    correctSequence:number = 0;
    isPreviousCorrect:boolean = false;
    maxCorrectSequence:number = 0;

    /**Number of tiles, to open */
    itemsForOpen:number = 0;

    isProcessing:boolean = false;
    processAction:cc.Action = null;
    
    /**Number of correctly selected tiles */
    selectedTilesPerRound:number = 0;

    difficultyBonus: number = 0;
    difficultyLevel: number = 0;
  
    getDifficultyBonus(){
      this.difficultyBonus = Math.round(7250 * this.difficultyLevel / 100);
    }

    get timeIsOver():boolean
    {
        return new Date().getTime() > this.gameFinishAt;
    }

    get isCorrectAnswer(){
        return this.selectedTilesPerRound == this.itemsForOpen;
    }
    public static randomInt(min, max){
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    public static randomFloat(min, max){
        return Math.random() * (max - min + 1) + min;
    }


    initialize(levelIndex:number){
        this.curScenario = Config.getLevelsScenario(levelIndex);
        this.getDifficultyBonus();
    }
    getTotalBonus(){
        return this.score+this.timeBonus+this.difficultyBonus+this.streakBonus
    }

}
