// DO NOT INSTRUMENT

import {OutgoingMessageLogStore} from '../../LogStore/OutgoingMessageLogStore';
import {Analysis, Hooks, Sandbox} from '../../Type/nodeprof';
import {outputSync, toJSON} from '../../Util';

import {GerenciadorRastrearChamadas} from '../GerenciadorRastrearChamadas';
const meuGerenciadorRastrearChamadas = new 
GerenciadorRastrearChamadas("/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/logRastrearChamadas.txt");

export class OutgoingMessageStoreAnalysis extends Analysis
{
    public endExecution: Hooks['endExecution'] | undefined;

    constructor(sandbox: Sandbox)
    {
        meuGerenciadorRastrearChamadas.registrarChamadaConstrutor("OutgoingMessageStoreAnalysis");

        super(sandbox);
    }

    protected registerHooks(): void
    {
        meuGerenciadorRastrearChamadas.registrarChamadaFuncao("OutgoingMessageStoreAnalysis", "registerHooks");

        this.endExecution = () =>
        {
            outputSync(toJSON(OutgoingMessageLogStore.getOutgoingMessageDeclarations()), 'outgoingMessageLogStore.json');
        };
    }
}