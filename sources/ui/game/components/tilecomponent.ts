import GameView from "../gameview";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TileComponent extends cc.Component
{
    @property(cc.Sprite)
    mainImg:cc.Sprite = null;

    @property(cc.SpriteFrame)
    backCorrect:cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    wrongCorrect:cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    mainSprites:Array<cc.SpriteFrame> = [];

    isFocused:boolean = false;
    isOpened:boolean = false;
    curIndex:number = 0;
    curTask:string = "";

    SetSprite(color:string, item:string)
    {
        this.curIndex = GameView.items.indexOf(item) * GameView.items.length + GameView.colors.indexOf(color);
        this.mainImg.spriteFrame = this.mainSprites[this.curIndex];
        this.curTask = color + "," + item;
    }

    SetCorrectBack()
    {
        this.mainImg.spriteFrame = this.backCorrect;
    }

    SetWrongBack()
    {
        this.mainImg.spriteFrame = this.wrongCorrect;
    }

    ShowItem()
    {
        this.isOpened = true;
        this.mainImg.spriteFrame = this.mainSprites[this.curIndex];
    }

    onTileClick(){
        this.node.emit("select",this.getComponent(TileComponent))
        this.ShowItem();
    }
}