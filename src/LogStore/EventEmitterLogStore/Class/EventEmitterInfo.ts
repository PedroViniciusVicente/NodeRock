import {EventEmitter} from 'events';
import {ResourceInfo} from '../../Class/ResourceInfo';
import {SourceCodeInfo} from '../../Class/SourceCodeInfo';
import {StatisticsStore} from '../../StatisticsStore';
import {isRunningUnitTests} from '../../../Util';

import {GerenciadorRastrearChamadas} from '/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/GerenciadorRastrearChamadas';
const meuGerenciadorRastrearChamadas = new 
GerenciadorRastrearChamadas("/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/logRastrearChamadas.txt");

export class EventEmitterInfo extends ResourceInfo
{
    private readonly eventEmitter: WeakRef<EventEmitter>;
    private readonly event: string | symbol;

    constructor(eventEmitter: EventEmitter, event: string | symbol, possibleDefineCodeScope: SourceCodeInfo | null)
    {
        meuGerenciadorRastrearChamadas.registrarChamadaConstrutor("EventEmitterInfo do LogStore");

        super('eventEmitter', possibleDefineCodeScope);
        this.eventEmitter = new WeakRef(eventEmitter);
        this.event = event;
        StatisticsStore.addEventEmitterCount();
    }

    public override getHash(): object | string
    {
        meuGerenciadorRastrearChamadas.registrarChamadaFuncao("EventEmitterInfo do LogStore", "getHash");

        if (isRunningUnitTests() && typeof this.event === 'string')
        {
            return JSON.stringify({
                ...this,
                eventEmitter: undefined,
            });
        }
        else
        {
            return this;
        }
    }

    public is(other: unknown, event?: string | symbol): boolean
    {
        meuGerenciadorRastrearChamadas.registrarChamadaFuncao("EventEmitterInfo do LogStore", "is");

        return this.eventEmitter.deref() === other && event === this.event;
    }

    public toJSON()
    {
        meuGerenciadorRastrearChamadas.registrarChamadaFuncao("EventEmitterInfo do LogStore", "toJSON");

        return {
            ...this,
            eventEmitter: undefined,
        };
    }
}