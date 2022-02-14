export default abstract class IdentityMap<T>
{
    private items = {}

    register(item:T):T
    {
        let key = this.getKey(item);
        let existing_item = this.items[key];

        if( existing_item )
        {
            cc.log("Found duplicate:" + key);
            cc.log(existing_item);
            cc.log(item)

            this.merge(item, existing_item);
        }
        else
        {
            this.items[key] = item;

            existing_item = item;
        }

        return existing_item;
    }

    public getItem(key:string):T{
        return this.items[key]
    }

    abstract getKey(item:T);
    abstract merge(from:T, to:T);
}
