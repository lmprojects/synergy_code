/*
 * Copyright (C) Melior Games, LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Melior Games Team <info@meliorgames.com>
 *
 */

export default class Command extends cc.Component
{
    args:Array = []
    _isRunning:boolean = true
    _isStarted:boolean = false
    _resourcesReleased:boolean = false
    _resolve:null
    _reject:null
    promise:null
    commands:Array = []

    constructor()
    {
        super();

        const self = this;

        this.args = [];

        this.promise = new Promise(function ( resolve, reject )
            {
                self._resolve = resolve;
                self._reject = reject;
            }
        );
    }

    start ()
    {
        if(this._isRunning)
        {
            this._isStarted=true;



            cc.log("Command " + this.getName() + " started")

            this.onStart(this.args);
        }
    }

    onStart(args:Array)
    {

    }

    update(dt)
    {
        if(this._isRunning)
            this.onUpdate(dt);
    }

    onUpdate(dt)
    {

    }

    static executeOn(type,target,args,state = null)
    {
        const command = target.addComponent(type);

        command.args = args;

        if(state)
        {
            state.commands.push(command)

            state.promise.then(()=>{
                state.commands.splice(state.commands.indexOf(command),1);
            },()=>{
                state.commands.splice(state.commands.indexOf(command),1);
            });
        }

        return command;
    }

    finishCommand(success = true)
    {
        if(this._isRunning)
        {
            this._isRunning = false;
            this.onFinishCommand(success);

            if(this._isStarted)
            {
                this.onReleaseResources();
                this._resourcesReleased = true;
            }

            this.destroy();
        }
    }

    onFinishCommand(success)
    {
        let maxCalls = this.commands.length;

        while(this.commands.length > 0)
        {
            maxCalls--;

            this.commands[0].finishCommand(success);

            if(maxCalls === 0)
                break;
        }

        if(this.commands.length !== 0)
        {
            cc.log("State does not finished all commands");
        }

        if(success)
            this._resolve(this);
        else
            this._reject(this);
    }

    onReleaseResources()
    {
    }

    getName(){
        return this.name;
    }

    onDestroy()
    {
        cc.log("Command " + this.getName() + " destroyed");

        if(!this._resourcesReleased && this._isStarted)
        {
            try
            {
                cc.log("Release resources")

                this.onReleaseResources();
            }
            catch(e)
            {
                cc.log("Error during release command resources " + e.toString());
            }

            this._resourcesReleased = true;
        }
    }

    terminate()
    {
        this.finishCommand(false);
    }
}
