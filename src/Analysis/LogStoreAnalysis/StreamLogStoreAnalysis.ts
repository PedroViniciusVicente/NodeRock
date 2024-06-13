// DO NOT INSTRUMENT

import {StreamLogStore} from '../../LogStore/StreamLogStore';
import {Analysis, Hooks, Sandbox} from '../../Type/nodeprof';
import {outputSync, toJSON} from '../../Util';

import {GerenciadorRastrearChamadas} from '../GerenciadorRastrearChamadas';
 

export class StreamLogStoreAnalysis extends Analysis
{
    public endExecution: Hooks['endExecution'] | undefined;

    constructor(sandbox: Sandbox)
    {
         GerenciadorRastrearChamadas.registrarChamadaConstrutor("StreamLogStoreAnalysis");

        super(sandbox);
    }

    protected registerHooks(): void
    {
         GerenciadorRastrearChamadas.registrarChamadaFuncao("StreamLogStoreAnalysis", "registerHooks");

        this.endExecution = () =>
        {
            outputSync(toJSON(StreamLogStore.getStreamDeclarations()), 'streamLogStore.json');
        };
    }
}