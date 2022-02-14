import enumerate = Reflect.enumerate;

export enum LocalzationLang
{
    English = 0,
    Chinese = 1
}

export default class Localization
{
    private static map:any
    static currentLanguage:LocalzationLang = LocalzationLang.Chinese

    static instance:Localization = null

    constructor()
    {
        Localization.instance = this;
    }

    static load(file_name:string):Promise<any>
    {
        new Localization();

        return new Promise(function (resolve,reject)
        {
            cc.loader.loadRes(file_name,function(err, file)
            {
                if (err)
                {
                    console.log(err);
                }
                else if(file)
                {
                    Localization.map = file.json;
                }

                resolve();
            });
        });
    }

    static getString(key:string):string
    {
        let values:Array<string> = [];

        if(!Localization.map)
            return key;

        if (Array.isArray(Localization.map[key]))
            values = Localization.map[key];

        const value = values[this.currentLanguage];

        if(!value)
        {
            cc.warn("Localization key " + key + " not found");

            return key;
        }

        return value;
    }
}