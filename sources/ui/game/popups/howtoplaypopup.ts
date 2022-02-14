import PopUpComponent from "./popupcomponent";

const {ccclass, property} = cc._decorator;

@ccclass
export default class HowToPlayPopUp extends PopUpComponent{

    @property(cc.Node)
    canvas:cc.Node = null;
    @property(cc.PageView)
    pageView:cc.PageView = null;

    onOpen(args: any) {
        super.onOpen(args);

        this.pageView.setCurrentPageIndex(0);

    }

    onClose(){
        this.node.runAction(cc.sequence(
            cc.fadeOut(0.2),
            cc.callFunc(() => this.pageView.setCurrentPageIndex(0)),
            cc.delayTime(0.3), 
            cc.callFunc(() =>
            {
                this.close(true);
                this.canvas.emit("firstGamePauseOff", true);
            })
        ))
    }

    onNext(){
        this.pageView.setCurrentPageIndex(this.pageView.getCurrentPageIndex()+1);
    }
}
