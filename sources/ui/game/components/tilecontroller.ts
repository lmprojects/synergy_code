import TileComponent from "./tilecomponent";
import GameView from "../gameview";
import Color = cc.Color;

const {ccclass, property} = cc._decorator;

@ccclass
export default class TileController extends cc.Component
{
    @property(cc.Prefab)
    tilePrefab:cc.Prefab = null;

    tiles:Array<TileComponent> = [];
    tileWidth:number = 0;
    tileHeight:number = 0;
    startAction:cc.Action = null;
    moveAction:cc.Action = null;
    isStartAction:boolean = false;
    isMoveAction:boolean = false;

    protected onLoad() {

        this.tileWidth = this.node.width;
        this.tileHeight = this.node.height;
    }

    createTiles(tilesCount:number, allTiles:Array<string>, colorN:number, itemN:number, focusColors:Array<string>, focusItems:Array<string>, tileMoveCount:number)
    {
        let tileRowCnt = Math.sqrt(tilesCount);
        let tileSize = this.tileWidth / tileRowCnt;

        let x = -this.node.width / 2 + tileSize / 2;
        let y = (tileRowCnt - 1) / 2 * tileSize + 0.5 * tileSize;
        for(let i = 0; i < tilesCount; i++)
        {
            let tileNode = cc.instantiate(this.tilePrefab);
            tileNode.setParent(this.node);
            tileNode.on("select",this.onTileClick,this);
            if(i > 0 && i % tileRowCnt == 0)
            {
                x = -this.node.width / 2 + tileSize / 2;
                y -= tileSize;
            }
            tileNode.position = new cc.Vec3(x, y,0);
            x += tileSize;
            tileNode.height = tileSize;
            tileNode.width = tileSize;
            let tile = tileNode.getComponent(TileComponent);
            this.tiles.push(tile);

            let curTileTask = allTiles[i].split(",");
            tile.SetSprite(curTileTask[0], curTileTask[1]);
            if(curTileTask.length == 3 && curTileTask[2] == "f")
                tile.isFocused = true;
        }

        this.onTilesBlocked();

        this.node.emit("showStartMsg",this.getStartMsg(colorN, itemN, focusColors, focusItems));
        let movePos = this.generateMovePositions(tileMoveCount, tileRowCnt);
        let index = 0;
        let waitTime = 3 - tileMoveCount * 0.5;
        this.moveAction = cc.sequence(
            cc.callFunc(()=>this.isMoveAction = true),
            cc.callFunc(()=>cc.log("================ start move action")),
            cc.delayTime(waitTime),
            cc.repeat(
                cc.sequence(
                    cc.callFunc(() =>
                        {
                            let startPos = movePos[index];
                            let finishPos = movePos[index+1];
                            index += 2;
                            this.tiles[startPos].node.runAction(cc.moveTo(0.45, this.tiles[finishPos].node.position));
                            this.tiles[finishPos].node.runAction(cc.moveTo(0.45, this.tiles[startPos].node.position));
                            let tmp = this.tiles[startPos];
                            this.tiles[startPos] = this.tiles[finishPos];
                            this.tiles[finishPos] = tmp;
                        }
                    ), 
                    cc.delayTime(0.5)
                ), 
                tileMoveCount
            ),
            // cc.callFunc(() =>
            // {
            //     this.node.emit("showStartMsg", " ");   // ===== clear message text
            // }),
            cc.delayTime(1.5),   // ===== set delay before choosing tiles
            cc.callFunc(() =>
                {
                    this.node.emit("showStartMsg",this.getFlipMsg(colorN, itemN, focusColors, focusItems));
                    this.onTilesUnlocked();
                    this.node.emit("settimer", true);
                }
            ),
            cc.callFunc(()=>this.isMoveAction = false),
            cc.callFunc(()=>cc.log("================ end move action")),
        );

        let trackDelay = 0;
        switch(tilesCount){
            case 9:
                trackDelay = 7;
                break;
            case 16:
                trackDelay = 9;
                break;
            case 25:
                trackDelay = 11;
                break;
        }
        this.startAction = cc.sequence(
            cc.callFunc(()=>cc.log("================ start START action")),
            cc.delayTime(trackDelay), 
            cc.callFunc(() =>
                {
                    this.node.emit("showStartMsg", "Track the movement of your tiles.");
                    this.tiles.forEach(function (tile){
                            tile.SetCorrectBack();
                    });
                    this.isStartAction = false;
                    this.node.runAction(this.moveAction);
                }
            ),
            cc.callFunc(()=>cc.log("================ end START action")),
        );

        this.isStartAction = true;
        this.node.runAction(this.startAction);
    }

