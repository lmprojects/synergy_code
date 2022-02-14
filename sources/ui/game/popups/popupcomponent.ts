import SoundManager from "../soundmanager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PopUpComponent extends cc.Component{

    @property(SoundManager)
    soundManager:SoundManager = null

    parent:any;
    resolve:any
    reject:any

    _openPosition:cc.Vec2
    _closePosition:cc.Vec2

    protected onLoad(): void {
        this._openPosition = new cc.Vec2(this.node.position.x,this.node.position.y)
        this.node.position = new cc.Vec3(this._openPosition.x,this._openPosition.y - 2000)
        this._closePosition = new cc.Vec2(this.node.position.x,this.node.position.y)
        this.node.active = false
    }

    open(args:any):Promise<PopUpComponent>{
        const self = this;

        this.node.active = true;

        this.onOpen(args);

        this.node.runAction(
            cc.spawn([cc.moveTo(0.3,this._openPosition).easing(cc.easeBackOut()),
            cc.fadeIn(0.2)]));

        return new Promise<PopUpComponent>(((resolve, reject) => {
            self.reject = reject
            self.resolve = resolve
        }))
    }

    onOpen(args:any){

    }

    close(resolve:boolean){

        let sq = cc.sequence([ 
            cc.spawn([
                cc.moveTo(0.3,this._closePosition).easing(cc.easeBackIn()),
                cc.fadeOut(0.2)
            ]),
            cc.callFunc(()=>this.node.active = false)
        ])

        this.node.runAction(sq)

        if(resolve)
            this.resolve(this)
        else
            this.reject(this)
    }
}
