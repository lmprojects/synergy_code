/*
 * Copyright (C) Melior Games, LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Melior Games Team <info@meliorgames.com>
 *
 */

import Command from "./command"

export default class StateMachine {

    _container:cc.Node
    _commands:Array = []
    _state:Command = null

    constructor(container:cc.Node)
    {
        this._container = container;
    }

    on(eventName, handler, target)
    {
        this._container.on(eventName,handler,target);
    }

    off(eventName, handler, target)
    {
        this._container.off(eventName,handler,target);
    }

    private changeState(stateType, args)
    {
        let prevState = this._state;

        this._state = null;

        if(prevState !== null)
        {
            prevState.finishCommand(true);
        }

        this._state = this.createState(stateType, args);

        this._container.emit('state-changed', this._state);

        return this._state.promise;
    }

    applyState(stateType, args = [])
    {
        return this.changeState(stateType, args);
    }

    private createState(stateType, args)
    {
        let result:Command = this._container.addComponent(stateType);

        result.args = args;

        return result;
    }

    execute(type, args = [])
    {
        return Command.executeOn(type, this._container, args, this._state).promise;
    }
}