    generateMovePositions(countMove:number, rowCount:number)
    {
        let resPositions = [];
        let positions = [];
        for(let i = 0;  i < this.tiles.length; i++)
            positions.push(i);
        GameView.shuffle(positions);
        for(let i = 0; i < countMove; i++)
        {
            let startPos = positions[i];

            let neighbor = [];
            if(startPos % rowCount != 0 && positions.includes(startPos - 1))
                neighbor.push(startPos - 1);
            if((startPos + 1) % rowCount != 0 && positions.includes(startPos + 1))
                neighbor.push(startPos + 1);
            if(startPos >= rowCount && positions.includes(startPos - rowCount))
                neighbor.push(startPos - rowCount);
            if(startPos < (rowCount * rowCount) - rowCount && positions.includes(startPos + rowCount))
                neighbor.push(startPos + rowCount);
            GameView.shuffle(neighbor);

            let endPos = neighbor[0];

            positions.splice(positions.indexOf(startPos), 1);
            positions.splice(positions.indexOf(endPos), 1);

            resPositions.push(startPos);
            resPositions.push(endPos);
        }

        console.log("Move positions " + resPositions);
        return resPositions;
    }

    getStartMsg(colorN:number, itemN:number, focusColors:Array<string>, focusItems:Array<string>)
    {
        let articleItems = [];
        focusItems.forEach(function (item)
        {
            let str = item;
            if(item == "basketball" || item == "book" || item == "candle") {
                str = "a " + item.toUpperCase();
                articleItems.push(str);
            }
            else
                articleItems.push(str.toUpperCase());
        })
        let msg = "";
        if(colorN > 0 && itemN > 0)
            msg = "Focus on the " + focusColors[0].toString().toUpperCase() + " tiles and the tiles that contain " + articleItems[1] + ".";
        else if(colorN > 0)
        {
            if(colorN == 1)
                msg = "Focus on the " + focusColors[0].toString().toUpperCase() + " tiles.";
            else
            {
                msg = "Focus on the " + focusColors[0].toString().toUpperCase() + " tiles";
                for(let i = 1; i < focusColors.length;i++)
                    msg += " and the " + focusColors[i].toString().toUpperCase() + " tiles";
                msg += ".";
            }
        }
        else if(itemN > 0)
        {
            if(itemN == 1)
                msg = "Focus on the tiles that contain " + articleItems[0] + ".";
            else
            {
                msg = "Focus on the tiles that contain " + articleItems[0];
                for(let i = 1; i < articleItems.length;i++)
                    msg += " and the tiles that contain " + articleItems[i];
                msg += ".";
            }
        }
        return msg;
    }

    getFlipMsg(colorN:number, itemN:number, focusColors:Array<string>, focusItems:Array<string>)
    {
        let articleItems = [];
        focusItems.forEach(function (item)
        {
            let str = item;
            if(item == "basketball" || item == "book" || item == "candle") {
                str = "a " + item.toUpperCase();
                articleItems.push(str);
            }
            else
                articleItems.push(str.toUpperCase());
        })
        let msg = "";
        if(colorN > 0 && itemN > 0)
            msg = "Flip over the " + focusColors[0].toString().toUpperCase() + " tiles and the tiles that contain " + articleItems[1] + ".";
        else if(colorN > 0)
        {
            if(colorN == 1)
                msg = "Flip over the " + focusColors[0].toString().toUpperCase() + " tiles.";
            else
            {
                msg = "Flip over the " + focusColors[0].toString().toUpperCase() + " tiles";
                for(let i = 1; i < focusColors.length;i++)
                    msg += " and the " + focusColors[i].toString().toUpperCase() + " tiles";
                msg += ".";
            }
        }
        else if(itemN > 0)
        {
            if(itemN == 1)
                msg = "Flip over the tiles that contain " + articleItems[0] + ".";
            else
            {
                msg = "Flip over the tiles that contain " + articleItems[0];
                for(let i = 1; i < articleItems.length;i++)
                    msg += " and the tiles that contain " + articleItems[i];
                msg += ".";
            }
        }
        return msg;
    }

    onTileClick(tile:TileComponent){
        this.node.emit("select",tile);
    }

    SetTilesWrong()
    {
        this.onTilesBlocked();
        for(let i = 0; i < this.tiles.length; i++)
            if(!this.tiles[i].isOpened)
                this.tiles[i].SetWrongBack();
    }

    public onTilesBlocked()
    {
        for(let i = 0; i < this.tiles.length; i++)
            this.tiles[i].getComponent(cc.Button).enabled = false;
    }

    public onTilesUnlocked()
    {
        for(let i = 0; i < this.tiles.length; i++)
            this.tiles[i].getComponent(cc.Button).enabled = true;
    }

    public ClearTiles()
    {
        this.node.stopAllActions();
        for(let i = 0; i < this.tiles.length; i++)
            this.tiles[i].node.runAction(cc.destroySelf());
        this.tiles = [];
    }

    public ShowCorrectTiles()
    {
        for(let i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i].isFocused)
                this.tiles[i].ShowItem();
            else
                this.tiles[i].SetWrongBack();
        }
    }

    OnPauseOn()
    {
        this.node.pauseAllActions();
       /* if(this.isStartAction){
            cc.log("==========> pause start action")
            this.node.stopAction(this.startAction);
        }
        if(this.isMoveAction){
            this.node.stopAction(this.moveAction);
            cc.log("==========> pause move action")
        }*/
    }

    OnPauseOff()
    {
        this.node.resumeAllActions();
       /* if(this.isStartAction){
            this.node.runAction(this.startAction);
        }
        if(this.isMoveAction){
            this.node.runAction(this.moveAction);
        }*/

    }
}