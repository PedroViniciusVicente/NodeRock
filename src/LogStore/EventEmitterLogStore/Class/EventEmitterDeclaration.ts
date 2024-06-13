import {RaceDetector} from '../../../RaceDetector';
import {AsyncCalledFunctionInfo} from '../../Class/AsyncCalledFunctionInfo';
import {ResourceDeclaration} from '../../Class/ResourceDeclaration';
import {SourceCodeInfo} from '../../Class/SourceCodeInfo';
import {EventEmitterInfo} from './EventEmitterInfo';
import {EventEmitterOperation} from './EventEmitterOperation';
import {EventEmitter} from 'events';

import {GerenciadorRastrearChamadas} from '/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/GerenciadorRastrearChamadas';
const meuGerenciadorRastrearChamadas = new 
GerenciadorRastrearChamadas("/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/logRastrearChamadas.txt");

export class EventEmitterDeclaration extends ResourceDeclaration
{
    private readonly eventEmitterInfo: EventEmitterInfo;
    private readonly asyncContextToOperations: Map<AsyncCalledFunctionInfo, EventEmitterOperation[]>;

    constructor(eventEmitter: EventEmitter, event: EventEmitterInfo['event'], possibleDefineCodeScope: SourceCodeInfo | null)
    {
        meuGerenciadorRastrearChamadas.registrarChamadaConstrutor("EventEmitterDeclaration do LogStore");

        super();
        this.eventEmitterInfo = new EventEmitterInfo(eventEmitter, event, possibleDefineCodeScope);
        this.asyncContextToOperations = new Map();
    }

    public appendOperation(currentCallbackFunction: AsyncCalledFunctionInfo, eventEmitterOperation: EventEmitterOperation): void
    {
        meuGerenciadorRastrearChamadas.registrarChamadaFuncao("EventEmitterDeclaration do LogStore", "appendOperation");

        const operations = this.asyncContextToOperations.get(currentCallbackFunction);
        if (operations === undefined)
        {
            this.asyncContextToOperations.set(currentCallbackFunction, [eventEmitterOperation]);
        }
        else
        {
            operations.push(eventEmitterOperation);
        }
        RaceDetector.emit('operationAppended', this);
    }

    public getAsyncContextToOperations(): ReadonlyMap<AsyncCalledFunctionInfo, ReadonlyArray<EventEmitterOperation>>
    {
        meuGerenciadorRastrearChamadas.registrarChamadaFuncao("EventEmitterDeclaration do LogStore", "getAsyncContextToOperations");

        return this.asyncContextToOperations;
    }

    public getResourceInfo(): EventEmitterInfo
    {
        meuGerenciadorRastrearChamadas.registrarChamadaFuncao("EventEmitterDeclaration do LogStore", "getResourceInfo");

        return this.eventEmitterInfo;
    }

    public is(other: unknown, event?: string | symbol): boolean
    {
        meuGerenciadorRastrearChamadas.registrarChamadaFuncao("EventEmitterDeclaration do LogStore", "is");

        return this.eventEmitterInfo.is(other, event);
    }
}