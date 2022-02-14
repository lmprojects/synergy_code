import PopUpComponent from "./popupcomponent";
import HowToPlayPopUp from "./howtoplaypopup";

const {ccclass} = cc._decorator;

@ccclass
export default class MenuPopUp extends PopUpComponent{

    isRestart:boolean = false;

    onOpen(args: any) {
        super.onOpen(args);
    }

    async onHelp(){
        await this.parent.openPopUp(HowToPlayPopUp);
    }

    onClose(e,v){
        this.isRestart = (v == 1);

        this.close(true);
    }
}
