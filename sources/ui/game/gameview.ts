import SoundManager from "./soundmanager";
import GameModel from "./gamemodel";
import Observable, {Observer} from "../../meliorgames/observable";
import Question from "../../domain/question";
import TileController from "./components/tilecontroller";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameView extends cc.Component implements Observer
{
    @property(SoundManager)
    soundManager:SoundManager = null;   // ===== create property for SoundManager

    @property(cc.Node)
    nodeTimer:cc.Node = null;
    @property(cc.Label)
    lbTimer:cc.Label = null;
    @property(cc.Sprite)
    spProgress:cc.Sprite = null;
    @property(cc.Node)
    backgroundWrong:cc.Node = null;
    @property(cc.Node)
    backgroundCorrect:cc.Node = null;
    @property(cc.Label)
    lbScore:cc.Label = null;
    @property(cc.Node)
    messageWrong:cc.Node = null;
    @property(cc.Node)
    messageCorrect:cc.Node = null;
    @property(cc.Node)
    menuButton:cc.Node = null;

    @property(TileController)
    tileController:TileController = null;

    @property(cc.Node)
    startMsg:cc.Node = null;
    @property(cc.Label)
    lbStartMsg:cc.Label = null;

    //test
    @property(cc.Label)
    lbTestBtn: cc.Label = null

    @property(cc.Node)
    loader:cc.Node = null;
    @property(cc.Node)
    blocker:cc.Node = null;

    model:GameModel = null;
    curQuestion:Question = null;
    isTimerOn:boolean = false;
    timerStopTime:number = 0;
    isPause:boolean = false;

    itemsForOpen:number = 0;

    static colors:Array<string> = ["blue", "green", "orange", "purple", "yellow"];
    static items:Array<string> = ["basketball", "book", "candle", "headphones", "sneakers"];

    protected onLoad(): void {
        this.isPause = true;

        this.tileController.node.on("showStartMsg", this.ShowStartMsg, this);
        this.tileController.node.on("settimer", this.OnSetTimer, this);
        this.node.on("resettimer", this.onResetTimer, this);
        this.node.on("msgwrongshow", this.ShowWrongMsg, this);
        this.node.on("firstGamePauseOff", this.FirstGamePauseOff, this);

        this.startMsg.active = false;
        this.messageWrong.active = false;
        this.messageCorrect.active = false;
        this.backgroundCorrect.active = false;
        this.backgroundWrong.active = false;
    }

    protected lateUpdate(dt: number): void {
        if(this.model) {
            if(this.isPause)
            {
                this.nodeTimer.active = false;
                return;
            }
            else
                this.nodeTimer.active = true;

            if (this.isTimerOn) {
                let timeLeft = (this.model.gameFinishAt - new Date().getTime()) / 1000;

                if (timeLeft > 0) {
                    this.spProgress.fillRange = 1 - timeLeft / this.model.gameTotalSeconds;
                    this.lbTimer.string = Math.round(timeLeft).toString();
                } else
                    this.node.emit("gameover");
            }
        }
    }

    applyModel(model:GameModel) {
        this.model = model;
        model.addObserver(this);
        this.onObjectChanged(model);

        this.spProgress.fillRange = 0;
        this.lbTimer.string = this.model.gameTotalSeconds.toString();
    }

    onMenu(){
        this.node.emit("menu");
    }

    onObjectChanged(model: Observable)
    {
        this.lbTestBtn.string = `Level ${this.model.currentStage + 1}`;
        this.lbScore.string = "Score: " + this.model.score;
    }

    // for test
    testLevel(){
        this.node.emit("next");
    }

    static shuffle(array: Array<unknown>) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            let temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }

    onResetTimer()
    {
        this.spProgress.fillRange = 0;
        this.lbTimer.string = this.model.gameTotalSeconds.toString();
    }

    OnSetTimer(enable:boolean)
    {
        this.blocker.active = false;
        
        this.isTimerOn = enable;
        if(!enable)
        {
            this.timerStopTime = new Date().getTime();
        }
        else
        {
            this.model.gameFinishAt += new Date().getTime() - this.timerStopTime;
            this.timerStopTime = 0;
        }
    }

    OnPauseGameOn()
    {
        this.isPause = true;
        this.tileController.onTilesBlocked();
        this.tileController.OnPauseOn();
        if(this.model.isProcessing){
            this.node.stopAction(this.model.processAction)
        }
    }

    OnPauseGameOff()
    {
        this.isPause = false;
        this.tileController.OnPauseOff();
        this.tileController.onTilesUnlocked();
        // if(this.model.isProcessing){
        //     this.node.runAction(this.model.processAction)
        // }
    }

    FirstGamePauseOff()
    {
        this.model.gameFinishAt = this.model.gameTotalSeconds * 1000 + new Date().getTime();
        this.timerStopTime = new Date().getTime();
        this.OnPauseGameOff();
        this.node.off("firstGamePauseOff", this.FirstGamePauseOff, this);
    }

    CreateTiles(curQuestion:number, isFirstPlay:boolean)
    {
        this.backgroundCorrect.active = false;
        this.backgroundWrong.active = false;
        this.messageWrong.active = false;
        this.messageCorrect.active = false;

        this.curQuestion = this.model.curScenario.questions[curQuestion];
        let tilesCount = this.curQuestion.totalTiles;

        let colorsNumber = 0;
        let itemsNumber = 0;
        this.model.itemsForOpen = 0;
        let tasks = this.curQuestion.task.split(',');
        tasks.forEach(t =>
        {
            if(t.includes("Colors"))
                colorsNumber = parseInt(t.substr(0, t.length - 7));
            else if(t.includes("Color"))
                colorsNumber = parseInt(t.substr(0, t.length - 6));

            if(t.includes("Items"))
                itemsNumber = parseInt(t.substr(0, t.length - 6));
            else if(t.includes("Item"))
                itemsNumber = parseInt(t.substr(0, t.length - 5));
        });

        let questionColors:Array<string> = [];
        for(let i = 0; i < this.curQuestion.tileColorsInvolved; i++)
            questionColors[i] = GameView.colors[i];
        GameView.shuffle(questionColors);
        let questionItems:Array<string> = [];
        for(let i = 0; i < this.curQuestion.tileItemInvolved; i++)
            questionItems[i] = GameView.items[i];
        GameView.shuffle(questionItems);

        //set focus combinations
        let focusCombinationsColors = [];
        let focusCombinationsItems = [];
        let j = 0;
        for(let i = 0; i < colorsNumber; i++)
        {
            focusCombinationsColors[j] = questionColors[i];
            focusCombinationsItems[j] = "any";
            j++;
        }
        for(let i = 0; i < itemsNumber; i++)
        {
            focusCombinationsColors[j] = "any";
            focusCombinationsItems[j] = questionItems[i];
            j++;
        }
        console.log("Focus combinations: " + focusCombinationsColors + " ; " + focusCombinationsItems);

        let allTiles:Array<string> = [];

        //create focus tiles
        let index = 0;
        while(allTiles.length < 3)
        {
            if(focusCombinationsColors[index] == "any")
                allTiles.push(this.getRandomValue(questionColors) + "," + focusCombinationsItems[index] + ",f");
            else if(focusCombinationsItems[index] == "any")
                allTiles.push(focusCombinationsColors[index] + "," + this.getRandomValue(questionItems) + ",f");
            else
                allTiles.push(focusCombinationsColors[index] + "," + focusCombinationsItems[index]+ ",f");
            index = index + 1 >= focusCombinationsColors.length ? 0 : index + 1;
        }

        //add not focused tiles
        for(let i = 0; i < 3; i++)
        {
            if(itemsNumber == 0)
            {
                let acceptedColors = [];
                questionColors.forEach(function (value)
                {
                    if(!focusCombinationsColors.includes(value))
                        acceptedColors.push(value);
                })
                allTiles.push(this.getRandomValue(acceptedColors) + "," + this.getRandomValue(questionItems));
            }
            else if(colorsNumber == 0)
            {
                let acceptedItems = [];
                questionItems.forEach(function (value)
                {
                    if(!focusCombinationsItems.includes(value))
                        acceptedItems.push(value);
                })
                allTiles.push(this.getRandomValue(questionColors) + "," + this.getRandomValue(acceptedItems));
            }
            else
            {
                let acceptedColors = [];
                questionColors.forEach(function (value)
                {
                    if(!focusCombinationsColors.includes(value))
                        acceptedColors.push(value);
                })
                let acceptedItems = [];
                questionItems.forEach(function (value)
                {
                    if(!focusCombinationsItems.includes(value))
                        acceptedItems.push(value);
                })
                allTiles.push(this.getRandomValue(acceptedColors) + "," + this.getRandomValue(acceptedItems));
            }
        }

        for(let i = 6; i < tilesCount; i++)
        {
            let rndColor = this.getRandomValue(questionColors);
            let rndItem = this.getRandomValue(questionItems);
            if(focusCombinationsItems.includes(rndItem))
                allTiles.push(rndColor + "," + rndItem + ",f");
            else if(focusCombinationsColors.includes(rndColor))
                allTiles.push(rndColor + "," + rndItem + ",f");
            else
                allTiles.push(rndColor + "," + rndItem);
        }

        GameView.shuffle(allTiles);

        for(let i = 0; i < allTiles.length; i++)
            if(allTiles[i].split(',').length == 3)
                this.model.itemsForOpen++;
                

        this.tileController.createTiles(tilesCount, allTiles, colorsNumber, itemsNumber, focusCombinationsColors, focusCombinationsItems, this.curQuestion.tileMovementsCount);

        this.isPause = isFirstPlay;
        if(this.isPause)
            this.OnPauseGameOn();
        if(!isFirstPlay)
            this.node.off("firstGamePauseOff", this.FirstGamePauseOff, this);
    }

    getRandomValue(arr:Array<string>)
    {
        GameView.shuffle(arr);
        let rnd = GameModel.randomInt(0, arr.length - 1);
        return arr[rnd];
    }

    ShowStartMsg(text:string)
    {
        this.startMsg.active = true;
        this.lbStartMsg.string = text;
    }

    ShowCorrectBg() {
        this.backgroundCorrect.active = true;
        this.backgroundWrong.active = false;
    }

    ShowWrongBg() {
        this.backgroundCorrect.active = false;
        this.backgroundWrong.active = true;
        this.tileController.SetTilesWrong();
    }

    ShowWrongMsg()
    {
        this.node.runAction(cc.sequence(
            cc.callFunc(() =>
            {
                cc.log("start wrong msg =====================>")
                this.startMsg.active = false;
                this.backgroundCorrect.active = false;
                this.backgroundWrong.active = true;
                this.messageWrong.active = true;
            }),
            cc.delayTime(2),
            cc.callFunc(() =>
            {
                this.messageWrong.active = false;
                this.tileController.ShowCorrectTiles();
                this.backgroundCorrect.active = true;
                this.backgroundWrong.active = false;
                this.messageCorrect.active = true;
                cc.log("end wrong msg =====================>")
            })));
    }

    public GoToNextQ()
    {
        this.messageCorrect.active = false;
        this.node.emit("gotonextquestion");
    }
}
