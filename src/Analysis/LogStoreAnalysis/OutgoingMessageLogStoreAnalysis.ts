// DO NOT INSTRUMENT

import {OutgoingMessageLogStore} from '../../LogStore/OutgoingMessageLogStore';
import {Analysis, Hooks, Sandbox} from '../../Type/nodeprof';
import {outputSync, toJSON} from '../../Util';

import {GerenciadorRastrearChamadas} from '../GerenciadorRastrearChamadas';
 

export class OutgoingMessageStoreAnalysis extends Analysis
{
    public endExecution: Hooks['endExecution'] | undefined;

    constructor(sandbox: Sandbox)
    {
         GerenciadorRastrearChamadas.registrarChamadaConstrutor("OutgoingMessageStoreAnalysis");

        super(sandbox);
    }

    protected registerHooks(): void
    {
         GerenciadorRastrearChamadas.registrarChamadaFuncao("OutgoingMessageStoreAnalysis", "registerHooks");

        this.endExecution = () =>
        {
            outputSync(toJSON(OutgoingMessageLogStore.getOutgoingMessageDeclarations()), 'outgoingMessageLogStore.json');
        };
    }
}