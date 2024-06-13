// DO NOT INSTRUMENT

import {PrimitiveLogStore} from '../../LogStore/PrimitiveLogStore';
import {Analysis, Hooks, Sandbox} from '../../Type/nodeprof';
import {outputSync, toJSON} from '../../Util';

import {GerenciadorRastrearChamadas} from '../GerenciadorRastrearChamadas';
const meuGerenciadorRastrearChamadas = new 
GerenciadorRastrearChamadas("/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/logRastrearChamadas.txt");

export class PrimitiveLogStoreAnalysis extends Analysis
{
    public endExecution: Hooks['endExecution'] | undefined;

    constructor(sandbox: Sandbox)
    {
        meuGerenciadorRastrearChamadas.registrarChamadaConstrutor("PrimitiveLogStoreAnalysis");

        super(sandbox);
    }

    protected registerHooks(): void
    {
        meuGerenciadorRastrearChamadas.registrarChamadaFuncao("PrimitiveLogStoreAnalysis", "registerHooks");

        this.endExecution = () =>
        {
            outputSync(toJSON(PrimitiveLogStore.getPrimitiveDeclarations()), 'primitiveLogStore.json');
        };
    }
}