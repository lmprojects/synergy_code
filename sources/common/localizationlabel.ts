import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import Localization from "./localization";

@ccclass
export default class LocalizationLabel extends cc.Label
{
    @property
    key:string = ""

    start()
    {
        if(Localization.instance)
        {
            this.string = Localization.getString(this.key);
        }
    }
}