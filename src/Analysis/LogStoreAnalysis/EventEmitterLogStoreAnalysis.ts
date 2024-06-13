import {Analysis, Hooks, Sandbox} from '../../Type/nodeprof';
import {outputSync, toJSON} from '../../Util';
import {EventEmitterLogStore} from '../../LogStore/EventEmitterLogStore';

import {GerenciadorRastrearChamadas} from '../GerenciadorRastrearChamadas';
 

export class EventEmitterLogStoreAnalysis extends Analysis
{
    public endExecution: Hooks['endExecution'] | undefined;

    constructor(sandbox: Sandbox)
    {
         GerenciadorRastrearChamadas.registrarChamadaConstrutor("EventEmitterLogStoreAnalysis");

        super(sandbox);
    }

    protected registerHooks(): void
    {
         GerenciadorRastrearChamadas.registrarChamadaFuncao("EventEmitterLogStoreAnalysis", "registerHooks");

        this.endExecution = () =>
        {
            outputSync(toJSON(EventEmitterLogStore.getEventEmitterDeclarations()), 'eventEmitterLogStore.json');
        };
    }
}