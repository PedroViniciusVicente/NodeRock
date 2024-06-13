// DO NOT INSTRUMENT

import {BufferLogStore} from '../../LogStore/BufferLogStore';
import {Analysis, Hooks, Sandbox} from '../../Type/nodeprof';
import {outputSync, toJSON} from '../../Util';

import {GerenciadorRastrearChamadas} from '../GerenciadorRastrearChamadas';
 

export class BufferLogStoreAnalysis extends Analysis
{
    public endExecution: Hooks['endExecution'] | undefined;

    constructor(sandbox: Sandbox)
    {
         GerenciadorRastrearChamadas.registrarChamadaConstrutor("BufferLogStoreAnalysis");

        super(sandbox);
    }

    protected registerHooks(): void
    {
         GerenciadorRastrearChamadas.registrarChamadaFuncao("BufferLogStoreAnalysis", "registerHooks");

        this.endExecution = () =>
        {
            outputSync(toJSON(BufferLogStore.getBufferDeclarations()), 'bufferLogStore.json');
        };
    }
}