import {Analysis, Hooks, Sandbox} from '../../Type/nodeprof';
import {outputSync, toJSON} from '../../Util';
import {EventEmitterLogStore} from '../../LogStore/EventEmitterLogStore';

import {GerenciadorRastrearChamadas} from '../GerenciadorRastrearChamadas';
const meuGerenciadorRastrearChamadas = new 
GerenciadorRastrearChamadas("/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/logRastrearChamadas.txt");

export class EventEmitterLogStoreAnalysis extends Analysis
{
    public endExecution: Hooks['endExecution'] | undefined;

    constructor(sandbox: Sandbox)
    {
        meuGerenciadorRastrearChamadas.registrarChamadaConstrutor("EventEmitterLogStoreAnalysis");

        super(sandbox);
    }

    protected registerHooks(): void
    {
        meuGerenciadorRastrearChamadas.registrarChamadaFuncao("EventEmitterLogStoreAnalysis", "registerHooks");

        this.endExecution = () =>
        {
            outputSync(toJSON(EventEmitterLogStore.getEventEmitterDeclarations()), 'eventEmitterLogStore.json');
        };
    }
}