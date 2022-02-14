export interface Observer
{
    onObjectChanged(model:Observable)
}

export default class Observable
{
    private observers:Array<Observer> = [];

    setChanged ()
    {
        for(let i = 0; i < this.observers.length; i++)
        {
            this.observers[i].onObjectChanged(this);
        }
            
    }

    addObserver(observer:Observer)
    {
        this.observers.push(observer)
    }

    removeObserver(observer:Observer)
    {
        let index = this.observers.indexOf(observer);

        if(index != -1)
            this.observers.splice(index,1);
    }
}

